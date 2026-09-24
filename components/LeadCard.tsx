'use client';

import type { Oportunidad } from '@/lib/types';
import { Avatar, Icon, eventoLabel, fmtDate, fmtMoney, tituloOportunidad } from './ui';

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
  const titulo = tituloOportunidad(oportunidad);
  const contacto = oportunidad.cliente.nombre;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      style={{ borderLeftColor: color }}
      className="bg-white border border-line border-l-[3px] rounded-lg p-3 text-sm cursor-grab active:cursor-grabbing shadow-card hover:shadow-card-hover transition-shadow"
    >
      <div className="font-semibold leading-snug line-clamp-2" title={titulo}>{titulo}</div>
      <div className="text-xs text-ink-soft mt-0.5 truncate">
        {contacto !== titulo ? `${contacto} · ` : ''}
        {eventoLabel(oportunidad)}
      </div>

      <div className="flex items-center gap-3.5 mt-2.5 text-xs text-ink-soft">
        <span className="inline-flex items-center gap-1">
          <Icon name="calendar" className="w-3.5 h-3.5" /> {fmtDate(oportunidad.fecha_evento)}
        </span>
        {oportunidad.num_invitados ? (
          <span className="inline-flex items-center gap-1">
            <Icon name="guests" className="w-3.5 h-3.5" /> {oportunidad.num_invitados}
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-line">
        <span className="font-semibold tabular-nums">{fmtMoney(oportunidad.presupuesto_estimado)}</span>
        <span className="flex items-center gap-1.5 text-xs text-ink-soft min-w-0">
          {oportunidad.comercial && <span className="truncate max-w-[90px]">{oportunidad.comercial.nombre.split(' ')[0]}</span>}
          <Avatar nombre={oportunidad.comercial?.nombre} size={24} />
        </span>
      </div>
    </div>
  );
}
