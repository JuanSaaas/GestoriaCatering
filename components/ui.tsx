import type { Oportunidad } from '@/lib/types';
import { TIPO_EVENTO_LABEL } from '@/lib/types';

/* ---------- Formateadores ---------- */

export function fmtMoney(n: number | null | undefined) {
  if (n === null || n === undefined) return '—';
  return Number(n).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

export function fmtDate(d: string | null) {
  if (!d) return 'Sin fecha';
  return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function eventoLabel(o: Pick<Oportunidad, 'tipo_evento' | 'tipo_evento_otro'>) {
  if (o.tipo_evento === 'otro' && o.tipo_evento_otro) return o.tipo_evento_otro;
  return TIPO_EVENTO_LABEL[o.tipo_evento];
}

// Nombre principal de una oportunidad: empresa asociada > empresa escrita en el formulario > contacto
export function tituloOportunidad(o: Oportunidad) {
  return o.empresa?.nombre || o.cliente.empresa || o.cliente.nombre;
}

/* ---------- Iconos (SVG en línea, sin dependencias) ---------- */

const PATHS = {
  plus: ['M12 5v14M5 12h14'],
  search: ['M21 21l-4.3-4.3', 'M11 19a8 8 0 100-16 8 8 0 000 16z'],
  building: ['M3 21h18', 'M6 21V5a1 1 0 011-1h6a1 1 0 011 1v16', 'M14 9h3a1 1 0 011 1v11', 'M9 8h2M9 12h2M9 16h2'],
  user: ['M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2', 'M12 11a4 4 0 100-8 4 4 0 000 8z'],
  calendar: ['M8 2v4M16 2v4', 'M3 9h18', 'M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z'],
  guests: ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', 'M9 11a4 4 0 100-8 4 4 0 000 8z', 'M23 21v-2a4 4 0 00-3-3.87', 'M16 3.13a4 4 0 010 7.75'],
  close: ['M18 6L6 18M6 6l12 12'],
  layers: ['M12 2l10 5-10 5L2 7l10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],
  check: ['M20 6L9 17l-5-5'],
  trend: ['M3 17l6-6 4 4 8-8', 'M14 7h7v7'],
  percent: ['M19 5L5 19', 'M6.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5z', 'M17.5 20a2.5 2.5 0 100-5 2.5 2.5 0 000 5z'],
  alert: ['M12 9v4M12 17h.01', 'M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z'],
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = 'w-4 h-4' }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name].map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

/* ---------- Avatar con iniciales ---------- */

const AVATAR_COLORS = ['#7A1F2B', '#AE8148', '#4B5E45', '#5B6C8F', '#7A5C9E', '#B0563B'];

function iniciales(nombre: string) {
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ nombre, size = 28 }: { nombre?: string | null; size?: number }) {
  if (!nombre) {
    return (
      <span
        title="Sin asignar"
        style={{ width: size, height: size }}
        className="inline-flex items-center justify-center rounded-full border border-dashed border-ink-soft/40 text-ink-soft/60 shrink-0"
      >
        <Icon name="user" className="w-1/2 h-1/2" />
      </span>
    );
  }
  let hash = 0;
  for (const ch of nombre) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return (
    <span
      title={nombre}
      style={{ width: size, height: size, backgroundColor: AVATAR_COLORS[hash % AVATAR_COLORS.length], fontSize: size * 0.38 }}
      className="inline-flex items-center justify-center rounded-full text-white font-semibold shrink-0 select-none"
    >
      {iniciales(nombre)}
    </span>
  );
}

/* ---------- Clases reutilizables ---------- */

export const inputCls =
  'w-full h-10 px-3 text-sm bg-white border border-line rounded-lg text-ink placeholder:text-ink-soft/60 ' +
  'focus:outline-none focus:border-wine focus:ring-2 focus:ring-wine/15 transition disabled:bg-surface';
export const labelCls = 'flex items-center gap-1.5 text-xs font-medium text-ink-soft mb-1.5';
export const btnPrimary =
  'inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-wine text-white text-sm font-medium ' +
  'shadow-sm hover:bg-wine-dark transition disabled:opacity-60 disabled:cursor-not-allowed';
export const btnGhost =
  'inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg border border-line bg-white text-ink text-sm ' +
  'font-medium hover:bg-surface transition disabled:opacity-60';

/* ---------- Bloque con título de sección ---------- */

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft mb-3">{title}</h3>
      {children}
    </section>
  );
}
