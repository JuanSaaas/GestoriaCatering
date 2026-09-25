'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Oportunidad, EstadoOportunidad, Empresa, Empleado } from '@/lib/types';
import { OPORTUNIDAD_SELECT } from '@/lib/types';
import KanbanBoard from '@/components/KanbanBoard';
import StatsBar from '@/components/StatsBar';
import OpportunityModal from '@/components/OpportunityModal';
import NewOpportunityModal from '@/components/NewOpportunityModal';
import CrmShell from '@/components/CrmShell';
import { Avatar, Icon, eventoLabel, inputCls, tituloOportunidad } from '@/components/ui';

type FiltroEmpleado = 'todos' | 'sin_asignar' | string;

export default function CrmPage() {
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [live, setLive] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filtro, setFiltro] = useState<FiltroEmpleado>('todos');

  async function loadAll() {
    const { data, error } = await supabase
      .from('oportunidades')
      .select(OPORTUNIDAD_SELECT)
      .order('created_at', { ascending: false });
    if (error) {
      console.error(error);
      setLoadError(error.message);
    } else {
      setLoadError(null);
      setOportunidades((data as unknown as Oportunidad[]) || []);
    }
  }

  async function loadCatalogos() {
    const [{ data: emp }, { data: usr }] = await Promise.all([
      supabase.from('empresas').select('*').order('nombre'),
      supabase.from('usuarios').select('*').order('nombre'),
    ]);
    setEmpresas((emp as Empresa[]) || []);
    setEmpleados((usr as Empleado[]) || []);
  }

  useEffect(() => {
    loadAll();
    loadCatalogos();

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

  const selected = oportunidades.find((o) => o.id === selectedId) ?? null;

  async function updateEstado(id: string, estado: EstadoOportunidad) {
    await supabase.from('oportunidades').update({ estado }).eq('id', id);
    setOportunidades((prev) => prev.map((o) => (o.id === id ? { ...o, estado } : o)));
  }

  async function updateAsignacion(id: string, patch: { empresa?: Empresa | null; comercial?: Empleado | null }) {
    const dbPatch: { empresa_id?: string | null; comercial_id?: string | null } = {};
    if ('empresa' in patch) dbPatch.empresa_id = patch.empresa?.id ?? null;
    if ('comercial' in patch) dbPatch.comercial_id = patch.comercial?.id ?? null;

    const { error } = await supabase.from('oportunidades').update(dbPatch).eq('id', id);
    if (error) {
      console.error(error);
      alert('No se pudo guardar la asignación.');
      return;
    }
    setOportunidades((prev) => prev.map((o) => (o.id === id ? { ...o, ...dbPatch, ...patch } : o)));
  }

  function handleCreated(o: Oportunidad) {
    setOportunidades((prev) => [o, ...prev.filter((x) => x.id !== o.id)]);
    setShowNew(false);
  }

  function handleDeleted(id: string) {
    setOportunidades((prev) => prev.filter((o) => o.id !== id));
    setSelectedId(null);
  }

  const addEmpresa = (e: Empresa) => setEmpresas((prev) => [...prev, e]);
  const addEmpleado = (e: Empleado) => setEmpleados((prev) => [...prev, e]);

  const visibles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return oportunidades.filter((o) => {
      if (filtro === 'sin_asignar' && o.comercial_id) return false;
      if (filtro !== 'todos' && filtro !== 'sin_asignar' && o.comercial_id !== filtro) return false;
      if (!q) return true;
      return [tituloOportunidad(o), o.cliente.nombre, o.cliente.email, o.comercial?.nombre, eventoLabel(o)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [oportunidades, query, filtro]);

  const chip = (activo: boolean) =>
    `inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-sm border transition whitespace-nowrap ${
      activo ? 'bg-black text-white border-black' : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400'
    }`;

  return (
    <CrmShell live={live} onNew={() => setShowNew(true)}>
      <div className="px-6 pt-6 pb-5">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Tablero de oportunidades</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Arrastra las tarjetas entre columnas, como en Trello.{' '}
              {visibles.length === oportunidades.length
                ? `${oportunidades.length} oportunidades`
                : `${visibles.length} de ${oportunidades.length} oportunidades`}
            </p>
          </div>
          <div className="relative w-full lg:w-80">
            <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              className={`${inputCls} pl-9`}
              placeholder="Buscar empresa, contacto, empleado…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
          <button className={chip(filtro === 'todos')} onClick={() => setFiltro('todos')}>
            Todos
          </button>
          {empleados.map((e) => (
            <button key={e.id} className={chip(filtro === e.id)} onClick={() => setFiltro(e.id)}>
              <Avatar nombre={e.nombre} size={18} /> {e.nombre.split(' ')[0]}
            </button>
          ))}
          <button className={chip(filtro === 'sin_asignar')} onClick={() => setFiltro('sin_asignar')}>
            Sin asignar
          </button>
        </div>
      </div>

      {loadError && (
        <div className="mx-6 mb-5 flex items-start gap-2.5 px-4 py-3 rounded-lg bg-red-50 border border-warning/20 text-sm text-warning">
          <Icon name="alert" className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            No se pudieron cargar las oportunidades: {loadError}
            <div className="text-xs mt-0.5 opacity-80">
              Si acabas de actualizar el proyecto, ejecuta las migraciones SQL en el SQL Editor de Supabase.
            </div>
          </div>
        </div>
      )}

      <StatsBar oportunidades={visibles} />

      <div className="pt-6">
        <KanbanBoard oportunidades={visibles} onCardClick={(o) => setSelectedId(o.id)} onDrop={updateEstado} />
      </div>

      {selected && (
        <OpportunityModal
          oportunidad={selected}
          empresas={empresas}
          empleados={empleados}
          onClose={() => setSelectedId(null)}
          onEstadoChange={updateEstado}
          onAsignacionChange={updateAsignacion}
          onEmpresaCreated={addEmpresa}
          onEmpleadoCreated={addEmpleado}
          onDeleted={handleDeleted}
        />
      )}

      {showNew && (
        <NewOpportunityModal
          empresas={empresas}
          empleados={empleados}
          empleadoInicial={empleados.find((e) => e.id === filtro) ?? null}
          onClose={() => setShowNew(false)}
          onCreated={handleCreated}
          onEmpresaCreated={addEmpresa}
          onEmpleadoCreated={addEmpleado}
        />
      )}
    </CrmShell>
  );
}
