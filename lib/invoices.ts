export type InvoiceStatus = 'extraida' | 'revisar';
export type InvoiceReviewStatus = 'pendiente' | 'validada' | 'descartada';
export const INVOICE_REVIEW_STATUS: Record<InvoiceReviewStatus, string> = {
  pendiente: '◷ Por revisar', validada: '✓ Aceptada', descartada: '× Rechazada',
};
export type InvoiceReviewData = {
  proveedor_nombre: string | null; proveedor_identificacion: string | null;
  numero_factura: string | null; fecha_emision: string | null; moneda: string | null;
  base_imponible: number | null; iva_importe: number | null; importe_total: number | null;
};
export type InvoiceReviewRequest = { factura_id: string; version: number; accion: 'guardar' | 'validar' | 'descartar'; datos: InvoiceReviewData | Record<string, never> };
export type DocumentStatus = 'pendiente' | 'procesando' | 'reintento' | 'revisar' | 'completada' | 'duplicada';
export const DOCUMENT_STATUS: Record<DocumentStatus, string> = {
  pendiente: '◷ Pendiente', procesando: '↻ Procesando', reintento: '◷ Reintento previsto',
  revisar: '⚠ Requiere revisión', completada: '✓ Guardada', duplicada: '≡ Duplicada',
};
export type Invoice = {
  id: string; documento_id: string; numero_factura: string | null; fecha_emision: string | null;
  proveedor_nombre: string | null; proveedor_identificacion: string | null;
  base_imponible: number | string | null; importe_total: number | string | null; moneda: string | null;
  iva_importe: number | string | null; estado_revision: InvoiceReviewStatus; revision_version: number;
  revisado_en: string | null; datos_extraidos: Record<string, unknown> | null; original_disponible?: boolean;
  impuestos: { nombre: string; porcentaje: number | string | null; importe: number | string | null }[];
  observaciones: string | null; advertencias: string[]; estado: InvoiceStatus; modelo_ia: string; creado_en: string;
};
export type InvoiceDocument = {
  id: string; archivo_nombre: string; estado: DocumentStatus; intentos: number; max_intentos: number;
  siguiente_intento: string; error_codigo: string | null; error_mensaje: string | null; actualizado_en: string;
};
export type InvoiceAttempt = { id: number; documento_id: string; modelo: string; resultado: 'correcto' | 'error' | 'omitido'; categoria: string | null; mensaje: string | null; creado_en: string };
export type InvoiceAgent = { estado: 'activo' | 'incidencia'; mensaje: string; modelos: string[]; actualizado_en: string };
export type InvoicePage = { facturas: Invoice[]; documentos: InvoiceDocument[]; intentos: InvoiceAttempt[]; agente: InvoiceAgent | null; total: number; pagina: number; recuentos?: Record<InvoiceReviewStatus, number> };

export function invoiceMoney(value: number | string | null, currency: string | null) {
  if (value === null) return 'Sin importe';
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'Importe no válido';
  if (!currency) return `${amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · moneda sin indicar`;
  try { return amount.toLocaleString('es-ES', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  catch { return `${amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`; }
}

export function invoiceFilters(url: URL) {
  const raw = Number(url.searchParams.get('pagina') || '1');
  const pagina = Number.isInteger(raw) && raw >= 1 ? Math.min(raw, 10000) : 1;
  const estado = url.searchParams.get('estado') || 'todas';
  if (!['todas', 'extraida', 'revisar', 'pendiente', 'validada', 'descartada'].includes(estado)) throw new Error('Selecciona un estado de factura válido.');
  // Literal text only: never allow PostgREST filter syntax through the search box.
  const query = (url.searchParams.get('q') || '').slice(0, 120).replace(/[,().%_*\\]/g, ' ').trim();
  return { pagina, estado, query };
}

export function invoiceReviewInput(body: unknown): InvoiceReviewRequest {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('No se pudo leer la revisión.');
  const input = body as Record<string, unknown>;
  if (typeof input.factura_id !== 'string' || !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(input.factura_id)) throw new Error('Selecciona una factura válida.');
  if (!Number.isSafeInteger(input.version) || Number(input.version) < 0) throw new Error('Actualiza la ficha antes de guardar.');
  if (!['guardar', 'validar', 'descartar'].includes(String(input.accion))) throw new Error('Selecciona una acción válida.');
  if (input.accion === 'descartar') return { factura_id: input.factura_id, version: Number(input.version), accion: 'descartar', datos: {} };
  if (!input.datos || typeof input.datos !== 'object' || Array.isArray(input.datos)) throw new Error('Revisa los datos de la factura.');
  const raw = input.datos as Record<string, unknown>;
  const allowed = ['proveedor_nombre','proveedor_identificacion','numero_factura','fecha_emision','base_imponible','iva_importe','importe_total','moneda'];
  if (Object.keys(raw).some(key => !allowed.includes(key))) throw new Error('La revisión contiene campos no permitidos.');
  function text(key: string, label: string, max: number) {
    if (raw[key] == null || raw[key] === '') return null;
    if (typeof raw[key] !== 'string' || String(raw[key]).length > max) throw new Error(`Revisa «${label}».`);
    return String(raw[key]).trim() || null;
  }
  function amount(key: string, label: string) {
    if (raw[key] == null || raw[key] === '') return null;
    if (!['string','number'].includes(typeof raw[key])) throw new Error(`Revisa «${label}».`);
    const value = String(raw[key]).trim().replace(',', '.');
    if (!/^-?\d{1,12}(\.\d{1,2})?$/.test(value) || !Number.isFinite(Number(value))) throw new Error(`Escribe «${label}» con un máximo de dos decimales, por ejemplo 240,00.`);
    return Number(value);
  }
  const datos: InvoiceReviewData = {
    proveedor_nombre: text('proveedor_nombre','Proveedor',300),
    proveedor_identificacion: text('proveedor_identificacion','NIF',100),
    numero_factura: text('numero_factura','Número',200), fecha_emision: text('fecha_emision','Fecha',10),
    base_imponible: amount('base_imponible','Base'), iva_importe: amount('iva_importe','IVA'),
    importe_total: amount('importe_total','Total'), moneda: text('moneda','Moneda',3)?.toUpperCase() || null,
  };
  if (datos.fecha_emision && (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha_emision) || !Number.isFinite(new Date(`${datos.fecha_emision}T00:00:00Z`).getTime()) || new Date(`${datos.fecha_emision}T00:00:00Z`).toISOString().slice(0,10) !== datos.fecha_emision)) throw new Error('Introduce una fecha válida.');
  if (datos.moneda && !/^[A-Z]{3}$/.test(datos.moneda)) throw new Error('Indica una moneda de tres letras, por ejemplo EUR.');
  if (input.accion === 'validar' && Object.values(datos).some(value => value === null)) throw new Error('Completa proveedor, NIF, número, fecha, base, IVA, total y moneda antes de validar.');
  return { factura_id: input.factura_id, version: Number(input.version), accion: input.accion as 'guardar' | 'validar', datos };
}
