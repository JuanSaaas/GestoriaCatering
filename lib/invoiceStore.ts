import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { invoiceFilters, type Invoice, type InvoiceReviewRequest } from './invoices';

export class InvoiceStorageError extends Error {
  constructor(message: string, public status = 503) { super(message); }
}

function database() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '').trim();
  if (!url || !key) throw new InvoiceStorageError('Falta conectar Facturas con Supabase: configura la URL del proyecto y una clave privada de servidor (SUPABASE_SECRET_KEY o SUPABASE_SERVICE_ROLE_KEY).');
  try { if (new URL(url).protocol !== 'https:') throw new Error(); }
  catch { throw new InvoiceStorageError('La conexión de Facturas debe utilizar una dirección HTTPS válida.'); }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function check(error: { code?: string } | null) {
  if (!error) return;
  if (['42P01', 'PGRST205', 'PGRST202', 'PGRST204', 'PGRST200', '42703'].includes(error.code || '')) throw new InvoiceStorageError('Facturas necesita completar su configuración. Contacta con administración para activar el módulo.');
  throw new InvoiceStorageError('No se pudo acceder a las facturas. Revisa la conexión o vuelve a intentarlo.');
}

export async function getInvoices(url: URL) {
  const { pagina, estado, query } = invoiceFilters(url);
  const db = database();
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 12000);
  try {
    let invoices = db.from('facturas').select('*,factura_documentos(archivo_ruta)', { count: 'exact' }).order('creado_en', { ascending: false }).range((pagina - 1) * 25, pagina * 25 - 1);
    if (estado !== 'todas') invoices = invoices.eq(['extraida','revisar'].includes(estado) ? 'estado' : 'estado_revision', estado);
    if (query) invoices = invoices.or(`numero_factura.ilike.%${query}%,proveedor_nombre.ilike.%${query}%,proveedor_identificacion.ilike.%${query}%`);
    const countRequests = ['pendiente','validada','descartada'].map(status => {
      let request = db.from('facturas').select('id', { count: 'exact', head: true }).eq('estado_revision',status);
      if (query) request = request.or(`numero_factura.ilike.%${query}%,proveedor_nombre.ilike.%${query}%,proveedor_identificacion.ilike.%${query}%`);
      return request.abortSignal(abort.signal);
    });
    const [rows, docs, attempts, agent, ...counts] = await Promise.all([
      invoices.abortSignal(abort.signal),
      db.from('factura_documentos').select('id,archivo_nombre,estado,intentos,max_intentos,siguiente_intento,error_codigo,error_mensaje,actualizado_en').order('actualizado_en', { ascending: false }).limit(50).abortSignal(abort.signal),
      db.from('factura_intentos').select('id,documento_id,modelo,resultado,categoria,mensaje,creado_en').order('creado_en', { ascending: false }).limit(50).abortSignal(abort.signal),
      db.from('factura_agente').select('estado,mensaje,modelos,actualizado_en').eq('id', 'principal').abortSignal(abort.signal).maybeSingle(),
      ...countRequests,
    ]);
    [rows, docs, attempts, agent, ...counts].forEach(result => check(result.error));
    const facturas = (rows.data || []).map(row => {
      const { factura_documentos, ...invoice } = row;
      const document = Array.isArray(factura_documentos) ? factura_documentos[0] : factura_documentos;
      return { ...invoice, original_disponible: !!document?.archivo_ruta };
    });
    return { facturas, documentos: docs.data || [], intentos: attempts.data || [], agente: agent.data, total: rows.count || 0, pagina,
      recuentos: { pendiente: counts[0].count || 0, validada: counts[1].count || 0, descartada: counts[2].count || 0 } };
  } finally { clearTimeout(timer); }
}

export async function reviewInvoice(input: InvoiceReviewRequest): Promise<Invoice> {
  const result = await database().rpc('revisar_factura', { p_factura_id: input.factura_id, p_version: input.version, p_accion: input.accion, p_datos: input.datos });
  if (result.error?.code === '40001') throw new InvoiceStorageError('Otra persona ha modificado esta factura. Actualiza la ficha; tus cambios siguen en pantalla.',409);
  if (result.error?.code === '23505') throw new InvoiceStorageError('Ya existe otra factura con ese NIF, número y año. Revisa el original.',409);
  if (result.error?.code === 'P0002') throw new InvoiceStorageError('No se encontró la factura. Actualiza la lista.',404);
  if (result.error && ['P0001','22007','22008','23514','22003'].includes(result.error.code)) throw new InvoiceStorageError('No se pudo guardar la revisión. Comprueba los datos de los campos.',400);
  check(result.error);
  if (!result.data || result.data.id !== input.factura_id) throw new InvoiceStorageError('No se pudo confirmar el guardado. Actualiza antes de repetir la acción.');
  return result.data as Invoice;
}

export async function getInvoiceOriginalUrl(id: string): Promise<string> {
  if (!/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id)) throw new InvoiceStorageError('Selecciona una factura válida.',400);
  const db = database();
  const row = await db.from('facturas').select('factura_documentos(archivo_ruta)').eq('id',id).maybeSingle();
  check(row.error);
  const relation = row.data?.factura_documentos;
  const path = (Array.isArray(relation) ? relation[0] : relation)?.archivo_ruta;
  if (!path || !/^[a-f0-9]{64}\.(pdf|jpg|jpeg|png|webp)$/.test(path)) throw new InvoiceStorageError('El agente todavía no ha sincronizado el original de esta factura.',404);
  const result = await db.storage.from('facturas-originales').createSignedUrl(path,60);
  if (result.error) throw new InvoiceStorageError('No se pudo abrir el original. Vuelve a intentarlo.');
  if (!result.data?.signedUrl) throw new InvoiceStorageError('No se pudo abrir el original. Vuelve a intentarlo.');
  return result.data.signedUrl;
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
