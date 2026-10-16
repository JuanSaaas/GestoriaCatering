import type { Cliente, Empresa, Oportunidad } from './types';

export function linkContacts(contactos: Cliente[], empresas: Empresa[], oportunidades: Oportunidad[]) {
  return contactos.map((contacto) => {
    if (Object.prototype.hasOwnProperty.call(contacto, 'empresa_id')) return contacto;
    const nombre = contacto.empresa?.trim().toLowerCase();
    const porNombre = empresas.filter((e) => e.nombre.trim().toLowerCase() === nombre);
    const vinculadas = new Set(oportunidades
      .filter((o) => o.cliente_id === contacto.id && o.empresa_id)
      .map((o) => o.empresa_id));
    const empresaId = porNombre.length === 1 ? porNombre[0].id
      : vinculadas.size === 1 ? [...vinculadas][0] : null;
    return { ...contacto, empresa_id: empresaId ?? null };
  });
}

async function readDirectory() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch('/api/crm/directorio', { cache: 'no-store', signal: controller.signal });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'No se pudo cargar el CRM.');
    const empresas = data.empresas as Empresa[];
    const oportunidades = data.oportunidades as Oportunidad[];
    const contactos = linkContacts(data.contactos as Cliente[], empresas, oportunidades);
    const sample = data.contactos[0];
    return {
      empresas, contactos, oportunidades,
      supportsContactCompanyId: !!sample && 'empresa_id' in sample,
      supportsContactRole: !!sample && 'cargo' in sample,
    };
  } finally { clearTimeout(timer); }
}

export async function loadCrmDirectory() {
  try { return await readDirectory(); }
  catch {
    // Retry a transient connection failure without replacing real records with empty data.
    return readDirectory();
  }
}
