'use client';

import { LockClosedIcon } from '@heroicons/react/24/outline';
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
      <main className="flex min-h-dvh items-center justify-center px-4 py-8 sm:px-6">
        <section className="w-full max-w-md rounded-2xl border border-[#ded7cc] bg-white p-6 shadow-sm sm:p-10" aria-labelledby="login-title">
          <div className="mb-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700"><LockClosedIcon aria-hidden="true" className="h-6 w-6" /></span>
            <h1 id="login-title" className="mt-5 text-2xl font-semibold">Bienvenido a tu equipo</h1>
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
