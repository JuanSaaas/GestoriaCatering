'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon, type IconName } from './ui';
import { useDialog } from './useDialog';

function MobileMenu({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  const ref = useDialog<HTMLElement>(onClose);
  return <aside ref={ref} role="dialog" aria-modal="true" aria-label="Menú principal" tabIndex={-1} className="relative w-64 bg-white h-full flex flex-col shadow-xl">{children}</aside>;
}

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/crm', label: 'Resumen', icon: 'gauge' },
  { href: '/crm/empresas', label: 'Empresas', icon: 'building' },
  { href: '/crm/contactos', label: 'Contactos', icon: 'user' },
  { href: '/crm/oportunidades', label: 'Oportunidades', icon: 'layers' },
  { href: '/crm/cierres', label: 'Cierres previstos', icon: 'calendar' },
  { href: '/crm/tareas', label: 'Tareas', icon: 'check' },
  { href: '/crm/rrhh', label: 'Recursos humanos', icon: 'guests' },
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
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError('');
    try {
      const response = await fetch('/api/crm/logout', { method: 'POST' });
      if (!response.ok) throw new Error();
      router.replace('/crm/login');
      router.refresh();
    } catch { setLogoutError('⚠ No se pudo cerrar la sesión. Vuelve a intentarlo.'); setLoggingOut(false); }
  }

  const isActive = (href: string) => {
    if (href === '/crm') return pathname === '/crm';
    return pathname.startsWith(href);
  };

  const NavLinks = () => (
    <nav aria-label="Menú principal" className="flex-1 px-3 space-y-2">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(item.href) ? 'page' : undefined}
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-2 min-h-12 px-4 rounded-lg text-sm font-medium transition ${
            isActive(item.href)
              ? 'relative bg-white text-black shadow-sm ring-1 ring-neutral-200 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-full before:bg-black'
              : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
          }`}
        >
          <Icon name={item.icon} className="w-4 h-4 shrink-0" />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="crm-shell min-h-screen bg-neutral-50 text-black md:flex">
      <a href="#crm-contenido" className="skip-link">Saltar al contenido</a>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 md:left-0 bg-white border-r border-neutral-200 z-40">
        <div className="flex items-center gap-2 px-5 h-16 shrink-0 bg-white border-b border-neutral-100">
          <img src="/logo-icon.png" alt="" className="h-8 w-auto shrink-0" />
          <div className="leading-tight min-w-0">
            <div className="font-serif italic text-[17px] truncate text-[#1c1410]">La Mesa Perfecta</div>
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-neutral-500">CRM</span>
          </div>
        </div>
        <p className="px-6 py-4 text-xs text-neutral-600">Gestión de eventos y equipo</p>
        <NavLinks />
        <div className="p-3 border-t border-neutral-200 shrink-0">
          {typeof live === 'boolean' && (
            <span className="flex items-center gap-1.5 text-xs text-neutral-500 px-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${live ? 'bg-success animate-pulse' : 'bg-neutral-300'}`} />
              {live ? 'En vivo' : 'Conectando…'}
            </span>
          )}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full inline-flex items-center justify-center gap-2 min-h-12 px-4 mt-2 rounded-lg border border-red-700 bg-red-700 text-white text-sm font-medium hover:bg-red-800 hover:border-red-800 focus-visible:!outline-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Icon name="logout" className="w-4 h-4" /> {loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </button>
        </div>
      </aside>

      {/* Header + drawer móvil */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-neutral-200">
        <div className="flex items-center justify-between gap-3 px-4 h-14">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-[var(--crm-accent-soft)] text-[#1c1410]"
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
          >
            <Icon name="layers" className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-[#1c1410]">
            <img src="/logo-icon.png" alt="" className="h-6 w-auto" />
            <span className="font-serif italic text-base">La Mesa Perfecta</span>
          </div>
          {onNew ? (
            <button onClick={onNew} className="p-2 -mr-2 rounded-lg hover:bg-[var(--crm-accent-soft)] text-[var(--crm-accent)]" aria-label="Nueva oportunidad">
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
          <MobileMenu onClose={() => setMobileOpen(false)}>
            <div className="flex items-center justify-between px-5 h-14 border-b border-neutral-200 shrink-0">
              <span className="font-serif italic text-base">La Mesa Perfecta</span>
              <button aria-label="Cerrar menú" onClick={() => setMobileOpen(false)} className="p-1 rounded hover:bg-neutral-100">
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>
            <div className="pt-3 flex-1 overflow-y-auto">
              <NavLinks />
            </div>
            <div className="p-3 border-t border-neutral-200 shrink-0">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full inline-flex items-center justify-center gap-2 min-h-12 px-4 rounded-lg border border-red-700 bg-red-700 text-white text-sm font-medium hover:bg-red-800 hover:border-red-800 focus-visible:!outline-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Icon name="logout" className="w-4 h-4" /> {loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
              </button>
            </div>
          </MobileMenu>
        </div>
      )}

      {/* Contenido */}
      <main id="crm-contenido" tabIndex={-1} className="flex-1 min-w-0 md:pl-60">
        <nav aria-label="Ruta de navegación" className="px-6 pt-6 text-sm text-neutral-600 flex gap-2 flex-wrap">
          <Link href="/crm" className="hover:underline">Inicio</Link>
          {pathname !== '/crm' && <><span aria-hidden="true">›</span><Link href={NAV.find((item) => item.href !== '/crm' && pathname.startsWith(item.href))?.href || '/crm/contactos'} className="hover:underline">{NAV.find((item) => item.href !== '/crm' && pathname.startsWith(item.href))?.label || 'Contactos'}</Link></>}
          {pathname.split('/').length > 3 && <><span aria-hidden="true">›</span><span aria-current="page">Ficha</span></>}
        </nav>
        {logoutError && <p role="alert" className="px-6 pt-4 text-sm">{logoutError}</p>}
        {children}
      </main>
    </div>
  );
}
