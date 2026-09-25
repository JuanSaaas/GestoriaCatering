'use client';

import Link from 'next/link';
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
    </div>
  </div>;
}
