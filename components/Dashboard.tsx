'use client';

import type { Empresa, Oportunidad } from '@/lib/types';
import { ESTADOS, TIPO_EVENTO_LABEL } from '@/lib/types';
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

function MonthlyBars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const n = Math.max(1, data.length);
  const points = data
    .map((d, i) => {
      const x = ((i + 0.5) / n) * 100;
      const height = d.value > 0 ? Math.max(5, (d.value / max) * 86) : 1.5;
      const y = 100 - height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div>
      <div className="relative h-36">
        <div className="absolute inset-0 flex items-end gap-3">
          {data.map((d) => {
            const height = d.value > 0 ? Math.max(5, (d.value / max) * 86) : 1.5;
            return (
              <div key={d.label} className="relative flex-1 h-full flex items-end justify-center">
                <div
                  className="relative w-full max-w-[36px] bg-[var(--crm-accent)] rounded-t-md transition-all"
                  style={{ height: `${height}%` }}
                >
                  <span className="absolute left-1/2 -translate-x-1/2 -top-5 text-[11px] text-neutral-500 tabular-nums">
                    {d.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 w-full h-full overflow-visible"
          aria-hidden="true"
        >
          <polyline
            points={points}
            fill="none"
            stroke="#1c1410"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {data.map((d, i) => {
            const x = ((i + 0.5) / n) * 100;
            const height = d.value > 0 ? Math.max(5, (d.value / max) * 86) : 1.5;
            const y = 100 - height;
            return <circle key={d.label} cx={x} cy={y} r="1.15" fill="#1c1410" vectorEffect="non-scaling-stroke" />;
          })}
        </svg>
      </div>
      <div className="flex gap-3 mt-2">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center text-xs text-neutral-500 capitalize">
            {d.label}
          </span>
        ))}
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

  // Contadores basados en solicitudes reales (oportunidades creadas).
  const contactosSolicitantes = new Set(oportunidades.map((o) => o.cliente_id).filter(Boolean)).size;
  const empresasSolicitantes = new Set(oportunidades.map((o) => o.empresa_id).filter(Boolean)).size;
  const oportunidadesTotales = oportunidades.length;

  const estadosAbiertos = ESTADOS.filter((e) => e.key !== 'ganado' && e.key !== 'perdido');
  const segments = estadosAbiertos.map((e) => ({
    label: e.label,
    value: abiertas.filter((o) => o.estado === e.key).length,
    color: e.color,
  }));

  // Cuántas oportunidades abiertas hay de cada tipo de evento, para ver qué
  // formato de celebración está tirando más del pipeline ahora mismo.
  const porTipoEvento = Object.keys(TIPO_EVENTO_LABEL).map((key) => ({
    key,
    label: TIPO_EVENTO_LABEL[key as keyof typeof TIPO_EVENTO_LABEL],
    n: abiertas.filter((o) => o.tipo_evento === key).length,
  }));
  const maxTipo = Math.max(1, ...porTipoEvento.map((t) => t.n));

  // Evolución de altas de oportunidades en los últimos 6 meses, para ver
  // si el ritmo de entrada de nuevo negocio sube o baja.
  const meses = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    return d;
  });
  const evolucionMensual = meses.map((d) => {
    const label = d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
    const value = oportunidades.filter((o) => {
      if (!o.created_at) return false;
      const od = new Date(o.created_at);
      return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth();
    }).length;
    return { label, value };
  });

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
          <Icon name="calendar" className="w-4 h-4" />
          Oportunidades por tipo de evento
        </div>
        <div className="space-y-2.5">
          {porTipoEvento.map((t) => (
            <div key={t.key} className="flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0 truncate text-neutral-600">{t.label}</span>
              <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                <div className="h-full bg-[var(--crm-accent)] rounded-full" style={{ width: `${(t.n / maxTipo) * 100}%` }} />
              </div>
              <span className="w-6 text-right tabular-nums text-neutral-500 shrink-0">{t.n}</span>
            </div>
          ))}
          {abiertas.length === 0 && <p className="text-sm text-neutral-500">Todavía no hay oportunidades abiertas.</p>}
        </div>
      </div>

      <div className="lg:col-span-3 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-4 items-stretch">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-500 mb-4">
            <Icon name="trend" className="w-4 h-4" />
            Nuevas oportunidades por mes
          </div>
          <MonthlyBars data={evolucionMensual} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-3">
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-neutral-500 mb-1">Contactos solicitantes</div>
              <div className="text-3xl font-semibold tabular-nums">{contactosSolicitantes}</div>
            </div>
            <span className="w-10 h-10 rounded-lg bg-[var(--crm-accent-soft)] text-[var(--crm-accent)] flex items-center justify-center shrink-0">
              <Icon name="user" className="w-5 h-5" />
            </span>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-neutral-500 mb-1">Empresas solicitantes</div>
              <div className="text-3xl font-semibold tabular-nums">{empresasSolicitantes}</div>
            </div>
            <span className="w-10 h-10 rounded-lg bg-[var(--crm-accent-soft)] text-[var(--crm-accent)] flex items-center justify-center shrink-0">
              <Icon name="building" className="w-5 h-5" />
            </span>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-neutral-500 mb-1">Oportunidades totales</div>
              <div className="text-3xl font-semibold tabular-nums">{oportunidadesTotales}</div>
            </div>
            <span className="w-10 h-10 rounded-lg bg-[var(--crm-accent-soft)] text-[var(--crm-accent)] flex items-center justify-center shrink-0">
              <Icon name="trend" className="w-5 h-5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
