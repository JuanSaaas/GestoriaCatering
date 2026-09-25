'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CrmLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    const res = await fetch('/api/crm/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user, password }) });
    setLoading(false);
    if (!res.ok) { setError('Las credenciales no son correctas.'); return; }
    const next = params.get('next');
    router.replace(next?.startsWith('/crm') && next !== '/crm/login' ? next : '/crm');
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#0b0b0c] text-white grid lg:grid-cols-[1.05fr_.95fr]">
      <section className="hidden lg:flex relative overflow-hidden min-h-screen p-12 flex-col justify-between border-r border-white/10">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(196,161,92,.35),transparent_32%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,.12),transparent_30%)]" />
        <div className="relative flex items-center gap-3"><img src="/logo-icon.png" className="h-10 w-auto" alt=""/><div><div className="font-serif italic text-2xl">La Mesa Perfecta</div><div className="text-[10px] uppercase tracking-[.28em] text-white/45">Private workspace</div></div></div>
        <div className="relative max-w-xl">
          <span className="text-[11px] uppercase tracking-[.28em] text-[#d7b76e]">CRM · Operaciones</span>
          <h1 className="font-serif text-6xl leading-[1.02] mt-5">Cada evento, bajo control.</h1>
          <p className="mt-6 text-lg leading-relaxed text-white/55 max-w-lg">Oportunidades, clientes, empresas, equipo y tareas en un único espacio conectado en tiempo real.</p>
        </div>
        <div className="relative flex items-center gap-2 text-xs text-white/35"><span className="w-2 h-2 rounded-full bg-emerald-400"/> Conexión segura · Supabase Realtime</div>
      </section>
      <section className="min-h-screen flex items-center justify-center px-6 py-12 bg-[#f7f5f0] text-neutral-950">
        <div className="w-full max-w-[430px]">
          <div className="lg:hidden flex items-center gap-3 mb-12"><img src="/logo-icon.png" className="h-9 w-auto" alt=""/><span className="font-serif italic text-xl">La Mesa Perfecta</span></div>
          <div className="mb-9"><div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[.16em] text-neutral-500"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Área privada</div><h2 className="text-3xl font-semibold tracking-tight mt-5">Bienvenido de nuevo</h2><p className="text-neutral-500 mt-2">Accede al centro de operaciones de La Mesa Perfecta.</p></div>
          <form onSubmit={submit} className="space-y-5">
            <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Usuario</label><input autoFocus autoComplete="username" value={user} onChange={e=>setUser(e.target.value)} className="w-full h-12 rounded-xl border border-neutral-200 bg-white px-4 outline-none transition focus:border-neutral-900 focus:ring-4 focus:ring-black/5" placeholder="Introduce tu usuario" required /></div>
            <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Contraseña</label><div className="relative"><input type={show?'text':'password'} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full h-12 rounded-xl border border-neutral-200 bg-white px-4 pr-16 outline-none transition focus:border-neutral-900 focus:ring-4 focus:ring-black/5" placeholder="••••••••" required/><button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-500 hover:text-black">{show?'Ocultar':'Ver'}</button></div></div>
            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <button disabled={loading} className="w-full h-12 rounded-xl bg-neutral-950 text-white text-sm font-semibold hover:bg-neutral-800 transition disabled:opacity-60 shadow-[0_8px_24px_rgba(0,0,0,.12)]">{loading?'Verificando…':'Entrar al CRM'}</button>
          </form>
          <p className="mt-8 text-xs text-neutral-400 leading-relaxed">Acceso restringido al equipo autorizado. La sesión se guarda en una cookie HTTP-only y caduca automáticamente.</p>
        </div>
      </section>
    </main>
  );
}
