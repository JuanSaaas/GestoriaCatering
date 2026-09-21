'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import type { Oportunidad, EstadoOportunidad } from '@/lib/types';
import KanbanBoard from '@/components/KanbanBoard';
import StatsBar from '@/components/StatsBar';
import OpportunityModal from '@/components/OpportunityModal';

export default function CrmPage() {
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [selected, setSelected] = useState<Oportunidad | null>(null);
  const [live, setLive] = useState(false);

  async function loadAll() {
    const { data, error } = await supabase
      .from('oportunidades')
      .select('*, cliente:clientes(*)')
      .order('created_at', { ascending: false });
    if (!error) setOportunidades(data || []);
  }

  useEffect(() => {
    loadAll();

    const channel = supabase
      .channel('crm-oportunidades')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'oportunidades' }, () => loadAll())
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setLive(true);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function updateEstado(id: string, estado: EstadoOportunidad) {
    await supabase.from('oportunidades').update({ estado }).eq('id', id);
    setOportunidades((prev) => prev.map((o) => (o.id === id ? { ...o, estado } : o)));
    setSelected((prev) => (prev && prev.id === id ? { ...prev, estado } : prev));
  }

  function handleDeleted(id: string) {
    setOportunidades((prev) => prev.filter((o) => o.id !== id));
    setSelected(null);
  }

  return (
    <main>
      <header className="flex justify-between items-center px-7 py-5 border-b border-[var(--line)] bg-paper-2">
        <div className="flex items-center gap-2.5">
          <img src="/logo-icon.png" alt="" className="h-7 w-auto" />
          <div>
            <div className="font-serif italic text-xl">La Mesa Perfecta</div>
            <div className="text-xs text-ink-soft">CRM · Pipeline de oportunidades</div>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <span className="text-sm text-ink-soft flex items-center gap-1.5">
            {live && <span className="text-olive">●</span>} {live ? 'En vivo' : 'Conectando...'}
          </span>
          <Link href="/" className="text-sm text-ink-soft hover:text-wine">
            Ver web pública
          </Link>
        </div>
      </header>

      <StatsBar oportunidades={oportunidades} />

      <div className="pt-5">
        <KanbanBoard
          oportunidades={oportunidades}
          onCardClick={setSelected}
          onDrop={updateEstado}
        />
      </div>

      {selected && (
        <OpportunityModal
          oportunidad={selected}
          onClose={() => setSelected(null)}
          onEstadoChange={updateEstado}
          onDeleted={handleDeleted}
        />
      )}
    </main>
  );
}
