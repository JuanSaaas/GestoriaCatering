'use client';

import ValidatedForm from '@/components/ValidatedForm';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon, btnPrimary, inputCls } from '@/components/ui';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const destination = params.get('next') || '/crm';
  const next = destination.startsWith('/crm') && !destination.startsWith('/crm/login') && !destination.includes('\\') ? destination : '/crm';

  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
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
    <div className="crm-shell min-h-screen !bg-[#f5f1e9] text-slate-950">
      <header className="px-6 py-6 sm:px-10 flex items-center justify-between border-b border-[#ded7cc]">
        <a href="/" aria-label="La Mesa Perfecta · Ir a la web" className="flex items-center gap-3">
          <img src="/logo-icon.png" alt="" className="h-12 w-12 object-contain" />
          <span className="font-serif text-xl">La Mesa Perfecta</span>
        </a>
        <span className="hidden sm:block text-sm text-slate-600">Equipo comercial y administración</span>
      </header>
      <main className="mx-auto grid max-w-6xl gap-12 px-6 py-12 lg:grid-cols-2 lg:items-center lg:gap-24 lg:py-20">
        <section className="max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#715b3e]">Eventos y catering</p>
          <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">Cada gran evento empieza con una buena organización.</h1>
          <p className="mt-6 text-base leading-7 text-slate-600">Tu espacio de trabajo para atender solicitudes, acompañar a los clientes y preparar su próxima celebración.</p>
          <div className="mt-8 overflow-hidden rounded-2xl border border-[#ded7cc]">
            <img src="/hero-photo.jpg" alt="Mesa preparada para un evento de La Mesa Perfecta" className="h-48 w-full object-cover sm:h-64" />
          </div>
        </section>
        <section className="w-full max-w-md rounded-2xl border border-[#ded7cc] bg-white p-6 shadow-sm sm:p-10" aria-labelledby="login-title">
          <div className="mb-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#f5f1e9] text-[#715b3e]"><Icon name="user" className="h-6 w-6" /></span>
            <h2 id="login-title" className="mt-5 text-2xl font-semibold">Bienvenido a tu equipo</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Accede al CRM de La Mesa Perfecta.</p>
          </div>
          <ValidatedForm onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="usuario" className="mb-2 block text-sm font-medium">Usuario *</label>
              <input id="usuario" name="username" className={inputCls} value={usuario} onChange={(e) => setUsuario(e.target.value)} autoComplete="username" autoCapitalize="none" required disabled={loading} />
            </div>
            <div>
              <label htmlFor="contrasena" className="mb-2 block text-sm font-medium">Contraseña *</label>
              <input id="contrasena" name="password" type={showPassword ? 'text' : 'password'} className={inputCls} value={contrasena} onChange={(e) => setContrasena(e.target.value)} autoComplete="current-password" required disabled={loading} />
              <button type="button" className="mt-1 text-sm font-medium text-slate-600 underline underline-offset-4" aria-controls="contrasena" aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}</button>
            </div>
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">⚠ {error}</p>}
            <button type="submit" className={btnPrimary + ' w-full !bg-[#2a2622] hover:!bg-[#403930]'} disabled={loading}>{loading ? 'Entrando…' : 'Entrar al CRM'}<Icon name="logout" /></button>
            <p role="status" className="text-xs leading-5 text-slate-600">{loading ? 'Verificando tus credenciales…' : 'Acceso reservado al equipo de La Mesa Perfecta.'}</p>
          </ValidatedForm>
        </section>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<p role="status" className="p-8">Preparando el acceso…</p>}><LoginForm /></Suspense>;
}
