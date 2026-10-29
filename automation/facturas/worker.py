import argparse
import logging
from pathlib import Path
import signal
import time
from uuid import uuid4

from .config import ConfigurationError, Settings
from .documents import Document, DocumentError, extract_document, read_snapshot
from .models import Failure, ModelRouter, ProcessingError
from .storage import StorageError, Store, saving_tool

logger = logging.getLogger("facturas")
SUFFIXES = {".pdf", ".jpg", ".jpeg", ".png", ".webp"}


class Worker:
    def __init__(self, settings, store=None, router=None, extract=extract_document, sleep=time.sleep):
        self.settings = settings
        self.store = store or Store(settings)
        self.router = router or ModelRouter(settings)
        self.extract = extract
        self.sleep = sleep
        self.stopping = False

    def run_file(self, path: Path):
        # Read an immutable byte snapshot; the original is never deleted or moved.
        data, sha256 = read_snapshot(path, self.settings)
        self.store.register(sha256, path.name, self.settings.max_attempts)
        token = str(uuid4())
        job = self.store.claim(sha256, token, self.settings.lease_seconds)
        if not job:
            return
        document_id = job["id"]
        logger.info("documento=%s evento=inicio", document_id)
        try:
            document = self.extract(data, path.suffix.lower(), self.settings)
            invoice, model = self.router.extract(document, lambda *args: self.store.attempt(document_id, token, *args))
            from langsmith import tracing_context
            with tracing_context(enabled=False):
                result = saving_tool(self.store, document_id, token, model).invoke({"datos": invoice.model_dump(mode="json")})
            logger.info("documento=%s evento=guardado modelo=%s estado=%s", document_id, model, result.get("estado"))
        except DocumentError as exc:
            self.store.fail(document_id, token, "documento", str(exc), False)
            logger.warning("documento=%s evento=requiere_revision", document_id)
        except ConfigurationError:
            self.store.fail(document_id, token, "configuracion", "Revisa OCR, claves y configuración del agente.", True)
            raise
        except ProcessingError as exc:
            failure = exc.failure
            self.store.fail(document_id, token, failure.category, failure.message, failure.retry or failure.pause)
            logger.warning("documento=%s evento=error categoria=%s", document_id, failure.category)
            if failure.pause:
                raise
        # Storage errors deliberately leave the lease intact. Another attempt can
        # reclaim it after expiry; a successful but lost response cannot duplicate.

    def cycle(self):
        self.settings.input_dir.mkdir(parents=True, exist_ok=True)
        files = sorted(p for p in self.settings.input_dir.iterdir() if p.suffix.lower() in SUFFIXES and not p.is_symlink())
        before = {}
        for path in files:
            try:
                stat = path.stat()
                before[path] = (stat.st_size, stat.st_mtime_ns)
            except OSError:
                continue
        if files:
            self.sleep(2)  # A partially copied file must survive two stable scans.
        for path in files:
            if self.stopping:
                break
            try:
                current = path.stat()
                if before.get(path) != (current.st_size, current.st_mtime_ns):
                    continue
                self.run_file(path)
            except (OSError, DocumentError):
                # Pre-registration problems (empty, oversized or copying) are visible
                # in the agent status and retried on the next scan, without upload.
                self.store.heartbeat("incidencia", "Hay archivos que no se pueden leer, están vacíos o superan el tamaño permitido. Revisa la carpeta de entrada.", self.settings.models)
                logger.warning("evento=archivo_no_disponible")
            except StorageError:
                logger.warning("evento=almacenamiento_no_disponible")
                raise

    def run(self, once=False):
        while not self.stopping:
            try:
                self.store.heartbeat("activo", "Agente conectado. Comprobando documentos pendientes.", self.settings.models)
                self.cycle()
            except (ConfigurationError, ProcessingError, StorageError) as exc:
                message = str(exc) if not isinstance(exc, StorageError) else "No se puede conectar con el almacenamiento de facturas."
                logger.error("evento=agente_pausado tipo=%s", type(exc).__name__)
                try:
                    self.store.heartbeat("incidencia", message, self.settings.models)
                except (StorageError, ConfigurationError):
                    pass
                terminal = isinstance(exc, ConfigurationError) or (isinstance(exc, ProcessingError) and exc.failure.category in {'autenticacion', 'permisos', 'configuracion'})
                if once or terminal:
                    return 1
                # Global account/config errors stop this batch, not every invoice.
                self.sleep(300 if isinstance(exc, ProcessingError) and exc.failure.category == 'saldo_cuenta' else 60)
                continue
            if once:
                return 0
            self.sleep(self.settings.poll_seconds)
        return 0


def main():
    parser = argparse.ArgumentParser(description="Agente de facturas de La Mesa Perfecta")
    parser.add_argument("--once", action="store_true", help="Comprueba una vez la carpeta y termina")
    parser.add_argument("--env-file", type=Path, default=Path("automation/facturas/.env"))
    parser.add_argument("--check-models", action="store_true", help="Verifica modelos sin enviar documentos")
    args = parser.parse_args()
    from dotenv import load_dotenv
    load_dotenv(args.env_file, override=False)
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    try:
        settings = Settings.from_env()
        worker = Worker(settings)
        if args.check_models:
            candidates = worker.router.candidates(Document("", []))
            for model in settings.models:
                print(model, "compatible" if model in candidates else "no disponible o incompatible")
            return 0 if candidates else 1
        def stop(*_):
            worker.stopping = True
        signal.signal(signal.SIGINT, stop)
        signal.signal(signal.SIGTERM, stop)
        return worker.run(args.once)
    except (ConfigurationError, ProcessingError) as exc:
        logger.error("%s", exc)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
