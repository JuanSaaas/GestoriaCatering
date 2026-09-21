'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Oportunidad, Tarea, Nota } from '@/lib/types';
import { ESTADOS, TIPO_EVENTO_LABEL } from '@/lib/types';

function fmtMoney(n: number | null) {
  if (n === null || n === undefined) return '—';
  return Number(n).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

function fmtDate(d: string | null) {
  if (!d) return 'sin fecha';
  return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function OpportunityModal({
  oportunidad,
  onClose,
  onEstadoChange,
  onDeleted,
}: {
  oportunidad: Oportunidad;
  onClose: () => void;
  onEstadoChange: (id: string, estado: Oportunidad['estado']) => void;
  onDeleted: (id: string) => void;
}) {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newNote, setNewNote] = useState('');

  async function loadDetails() {
    const [{ data: t }, { data: n }] = await Promise.all([
      supabase.from('tareas').select('*').eq('oportunidad_id', oportunidad.id).order('created_at'),
      supabase.from('notas').select('*').eq('oportunidad_id', oportunidad.id).order('created_at', { ascending: false }),
    ]);
    setTareas(t || []);
    setNotas(n || []);
  }

  useEffect(() => {
    loadDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oportunidad.id]);

  async function addTask() {
    const titulo = newTask.trim();
    if (!titulo) return;
    const { data, error } = await supabase
      .from('tareas')
      .insert({ oportunidad_id: oportunidad.id, titulo })
      .select()
      .single();
    if (!error && data) {
      setTareas((prev) => [...prev, data]);
      setNewTask('');
    }
  }

  async function toggleTask(t: Tarea) {
    await supabase.from('tareas').update({ completada: !t.completada }).eq('id', t.id);
    setTareas((prev) => prev.map((x) => (x.id === t.id ? { ...x, completada: !x.completada } : x)));
  }

  async function deleteTask(id: string) {
    await supabase.from('tareas').delete().eq('id', id);
    setTareas((prev) => prev.filter((x) => x.id !== id));
  }

  async function addNote() {
    const contenido = newNote.trim();
    if (!contenido) return;
    const { data, error } = await supabase
      .from('notas')
      .insert({ oportunidad_id: oportunidad.id, contenido })
      .select()
      .single();
    if (!error && data) {
      setNotas((prev) => [data, ...prev]);
      setNewNote('');
    }
  }

  async function deleteOpportunity() {
    if (!confirm('¿Eliminar esta oportunidad? Esta acción no se puede deshacer.')) return;
    await supabase.from('oportunidades').delete().eq('id', oportunidad.id);
    onDeleted(oportunidad.id);
  }

  return (
    <div
      className="fixed inset-0 bg-[rgba(36,27,22,0.45)] flex items-center justify-center z-20 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-paper-2 w-[520px] max-w-full max-h-[88vh] overflow-y-auto rounded-sm p-7">
        <h2 className="font-serif text-2xl">{oportunidad.cliente.empresa || oportunidad.cliente.nombre}</h2>
        <div className="text-ink-soft text-sm mb-5">
          {oportunidad.cliente.tipo_cliente === 'empresa'
            ? `Cliente empresa · Contacto: ${oportunidad.cliente.nombre}`
            : 'Cliente particular'}
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-2.5 mb-5 text-sm">
          <div><span className="block text-xs text-ink-soft">Email</span>{oportunidad.cliente.email}</div>
          <div><span className="block text-xs text-ink-soft">Teléfono</span>{oportunidad.cliente.telefono || '—'}</div>
          <div><span className="block text-xs text-ink-soft">Tipo de evento</span>
        {TIPO_EVENTO_LABEL[oportunidad.tipo_evento]}
        {oportunidad.tipo_evento === 'otro' && oportunidad.tipo_evento_otro
          ? ` — ${oportunidad.tipo_evento_otro}`
          : ''}
      </div>
          <div><span className="block text-xs text-ink-soft">Fecha del evento</span>{fmtDate(oportunidad.fecha_evento)}</div>
          <div><span className="block text-xs text-ink-soft">Nº invitados</span>{oportunidad.num_invitados || '—'}</div>
          <div><span className="block text-xs text-ink-soft">Presupuesto estimado</span>{fmtMoney(oportunidad.presupuesto_estimado)}</div>
        </div>

        {oportunidad.mensaje && (
          <div className="bg-paper border border-[var(--line)] px-3 py-2.5 rounded-sm text-sm text-ink-soft mb-4">
            {oportunidad.mensaje}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs text-ink-soft mb-1.5" htmlFor="estado">Estado</label>
          <select
            id="estado"
            className="w-full px-2.5 py-2 border border-[var(--line)] rounded-sm bg-paper text-sm"
            value={oportunidad.estado}
            onChange={(e) => onEstadoChange(oportunidad.id, e.target.value as Oportunidad['estado'])}
          >
            {ESTADOS.map((e) => (
              <option key={e.key} value={e.key}>{e.label}</option>
            ))}
          </select>
        </div>

        <div className="mb-5">
          <h3 className="text-sm font-semibold mb-2.5">Tareas de seguimiento</h3>
          {tareas.length === 0 && <div className="text-xs text-ink-soft text-center py-3">Sin tareas todavía</div>}
          {tareas.map((t) => (
            <div key={t.id} className="flex items-center gap-2 py-1.5 border-b border-[var(--line)] text-sm">
              <input type="checkbox" checked={t.completada} onChange={() => toggleTask(t)} />
              <span className={t.completada ? 'line-through text-ink-soft' : ''}>{t.titulo}</span>
              <span onClick={() => deleteTask(t.id)} className="ml-auto text-xs text-wine cursor-pointer">
                eliminar
              </span>
            </div>
          ))}
          <div className="flex gap-2 mt-3">
            <input
              className="flex-1 px-2.5 py-2 border border-[var(--line)] rounded-sm text-sm"
              placeholder="Ej. Llamar para confirmar menú"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
            />
            <button onClick={addTask} className="px-3.5 py-2 bg-olive text-white rounded-sm text-sm">
              Añadir
            </button>
          </div>
        </div>

        <div className="mb-2">
          <h3 className="text-sm font-semibold mb-2.5">Notas e interacciones</h3>
          {notas.length === 0 && <div className="text-xs text-ink-soft text-center py-3">Sin notas todavía</div>}
          <div className="space-y-2">
            {notas.map((n) => (
              <div key={n.id} className="text-sm bg-paper border border-[var(--line)] rounded-sm px-2.5 py-2">
                <div>{n.contenido}</div>
                <div className="text-[11px] text-ink-soft mt-1">
                  {new Date(n.created_at).toLocaleString('es-ES')}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input
              className="flex-1 px-2.5 py-2 border border-[var(--line)] rounded-sm text-sm"
              placeholder="Ej. Llamada de seguimiento, cambió el menú a..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addNote()}
            />
            <button onClick={addNote} className="px-3.5 py-2 bg-olive text-white rounded-sm text-sm">
              Añadir
            </button>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={deleteOpportunity} className="px-4 py-2 border border-wine text-wine rounded-sm text-sm">
            Eliminar oportunidad
          </button>
          <button onClick={onClose} className="px-4 py-2 border border-[var(--line)] rounded-sm text-sm">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
