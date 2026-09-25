'use client';

import type { Oportunidad } from '@/lib/types';
import { Avatar, Icon, eventoLabel, fmtDate, fmtMoney, tituloOportunidad } from './ui';
import CompanyLogo from './CompanyLogo';

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
  const empresa = oportunidad.empresa;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      style={{ borderLeftColor: color }}
      className="bg-white border border-neutral-200 border-l-[3px] rounded-lg p-3 text-sm cursor-grab active:cursor-grabbing shadow-card hover:shadow-card-hover transition-shadow"
    >
      <div className="flex items-start gap-2">
        {empresa && (
          <CompanyLogo
            nombre={empresa.nombre}
            sitio_web={empresa.sitio_web}
            email={empresa.email}
            logo_url={empresa.logo_url}
            size={22}
          />
        )}
        <div className="font-semibold leading-snug line-clamp-2 min-w-0" title={titulo}>
          {titulo}
        </div>
      </div>
      <div className="text-xs text-neutral-500 mt-0.5 truncate">
        {contacto !== titulo ? `${contacto} · ` : ''}
        {eventoLabel(oportunidad)}
      </div>

      <div className="flex items-center gap-3.5 mt-2.5 text-xs text-neutral-500">
        <span className="inline-flex items-center gap-1">
          <Icon name="calendar" className="w-3.5 h-3.5" /> {fmtDate(oportunidad.fecha_evento)}
        </span>
        {oportunidad.num_invitados ? (
          <span className="inline-flex items-center gap-1">
            <Icon name="guests" className="w-3.5 h-3.5" /> {oportunidad.num_invitados}
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-neutral-200">
        <span className="font-semibold tabular-nums">{fmtMoney(oportunidad.presupuesto_estimado)}</span>
        <span className="flex items-center gap-1.5 text-xs text-neutral-500 min-w-0">
          {oportunidad.comercial && (
            <span className="truncate max-w-[90px]">{oportunidad.comercial.nombre.split(' ')[0]}</span>
          )}
          <Avatar nombre={oportunidad.comercial?.nombre} size={24} />
        </span>
      </div>
    </div>
  );
}
