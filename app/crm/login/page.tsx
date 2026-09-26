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
    <div className="crm-shell min-h-screen flex items-center justify-center bg-[#1c1410] px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2.5 mb-8">
          <img src="/logo-icon.png" alt="" className="h-12 w-auto" />
          <div className="text-center">
            <div className="font-serif italic text-xl text-white">La Mesa Perfecta</div>
            <span className="text-[10px] font-semibold tracking-widest uppercase text-white/50">CRM</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-7">
          <h1 className="text-lg font-semibold mb-1">Acceso al CRM</h1>
          <p className="text-sm text-neutral-500 mb-6">Introduce tus credenciales para continuar.</p>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-neutral-500 mb-1.5 block" htmlFor="usuario">
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
              <label className="text-xs font-medium text-neutral-500 mb-1.5 block" htmlFor="contrasena">
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

          <button type="submit" className={`${btnPrimary} w-full mt-6`} disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
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
