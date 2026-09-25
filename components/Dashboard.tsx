'use client';

import type { Empresa, Oportunidad } from '@/lib/types';
import { ESTADOS } from '@/lib/types';
import { fmtMoney, Icon } from './ui';

const OBJETIVO_PIPELINE = 60000;

function Gauge({ value, goal }: { value: number; goal: number }) {
  const pct = Math.max(0, Math.min(1, goal > 0 ? value / goal : 0));
  const totalTicks = 40;
  const litTicks = Math.round(pct * totalTicks);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 110" className="w-full max-w-[220px]">
        {Array.from({ length: totalTicks }).map((_, i) => {
          const angle = -180 + (i / (totalTicks - 1)) * 180;
          const rad = (angle * Math.PI) / 180;
          const r1 = 78;
          const r2 = 92;
          const cx = 100;
          const cy = 100;
          const x1 = cx + r1 * Math.cos(rad);
          const y1 = cy + r1 * Math.sin(rad);
          const x2 = cx + r2 * Math.cos(rad);
          const y2 = cy + r2 * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              strokeWidth={3}
              strokeLinecap="round"
              stroke={i < litTicks ? '#7a1f2b' : '#E5E5E5'}
            />
          );
        })}
      </svg>
      <div className="-mt-9 text-center">
        <div className="text-2xl font-semibold tabular-nums">{fmtMoney(value)}</div>
        <div className="text-xs text-neutral-500">de {fmtMoney(goal)}</div>
      </div>
    </div>
  );
}

function Donut({ segments, total }: { segments: { label: string; value: number; color: string }[]; total: number }) {
  const size = 132;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 shrink-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F0F0F0" strokeWidth={stroke} />
        {segments.map((s) => {
          const frac = total > 0 ? s.value / total : 0;
          const dash = frac * c;
          const circle = (
            <circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += dash;
          return circle;
        })}
        <circle cx={size / 2} cy={size / 2} r={r - stroke / 2 - 2} fill="white" />
      </svg>
      <div className="min-w-0 flex-1">
        <div className="text-2xl font-semibold tabular-nums leading-none mb-3">{total}</div>
        <div className="space-y-1.5">
          {segments.map((s) => (
            <div key={s.label} className="flex items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-neutral-600 min-w-0 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
              <span className="tabular-nums text-neutral-500 shrink-0">
                {s.value} · {total > 0 ? Math.round((s.value / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ oportunidades, empresas }: { oportunidades: Oportunidad[]; empresas: Empresa[] }) {
  const abiertas = oportunidades.filter((o) => !['ganado', 'perdido'].includes(o.estado));
  const pipeline = abiertas.reduce((s, o) => s + (Number(o.presupuesto_estimado) || 0), 0);

  const estadosAbiertos = ESTADOS.filter((e) => e.key !== 'ganado' && e.key !== 'perdido');
  const segments = estadosAbiertos.map((e) => ({
    label: e.label,
    value: abiertas.filter((o) => o.estado === e.key).length,
    color: e.color,
  }));

  const porCiudad = new Map<string, number>();
  for (const e of empresas) {
    const ciudad = (e.ciudad || 'Sin ciudad').trim() || 'Sin ciudad';
    porCiudad.set(ciudad, (porCiudad.get(ciudad) || 0) + 1);
  }
  const ranking = [...porCiudad.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCiudad = ranking.length ? ranking[0][1] : 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-6 mb-2">
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card flex flex-col items-center">
        <div className="w-full flex items-center gap-2 text-sm font-medium text-neutral-500 mb-2">
          <Icon name="gauge" className="w-4 h-4" />
          Objetivo de pipeline
        </div>
        <Gauge value={pipeline} goal={OBJETIVO_PIPELINE} />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-500 mb-4">
          <Icon name="layers" className="w-4 h-4" />
          Reparto por estado
        </div>
        <Donut segments={segments} total={abiertas.length} />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-500 mb-4">
          <Icon name="pin" className="w-4 h-4" />
          Empresas por ciudad
        </div>
        <div className="space-y-2.5">
          {ranking.map(([ciudad, n]) => (
            <div key={ciudad} className="flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0 truncate text-neutral-600">{ciudad}</span>
              <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                <div className="h-full bg-[var(--crm-accent)] rounded-full" style={{ width: `${(n / maxCiudad) * 100}%` }} />
              </div>
              <span className="w-6 text-right tabular-nums text-neutral-500 shrink-0">{n}</span>
            </div>
          ))}
          {ranking.length === 0 && <p className="text-sm text-neutral-500">Todavía no hay empresas con ciudad.</p>}
        </div>
      </div>
    </div>
  );
}
