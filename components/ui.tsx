import { PlusIcon, MagnifyingGlassIcon, BuildingOffice2Icon, UserIcon, CalendarDaysIcon, UserGroupIcon, XMarkIcon, Square3Stack3DIcon, CheckIcon, ArrowTrendingUpIcon, ReceiptPercentIcon, ExclamationTriangleIcon, ChartBarIcon, MapPinIcon, ArrowDownTrayIcon, ArchiveBoxIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import type { Oportunidad } from '@/lib/types';
import { TIPO_EVENTO_LABEL } from '@/lib/types';

/* ---------- Formateadores ---------- */

export function fmtMoney(n: number | null | undefined) {
  if (n === null || n === undefined) return '—';
  return Number(n).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtDate(d: string | null) {
  if (!d) return 'Sin fecha';
  return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
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

const ICONS = {
  plus: PlusIcon, search: MagnifyingGlassIcon, building: BuildingOffice2Icon,
  user: UserIcon, calendar: CalendarDaysIcon, guests: UserGroupIcon,
  close: XMarkIcon, layers: Square3Stack3DIcon, check: CheckIcon,
  trend: ArrowTrendingUpIcon, percent: ReceiptPercentIcon,
  alert: ExclamationTriangleIcon, gauge: ChartBarIcon, pin: MapPinIcon,
  download: ArrowDownTrayIcon, archive: ArchiveBoxIcon, logout: ArrowRightOnRectangleIcon,
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, className = 'w-4 h-4' }: { name: IconName; className?: string }) {
  const HeroIcon = ICONS[name];
  return <HeroIcon className={className} aria-hidden="true" />;
}

/* ---------- Avatar con iniciales ---------- */

const AVATAR_COLORS = ['#1F2937', '#2563EB', '#4F46E5', '#0891B2'];

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
  'w-full min-h-12 h-12 px-4 text-sm bg-white border border-neutral-300 rounded-lg text-black placeholder:text-neutral-500 ' +
  'focus:outline-none focus:border-[var(--crm-accent)] focus:ring-2 focus:ring-[var(--crm-accent-soft)] transition disabled:bg-neutral-50';
export const labelCls = 'flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2';
export const btnPrimary =
  'inline-flex items-center justify-center gap-2 min-h-12 px-4 rounded-lg bg-[var(--crm-accent)] text-white text-sm font-semibold ' +
  'shadow-sm hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed';
export const btnGhost =
  'inline-flex items-center justify-center gap-2 min-h-12 px-4 rounded-lg border border-neutral-300 bg-white text-black text-sm ' +
  'font-medium hover:bg-neutral-50 transition disabled:opacity-60';

/* ---------- Bloque con título de sección ---------- */

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft mb-3">{title}</h3>
      {children}
    </section>
  );
}
