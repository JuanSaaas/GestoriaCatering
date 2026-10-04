'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon, btnPrimary, inputCls } from '@/components/ui';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/crm';

  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/crm/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contrasena }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || 'Usuario o contraseña incorrectos.');
        setLoading(false);
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError('No se pudo conectar. Inténtalo de nuevo.');
      setLoading(false);
    }
  }

  return (
    <div className="crm-shell min-h-screen bg-[#F6F8FB] text-slate-950 lg:grid lg:grid-cols-[minmax(0,1fr)_480px]">
      <section className="relative hidden overflow-hidden bg-[#2563EB] text-white lg:flex lg:flex-col lg:justify-between p-10 xl:p-12">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.18),rgba(37,99,235,0)_42%,rgba(15,159,154,0.22))]" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-lg">
            <img src="/logo-icon.png" alt="" className="h-8 w-auto" />
          </span>
          <div className="leading-tight">
            <div className="font-serif italic text-xl">La Mesa Perfecta</div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/65">CRM Suite</div>
          </div>
        </div>

        <div className="relative max-w-md">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            Panel administrativo
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">Gestiona clientes, pipeline y cierres desde un solo lugar.</h1>
          <p className="mt-4 text-sm leading-6 text-white/72">
            Acceso privado para el equipo comercial, con oportunidades en tiempo real y seguimiento profesional de cada evento.
          </p>
        </div>

        <div className="relative grid grid-cols-3 gap-3">
          {[
            ['Pipeline', '60k'],
            ['Estados', '6'],
            ['Tiempo real', 'Live'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <div className="text-2xl font-semibold tabular-nums">{value}</div>
              <div className="mt-1 text-xs text-white/65">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-card ring-1 ring-slate-200">
              <img src="/logo-icon.png" alt="" className="h-8 w-auto" />
            </span>
            <div className="leading-tight">
              <div className="font-serif italic text-xl text-slate-950">La Mesa Perfecta</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">CRM Suite</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-7 shadow-card sm:p-8">
            <div className="mb-7">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--crm-accent)]">Acceso seguro</div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">Entrar al CRM</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">Introduce tus credenciales para continuar al panel de administración.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block" htmlFor="usuario">
                  Usuario
                </label>
                <input
                  id="usuario"
                  className={inputCls}
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block" htmlFor="contrasena">
                  Contraseña
                </label>
                <input
                  id="contrasena"
                  type="password"
                  className={inputCls}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 mt-4 text-sm px-3 py-2.5 rounded-lg bg-red-50 text-red-700 border border-red-200">
                <Icon name="alert" className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" className={`${btnPrimary} h-10 w-full mt-6`} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar al panel'}
            </button>

            <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
              <Icon name="check" className="h-3.5 w-3.5 text-emerald-600" />
              Sesión privada para administradores y comerciales autorizados.
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
