'use client';

import { useState } from 'react';
import type { Oportunidad, EstadoOportunidad } from '@/lib/types';
import { ESTADOS } from '@/lib/types';
import LeadCard from './LeadCard';
import { fmtMoney } from './ui';

export default function KanbanBoard({
  oportunidades,
  onCardClick,
  onDrop,
}: {
  oportunidades: Oportunidad[];
  onCardClick: (o: Oportunidad) => void;
  onDrop: (id: string, estado: EstadoOportunidad) => void;
}) {
  const [over, setOver] = useState<EstadoOportunidad | null>(null);

  return (
    <div className="flex gap-4 px-6 pb-10 overflow-x-auto items-start">
      {ESTADOS.map((est) => {
        const items = oportunidades.filter((o) => o.estado === est.key);
        const total = items.reduce((s, o) => s + (Number(o.presupuesto_estimado) || 0), 0);
        const activa = over === est.key;
        return (
          <div
            key={est.key}
            className={`rounded-xl min-w-[264px] flex-1 max-w-[340px] border transition-colors ${
              activa ? 'bg-wine/[0.06] border-wine/40' : 'bg-[#EDEBE7] border-transparent'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(est.key);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setOver(null);
              const id = e.dataTransfer.getData('text/plain');
              if (id) onDrop(id, est.key);
            }}
          >
            <div className="px-3.5 pt-3.5 pb-2.5">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: est.color }} />
                  {est.label}
                </h3>
                <span className="text-xs font-medium text-ink-soft bg-white rounded-full px-2 py-0.5 shadow-card">
                  {items.length}
                </span>
              </div>
              <div className="text-xs text-ink-soft mt-1 tabular-nums">{fmtMoney(total)}</div>
            </div>
            <div className="px-2.5 pb-2.5 flex flex-col gap-2.5 min-h-[72px]">
              {items.length === 0 && (
                <div className="text-xs text-ink-soft/70 text-center py-5 border border-dashed border-ink-soft/25 rounded-lg">
                  Arrastra aquí una oportunidad
                </div>
              )}
              {items.map((o) => (
                <LeadCard
                  key={o.id}
                  oportunidad={o}
                  color={est.color}
                  onClick={() => onCardClick(o)}
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', o.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
