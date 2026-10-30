'use client';

import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDialog } from './useDialog';
import { invoiceReviewInput, type Invoice } from '@/lib/invoices';
import { btnGhost } from './ui';
import DecisionControl from './DecisionControl';

function ConfirmRejection({ number, onCancel, onConfirm }: { number: string; onCancel: () => void; onConfirm: () => void }) {
  const dialog = useDialog<HTMLDivElement>(onCancel);
  return createPortal(<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={event => { if (event.target === event.currentTarget) onCancel(); }}>
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="invoice-deny-title" tabIndex={-1} className="w-full max-w-md rounded-xl border border-neutral-300 bg-white p-6">
      <h2 id="invoice-deny-title" className="text-lg font-semibold">¿Seguro que deseas denegar la factura {number}?</h2>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" className={btnGhost} onClick={onCancel}>Cancelar</button>
        <DecisionControl decision="reject" label="Rechazar" onClick={onConfirm} />
      </div>
    </div>
  </div>, document.body);
}

export default function InvoiceRowActions({ invoice, blocked, onBusy, onSaved }: {
  invoice: Invoice; blocked: boolean; onBusy: (busy: boolean) => void; onSaved: (invoice: Invoice) => void | Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const pending = useRef(false);
  const name = `factura ${invoice.numero_factura || 'sin número'} de ${invoice.proveedor_nombre || 'proveedor sin indicar'}`;

  async function review(action: 'validar' | 'descartar') {
    if (pending.current || blocked) return;
    setError('');
    let input;
    try {
      input = invoiceReviewInput({ factura_id: invoice.id, version: invoice.revision_version, accion: action, datos: {
        proveedor_nombre: invoice.proveedor_nombre, proveedor_identificacion: invoice.proveedor_identificacion,
        numero_factura: invoice.numero_factura, fecha_emision: invoice.fecha_emision,
        base_imponible: invoice.base_imponible, iva_importe: invoice.iva_importe,
        importe_total: invoice.importe_total, moneda: invoice.moneda,
      } });
    } catch (failure) {
      setError(`${failure instanceof Error ? failure.message : 'Revisa los datos.'} Pulsa el número de factura para corregirlos.`);
      return;
    }
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    pending.current = true; setBusy(true); onBusy(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('/api/crm/facturas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal: controller.signal });
      const result = await response.json();
      const status = action === 'validar' ? 'validada' : 'descartada';
      if (!response.ok || result.ok !== true || result.factura?.id !== invoice.id || result.factura?.estado_revision !== status) throw new Error(result.error || 'No se pudo confirmar el cambio de estado.');
      await onSaved({ ...invoice, ...result.factura });
    } catch (failure) {
      setError(failure instanceof Error && failure.name !== 'AbortError' ? failure.message : 'No se pudo confirmar el cambio. Actualiza antes de repetir la acción.');
    } finally {
      clearTimeout(timer); pending.current = false; setBusy(false); onBusy(false);
      requestAnimationFrame(() => {
        if (trigger?.isConnected && !trigger.matches(':disabled')) trigger.focus();
        else {
          const destination = document.getElementById(`invoice-actions-${invoice.id}`) || document.getElementById('invoice-list-heading');
          if (destination) { destination.tabIndex = -1; destination.focus(); }
        }
      });
    }
  }

  return <div id={`invoice-actions-${invoice.id}`} role="group" tabIndex={-1} aria-label={`Acciones de la ${name}`} className="min-w-28" aria-busy={busy}>
    {invoice.estado_revision === 'validada' ?
      <DecisionControl decision="accept" label="Aceptada" />
      : invoice.estado_revision === 'descartada' ?
      <DecisionControl decision="reject" label="Rechazada" />
      : <div><p className="mb-2 text-sm text-neutral-600">Por revisar</p><div className="flex flex-wrap gap-3">
        <DecisionControl decision="accept" disabled={blocked || busy} ariaLabel={`Aceptar ${name}`} onClick={() => review('validar')} />
        <DecisionControl decision="reject" disabled={blocked || busy} ariaLabel={`Rechazar ${name}`} onClick={() => setConfirming(true)} />
      </div></div>}
    {confirming && <ConfirmRejection number={invoice.numero_factura || 'sin número'} onCancel={() => setConfirming(false)} onConfirm={() => { setConfirming(false); review('descartar'); }} />}
    {busy && <p role="status" className="mt-2">Guardando…</p>}
    {error && <p role="alert" className="mt-2 min-w-48 max-w-xs text-red-700">⚠ {error}</p>}
  </div>;
}
