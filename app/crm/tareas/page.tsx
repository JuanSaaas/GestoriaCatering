'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import CrmShell from '@/components/CrmShell';
import { btnGhost, fmtDate } from '@/components/ui';
import type { Tarea } from '@/lib/types';

export default function TareasPage() {
  const [items, setItems] = useState<Tarea[]>([]);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    try {
      const { data, error } = await supabase.from('tareas').select('*').order('completada').order('fecha_limite', { ascending: true });
      if (error) throw error;
      setItems((data as Tarea[]) || []); setError('');
    } catch { setError('⚠ No se pudieron cargar las tareas. Revisa tu conexión y vuelve a intentarlo.'); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    load();
    const channel = supabase.channel('crm-tareas-page').on('postgres_changes', { event: '*', schema: 'public', table: 'tareas' }, load).subscribe((status) => setLive(status === 'SUBSCRIBED'));
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function toggle(task: Tarea) {
    setBusy(task.id); setError(''); setNotice('');
    try {
      const { error } = await supabase.from('tareas').update({ completada: !task.completada }).eq('id', task.id);
      if (error) throw error;
      setItems((previous) => previous.map((item) => item.id === task.id ? { ...item, completada: !task.completada } : item));
      setNotice(`✓ «${task.titulo}» marcada como ${task.completada ? 'pendiente' : 'completada'}.`);
    } catch { setError('⚠ No se pudo guardar el estado de la tarea. Vuelve a intentarlo.'); }
    finally { setBusy(null); }
  }
  const pending = items.filter((item) => !item.completada).length;
  return <CrmShell live={live}><div className="p-6 lg:p-8 max-w-5xl">
    <h1 className="text-2xl font-semibold">Tareas</h1>
    <p className="text-sm text-neutral-600 mt-2 mb-6">{pending} pendientes · {items.length - pending} completadas. Crea tareas desde la ficha de una oportunidad.</p>
    {loading && <p role="status">Cargando tareas…</p>}
    {error && <p role="alert" className="mb-4 text-sm">{error} <button className="no-underline ml-2" onClick={load}>Reintentar</button></p>}
    {notice && <p role="status" className="mb-4 text-sm">{notice}</p>}
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {items.map((task) => <div key={task.id} className="flex flex-wrap items-center gap-4 p-4 border-b last:border-0">
        <button type="button" aria-pressed={task.completada} aria-label={`Marcar «${task.titulo}» como ${task.completada ? 'pendiente' : 'completada'}`} disabled={!!busy} onClick={() => toggle(task)} className="shrink-0 rounded-lg border border-neutral-300 px-3 text-sm">{busy === task.id ? '…' : task.completada ? '✓' : '○'}</button>
        <div className="min-w-0 flex-1"><p className={`text-sm font-medium ${task.completada ? 'line-through text-neutral-600' : ''}`}>{task.titulo}</p><p className="text-xs text-neutral-600 mt-2">{task.completada ? '✓ Completada' : '◷ Pendiente'} · {task.fecha_limite ? `Fecha límite: ${fmtDate(task.fecha_limite)}` : 'Sin fecha límite'}</p></div>
        <Link href={`/crm/oportunidades?abrir=${task.oportunidad_id}`} className={`${btnGhost} shrink-0`}>Ver oportunidad</Link>
      </div>)}
      {!loading && !error && !items.length && <div className="p-8 text-center"><p className="text-sm text-neutral-600">Todavía no hay tareas. Abre una oportunidad para añadir el próximo seguimiento.</p><Link href="/crm/oportunidades" className={`${btnGhost} mt-4`}>Ver oportunidades</Link></div>}
    </div>
  </div></CrmShell>;
}
