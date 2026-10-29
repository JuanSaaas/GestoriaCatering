'use client';

import type { Cliente, Empresa, Oportunidad } from '@/lib/types';
import { fmtMoney, Icon } from './ui';
import type { IconName } from './ui';

// Probabilidad de cierre estimada por estado, para calcular el "ponderado".
const PROBABILIDAD: Record<string, number> = {
  nuevo: 0.1,
  contactado: 0.25,
  presupuesto_enviado: 0.5,
  negociacion: 0.75,
  ganado: 1,
  perdido: 0,
};

export default function DashboardStats({
  empresas,
  contactos,
  oportunidades,
}: {
  empresas: Empresa[];
  contactos: Cliente[];
  oportunidades: Oportunidad[];
}) {
  const abiertas = oportunidades.filter((o) => !['ganado', 'perdido'].includes(o.estado));
  const pipeline = abiertas.reduce((s, o) => s + (Number(o.presupuesto_estimado) || 0), 0);
  const ponderado = abiertas.reduce(
    (s, o) => s + (Number(o.presupuesto_estimado) || 0) * (PROBABILIDAD[o.estado] ?? 0),
    0
  );

  const stats: { n: string | number; l: string; icon: IconName }[] = [
    { n: empresas.length, l: 'Empresas', icon: 'building' },
    { n: contactos.length, l: 'Contactos', icon: 'user' },
    { n: abiertas.length, l: 'Abiertas', icon: 'layers' },
    { n: oportunidades.length, l: 'Total', icon: 'trend' },
    { n: fmtMoney(pipeline), l: 'Importe abierto', icon: 'gauge' },
    { n: fmtMoney(ponderado), l: 'Previsión estimada', icon: 'percent' },
  ];

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-4 px-6">
      {stats.map((s) => (
        <div key={s.l} className="bg-white border border-neutral-200 rounded-xl p-4 shadow-card min-h-[168px] flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-base font-semibold text-neutral-700 min-h-12">
            <Icon name={s.icon} className="w-4 h-4 shrink-0" />
            {s.l}
          </div>
          <div className="text-2xl font-semibold tabular-nums my-auto min-w-0 max-w-full [overflow-wrap:anywhere]">{s.n}</div><p className="text-xs text-neutral-600 min-h-8 mt-2">{s.l === 'Previsión estimada' ? 'Según la fase de cada oportunidad' : ''}</p>
        </div>
      ))}
    </div>
  );
}
