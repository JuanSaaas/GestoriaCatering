import { supabase } from './supabaseClient';
import type { Cliente, Empresa, Oportunidad } from './types';
import { OPORTUNIDAD_SELECT } from './types';

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

export async function loadCrmDirectory() {
  const [e, c, o] = await Promise.all([
    supabase.from('empresas').select('*').order('nombre'),
    supabase.from('clientes').select('*').order('created_at', { ascending: false }),
    supabase.from('oportunidades').select(OPORTUNIDAD_SELECT).order('created_at', { ascending: false }),
  ]);
  for (const [nombre, result] of [['empresas', e], ['contactos', c], ['oportunidades', o]] as const) {
    if (result.error) throw new Error(`No se pudieron cargar ${nombre}: ${result.error.message}`);
  }
  const empresas = (e.data || []) as Empresa[];
  const oportunidades = (o.data || []) as unknown as Oportunidad[];
  const contactos = linkContacts((c.data || []) as Cliente[], empresas, oportunidades);
  const sample = c.data?.[0];
  return {
    empresas, contactos, oportunidades,
    supportsContactCompanyId: !!sample && 'empresa_id' in sample,
    supportsContactRole: !!sample && 'cargo' in sample,
  };
}
