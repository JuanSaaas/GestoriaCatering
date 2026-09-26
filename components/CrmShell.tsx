'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon, type IconName } from './ui';

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/crm', label: 'Dashboard', icon: 'gauge' },
  { href: '/crm/empresas', label: 'Empresas', icon: 'building' },
  { href: '/crm/contactos', label: 'Contactos', icon: 'user' },
  { href: '/crm/oportunidades', label: 'Oportunidades', icon: 'layers' },
  { href: '/crm/cierres', label: 'Cierres previstos', icon: 'calendar' },
];

export default function CrmShell({
  children,
  live,
  onNew,
}: {
  children: React.ReactNode;
  live?: boolean;
  onNew?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/crm/logout', { method: 'POST' });
    router.replace('/crm/login');
    router.refresh();
  }

  const isActive = (href: string) => {
    if (href === '/crm') return pathname === '/crm';
    return pathname.startsWith(href);
  };

  const NavLinks = () => (
    <nav className="flex-1 px-3 space-y-0.5">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-2.5 h-10 px-3 rounded-lg text-sm font-medium transition ${
            isActive(item.href)
              ? 'bg-[var(--crm-accent)] text-white'
              : 'text-neutral-600 hover:bg-[var(--crm-accent-soft)] hover:text-[var(--crm-accent)]'
          }`}
        >
          <Icon name={item.icon} className="w-4 h-4 shrink-0" />
          {item.label}
        </Link>
      ))}
      <div className="pt-4 mt-4 border-t border-neutral-200">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1.5">
          Próximamente
        </p>
        <span className="flex items-center gap-2.5 h-10 px-3 rounded-lg text-sm text-neutral-400 cursor-not-allowed">
          <Icon name="check" className="w-4 h-4 shrink-0" />
          Tareas
        </span>
      </div>
    </nav>
  );

  return (
    <div className="crm-shell min-h-screen bg-neutral-50 text-black md:flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 md:left-0 bg-white border-r border-neutral-200 z-40">
        <div className="flex items-center gap-2.5 px-5 h-16 shrink-0 bg-[#1c1410]">
          <img src="/logo-icon.png" alt="" className="h-7 w-auto" />
          <div className="leading-tight min-w-0">
            <div className="font-serif italic text-base truncate text-white">La Mesa Perfecta</div>
            <span className="text-[10px] font-semibold tracking-widest uppercase text-white/50">CRM</span>
          </div>
        </div>
        <div className="px-3 pt-4 pb-2">
          <div className="relative">
            <Icon name="search" className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              className="w-full h-9 pl-8 pr-3 text-sm bg-neutral-100 border border-transparent rounded-lg placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-300 transition"
              placeholder="Buscar en todo…"
              disabled
            />
          </div>
        </div>
        <NavLinks />
        <div className="p-3 border-t border-neutral-200 shrink-0">
          {typeof live === 'boolean' && (
            <span className="flex items-center gap-1.5 text-xs text-neutral-500 px-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${live ? 'bg-success animate-pulse' : 'bg-neutral-300'}`} />
              {live ? 'En vivo' : 'Conectando…'}
            </span>
          )}
          {onNew && (
            <button
              onClick={onNew}
              className="w-full inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-[var(--crm-accent)] text-white text-sm font-medium hover:brightness-110 transition"
            >
              <Icon name="plus" className="w-4 h-4" /> Nueva oportunidad
            </button>
          )}
          <button
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-1.5 h-9 px-4 mt-2 rounded-lg text-neutral-500 text-sm font-medium hover:bg-neutral-100 hover:text-black transition"
          >
            <Icon name="logout" className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Header + drawer móvil */}
      <div className="md:hidden sticky top-0 z-40 bg-[#1c1410]">
        <div className="flex items-center justify-between gap-3 px-4 h-14">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-white/10 text-white"
            aria-label="Abrir menú"
          >
            <Icon name="layers" className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-white">
            <img src="/logo-icon.png" alt="" className="h-6 w-auto" />
            <span className="font-serif italic text-base">La Mesa Perfecta</span>
          </div>
          {onNew ? (
            <button onClick={onNew} className="p-2 -mr-2 rounded-lg hover:bg-white/10 text-white" aria-label="Nueva oportunidad">
              <Icon name="plus" className="w-5 h-5" />
            </button>
          ) : (
            <span className="w-9" />
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-white h-full flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 h-14 border-b border-neutral-200 shrink-0">
              <span className="font-serif italic text-base">La Mesa Perfecta</span>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded hover:bg-neutral-100">
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>
            <div className="pt-3 flex-1 overflow-y-auto">
              <NavLinks />
            </div>
            <div className="p-3 border-t border-neutral-200 shrink-0">
              <button
                onClick={handleLogout}
                className="w-full inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg text-neutral-500 text-sm font-medium hover:bg-neutral-100 hover:text-black transition"
              >
                <Icon name="logout" className="w-4 h-4" /> Cerrar sesión
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Contenido */}
      <div className="flex-1 min-w-0 md:pl-60">{children}</div>
    </div>
  );
}
