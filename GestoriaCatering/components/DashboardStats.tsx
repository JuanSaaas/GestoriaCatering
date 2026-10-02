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
    { n: fmtMoney(pipeline), l: 'Pipeline', icon: 'gauge' },
    { n: fmtMoney(ponderado), l: 'Ponderado', icon: 'percent' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 px-6">
      {stats.map((s) => (
        <div key={s.l} className="bg-white border border-neutral-200 rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 mb-2">
            <Icon name={s.icon} className="w-3.5 h-3.5" />
            {s.l}
          </div>
          <div className="text-xl font-semibold tabular-nums truncate">{s.n}</div>
        </div>
      ))}
    </div>
  );
}
