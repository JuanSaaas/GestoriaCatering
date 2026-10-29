export type InvoiceStatus = 'extraida' | 'revisar';
export type DocumentStatus = 'pendiente' | 'procesando' | 'reintento' | 'revisar' | 'completada' | 'duplicada';
export const DOCUMENT_STATUS: Record<DocumentStatus, string> = {
  pendiente: '◷ Pendiente', procesando: '↻ Procesando', reintento: '◷ Reintento previsto',
  revisar: '⚠ Requiere revisión', completada: '✓ Guardada', duplicada: '≡ Duplicada',
};
export type Invoice = {
  id: string; documento_id: string; numero_factura: string | null; fecha_emision: string | null;
  proveedor_nombre: string | null; proveedor_identificacion: string | null;
  base_imponible: number | string | null; importe_total: number | string | null; moneda: string | null;
  impuestos: { nombre: string; porcentaje: number | string | null; importe: number | string | null }[];
  observaciones: string | null; advertencias: string[]; estado: InvoiceStatus; modelo_ia: string; creado_en: string;
};
export type InvoiceDocument = {
  id: string; archivo_nombre: string; estado: DocumentStatus; intentos: number; max_intentos: number;
  siguiente_intento: string; error_codigo: string | null; error_mensaje: string | null; actualizado_en: string;
};
export type InvoiceAttempt = { id: number; documento_id: string; modelo: string; resultado: 'correcto' | 'error' | 'omitido'; categoria: string | null; mensaje: string | null; creado_en: string };
export type InvoiceAgent = { estado: 'activo' | 'incidencia'; mensaje: string; modelos: string[]; actualizado_en: string };
export type InvoicePage = { facturas: Invoice[]; documentos: InvoiceDocument[]; intentos: InvoiceAttempt[]; agente: InvoiceAgent | null; total: number; pagina: number };

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
  if (!['todas', 'extraida', 'revisar'].includes(estado)) throw new Error('Selecciona un estado de factura válido.');
  // Literal text only: never allow PostgREST filter syntax through the search box.
  const query = (url.searchParams.get('q') || '').slice(0, 120).replace(/[,().%_*\\]/g, ' ').trim();
  return { pagina, estado, query };
}
