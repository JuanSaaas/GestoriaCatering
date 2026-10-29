'use client';

import type { Oportunidad } from '@/lib/types';
import { Icon, fmtMoney } from './ui';
import type { IconName } from './ui';

export default function StatsBar({ oportunidades }: { oportunidades: Oportunidad[] }) {
  const total = oportunidades.length;
  const abiertas = oportunidades.filter((o) => !['ganado', 'perdido'].includes(o.estado));
  const valorPipeline = abiertas.reduce((s, o) => s + (Number(o.presupuesto_estimado) || 0), 0);
  const ganadas = oportunidades.filter((o) => o.estado === 'ganado');
  const valorGanado = ganadas.reduce((s, o) => s + (Number(o.presupuesto_estimado) || 0), 0);
  const cerradas = oportunidades.filter((o) => ['ganado', 'perdido'].includes(o.estado)).length;
  const tasa = cerradas ? Math.round((ganadas.length / cerradas) * 100) : 0;

  const stats: { n: string | number; l: string; sub: string; icon: IconName; tone: string }[] = [
    { n: total, l: 'Oportunidades', sub: `${abiertas.length} abiertas`, icon: 'layers', tone: '#0A0A0A' },
    { n: fmtMoney(valorPipeline), l: 'Importe abierto', sub: 'Oportunidades abiertas', icon: 'trend', tone: '#2563EB' },
    { n: ganadas.length, l: 'Eventos ganados', sub: fmtMoney(valorGanado), icon: 'check', tone: '#166534' },
    { n: `${tasa}%`, l: 'Tasa de conversión', sub: `${cerradas} cerradas`, icon: 'percent', tone: '#4F46E5' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6">
      {stats.map((s) => (
        <div key={s.l} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card min-h-[168px] relative text-center">
          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold text-neutral-700 min-h-12 flex items-center justify-center px-5">{s.l}</div>
            <div className="text-2xl font-semibold mt-2 tabular-nums break-words">{s.n}</div>
            <div className="text-xs text-neutral-500 mt-0.5">{s.sub}</div>
          </div>
          <span
            className="absolute right-3 top-3 w-6 h-6 inline-flex items-center justify-center shrink-0"
            style={{ color: s.tone }}
          >
            <Icon name={s.icon} className="w-[18px] h-[18px]" />
          </span>
        </div>
      ))}
    </div>
  );
}
