'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Chart, registerables, type Plugin } from 'chart.js';
import { UserIcon, BuildingOffice2Icon, ChartBarIcon } from '@heroicons/react/24/outline';

Chart.register(...registerables);

import type { Empresa, Oportunidad } from '@/lib/types';
import { ESTADOS } from '@/lib/types';
import { summarizeEventTypes, type EventTypeSummary } from '@/lib/dashboardCharts';
import { fmtMoney, Icon } from './ui';

const OBJETIVO_PIPELINE = 60000;

// Okabe–Ito: labels and dark contours also identify data without color.
const CHART_COLORS = ['#0072B2', '#E69F00', '#009E73', '#D55E00', '#CC79A7', '#56B4E9'] as const;
const MONEY_CHART_COLOR = '#0072B2';

const barValues: Plugin<'bar'> = {
  id: 'accessibleBarValues',
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const horizontal = chart.options.indexAxis === 'y';
    ctx.save();
    ctx.fillStyle = '#111827';
    ctx.font = '600 16px system-ui, sans-serif';
    ctx.textAlign = horizontal ? 'left' : 'center';
    ctx.textBaseline = horizontal ? 'middle' : 'bottom';
    chart.getDatasetMeta(0).data.forEach((bar, index) => {
      ctx.fillText(String(chart.data.datasets[0].data[index]), bar.x + (horizontal ? 8 : 0), bar.y - (horizontal ? 0 : 8));
    });
    ctx.restore();
  },
};


function Gauge({ value, goal }: { value: number; goal: number }) {
  const pct = Math.max(0, Math.min(1, goal > 0 ? value / goal : 0));
  const totalTicks = 40;
  const litTicks = Math.round(pct * totalTicks);

  return (
    <div className="flex flex-col items-center">
      <svg role="img" aria-label={`Objetivo comercial: ${fmtMoney(value)} de ${fmtMoney(goal)}`} viewBox="0 0 200 110" className="w-full max-w-[300px]">
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
              x1={Number(x1.toFixed(4))}
              y1={Number(y1.toFixed(4))}
              x2={Number(x2.toFixed(4))}
              y2={Number(y2.toFixed(4))}
              strokeWidth={3}
              strokeLinecap="round"
              stroke={i < litTicks ? MONEY_CHART_COLOR : '#E2E8F0'}
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const chart = new Chart(canvasRef.current, {
      type: 'bar',
      plugins: [barValues],
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            label: 'Nuevas oportunidades',
            data: data.map((d) => d.value),
            backgroundColor: MONEY_CHART_COLOR,
            borderColor: '#111827',
            borderWidth: 2,
            borderRadius: 6,
            hoverBackgroundColor: 'rgba(37, 99, 235, 0.85)',
          },
        ],
      },
      options: {
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        layout: { padding: { top: 28, right: 12 } },
        plugins: {
          legend: { display: false },
          title: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `${context.parsed.y} oportunidades`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            min: 0,
            grid: { color: '#EEF2F7' },
            ticks: { precision: 0, color: '#475569', font: { size: 16 } },
          },
          x: {
            grid: { display: false },
            ticks: { color: '#475569', font: { size: 16 } },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [data]);

  return (
    <div><section className="mb-4" aria-label="Datos de nuevas oportunidades por mes"><h3 className="font-semibold">Oportunidades por mes</h3><ul>{data.map((item) => <li key={item.label}>{item.label}: {item.value} oportunidades</li>)}</ul></section><div className="chart-visual relative h-[250px] w-full">
      <canvas ref={canvasRef} role="img" aria-label={`Nuevas oportunidades por mes: ${data.map((d) => `${d.label}: ${d.value}`).join(', ')}`} />
    </div></div>
  );
}

function EventTypeBars({ data }: { data: EventTypeSummary[] }) {
  const [active, setActive] = useState<number | null>(null);
  const tooltipId = useId();
  const helpId = useId();
  const chartRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [tooltipPosition, setTooltipPosition] = useState<{ left: number; top: number; maxHeight: number } | null>(null);
  const total = data.reduce((sum, item) => sum + item.n, 0);
  const maximum = Math.max(1, ...data.map((item) => item.n));
  const selected = active === null ? null : data[active];
  const count = (n: number) => `${n} ${n === 1 ? 'oportunidad abierta' : 'oportunidades abiertas'}`;
  const share = (n: number) => `${(total ? n / total * 100 : 0).toLocaleString('es-ES', { maximumFractionDigits: 1 })} %`;

  useEffect(() => {
    if (active === null) { setTooltipPosition(null); return; }
    const position = () => {
      const bar = barRefs.current[active];
      const tooltip = tooltipRef.current;
      if (!bar || !tooltip) return;
      const rect = bar.getBoundingClientRect();
      const width = Math.min(360, window.innerWidth - 32);
      const height = Math.min(tooltip.scrollHeight, window.innerHeight - 32);
      const beside = rect.left >= width + 16 || window.innerWidth - rect.right >= width + 16;
      if (beside) {
        setTooltipPosition({ left: rect.left >= width + 16 ? rect.left - width : rect.right,
          top: Math.max(16, Math.min(rect.top, window.innerHeight - height - 16)), maxHeight: window.innerHeight - 32 });
      } else {
        const below = window.innerHeight - rect.bottom - 16;
        const above = rect.top - 16;
        const placeBelow = below >= height || below >= above;
        const maxHeight = Math.max(44, placeBelow ? below : above);
        setTooltipPosition({ left: Math.max(16, Math.min(rect.left, window.innerWidth - width - 16)),
          top: placeBelow ? rect.bottom : Math.max(16, rect.top - Math.min(height, maxHeight)), maxHeight });
      }
    };
    position();
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    return () => { window.removeEventListener('resize', position); window.removeEventListener('scroll', position, true); };
  }, [active, data]);

  return <div className="flex flex-1 min-w-0 flex-col">
    <div className="flex flex-1 items-center justify-center py-6">
      <div ref={chartRef} role="group" aria-label="Oportunidades abiertas por tipo de evento" aria-describedby={helpId}
        className="relative w-full max-w-xl"
        onPointerLeave={() => { if (!chartRef.current?.contains(document.activeElement)) setActive(null); }}
        onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActive(null); }}
        onKeyDown={(event) => { if (event.key === 'Escape') { setActive(null); event.stopPropagation(); } }}>
        <div className="space-y-1">
          {data.map((item, index) => <button key={item.key} type="button"
            ref={(element) => { barRefs.current[index] = element; }}
            className="grid w-full min-h-12 grid-cols-[minmax(0,6.5rem)_minmax(0,1fr)_3ch] items-center gap-2 rounded-lg px-1 py-2 text-left hover:bg-slate-50 focus-visible:bg-slate-50"
            aria-label={`${item.label}: ${count(item.n)}`}
            aria-describedby={active === index ? tooltipId : undefined}
            onPointerEnter={() => setActive(index)} onFocus={() => setActive(index)} onClick={() => setActive(index)}>
            <span className="text-sm text-slate-700">{item.label}</span>
            <span aria-hidden="true" className="block h-5 w-full rounded bg-slate-100">
              <span className="event-type-bar block h-full rounded border border-slate-900" style={{ width: `${item.n / maximum * 100}%`, backgroundColor: MONEY_CHART_COLOR, borderWidth: item.n ? 1 : 0 }} />
            </span>
            <span aria-hidden="true" className="text-sm font-semibold tabular-nums text-slate-900">{item.n}</span>
          </button>)}
        </div>
        {selected && <div ref={tooltipRef} id={tooltipId} role="tooltip"
          className="event-chart-tooltip fixed z-[60] overflow-y-auto rounded-lg border border-slate-500 bg-slate-900 p-4 text-base text-white shadow-lg"
          style={{ width: 'min(360px, calc(100vw - 32px))', visibility: tooltipPosition ? 'visible' : 'hidden', ...tooltipPosition }}>
            <p className="font-semibold">{selected.label} · {count(selected.n)}</p>
            <p className="mt-1">{share(selected.n)} de las {total} oportunidades abiertas.</p>
            <p className="mt-1">{selected.estimatedAmount === null ? 'Sin presupuesto indicado.' : `Presupuesto estimado informado: ${fmtMoney(selected.estimatedAmount)}.`}</p>
            {selected.key === 'otro' && <p className="mt-1">{selected.descriptions.length ? `Tipos registrados: ${selected.descriptions.join(', ')}.` : 'Eventos de otras categorías, distintos de bodas, corporativos, comuniones y cumpleaños.'}</p>}
            <p className="mt-2 text-sm">Solicitudes todavía abiertas. No incluye las oportunidades ganadas ni las perdidas.</p>
        </div>}
      </div>
    </div>
    <p id={helpId} className="text-sm text-neutral-600">Pasa por una barra, tócala o enfócala con Tab para ver el detalle. Escape cierra la información.</p>
    <details className="mt-3">
      <summary className="flex min-h-12 cursor-pointer items-center font-medium">Ver todos los datos del gráfico</summary>
      <ul className="space-y-3 pt-2">{data.map((item) => <li key={item.key}><strong>{item.label}:</strong> {count(item.n)} · {share(item.n)} del total · presupuesto estimado {fmtMoney(item.estimatedAmount)}.</li>)}</ul>
    </details>
  </div>;
}
function StatusDonut({ segments, total }: { segments: { label: string; value: number; color: string }[]; total: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const chart = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: segments.map((s) => s.label),
        datasets: [
          {
            data: segments.map((s) => s.value),
            backgroundColor: segments.map((s) => s.color),
            borderColor: '#111827',
            borderWidth: 2,
            hoverOffset: 5,
          },
        ],
      },
      options: {
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = Number(context.raw) || 0;
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                return `${context.label}: ${value} · ${pct}%`;
              },
            },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [segments, total]);

  return (
    <div className="flex flex-wrap justify-center items-center gap-7 min-h-[190px]">
      <div className="chart-visual relative h-[190px] w-[190px] shrink-0">
        <canvas ref={canvasRef} role="img" aria-label={`Reparto por estado: ${segments.map((item) => `${item.label}: ${item.value}`).join(', ')}`} />
      </div>
      <div className="min-w-0 basis-[13rem] flex-1">
        <div className="text-2xl font-semibold tabular-nums leading-none mb-4">{total}</div>
        <div className="space-y-2">
          {segments.map((s) => (
            <div key={s.label} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 text-neutral-600 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
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
  const chartPalette = CHART_COLORS;
  const segments = estadosAbiertos.map((e, index) => ({
    label: e.label,
    value: abiertas.filter((o) => o.estado === e.key).length,
    color: chartPalette[index % chartPalette.length],
  }));

  // Cuántas oportunidades abiertas hay de cada tipo de evento, para ver qué
  // formato de celebración está tirando más del pipeline ahora mismo.
  const porTipoEvento = summarizeEventTypes(oportunidades);

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
    <div className="grid grid-cols-12 gap-6 px-6 mb-2">
      <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-card flex min-w-0 flex-col">
        <h2 className="w-full flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
          <Icon name="gauge" className="w-4 h-4" />
          Objetivo comercial (orientativo)
        </h2>
        <div className="flex flex-1 min-h-[280px] items-center justify-center py-6"><div className="w-full max-w-[300px]"><Gauge value={pipeline} goal={OBJETIVO_PIPELINE} /></div></div>
      </div>

      <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-card flex min-w-0 flex-col">
        <h2 className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-4">
          <Icon name="layers" className="w-4 h-4" />
          Reparto por estado
        </h2>
        <div className="flex flex-1 min-h-[280px] items-center justify-center py-6"><div className="w-full"><StatusDonut segments={segments} total={abiertas.length} /></div></div>
      </div>

      <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-card flex min-w-0 flex-col">
        <h2 className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-4">
          <Icon name="calendar" className="w-4 h-4" />
          Oportunidades por tipo de evento
        </h2>
        {abiertas.length > 0 ? (
          <EventTypeBars data={porTipoEvento} />
        ) : (
          <p className="text-sm text-neutral-500">Todavía no hay oportunidades abiertas.</p>
        )}
      </div>

      <div className="col-span-12 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-4 items-stretch">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-card min-w-0">
          <h2 className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-4">
            <Icon name="trend" className="w-4 h-4" />
            Nuevas oportunidades por mes
          </h2>
          <MonthlyBars data={evolucionMensual} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-card flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-neutral-700 mb-1">Contactos solicitantes</div>
              <div className="text-2xl font-semibold tabular-nums">{contactosSolicitantes}</div>
            </div>
            <UserIcon className="w-7 h-7 text-neutral-700 shrink-0" aria-hidden="true" />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-card flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-neutral-700 mb-1">Empresas solicitantes</div>
              <div className="text-2xl font-semibold tabular-nums">{empresasSolicitantes}</div>
            </div>
            <BuildingOffice2Icon className="w-7 h-7 text-neutral-700 shrink-0" aria-hidden="true" />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-card flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-neutral-700 mb-1">Oportunidades totales</div>
              <div className="text-2xl font-semibold tabular-nums">{oportunidadesTotales}</div>
            </div>
            <ChartBarIcon className="w-7 h-7 text-neutral-700 shrink-0" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}
