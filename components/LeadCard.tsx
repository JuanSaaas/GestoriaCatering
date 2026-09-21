'use client';

import type { Oportunidad } from '@/lib/types';
import { TIPO_EVENTO_LABEL } from '@/lib/types';

function eventoLabel(o: Oportunidad) {
  if (o.tipo_evento === 'otro' && o.tipo_evento_otro) return o.tipo_evento_otro;
  return TIPO_EVENTO_LABEL[o.tipo_evento];
}

function fmtMoney(n: number | null) {
  if (n === null || n === undefined) return '—';
  return Number(n).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

function fmtDate(d: string | null) {
  if (!d) return 'sin fecha';
  return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function LeadCard({
  oportunidad,
  color,
  onClick,
  onDragStart,
}: {
  oportunidad: Oportunidad;
  color: string;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      style={{ borderLeftColor: color }}
      className="bg-paper border border-[var(--line)] border-l-[3px] rounded-sm px-3 py-2.5 text-sm cursor-grab active:cursor-grabbing"
    >
      <div className="font-semibold">{oportunidad.cliente.empresa || oportunidad.cliente.nombre}</div>
      <div className="text-xs text-ink-soft mt-1">
        {eventoLabel(oportunidad)} · {fmtDate(oportunidad.fecha_evento)}
      </div>
      <div className="text-xs text-ink-soft mt-1">
        {oportunidad.num_invitados ? `${oportunidad.num_invitados} invitados · ` : ''}
        {fmtMoney(oportunidad.presupuesto_estimado)}
      </div>
      <span className="inline-block mt-1.5 text-[11px] px-2 py-0.5 rounded-full bg-paper-2 border border-[var(--line)] text-ink-soft">
        {oportunidad.cliente.tipo_cliente === 'empresa' ? 'Empresa' : 'Particular'}
      </span>
    </div>
  );
}
