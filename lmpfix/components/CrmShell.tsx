'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/crm', label: 'Tablero' },
  { href: '/crm/empresas', label: 'Empresas' },
  { href: '/crm/empleados', label: 'Empleados' },
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

  const isActive = (href: string) => {
    if (href === '/crm') return pathname === '/crm';
    return pathname.startsWith(href);
  };

  return (
    <div className="crm-shell min-h-screen bg-white text-black">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-neutral-200">
        <div className="flex items-center justify-between gap-4 px-6 h-16">
          <div className="flex items-center gap-8 min-w-0">
            <div className="flex items-center gap-2.5 shrink-0">
              <img src="/logo-icon.png" alt="" className="h-7 w-auto" />
              <div className="hidden sm:block leading-tight">
                <div className="font-serif italic text-lg">La Mesa Perfecta</div>
              </div>
              <span className="text-[10px] font-semibold tracking-widest uppercase bg-black text-white rounded px-1.5 py-0.5">
                CRM
              </span>
            </div>
            <nav className="hidden md:flex items-center h-16 gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative inline-flex items-center h-full px-3 text-sm font-medium transition ${
                    isActive(item.href)
                      ? 'text-black after:absolute after:left-3 after:right-3 after:bottom-0 after:h-0.5 after:bg-black after:rounded-full'
                      : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {typeof live === 'boolean' && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-neutral-500">
                <span className={`w-2 h-2 rounded-full ${live ? 'bg-success animate-pulse' : 'bg-neutral-300'}`} />
                {live ? 'En vivo' : 'Conectando…'}
              </span>
            )}
            {onNew && (
              <button
                onClick={onNew}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800 transition"
              >
                + <span className="hidden sm:inline">Nueva oportunidad</span>
                <span className="sm:hidden">Nueva</span>
              </button>
            )}
          </div>
        </div>
        <nav className="md:hidden flex border-t border-neutral-200 px-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 text-center py-2 text-sm ${isActive(item.href) ? 'text-black font-medium' : 'text-neutral-500'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
