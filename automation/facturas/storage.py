import httpx
from datetime import datetime, timezone
from langchain_core.tools import tool

from .config import ConfigurationError, Settings
from .schema import Invoice


class StorageError(Exception):
    pass


class Store:
    def __init__(self, settings: Settings, client=None):
        self.storage_url = settings.supabase_url + '/storage/v1/object/facturas-originales/'
        self.client = client or httpx.Client(base_url=settings.supabase_url + "/rest/v1/", timeout=30,
            headers={"apikey": settings.supabase_key, "Authorization": "Bearer " + settings.supabase_key, "Content-Type": "application/json"})

    def request(self, method, path, **kwargs):
        try:
            response = self.client.request(method, path, **kwargs)
            response.raise_for_status()
            return response.json() if response.content else None
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code in (401, 403):
                raise ConfigurationError("Supabase ha rechazado la clave del agente. Revisa la clave de servidor y sus permisos.") from exc
            if exc.response.status_code in (400, 404):
                raise ConfigurationError("Revisa la migración de facturas y los parámetros de Supabase.") from exc
            raise StorageError("No se pudo confirmar la operación en Supabase; se conservará el documento.") from exc
        except (httpx.HTTPError, ValueError) as exc:
            raise StorageError("No se pudo confirmar la operación en Supabase; se conservará el documento.") from exc

    def rpc(self, name, payload):
        return self.request("POST", "rpc/" + name, json=payload)

    def register(self, sha256, filename, max_attempts):
        self.request("POST", "factura_documentos", params={"on_conflict": "sha256"},
            headers={"Prefer": "resolution=ignore-duplicates"}, json={"sha256": sha256, "archivo_nombre": filename[:255], "max_intentos": max_attempts})

    def claim(self, sha256, token, lease):
        result = self.rpc("reclamar_documento_factura", {"p_sha256": sha256, "p_token": token, "p_lease_seconds": lease})
        return result[0] if result else None

    def attempt(self, document_id, token, model, result, category, message, elapsed):
        self.rpc("registrar_intento_factura", {"p_documento_id": document_id, "p_token": token, "p_modelo": model,
            "p_resultado": result, "p_categoria": category, "p_mensaje": message, "p_duracion_ms": elapsed})

    def fail(self, document_id, token, category, message, retry):
        self.rpc("fallar_documento_factura", {"p_documento_id": document_id, "p_token": token,
            "p_codigo": category, "p_mensaje": message, "p_reintentar": retry})

    def heartbeat(self, state, message, models):
        self.request("POST", "factura_agente", params={"on_conflict": "id"}, headers={"Prefer": "resolution=merge-duplicates"},
            json={"id": "principal", "estado": state, "mensaje": message, "modelos": list(models), "actualizado_en": datetime.now(timezone.utc).isoformat()})

    def save(self, document_id, token, model, invoice: Invoice):
        warnings = invoice.warnings()
        return self.rpc("guardar_factura", {"p_documento_id": document_id, "p_token": token, "p_modelo": model,
            "p_datos": invoice.model_dump(mode="json"), "p_advertencias": warnings})

    def store_original(self, document_id, token, data: bytes, suffix: str, sha256: str):
        types = {'.pdf': 'application/pdf', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp'}
        if suffix not in types or len(sha256) != 64 or any(c not in '0123456789abcdef' for c in sha256):
            raise StorageError('No se pudo identificar el original de la factura.')
        path = sha256 + suffix
        try:
            response = self.client.request('POST', self.storage_url + path,
                content=data, headers={'Content-Type': types[suffix], 'x-upsert': 'false'})
            duplicate = False
            if response.status_code in (400, 409):
                try:
                    error = response.json()
                    duplicate = isinstance(error, dict) and (error.get('error') == 'Duplicate' or error.get('code') in {'KeyAlreadyExists', 'ResourceAlreadyExists'})
                except ValueError:
                    pass
            if not duplicate:
                response.raise_for_status()
        except httpx.HTTPError as exc:
            raise StorageError('No se pudo sincronizar el original privado. Se conserva el archivo para reintento.') from exc
        result = self.request('PATCH', 'factura_documentos',
            params={'id': 'eq.' + document_id, 'bloqueo_token': 'eq.' + token, 'estado': 'eq.procesando'},
            headers={'Prefer': 'return=representation'}, json={'archivo_ruta': path})
        if not result:
            raise StorageError('El bloqueo del documento cambió antes de confirmar su original.')


def saving_tool(store: Store, document_id: str, token: str, model: str):
    # These trusted values live in the closure, outside the model's control.
    @tool
    def guardar_factura(datos: dict) -> dict:
        """Valida y guarda una única factura extraída; evita duplicados en Supabase."""
        return store.save(document_id, token, model, Invoice.model_validate(datos))
    return guardar_factura
