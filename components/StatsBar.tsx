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
    { n: total, l: 'Oportunidades', sub: `${abiertas.length} abiertas`, icon: 'layers', tone: '#5B6C8F' },
    { n: fmtMoney(valorPipeline), l: 'Valor en pipeline', sub: 'Oportunidades abiertas', icon: 'trend', tone: '#AE8148' },
    { n: ganadas.length, l: 'Eventos ganados', sub: fmtMoney(valorGanado), icon: 'check', tone: '#4B5E45' },
    { n: `${tasa}%`, l: 'Tasa de conversión', sub: `${cerradas} cerradas`, icon: 'percent', tone: '#7A1F2B' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-6">
      {stats.map((s) => (
        <div key={s.l} className="bg-white border border-line rounded-xl p-4 shadow-card flex items-start justify-between">
          <div className="min-w-0">
            <div className="text-xs font-medium text-ink-soft">{s.l}</div>
            <div className="text-xl sm:text-2xl font-semibold mt-1 tabular-nums">{s.n}</div>
            <div className="text-xs text-ink-soft mt-0.5">{s.sub}</div>
          </div>
          <span
            className="w-9 h-9 rounded-lg inline-flex items-center justify-center shrink-0"
            style={{ backgroundColor: s.tone + '1A', color: s.tone }}
          >
            <Icon name={s.icon} className="w-[18px] h-[18px]" />
          </span>
        </div>
      ))}
    </div>
  );
}
