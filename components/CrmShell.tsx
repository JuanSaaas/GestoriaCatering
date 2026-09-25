'use client';

import { useState } from 'react';
import Link from 'next/link';
<<<<<<< HEAD
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const NAV = [
  { href: '/crm', label: 'Pipeline', icon: '▦' },
  { href: '/crm/contactos', label: 'Contactos', icon: '◎' },
  { href: '/crm/empresas', label: 'Empresas', icon: '◇' },
  { href: '/crm/empleados', label: 'Equipo', icon: '◉' },
  { href: '/crm/tareas', label: 'Tareas', icon: '✓' },
];

export default function CrmShell({ children, live, onNew }: { children: React.ReactNode; live?: boolean; onNew?: () => void }) {
  const pathname = usePathname(); const router = useRouter(); const [loggingOut, setLoggingOut] = useState(false);
  const isActive = (href: string) => href === '/crm' ? pathname === '/crm' : pathname.startsWith(href);
  async function logout(){ setLoggingOut(true); await fetch('/api/crm/logout',{method:'POST'}); router.replace('/crm/login'); router.refresh(); }

  return <div className="crm-shell min-h-screen bg-[#f6f7f8] text-neutral-950 lg:grid lg:grid-cols-[236px_1fr]">
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[236px] bg-[#101112] text-white flex-col z-50 border-r border-white/5">
      <div className="h-20 px-5 flex items-center gap-3 border-b border-white/10"><img src="/logo-icon.png" alt="" className="h-8 w-auto"/><div className="min-w-0"><div className="font-serif italic text-lg leading-none">La Mesa Perfecta</div><div className="text-[9px] uppercase tracking-[.24em] text-white/35 mt-1.5">CRM Workspace</div></div></div>
      <nav className="p-3 space-y-1 flex-1">{NAV.map(item=><Link key={item.href} href={item.href} className={`flex items-center gap-3 h-11 px-3 rounded-lg text-sm transition ${isActive(item.href)?'bg-white text-black font-semibold shadow-sm':'text-white/55 hover:text-white hover:bg-white/[.06]'}`}><span className="w-5 text-center text-base opacity-80">{item.icon}</span>{item.label}</Link>)}</nav>
      <div className="p-3 border-t border-white/10"><div className="rounded-xl bg-white/[.05] p-3 mb-2"><div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${live===false?'bg-amber-400':'bg-emerald-400'}`}/><span className="text-xs text-white/70">{live===false?'Conectando…':'Supabase conectado'}</span></div><div className="text-[10px] text-white/30 mt-1.5">Sincronización en tiempo real</div></div><button onClick={logout} disabled={loggingOut} className="w-full h-10 rounded-lg text-left px-3 text-sm text-white/45 hover:text-white hover:bg-white/[.06] transition">↗ {loggingOut?'Cerrando sesión…':'Cerrar sesión'}</button></div>
    </aside>
    <div className="lg:col-start-2 min-w-0">
      <header className="sticky top-0 z-40 h-16 bg-white/90 backdrop-blur-xl border-b border-neutral-200/80 flex items-center justify-between px-4 sm:px-6">
        <div className="lg:hidden flex items-center gap-2"><img src="/logo-icon.png" alt="" className="h-7"/><span className="font-serif italic">La Mesa Perfecta</span></div>
        <div className="hidden lg:block"><div className="text-[11px] uppercase tracking-[.18em] text-neutral-400">Centro de operaciones</div><div className="text-sm font-medium">Gestión comercial y eventos</div></div>
        <div className="flex items-center gap-3">{typeof live==='boolean'&&<span className="hidden sm:flex items-center gap-2 text-xs text-neutral-500"><span className={`w-2 h-2 rounded-full ${live?'bg-emerald-500':'bg-amber-400 animate-pulse'}`}/>{live?'En vivo':'Conectando'}</span>}{onNew&&<button onClick={onNew} className="h-9 px-4 rounded-lg bg-neutral-950 text-white text-sm font-semibold hover:bg-neutral-800 transition shadow-sm">+ Nueva oportunidad</button>}<button onClick={logout} className="lg:hidden h-9 px-3 rounded-lg border border-neutral-200 text-xs">Salir</button></div>
      </header>
      <nav className="lg:hidden bg-white border-b border-neutral-200 flex overflow-x-auto px-2">{NAV.map(item=><Link key={item.href} href={item.href} className={`px-3 py-3 text-xs whitespace-nowrap border-b-2 ${isActive(item.href)?'border-black text-black font-semibold':'border-transparent text-neutral-500'}`}>{item.label}</Link>)}</nav>
      <main>{children}</main>
=======
import { usePathname } from 'next/navigation';
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
  const [mobileOpen, setMobileOpen] = useState(false);

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
          </aside>
        </div>
      )}

      {/* Contenido */}
      <div className="flex-1 min-w-0 md:pl-60">{children}</div>
>>>>>>> 1a82e92 (Actualización)
    </div>
  </div>;
}
