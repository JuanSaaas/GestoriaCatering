'use client';

import type { Oportunidad } from '@/lib/types';

function fmtMoney(n: number) {
  return n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

export default function StatsBar({ oportunidades }: { oportunidades: Oportunidad[] }) {
  const total = oportunidades.length;
  const abiertas = oportunidades.filter((o) => !['ganado', 'perdido'].includes(o.estado));
  const valorPipeline = abiertas.reduce((s, o) => s + (Number(o.presupuesto_estimado) || 0), 0);
  const ganadas = oportunidades.filter((o) => o.estado === 'ganado').length;
  const cerradas = oportunidades.filter((o) => ['ganado', 'perdido'].includes(o.estado)).length;
  const tasa = cerradas ? Math.round((ganadas / cerradas) * 100) : 0;

  const stats = [
    { n: total, l: 'Oportunidades totales' },
    { n: fmtMoney(valorPipeline), l: 'Valor en pipeline abierto' },
    { n: ganadas, l: 'Eventos ganados' },
    { n: `${tasa}%`, l: 'Tasa de conversión' },
  ];

  return (
    <div className="flex gap-3.5 px-7 pt-5 pb-0">
      {stats.map((s) => (
        <div key={s.l} className="flex-1 bg-paper-2 border border-[var(--line)] rounded-sm px-4.5 py-3.5">
          <div className="font-serif text-2xl font-semibold">{s.n}</div>
          <div className="text-xs text-ink-soft mt-0.5">{s.l}</div>
        </div>
      ))}
    </div>
  );
}
