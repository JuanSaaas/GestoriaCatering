'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Cliente, Empresa, Oportunidad } from '@/lib/types';
import { OPORTUNIDAD_SELECT } from '@/lib/types';
import CrmShell from '@/components/CrmShell';
import DashboardStats from '@/components/DashboardStats';
import Dashboard from '@/components/Dashboard';

export default function DashboardPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [contactos, setContactos] = useState<Cliente[]>([]);
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [live, setLive] = useState(false);

  async function load() {
    const [{ data: emp }, { data: cli }, { data: ops }] = await Promise.all([
      supabase.from('empresas').select('*').order('nombre'),
      supabase.from('clientes').select('*'),
      supabase.from('oportunidades').select(OPORTUNIDAD_SELECT),
    ]);
    setEmpresas((emp as Empresa[]) || []);
    setContactos((cli as Cliente[]) || []);
    setOportunidades((ops as unknown as Oportunidad[]) || []);
  }

  useEffect(() => {
    load();

    const channel = supabase
      .channel('crm-dashboard')
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
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Resumen del pipeline comercial.</p>
      </div>

      <DashboardStats empresas={empresas} contactos={contactos} oportunidades={oportunidades} />

      <div className="pt-4 pb-8">
        <Dashboard oportunidades={oportunidades} empresas={empresas} />
      </div>
    </CrmShell>
  );
}
