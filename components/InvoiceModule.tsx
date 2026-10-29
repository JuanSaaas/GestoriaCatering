'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import CrmShell from './CrmShell';
import { useDialog } from './useDialog';
import { btnGhost, btnPrimary, fmtDate, inputCls, labelCls } from './ui';
import { DOCUMENT_STATUS, invoiceMoney, type Invoice, type InvoiceDocument, type InvoicePage } from '@/lib/invoices';

function stamp(value: string) {
  return new Date(value).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Madrid' });
}

function InvoiceDetails({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const ref = useDialog<HTMLDivElement>(onClose);
  return <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="invoice-title" tabIndex={-1} className="w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6"><h2 id="invoice-title" className="text-xl font-semibold">Factura {invoice.numero_factura || 'sin número legible'}</h2><button className={btnGhost} type="button" onClick={onClose}>Cerrar ficha</button></div>
      <p className="mb-4 font-medium">{invoice.estado === 'revisar' ? '⚠ Revisar datos' : '✓ Datos extraídos'}. Comprueba el original antes de contabilizar.</p>
      <dl className="space-y-4">
        <div><dt className="font-medium">Proveedor</dt><dd>{invoice.proveedor_nombre || 'Sin indicar'}</dd></div>
        <div><dt className="font-medium">Identificación del proveedor</dt><dd>{invoice.proveedor_identificacion || 'Sin indicar'}</dd></div>
        <div><dt className="font-medium">Fecha de emisión</dt><dd>{invoice.fecha_emision ? fmtDate(invoice.fecha_emision) : 'Sin indicar'}</dd></div>
        <div><dt className="font-medium">Base imponible</dt><dd>{invoiceMoney(invoice.base_imponible, invoice.moneda)}</dd></div>
        <div><dt className="font-medium">Impuestos y retenciones</dt><dd>{invoice.impuestos.length ? <ul className="space-y-2">{invoice.impuestos.map((tax, index) => <li key={index}>{tax.nombre}{tax.porcentaje !== null ? ` (${Number(tax.porcentaje).toLocaleString('es-ES')} %)` : ''}: {invoiceMoney(tax.importe, invoice.moneda)}</li>)}</ul> : 'No se han identificado impuestos. Comprueba el documento.'}</dd></div>
        <div><dt className="font-medium">Importe total</dt><dd className="font-semibold">{invoiceMoney(invoice.importe_total, invoice.moneda)}</dd></div>
        <div><dt className="font-medium">Modelo utilizado</dt><dd className="break-all">{invoice.modelo_ia}</dd></div>
        <div><dt className="font-medium">Fecha de extracción</dt><dd>{stamp(invoice.creado_en)}</dd></div>
        {invoice.observaciones && <div><dt className="font-medium">Información adicional del documento</dt><dd className="whitespace-pre-wrap break-words">{invoice.observaciones}</dd></div>}
      </dl>
      {!!invoice.advertencias.length && <section className="mt-6 border border-amber-700 bg-amber-50 rounded-lg p-4"><h3 className="font-semibold">⚠ Datos por revisar</h3><ul className="list-disc pl-6 mt-2 space-y-2">{invoice.advertencias.map((warning, index) => <li key={index}>{warning}</li>)}</ul></section>}
    </div>
  </div>;
}

export default function InvoiceModule() {
  const [data, setData] = useState<InvoicePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ query: '', status: 'todas', page: 1 });
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);
  const generation = useRef(0);
  const retryPending = useRef(false);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    const request = ++generation.current;
    setLoading(true); setError('');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const params = new URLSearchParams({ q: filters.query, estado: filters.status, pagina: String(filters.page) });
      const response = await fetch(`/api/crm/facturas?${params}`, { cache: 'no-store', signal: controller.signal });
      const result = await response.json().catch(() => { throw new Error('No se pudo leer la respuesta de Facturas. Vuelve a intentarlo.'); });
      if (response.status === 401) throw new Error('Tu sesión ha caducado. Vuelve a entrar al CRM.');
      if (!response.ok) throw new Error(typeof result?.error === 'string' ? result.error : 'No se pudieron cargar las facturas.');
      if (!['facturas', 'documentos', 'intentos'].every(key => Array.isArray(result[key]))) throw new Error('La respuesta de Facturas está incompleta. Vuelve a intentarlo.');
      if (mounted.current && request === generation.current) setData(result);
    } catch (failure) {
      if (mounted.current && request === generation.current) setError(failure instanceof Error && failure.name !== 'AbortError' ? failure.message : 'La conexión ha tardado demasiado. Vuelve a intentarlo.');
    } finally {
      clearTimeout(timeout);
      if (mounted.current && request === generation.current) setLoading(false);
    }
  }, [filters]);

  useEffect(() => { mounted.current = true; load(); return () => { mounted.current = false; generation.current++; }; }, [load]);

  async function retry(doc: InvoiceDocument) {
    if (retryPending.current) return;
    retryPending.current = true;
    setRetrying(doc.id); setNotice(''); setError('');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('/api/crm/facturas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accion: 'reintentar', documento_id: doc.id }), signal: controller.signal });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error(result.error || 'No se pudo preparar el reintento.');
      if (mounted.current) { setNotice(`✓ «${doc.archivo_nombre}» queda pendiente para la próxima pasada del agente.`); await load(); }
    } catch (failure) {
      if (mounted.current) setError(failure instanceof Error && failure.name !== 'AbortError' ? failure.message : 'No se pudo confirmar el reintento. Actualiza la lista antes de repetirlo.');
    } finally { clearTimeout(timeout); retryPending.current = false; if (mounted.current) setRetrying(null); }
  }

  const agent = data?.agente;
  const recentAgent = agent && Date.now() - new Date(agent.actualizado_en).getTime() < 5 * 60 * 1000;
  const filtered = !!filters.query || filters.status !== 'todas';

  return <CrmShell><div className="p-4 sm:p-6 space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-semibold">Facturas</h1><p className="text-neutral-600 mt-2 max-w-[65ch]">Consulta las facturas que el agente extrae de la carpeta del servidor. Los documentos originales se conservan para su revisión.</p></div><button type="button" disabled={loading} className={btnPrimary} onClick={load}>{loading ? 'Actualizando…' : 'Actualizar facturas'}</button></header>
    <section aria-labelledby="invoice-agent-heading" className="rounded-xl border border-neutral-300 bg-white p-4 sm:p-6">
      <h2 id="invoice-agent-heading" className="font-semibold text-lg">Automatización de documentos</h2>
      <p className="mt-2 font-medium">{!agent ? '○ Agente sin conexión registrada' : !recentAgent ? '◷ Sin actividad reciente del agente' : agent.estado === 'incidencia' ? '⚠ El agente necesita atención' : '✓ Agente conectado'}</p>
      <p className="mt-2 text-neutral-700">{agent ? agent.mensaje : 'Para comenzar, administración debe configurar y ejecutar el agente Python en el servidor y depositar las facturas en su carpeta de entrada.'}</p>
      <p className="mt-2 text-neutral-600">Modelo principal: Gemini 2.5 Flash. Si su proveedor alcanza un límite temporal, se prueban las alternativas configuradas. El saldo de OpenRouter se comparte entre modelos.</p>
      {agent && <p className="mt-2 text-neutral-600">Última señal: {stamp(agent.actualizado_en)}. Consulta el estado actualizado con «Actualizar facturas».</p>}
      <details className="mt-4"><summary className="min-h-12 cursor-pointer underline">Cómo funciona la entrada de documentos</summary><ol className="list-decimal pl-6 space-y-2 mt-2"><li>Deposita PDF, JPG, PNG o WebP en la carpeta de entrada configurada en el servidor.</li><li>El agente comprueba el archivo, aplica OCR cuando hace falta y extrae los datos.</li><li>Supabase guarda el resultado y evita duplicados. Los datos ausentes se indican para revisión.</li><li>Revisa el documento original antes de utilizar los importes en contabilidad.</li></ol>{!!agent?.modelos?.length && <p className="mt-4 break-words">Orden configurado: {agent.modelos.join(' → ')}.</p>}</details>
    </section>

    {error && <div role="alert" className="rounded-lg border border-amber-700 bg-amber-50 p-4"><p>⚠ {error}</p>{data && <p className="mt-2">Se muestran los últimos datos cargados; su estado puede haber cambiado.</p>}<button type="button" className={`${btnGhost} mt-3`} disabled={loading} onClick={load}>Reintentar carga</button></div>}
    {notice && <p role="status" className="rounded-lg border border-green-700 bg-green-50 text-green-900 p-4">{notice}</p>}
    {loading && <p role="status">◷ Cargando facturas y actividad del agente…</p>}

    <section aria-labelledby="invoice-list-heading" aria-busy={loading}>
      <h2 id="invoice-list-heading" className="text-xl font-semibold mb-4">Facturas extraídas</h2>
      <form onSubmit={e => { e.preventDefault(); setFilters(previous => ({ ...previous, query: search, page: 1 })); }} className="space-y-4 mb-6">
        <div><label htmlFor="invoice-search" className={labelCls}>Buscar por número o proveedor</label><input id="invoice-search" type="search" maxLength={120} className={inputCls} value={search} onChange={e => setSearch(e.target.value)} placeholder="Número, nombre o identificación del proveedor" /></div>
        <div><label htmlFor="invoice-status" className={labelCls}>Estado de los datos</label><select id="invoice-status" className={inputCls} value={filters.status} onChange={e => setFilters(previous => ({ ...previous, status: e.target.value, page: 1 }))}><option value="todas">Todos los estados</option><option value="extraida">✓ Datos extraídos</option><option value="revisar">⚠ Revisar datos</option></select></div>
        <button type="submit" className={btnGhost}>Buscar facturas</button>
      </form>
      {data && !data.facturas.length && <div className="border border-dashed border-neutral-400 rounded-xl bg-white p-6"><p>{filtered ? 'No hay facturas con estos filtros.' : 'Todavía no hay facturas extraídas. Deposita los documentos en la carpeta del servidor y comprueba que el agente está conectado.'}</p>{filtered && <button type="button" className={`${btnGhost} mt-4`} onClick={() => { setSearch(''); setFilters({ query: '', status: 'todas', page: 1 }); }}>Limpiar filtros</button>}</div>}
      {!!data?.facturas.length && <div role="region" tabIndex={0} aria-label="Tabla de facturas extraídas" className="overflow-x-auto rounded-xl border border-neutral-300 bg-white"><table className="w-full text-left"><caption className="sr-only">Facturas extraídas, con proveedor, fecha, importe, estado y modelo de inteligencia artificial</caption><thead><tr>{['Factura', 'Proveedor', 'Fecha', 'Total', 'Estado', 'Modelo', 'Detalle'].map(label => <th scope="col" className="p-4 border-b border-neutral-300" key={label}>{label}</th>)}</tr></thead><tbody>{data.facturas.map(invoice => <tr key={invoice.id}><th scope="row" className="p-4 border-b border-neutral-200 font-medium">{invoice.numero_factura || 'Sin número legible'}</th><td className="p-4 border-b border-neutral-200">{invoice.proveedor_nombre || 'Sin indicar'}</td><td className="p-4 border-b border-neutral-200 whitespace-nowrap">{invoice.fecha_emision ? fmtDate(invoice.fecha_emision) : 'Sin indicar'}</td><td className="p-4 border-b border-neutral-200 text-right tabular-nums whitespace-nowrap">{invoiceMoney(invoice.importe_total, invoice.moneda)}</td><td className="p-4 border-b border-neutral-200">{invoice.estado === 'revisar' ? '⚠ Revisar datos' : '✓ Extraída'}</td><td className="p-4 border-b border-neutral-200 break-words">{invoice.modelo_ia}</td><td className="p-4 border-b border-neutral-200"><button type="button" className={btnGhost} aria-label={`Ver factura ${invoice.numero_factura || 'sin número'} de ${invoice.proveedor_nombre || 'proveedor sin indicar'}`} onClick={() => setSelected(invoice)}>Ver factura</button></td></tr>)}</tbody></table></div>}
      {data && data.total > 25 && <nav aria-label="Páginas de facturas" className="mt-4 flex flex-wrap items-center gap-3"><button type="button" className={btnGhost} disabled={loading || filters.page === 1} onClick={() => setFilters(previous => ({ ...previous, page: previous.page - 1 }))}>Página anterior</button><span>Página {filters.page} de {Math.ceil(data.total / 25)}</span><button type="button" className={btnGhost} disabled={loading || filters.page * 25 >= data.total} onClick={() => setFilters(previous => ({ ...previous, page: previous.page + 1 }))}>Página siguiente</button></nav>}
    </section>

    <section aria-labelledby="invoice-queue-heading"><h2 id="invoice-queue-heading" className="text-xl font-semibold mb-4">Documentos y reintentos</h2><p className="text-neutral-600 mb-4">Últimos 50 documentos registrados. Reintentar conserva el original y vuelve a ponerlo en la cola; el agente debe estar ejecutándose.</p>{data && !data.documentos.length && <p className="border border-dashed border-neutral-400 rounded-xl p-6 bg-white">No se han registrado documentos. Los archivos aparecerán aquí cuando el agente los detecte.</p>}<ul className="space-y-3">{data?.documentos.map(doc => <li key={doc.id} className="rounded-lg border border-neutral-300 bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-semibold break-words">{doc.archivo_nombre}</h3><p className="mt-2">{DOCUMENT_STATUS[doc.estado]} · {doc.intentos} de {doc.max_intentos} intentos en este ciclo</p>{doc.error_mensaje && <p className="mt-2">⚠ {doc.error_mensaje}</p>}{doc.estado === 'reintento' && <p className="mt-2">Próximo intento a partir de {stamp(doc.siguiente_intento)}.</p>}</div>{['revisar', 'reintento'].includes(doc.estado) && <button type="button" className={btnGhost} disabled={!!retrying} aria-label={`Reintentar ${doc.archivo_nombre}`} onClick={() => retry(doc)}>{retrying === doc.id ? 'Preparando reintento…' : 'Reintentar documento'}</button>}</div></li>)}</ul></section>

    <section aria-labelledby="invoice-history-heading"><h2 id="invoice-history-heading" className="text-xl font-semibold mb-4">Actividad de los modelos</h2><p className="text-neutral-600 mb-4">Últimos 50 intentos de extracción y alternativas descartadas.</p>{data && !data.intentos.length && <p>No hay intentos de extracción registrados.</p>}<ul className="space-y-3">{data?.intentos.map(attempt => <li key={attempt.id} className="rounded-lg border border-neutral-300 bg-white p-4"><p className="font-medium break-all">{attempt.resultado === 'correcto' ? '✓ Extracción correcta' : attempt.resultado === 'omitido' ? '○ Modelo no compatible o no disponible' : '⚠ Intento fallido'} · {attempt.modelo}</p><p className="mt-2">{data.documentos.find(doc => doc.id === attempt.documento_id)?.archivo_nombre || `Documento ${attempt.documento_id.slice(0, 8)}`} · {stamp(attempt.creado_en)}</p>{attempt.mensaje && <p className="mt-2">{attempt.mensaje}</p>}</li>)}</ul></section>
    {selected && <InvoiceDetails invoice={selected} onClose={() => setSelected(null)} />}
  </div></CrmShell>;
}
