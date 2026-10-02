'use client';

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { UserIcon, BuildingOffice2Icon, ChartBarIcon } from '@heroicons/react/24/outline';

Chart.register(...registerables);

import type { Empresa, Oportunidad } from '@/lib/types';
import { ESTADOS, TIPO_EVENTO_LABEL } from '@/lib/types';
import { fmtMoney, Icon } from './ui';

const OBJETIVO_PIPELINE = 60000;

// Paleta corta y viva, inspirada en dashboards modernos tipo Chart.js.
const CHART_COLORS = ['#2563EB', '#4F46E5', '#0891B2', '#7C3AED'] as const;
const MONEY_CHART_COLOR = '#526A8A';


function Gauge({ value, goal }: { value: number; goal: number }) {
  const pct = Math.max(0, Math.min(1, goal > 0 ? value / goal : 0));
  const totalTicks = 40;
  const litTicks = Math.round(pct * totalTicks);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 110" className="w-full max-w-[300px]">
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
              stroke={i < litTicks ? MONEY_CHART_COLOR : '#ECECEC'}
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
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            label: 'Nuevas oportunidades',
            data: data.map((d) => d.value),
            backgroundColor: 'rgba(37, 99, 235, 0.72)',
            borderColor: '#2563EB',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
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
            ticks: { precision: 0 },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [data]);

  return (
    <div className="relative h-[250px] w-full">
      <canvas ref={canvasRef} />
    </div>
  );
}

function EventTypeBars({ data }: { data: { label: string; n: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.n));
  return (
    <div className="space-y-3 py-1">
      {data.map((d, i) => (
        <div key={d.label} className="grid grid-cols-[92px_1fr_24px] items-center gap-3 group">
          <span className="text-sm font-medium text-neutral-700 truncate">{d.label}</span>
          <div className="h-3 bg-neutral-100 overflow-hidden">
            <div
              className="h-full transition-all duration-200 group-hover:brightness-95"
              style={{ width: `${d.n === 0 ? 0 : Math.max(7, (d.n / max) * 100)}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
            />
          </div>
          <span className="text-sm font-medium text-neutral-600 tabular-nums text-right">{d.n}</span>
        </div>
      ))}
    </div>
  );
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
            borderColor: '#FFFFFF',
            borderWidth: 2,
            hoverOffset: 5,
          },
        ],
      },
      options: {
        responsive: true,
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
        animation: { duration: 650 },
      },
    });

    return () => chart.destroy();
  }, [segments, total]);

  return (
    <div className="flex items-center gap-7 min-h-[190px]">
      <div className="relative h-[190px] w-[190px] shrink-0">
        <canvas ref={canvasRef} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-2xl font-semibold tabular-nums leading-none mb-4">{total}</div>
        <div className="space-y-2">
          {segments.map((s) => (
            <div key={s.label} className="flex items-center justify-between gap-4 text-sm">
              <span className="flex items-center gap-2 text-neutral-600 min-w-0 truncate">
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
  const porTipoEvento = Object.keys(TIPO_EVENTO_LABEL).map((key) => ({
    key,
    label: TIPO_EVENTO_LABEL[key as keyof typeof TIPO_EVENTO_LABEL],
    n: abiertas.filter((o) => o.tipo_evento === key).length,
  }));

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
        <div className="w-full flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
          <Icon name="gauge" className="w-4 h-4" />
          Objetivo de pipeline
        </div>
        <Gauge value={pipeline} goal={OBJETIVO_PIPELINE} />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-4">
          <Icon name="layers" className="w-4 h-4" />
          Reparto por estado
        </div>
        <StatusDonut segments={segments} total={abiertas.length} />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-4">
          <Icon name="calendar" className="w-4 h-4" />
          Oportunidades por tipo de evento
        </div>
        {abiertas.length > 0 ? (
          <EventTypeBars data={porTipoEvento} />
        ) : (
          <p className="text-sm text-neutral-500">Todavía no hay oportunidades abiertas.</p>
        )}
      </div>

      <div className="lg:col-span-3 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-4 items-stretch">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-4">
            <Icon name="trend" className="w-4 h-4" />
            Nuevas oportunidades por mes
          </div>
          <MonthlyBars data={evolucionMensual} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-3">
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-neutral-700 mb-1">Contactos solicitantes</div>
              <div className="text-2xl font-semibold tabular-nums">{contactosSolicitantes}</div>
            </div>
            <UserIcon className="w-7 h-7 text-neutral-700 shrink-0" aria-hidden="true" />
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-neutral-700 mb-1">Empresas solicitantes</div>
              <div className="text-2xl font-semibold tabular-nums">{empresasSolicitantes}</div>
            </div>
            <BuildingOffice2Icon className="w-7 h-7 text-neutral-700 shrink-0" aria-hidden="true" />
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card flex items-center justify-between gap-4">
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
