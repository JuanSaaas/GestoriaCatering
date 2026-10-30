'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ClockIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import CrmShell from './CrmShell';
import { useDialog } from './useDialog';
import { btnGhost, btnPrimary, fmtDate, inputCls, labelCls } from './ui';
import ValidatedForm from './ValidatedForm';
import InvoiceUploadDialog from './InvoiceUploadDialog';
import InvoiceRowActions from './InvoiceRowActions';
import { INVOICE_REVIEW_STATUS, invoiceMoney, invoiceReviewInput, type Invoice, type InvoicePage } from '@/lib/invoices';

function stamp(value: string) {
  return new Date(value).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Madrid' });
}

function InvoiceDetails({ invoice, onClose, onSaved }: { invoice: Invoice; onClose: () => void; onSaved: (invoice: Invoice) => void }) {
  const initialForm = (value: Invoice) => ({
    proveedor_nombre: value.proveedor_nombre || '', proveedor_identificacion: value.proveedor_identificacion || '',
    numero_factura: value.numero_factura || '', fecha_emision: value.fecha_emision || '', moneda: value.moneda || '',
    base_imponible: value.base_imponible == null ? '' : Number(value.base_imponible).toFixed(2).replace('.',','),
    iva_importe: value.iva_importe == null ? '' : Number(value.iva_importe).toFixed(2).replace('.',','),
    importe_total: value.importe_total == null ? '' : Number(value.importe_total).toFixed(2).replace('.',','),
  });
  const [form,setForm] = useState(() => initialForm(invoice));
  const [dirty,setDirty] = useState(false);
  const [busy,setBusy] = useState(false);
  const pending = useRef(false);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const title = invoice.numero_factura || 'sin número legible';
  function close() {
    if (pending.current) return;
    if (dirty && !window.confirm(`La factura «${title}» tiene cambios sin guardar. ¿Cerrar la ficha y perder esas correcciones?`)) return;
    onClose();
  }
  const ref = useDialog<HTMLDivElement>(close);
  async function save() {
    if (pending.current) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setError(''); setNotice('');
    let input;
    try { input = invoiceReviewInput({ accion: 'guardar', factura_id: invoice.id, version: invoice.revision_version, datos: form }); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Revisa los datos.'); return; }
    pending.current = true; setBusy(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(),15000);
    try {
      const response = await fetch('/api/crm/facturas',{ method:'POST', headers:{'Content-Type':'application/json'},body:JSON.stringify(input),signal:controller.signal });
      const result = await response.json();
      if (!response.ok || result.ok !== true || !result.factura || result.factura.id !== invoice.id) throw new Error(result.error || 'No se pudo confirmar el guardado.');
      const updated = { ...invoice, ...result.factura };
      setForm(initialForm(updated)); setDirty(false); onSaved(updated);
      setNotice('✓ Correcciones guardadas. La factura queda por revisar.');
    } catch (failure) { setError(failure instanceof Error && failure.name !== 'AbortError' ? failure.message : 'No se pudo confirmar el guardado. Tus correcciones siguen en pantalla; consulta la versión guardada antes de repetir.'); }
    finally {
      clearTimeout(timeout); pending.current = false; setBusy(false);
      requestAnimationFrame(() => {
        if (trigger?.isConnected && !ref.current?.contains(document.activeElement)) trigger.focus();
      });
    }
  }
  const currency = form.moneda === 'EUR' ? '€' : form.moneda;
  const fields = [
    ['proveedor_nombre','Proveedor','text'], ['proveedor_identificacion','NIF','text'],
    ['numero_factura','Número','text'], ['fecha_emision','Fecha','date'],
    ['base_imponible',`Base${currency ? ` (${currency})` : ''}`,'text'],
    ['iva_importe',`IVA${currency ? ` (${currency})` : ''}`,'text'],
    ['importe_total',`Total${currency ? ` (${currency})` : ''}`,'text'],
  ] as const;
  return <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) close(); }}>
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="invoice-title" tabIndex={-1} className="w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6"><h2 id="invoice-title" className="text-xl font-semibold">Factura {title}</h2><button className={btnGhost} type="button" disabled={busy} onClick={close}>Cerrar ficha</button></div>
      <p className="mb-4 font-medium">{INVOICE_REVIEW_STATUS[invoice.estado_revision || 'pendiente']}. Contrasta cada dato con el original antes de validar.</p>
      {invoice.original_disponible ? <a className={`${btnGhost} mb-4`} href={`/api/crm/facturas/${invoice.id}/original`} target="_blank" rel="noopener noreferrer">Ver original (nueva pestaña)</a> : <p className="mb-4 text-neutral-600">El original estará disponible cuando el agente lo sincronice con el almacenamiento privado.</p>}
      {error && <p role="alert" className="mb-4 border border-amber-700 bg-amber-50 p-3 rounded-lg">⚠ {error}</p>}
      {notice && <p role="status" className="mb-4 border border-green-700 bg-green-50 p-3 rounded-lg">{notice}</p>}
      <ValidatedForm onSubmit={event => { event.preventDefault(); save(); }} aria-busy={busy} className="space-y-4 mb-6">
        <p className="text-neutral-600">Corrige los datos y guarda los cambios. Después podrás validar o denegar desde la tabla.</p>
        <fieldset disabled={busy} className="space-y-4">
          {fields.map(([name,label,type]) => {
            const money = ['base_imponible','iva_importe','importe_total'].includes(name);
            return <div key={name}><label htmlFor={`invoice-${name}`} className={labelCls}>{label}</label><input id={`invoice-${name}`} name={name} type={type} value={form[name]}
              maxLength={name === 'proveedor_nombre' ? 300 : name === 'numero_factura' ? 200 : money ? 16 : 100}
              inputMode={money ? 'decimal' : undefined} pattern={money ? '-?\\d{1,12}([.,]\\d{1,2})?' : undefined}
              aria-describedby={money ? 'invoice-money-help' : undefined} className={inputCls}
              onChange={event => { setForm(previous => ({...previous,[name]:event.target.value}));setDirty(true); }} /></div>;
          })}
          {<div><label htmlFor="invoice-currency" className={labelCls}>Moneda de la factura</label><input id="invoice-currency" maxLength={3} pattern="[A-Za-z]{3}" value={form.moneda} className={inputCls} placeholder="Por ejemplo EUR" onChange={event => {setForm(previous => ({...previous,moneda:event.target.value.toUpperCase()}));setDirty(true);}} /></div>}
          <p id="invoice-money-help" className="text-sm text-neutral-600">Importes con dos decimales, por ejemplo 240,00. El IVA es el importe en dinero, no el porcentaje.</p>
        </fieldset>
        <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-4">
          <button disabled={busy} type="submit" className={btnPrimary}>{busy ? 'Guardando…' : 'Guardar correcciones'}</button>
        </div>
      </ValidatedForm>
      <details><summary className="min-h-12 cursor-pointer font-medium">Ver información de la extracción</summary>
      <dl className="space-y-4">
        <div><dt className="font-medium">Desglose de impuestos extraído inicialmente</dt><dd>{invoice.impuestos.length ? <ul className="space-y-2">{invoice.impuestos.map((tax, index) => <li key={index}>{tax.nombre}{tax.porcentaje !== null ? ` (${Number(tax.porcentaje).toLocaleString('es-ES')} %)` : ''}: {invoiceMoney(tax.importe, invoice.moneda)}</li>)}</ul> : 'Sin desglose legible.'}</dd></div>
        <div><dt className="font-medium">Modelo utilizado</dt><dd className="break-all">{invoice.modelo_ia}</dd></div>
        <div><dt className="font-medium">Fecha de extracción</dt><dd>{stamp(invoice.creado_en)}</dd></div>
        {invoice.observaciones && <div><dt className="font-medium">Información adicional del documento</dt><dd className="whitespace-pre-wrap break-words">{invoice.observaciones}</dd></div>}
      </dl>
      {!!invoice.advertencias.length && <section className="mt-6 border border-amber-700 bg-amber-50 rounded-lg p-4"><h3 className="font-semibold">⚠ Advertencias de la extracción inicial</h3><ul className="list-disc pl-6 mt-2 space-y-2">{invoice.advertencias.map((warning, index) => <li key={index}>{warning}</li>)}</ul></section>}
      </details>
    </div>
  </div>;
}

export default function InvoiceModule() {
  const [data, setData] = useState<InvoicePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3000);
    return () => clearTimeout(timer);
  }, [notice]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ query: '', status: 'todas', page: 1 });
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const generation = useRef(0);
  const mounted = useRef(true);
  const fetching = useRef(false);

  const load = useCallback(async (background = false) => {
    if (background && fetching.current) return;
    fetching.current = true;
    const request = ++generation.current;
    if (!background) { setLoading(true); setError(''); }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const params = new URLSearchParams({ q: filters.query, estado: filters.status, pagina: String(filters.page) });
      const response = await fetch(`/api/crm/facturas?${params}`, { cache: 'no-store', signal: controller.signal });
      const result = await response.json().catch(() => { throw new Error('No se pudo leer la respuesta de Facturas. Vuelve a intentarlo.'); });
      if (response.status === 401) throw new Error('Tu sesión ha caducado. Vuelve a entrar al CRM.');
      if (!response.ok) throw new Error(typeof result?.error === 'string' ? result.error : 'No se pudieron cargar las facturas.');
      if (!['facturas', 'documentos', 'intentos'].every(key => Array.isArray(result[key]))) throw new Error('La respuesta de Facturas está incompleta. Vuelve a intentarlo.');
      if (mounted.current && request === generation.current) { setData(result); setError(''); }
    } catch (failure) {
      if (mounted.current && request === generation.current) setError(failure instanceof Error && failure.name !== 'AbortError' ? failure.message : 'La conexión ha tardado demasiado. Vuelve a intentarlo.');
    } finally {
      clearTimeout(timeout);
      if (mounted.current && request === generation.current) { fetching.current = false; setLoading(false); }
    }
  }, [filters]);

  useEffect(() => { mounted.current = true; load(); return () => { mounted.current = false; generation.current++; }; }, [load]);
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible' && !selected && !uploadOpen && !reviewing) load(true);
    }, 10000);
    return () => clearInterval(timer);
  }, [autoRefresh, load, selected, uploadOpen, reviewing]);

  const filtered = !!filters.query || filters.status !== 'todas';

  return <CrmShell><div className="p-4 sm:p-6 space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-semibold">Facturas</h1><p className="text-neutral-600 mt-2 max-w-[65ch]">Sube las facturas y consulta los datos que extrae el lector. Los documentos originales se conservan para su revisión.</p></div><div className="flex flex-wrap gap-3"><button type="button" disabled={loading} className={btnGhost} onClick={() => load()}>{loading ? 'Actualizando…' : 'Actualizar facturas'}</button><button type="button" className={btnPrimary} onClick={() => setUploadOpen(true)}>Subir facturas</button></div></header>


    {error && <div role="alert" className="rounded-lg border border-amber-700 bg-amber-50 p-4"><p>⚠ {error}</p>{data && <p className="mt-2">Se muestran los últimos datos cargados; su estado puede haber cambiado.</p>}<button type="button" className={`${btnGhost} mt-3`} disabled={loading} onClick={() => load()}>Reintentar carga</button></div>}
    {notice && <p role="status" className="rounded-lg border border-green-700 bg-green-50 text-green-900 p-4">{notice}</p>}
    {loading && <p role="status">◷ Cargando facturas y actividad del agente…</p>}

    <section aria-labelledby="invoice-list-heading" aria-busy={loading}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h2 id="invoice-list-heading" className="text-xl font-semibold">Facturas de proveedores</h2>
        <button type="button" className={`${btnGhost} ml-auto`} onClick={() => setAutoRefresh(previous => !previous)}>{autoRefresh ? 'Pausar actualización automática' : 'Reanudar actualización automática'}</button>
      </div>
      {data?.recuentos && <div role="status" aria-atomic="true" className="mb-6">
        <dl aria-label="Resumen de revisión de facturas" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {([
            { key: 'pendiente', label: 'Por revisar', Icon: ClockIcon, note: 'Pendientes de aprobación' },
            { key: 'validada', label: 'Validadas', Icon: CheckIcon, note: 'Revisión completada' },
            { key: 'descartada', label: 'Descartadas', Icon: XMarkIcon, note: 'Originales conservados' },
          ] as const).map(({ key, label, Icon, note }) => <div key={key} className="rounded-2xl border border-neutral-300 bg-white bg-none p-6 shadow-none">
            <div className="flex items-start justify-between gap-4">
              <div><dt className="font-medium text-neutral-600">{label}</dt><dd className="mt-2 text-3xl font-semibold tracking-tight tabular-nums text-neutral-900">{data.recuentos![key]}</dd></div>
              <Icon aria-hidden="true" className="mt-1 shrink-0 text-blue-600" style={{ width: 20, height: 20 }} strokeWidth={1.75} />
            </div>
            <p className="mt-4 text-sm text-neutral-600">{note}</p>
          </div>)}
        </dl>
      </div>}
      <form onSubmit={e => { e.preventDefault(); setFilters(previous => ({ ...previous, query: search, page: 1 })); }} className="space-y-4 mb-6">
        <div><label htmlFor="invoice-search" className={labelCls}>Buscar por número o proveedor</label><input id="invoice-search" type="search" maxLength={120} className={inputCls} value={search} onChange={e => setSearch(e.target.value)} placeholder="Número, nombre o identificación del proveedor" /></div>
        <div><label htmlFor="invoice-status" className={labelCls}>Estado de la factura</label><select id="invoice-status" className={inputCls} value={filters.status} onChange={e => setFilters(previous => ({ ...previous, status: e.target.value, page: 1 }))}><option value="todas">Todos los estados</option><option value="pendiente">◷ Por revisar</option><option value="validada">✓ Validadas</option><option value="descartada">× Descartadas</option><option value="extraida">✓ Datos extraídos</option><option value="revisar">⚠ Extracción con advertencias</option></select></div>
        <button type="submit" className={btnGhost}>Buscar facturas</button>
      </form>
      {data && !data.facturas.length && <div className="border border-dashed border-neutral-400 rounded-xl bg-white p-6"><p>{filtered ? 'No hay facturas con estos filtros.' : 'Todavía no hay facturas leídas. Utiliza «Subir facturas» para guardarlas en la carpeta de entrada. Sus datos aparecerán cuando el lector las procese.'}</p>{filtered && <button type="button" className={`${btnGhost} mt-4`} onClick={() => { setSearch(''); setFilters({ query: '', status: 'todas', page: 1 }); }}>Limpiar filtros</button>}</div>}
      {!!data?.facturas.length && <div role="region" tabIndex={0} aria-label="Tabla de facturas extraídas" className="overflow-x-auto rounded-xl border border-neutral-300 bg-white"><table className="w-full min-w-[56rem] text-left"><caption className="sr-only">Facturas de proveedores con NIF, fecha, base, IVA, total y estado de revisión</caption><thead><tr>{['Factura', 'Proveedor y NIF', 'Fecha', 'Base', 'IVA', 'Total', 'Estado'].map(label => <th scope="col" className="p-4 border-b border-neutral-300 whitespace-nowrap" key={label}>{label}</th>)}</tr></thead><tbody>{data.facturas.map(invoice => <tr key={invoice.id}><th scope="row" className="p-4 border-b border-neutral-200 font-medium"><button type="button" className="min-h-12 underline text-left hover:no-underline" title="Corregir datos de la factura" aria-label={`Corregir datos de la factura ${invoice.numero_factura || 'sin número'} de ${invoice.proveedor_nombre || 'proveedor sin indicar'}`} onClick={() => setSelected(invoice)}>{invoice.numero_factura || 'Sin número legible'}</button></th><td className="p-4 border-b border-neutral-200">{invoice.proveedor_nombre || 'Sin indicar'}<span className="block mt-2 text-neutral-600">{invoice.proveedor_identificacion || 'NIF sin indicar'}</span></td><td className="p-4 border-b border-neutral-200 whitespace-nowrap">{invoice.fecha_emision ? fmtDate(invoice.fecha_emision) : 'Sin indicar'}</td><td className="p-4 border-b border-neutral-200 text-right tabular-nums whitespace-nowrap">{invoiceMoney(invoice.base_imponible, invoice.moneda)}</td><td className="p-4 border-b border-neutral-200 text-right tabular-nums whitespace-nowrap">{invoiceMoney(invoice.iva_importe, invoice.moneda)}</td><td className="p-4 border-b border-neutral-200 text-right tabular-nums whitespace-nowrap">{invoiceMoney(invoice.importe_total, invoice.moneda)}</td><td className="p-4 border-b border-neutral-200"><InvoiceRowActions invoice={invoice} blocked={reviewing || loading} onBusy={setReviewing} onSaved={async updated => { setData(previous => previous ? { ...previous, facturas: previous.facturas.map(row => row.id === updated.id ? updated : row) } : previous); setNotice(`✓ Factura «${updated.numero_factura || 'sin número'}» ${updated.estado_revision === 'validada' ? 'validada' : 'denegada. El original se conserva'}.`); await load(); }} /></td></tr>)}</tbody></table></div>}
      {data && data.total > 25 && <nav aria-label="Páginas de facturas" className="mt-4 flex flex-wrap items-center gap-3"><button type="button" className={btnGhost} disabled={loading || filters.page === 1} onClick={() => setFilters(previous => ({ ...previous, page: previous.page - 1 }))}>Página anterior</button><span>Página {filters.page} de {Math.ceil(data.total / 25)}</span><button type="button" className={btnGhost} disabled={loading || filters.page * 25 >= data.total} onClick={() => setFilters(previous => ({ ...previous, page: previous.page + 1 }))}>Página siguiente</button></nav>}
    </section>

    {selected && <InvoiceDetails key={selected.id} invoice={selected} onClose={() => setSelected(null)} onSaved={invoice => { setSelected(invoice); load(); }} />}
    {uploadOpen && <InvoiceUploadDialog onClose={() => setUploadOpen(false)} onUploaded={count => { load(); setNotice(`✓ ${count} ${count === 1 ? 'factura guardada' : 'facturas guardadas'} · Pendientes de lectura.`); }} />}
  </div></CrmShell>;
}
