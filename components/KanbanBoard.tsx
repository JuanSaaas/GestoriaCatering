'use client';

import type { Oportunidad, EstadoOportunidad } from '@/lib/types';
import { ESTADOS } from '@/lib/types';
import LeadCard from './LeadCard';

export default function KanbanBoard({
  oportunidades,
  onCardClick,
  onDrop,
}: {
  oportunidades: Oportunidad[];
  onCardClick: (o: Oportunidad) => void;
  onDrop: (id: string, estado: EstadoOportunidad) => void;
}) {
  return (
    <div className="flex gap-4 px-7 pb-10 overflow-x-auto items-start">
      {ESTADOS.map((est) => {
        const items = oportunidades.filter((o) => o.estado === est.key);
        return (
          <div
            key={est.key}
            style={{ borderTopColor: est.color }}
            className="bg-paper-2 border border-[var(--line)] border-t-[3px] rounded-sm min-w-[250px] max-w-[280px] flex-1"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData('text/plain');
              onDrop(id, est.key);
            }}
          >
            <div className="px-3.5 py-3 border-b border-[var(--line)] flex justify-between items-baseline">
              <h3 className="text-sm font-semibold">{est.label}</h3>
              <span className="text-xs text-ink-soft">{items.length}</span>
            </div>
            <div className="p-2.5 flex flex-col gap-2.5 min-h-[60px]">
              {items.length === 0 && (
                <div className="text-xs text-ink-soft text-center py-3.5">Sin oportunidades</div>
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
