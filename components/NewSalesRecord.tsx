'use client';
import { useEffect, useRef, useState } from 'react';
import { useDialog } from './useDialog';
import ValidatedForm from './ValidatedForm';
import SearchableSelect from './SearchableSelect';
import { loadCrmDirectory } from '@/lib/crmDirectory';
import type { Oportunidad } from '@/lib/types';
import { btnGhost, btnPrimary, inputCls, labelCls, tituloOportunidad } from './ui';
export default function NewSalesRecord({ kind, onClose, onSaved }: { kind: 'cliente' | 'actividad' | 'comercial'; onClose: () => void; onSaved: () => void }) {
  const [id] = useState(() => crypto.randomUUID());
  const [busy,setBusy] = useState(false); const pending = useRef(false);
  const [error,setError] = useState(''); const [options,setOptions] = useState<Oportunidad[]>([]);
  const [loading,setLoading] = useState(kind === 'actividad');
  const title = kind === 'cliente' ? 'Nuevo cliente' : kind === 'actividad' ? 'Nueva actividad' : 'Añadir comercial';
  const dialog = useDialog<HTMLDivElement>(() => { if (!pending.current) onClose(); });
  async function load() {
    setLoading(true); setError('');
    try { setOptions((await loadCrmDirectory()).oportunidades); } catch { setError('No se pudieron cargar las oportunidades.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { if (kind === 'actividad') load(); }, [kind]);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending.current) return;
    const form = new FormData(event.currentTarget); pending.current = true; setBusy(true); setError('');
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('/api/crm/ventas', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ ...Object.fromEntries(form), tipo:kind, id }), signal:controller.signal });
      const result = await response.json(); if (!response.ok || result.ok !== true || result.id !== id) throw new Error(result.error || 'No se pudo confirmar el guardado.');
      onSaved(); onClose();
    } catch (failure) { setError(failure instanceof Error && failure.name !== 'AbortError' ? failure.message : 'No se pudo confirmar el guardado. Tus datos se conservan; actualiza la lista antes de repetir.'); }
    finally { clearTimeout(timer); pending.current = false; setBusy(false); }
  }
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="new-sales-title" tabIndex={-1} className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-xl bg-white p-6">
    <div className="flex flex-wrap justify-between items-center gap-4 mb-6"><h2 id="new-sales-title" className="text-xl font-semibold">{title}</h2><button type="button" className={btnGhost} disabled={busy} onClick={onClose}>Cancelar</button></div>
    {error && <p role="alert" className="mb-4 text-red-700">⚠ {error}</p>}
    {loading && <p role="status">Cargando oportunidades…</p>}
    {kind === 'actividad' && !loading && !options.length && <p className="mb-4">Crea una oportunidad en Mi flujo antes de añadir actividades.</p>}
    {kind === 'actividad' && error && <button type="button" className={btnGhost} onClick={load}>Reintentar carga</button>}
    <ValidatedForm onSubmit={save} className="space-y-4" aria-busy={busy}><fieldset disabled={busy} className="space-y-4">
      <div><label htmlFor="sales-name" className={labelCls}>{kind === 'actividad' ? 'Actividad' : 'Nombre'} *</label><input id="sales-name" name="nombre" required maxLength={200} className={inputCls} /></div>
      {kind === 'actividad' ? <><div><label htmlFor="sales-opportunity" className={labelCls}>Oportunidad *</label><SearchableSelect id="sales-opportunity" name="oportunidad_id" required className={inputCls}><option value="">Selecciona una oportunidad</option>{options.map(item => <option key={item.id} value={item.id}>{tituloOportunidad(item)}</option>)}</SearchableSelect></div><div><label htmlFor="sales-due" className={labelCls}>Fecha límite</label><input id="sales-due" name="fecha_limite" type="date" className={inputCls} /></div></> : <><div><label htmlFor="sales-email" className={labelCls}>Correo electrónico</label><input id="sales-email" name="email" type="email" maxLength={254} className={inputCls} /></div>{kind === 'cliente' && <><div><label htmlFor="sales-company" className={labelCls}>Empresa</label><input id="sales-company" name="empresa" maxLength={200} className={inputCls} /></div><div><label htmlFor="sales-phone" className={labelCls}>Teléfono</label><input id="sales-phone" name="telefono" type="tel" maxLength={40} className={inputCls} /></div></>}</>}
    </fieldset><button type="submit" disabled={busy || loading || (kind === 'actividad' && !options.length)} className={btnPrimary}>{busy ? 'Guardando…' : 'Guardar'}</button></ValidatedForm>
  </div></div>;
}
