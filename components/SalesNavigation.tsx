'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from './ui';

export const SALES_LINKS = [
  { href: '/crm/ventas/presupuestos', label: 'Presupuestos' },
  { href: '/crm/ventas/pedidos', label: 'Pedidos' },
  { href: '/crm/ventas/productos', label: 'Productos y servicios' },
];

export default function SalesNavigation({ pathname, onNavigate }: {
  pathname: string;
  onNavigate: () => void;
}) {
  const active = pathname === '/crm/ventas' || pathname.startsWith('/crm/ventas/');
  const [open, setOpen] = useState(active);
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => { if (active) setOpen(true); }, [pathname, active]);

  return <div onKeyDown={event => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      trigger.current?.focus();
    }
  }}>
    <button ref={trigger} type="button" aria-expanded={open} aria-controls={id}
      onClick={() => setOpen(value => !value)}
      className={`flex min-h-12 w-full items-center gap-2 rounded-lg px-4 text-left text-sm font-medium ${active ? 'bg-neutral-100 text-black' : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'}`}>
      <Icon name="trend" className="h-4 w-4 shrink-0" />
      <span className="flex-1">Ventas</span>
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0">
        <path d={open ? 'M5 12.5 10 7.5 15 12.5' : 'M5 7.5 10 12.5 15 7.5'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
    <ul id={id} hidden={!open} aria-label="Apartados de Ventas" className="ml-6 mt-2 space-y-2 border-l border-neutral-500 pl-2">
      {SALES_LINKS.map(item => <li key={item.href}>
        <Link href={item.href} onClick={onNavigate} aria-current={(pathname === item.href || pathname.startsWith(item.href+'/') || (pathname==='/crm/ventas'&&item.label==='Presupuestos')) ? 'page' : undefined}
          className={`flex min-h-12 items-center rounded-lg px-4 text-sm ${(pathname === item.href || pathname.startsWith(item.href+'/') || (pathname==='/crm/ventas'&&item.label==='Presupuestos')) ? 'bg-neutral-100 font-semibold text-black underline underline-offset-4' : 'text-neutral-600 hover:bg-neutral-100 hover:text-black hover:underline'}`}>
          {item.label}
        </Link>
      </li>)}
    </ul>
  </div>;
}
