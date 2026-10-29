'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { loadCrmDirectory } from '@/lib/crmDirectory';
import type { Oportunidad } from '@/lib/types';
import { ESTADOS } from '@/lib/types';
import CrmShell from '@/components/CrmShell';
import { Icon, eventoLabel, fmtDate, fmtMoney, tituloOportunidad } from '@/components/ui';

export default function CierresPage() {
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const data = await loadCrmDirectory();
      setOportunidades(data.oportunidades.sort((a, b) => (a.fecha_evento || '').localeCompare(b.fecha_evento || '')));
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudieron cargar los cierres.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  // Solo oportunidades abiertas con fecha de evento futura (el "cierre previsto"
  // es la fecha del evento: es cuando la oportunidad tiene que estar resuelta).
  const proximos = useMemo(() => {
    const hoy = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
    return oportunidades.filter(
      (o) => o.cliente?.nombre?.trim().toLowerCase() !== 'prueba supabase'
        && !['ganado', 'perdido'].includes(o.estado) && o.fecha_evento && o.fecha_evento >= hoy
    );
  }, [oportunidades]);

  const grupos = useMemo(() => {
    const map = new Map<string, Oportunidad[]>();
    for (const o of proximos) {
      const mes = new Date(o.fecha_evento! + 'T00:00:00').toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric',
      });
      const arr = map.get(mes) || [];
      arr.push(o);
      map.set(mes, arr);
    }
    return [...map.entries()];
  }, [proximos]);

  return (
    <CrmShell>
      <div className="px-6 py-6">
        <h1 className="text-2xl font-semibold">Cierres previstos</h1>
        <p className="text-sm text-neutral-500 mt-1 mb-6">
          Oportunidades abiertas ordenadas por la fecha del evento, la que marca cuándo tienen que estar resueltas.
        </p>

        <div className="space-y-8">
          {loading && <p role="status" className="text-sm text-neutral-500">Cargando cierres previstos...</p>}
          {error && <div role="alert" className="p-4 bg-red-50 text-red-700 rounded-md text-sm">{error}<button className="no-underline ml-3" onClick={load}>Reintentar</button></div>}
          {grupos.map(([mes, ops]) => (
            <div key={mes}>
              <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3 capitalize">{mes}</h2>
              <div className="space-y-2">
                {ops.map((o) => {
                  const est = ESTADOS.find((e) => e.key === o.estado);
                  return (
                    <Link
                      key={o.id}
                      href={`/crm/oportunidades?abrir=${o.id}`}
                      className="flex items-center justify-between gap-3 p-4 rounded-xl border border-neutral-200 bg-white hover:border-[var(--crm-accent)] transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex flex-col items-center justify-center w-11 h-11 rounded-lg bg-neutral-100 text-xs font-semibold shrink-0">
                          <Icon name="calendar" className="w-4 h-4 mb-0.5 text-neutral-500" />
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{tituloOportunidad(o)}</div>
                          <div className="text-xs text-neutral-500 truncate">
                            {eventoLabel(o)} · {fmtDate(o.fecha_evento)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm tabular-nums hidden sm:inline">{fmtMoney(o.presupuesto_estimado)}</span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
                          style={{ backgroundColor: (est?.color || '#000') + '22', color: est?.color }}
                        >
                          {est?.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          {!loading && !error && proximos.length === 0 && (
            <div className="text-sm text-neutral-500 py-10 text-center border border-dashed border-neutral-200 rounded-xl">
              <p>No hay oportunidades abiertas con fecha de evento próxima.</p>
              <Link href="/crm/oportunidades" className="inline-flex min-h-12 items-center no-underline mt-4">Revisar fechas de las oportunidades</Link>
            </div>
          )}
        </div>
      </div>
    </CrmShell>
  );
}
