import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { invoiceFilters } from './invoices';

export class InvoiceStorageError extends Error {
  constructor(message: string, public status = 503) { super(message); }
}

function database() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '').trim();
  if (!url || !key) throw new InvoiceStorageError('Falta conectar Facturas con Supabase. Administración debe configurar la clave de servidor y ejecutar la migración de facturas.');
  try { if (new URL(url).protocol !== 'https:') throw new Error(); }
  catch { throw new InvoiceStorageError('La conexión de Facturas debe utilizar una dirección HTTPS válida.'); }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function check(error: { code?: string } | null) {
  if (!error) return;
  if (['42P01', 'PGRST205', 'PGRST202', '42703'].includes(error.code || '')) throw new InvoiceStorageError('Falta activar las tablas o funciones de Facturas. Ejecuta la migración del módulo en Supabase.');
  throw new InvoiceStorageError('No se pudo acceder a las facturas. Revisa la conexión o vuelve a intentarlo.');
}

export async function getInvoices(url: URL) {
  const { pagina, estado, query } = invoiceFilters(url);
  const db = database();
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 12000);
  try {
    let invoices = db.from('facturas').select('*', { count: 'exact' }).order('creado_en', { ascending: false }).range((pagina - 1) * 25, pagina * 25 - 1);
    if (estado !== 'todas') invoices = invoices.eq('estado', estado);
    if (query) invoices = invoices.or(`numero_factura.ilike.%${query}%,proveedor_nombre.ilike.%${query}%,proveedor_identificacion.ilike.%${query}%`);
    const [rows, docs, attempts, agent] = await Promise.all([
      invoices.abortSignal(abort.signal),
      db.from('factura_documentos').select('id,archivo_nombre,estado,intentos,max_intentos,siguiente_intento,error_codigo,error_mensaje,actualizado_en').order('actualizado_en', { ascending: false }).limit(50).abortSignal(abort.signal),
      db.from('factura_intentos').select('id,documento_id,modelo,resultado,categoria,mensaje,creado_en').order('creado_en', { ascending: false }).limit(50).abortSignal(abort.signal),
      db.from('factura_agente').select('estado,mensaje,modelos,actualizado_en').eq('id', 'principal').abortSignal(abort.signal).maybeSingle(),
    ]);
    [rows, docs, attempts, agent].forEach(result => check(result.error));
    return { facturas: rows.data || [], documentos: docs.data || [], intentos: attempts.data || [], agente: agent.data, total: rows.count || 0, pagina };
  } finally { clearTimeout(timer); }
}

export async function retryInvoiceDocument(id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new InvoiceStorageError('Selecciona un documento válido para reintentarlo.', 400);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const result = await database().rpc('reintentar_documento_factura', { p_documento_id: id }).abortSignal(controller.signal);
    check(result.error);
    if (result.data !== true) throw new InvoiceStorageError('El documento ya se ha procesado o está en curso. Actualiza la lista para consultar su estado.', 409);
  } finally { clearTimeout(timer); }
}
