'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Cliente, Empresa, Oportunidad } from '@/lib/types';
import { loadCrmDirectory } from '@/lib/crmDirectory';
import CrmShell from '@/components/CrmShell';
import DashboardStats from '@/components/DashboardStats';
import Dashboard from '@/components/Dashboard';

export default function DashboardPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [contactos, setContactos] = useState<Cliente[]>([]);
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setError(''); setLoading(true);
    try {
      const data = await loadCrmDirectory();
      setEmpresas(data.empresas); setContactos(data.contactos); setOportunidades(data.oportunidades);
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cargar el resumen.'); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    load();

    const channel = supabase
      .channel('crm-resumen')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'oportunidades' }, () => load())
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') setLive(true);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <CrmShell live={live}>
      <div className="px-6 pt-6 pb-5">
        <h1 className="text-2xl font-semibold">Resumen</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Actividad comercial, solicitudes y próximos pasos.</p>
      </div>

      {loading && <p role="status" className="px-6 py-4 text-sm text-neutral-500">Cargando resumen...</p>}
      {error && <div role="alert" className="mx-6 p-4 bg-red-50 text-red-700 rounded-md text-sm">{error}<button className="no-underline ml-3" onClick={load}>Reintentar</button></div>}
      {!loading && !error && <><DashboardStats empresas={empresas} contactos={contactos} oportunidades={oportunidades} />

      <div className="pt-4 pb-8">
        <Dashboard oportunidades={oportunidades} empresas={empresas} />
      </div>
      </>}
    </CrmShell>
  );
}
