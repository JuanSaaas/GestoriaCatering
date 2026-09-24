'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Oportunidad, Tarea, Nota, Empresa, Empleado } from '@/lib/types';
import { ESTADOS } from '@/lib/types';
import AssignmentFields from './AssignmentFields';
import { Avatar, Icon, Section, btnGhost, btnPrimary, eventoLabel, fmtDate, fmtMoney, inputCls, tituloOportunidad } from './ui';

export default function OpportunityModal({
  oportunidad,
  empresas,
  empleados,
  onClose,
  onEstadoChange,
  onAsignacionChange,
  onEmpresaCreated,
  onEmpleadoCreated,
  onDeleted,
}: {
  oportunidad: Oportunidad;
  empresas: Empresa[];
  empleados: Empleado[];
  onClose: () => void;
  onEstadoChange: (id: string, estado: Oportunidad['estado']) => void;
  onAsignacionChange: (id: string, patch: { empresa?: Empresa | null; comercial?: Empleado | null }) => void;
  onEmpresaCreated: (e: Empresa) => void;
  onEmpleadoCreated: (e: Empleado) => void;
  onDeleted: (id: string) => void;
}) {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newNote, setNewNote] = useState('');

  const estadoActual = ESTADOS.find((e) => e.key === oportunidad.estado)!;
  const estadoIdx = ESTADOS.findIndex((e) => e.key === oportunidad.estado);

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function addTask() {
    const titulo = newTask.trim();
    if (!titulo) return;
    // La tarea queda asignada al empleado responsable de la oportunidad
    const { data, error } = await supabase
      .from('tareas')
      .insert({ oportunidad_id: oportunidad.id, titulo, usuario_id: oportunidad.comercial_id })
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

  const c = oportunidad.cliente;
  const tareasPendientes = tareas.filter((t) => !t.completada).length;

  const dato = (label: string, value: React.ReactNode) => (
    <div>
      <dt className="text-xs text-ink-soft">{label}</dt>
      <dd className="text-sm mt-0.5 break-words">{value}</dd>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Ficha de oportunidad"
        className="absolute right-0 top-0 h-full w-[580px] max-w-full bg-white shadow-2xl flex flex-col animate-slide-in"
      >
        {/* Cabecera */}
        <div className="px-6 pt-5 pb-4 border-b border-line">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: estadoActual.color + '1A', color: estadoActual.color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: estadoActual.color }} />
                  {estadoActual.label}
                </span>
                <span className="text-xs text-ink-soft">{eventoLabel(oportunidad)}</span>
              </div>
              <h2 className="text-xl font-semibold truncate">{tituloOportunidad(oportunidad)}</h2>
              <p className="text-sm text-ink-soft mt-0.5">
                {c.tipo_cliente === 'empresa' || oportunidad.empresa ? `Contacto: ${c.nombre}` : 'Cliente particular'}
              </p>
            </div>
            <button onClick={onClose} aria-label="Cerrar" className="p-1.5 -mr-1.5 rounded-lg text-ink-soft hover:bg-surface shrink-0">
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de progreso del pipeline */}
          <div className="flex gap-1 mt-4" aria-hidden="true">
            {ESTADOS.slice(0, 5).map((e, i) => (
              <span
                key={e.key}
                className="h-1.5 flex-1 rounded-full transition-colors"
                style={{ backgroundColor: estadoIdx < 5 && i <= estadoIdx ? estadoActual.color : '#E6E2DB' }}
              />
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
          <Section title="Asignación">
            <AssignmentFields
              empresas={empresas}
              empleados={empleados}
              empresa={oportunidad.empresa}
              empleado={oportunidad.comercial}
              onEmpresaChange={(e) => onAsignacionChange(oportunidad.id, { empresa: e })}
              onEmpleadoChange={(e) => onAsignacionChange(oportunidad.id, { comercial: e })}
              onEmpresaCreated={onEmpresaCreated}
              onEmpleadoCreated={onEmpleadoCreated}
              sugerenciaEmpresa={c.empresa}
            />
          </Section>

          <Section title="Fase">
            <select
              aria-label="Estado"
              className={inputCls}
              value={oportunidad.estado}
              onChange={(e) => onEstadoChange(oportunidad.id, e.target.value as Oportunidad['estado'])}
            >
              {ESTADOS.map((e) => (
                <option key={e.key} value={e.key}>{e.label}</option>
              ))}
            </select>
          </Section>

          <Section title="Evento y contacto">
            <dl className="grid grid-cols-2 gap-x-5 gap-y-3.5">
              {dato('Tipo de evento', eventoLabel(oportunidad))}
              {dato('Fecha del evento', fmtDate(oportunidad.fecha_evento))}
              {dato('Nº de invitados', oportunidad.num_invitados || '—')}
              {dato('Presupuesto estimado', <span className="font-semibold">{fmtMoney(oportunidad.presupuesto_estimado)}</span>)}
              {dato('Email', <a href={`mailto:${c.email}`} className="text-wine hover:underline">{c.email}</a>)}
              {dato('Teléfono', c.telefono ? <a href={`tel:${c.telefono}`} className="text-wine hover:underline">{c.telefono}</a> : '—')}
            </dl>
            {oportunidad.mensaje && (
              <div className="mt-4 bg-surface border border-line px-3.5 py-3 rounded-lg text-sm text-ink-soft whitespace-pre-line">
                {oportunidad.mensaje}
              </div>
            )}
          </Section>

          <Section title={`Tareas de seguimiento${tareas.length ? ` · ${tareasPendientes} pendientes` : ''}`}>
            {tareas.length === 0 && <div className="text-sm text-ink-soft py-1">Sin tareas todavía.</div>}
            <ul className="divide-y divide-line">
              {tareas.map((t) => {
                const responsable = empleados.find((e) => e.id === t.usuario_id);
                return (
                  <li key={t.id} className="flex items-center gap-2.5 py-2 text-sm group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#7A1F2B]"
                      checked={t.completada}
                      onChange={() => toggleTask(t)}
                    />
                    <span className={t.completada ? 'line-through text-ink-soft' : ''}>{t.titulo}</span>
                    <span className="ml-auto flex items-center gap-2 shrink-0">
                      {responsable && <Avatar nombre={responsable.nombre} size={20} />}
                      <button
                        onClick={() => deleteTask(t.id)}
                        className="text-xs text-ink-soft hover:text-wine opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
                      >
                        Eliminar
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="flex gap-2 mt-3">
              <input
                className={inputCls}
                placeholder="Ej. Llamar para confirmar menú"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
              />
              <button onClick={addTask} className={btnPrimary}>Añadir</button>
            </div>
          </Section>

          <Section title="Notas e interacciones">
            {notas.length === 0 && <div className="text-sm text-ink-soft py-1">Sin notas todavía.</div>}
            <div className="space-y-2">
              {notas.map((n) => (
                <div key={n.id} className="text-sm bg-surface border border-line rounded-lg px-3.5 py-2.5">
                  <div className="whitespace-pre-line">{n.contenido}</div>
                  <div className="text-[11px] text-ink-soft mt-1">{new Date(n.created_at).toLocaleString('es-ES')}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <input
                className={inputCls}
                placeholder="Ej. Llamada de seguimiento, cambió el menú a…"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addNote()}
              />
              <button onClick={addNote} className={btnPrimary}>Añadir</button>
            </div>
          </Section>
        </div>

        {/* Pie */}
        <div className="flex justify-between px-6 py-4 border-t border-line bg-surface/60">
          <button
            onClick={deleteOpportunity}
            className="inline-flex items-center h-9 px-3.5 rounded-lg border border-wine/40 text-wine text-sm font-medium hover:bg-wine hover:text-white transition"
          >
            Eliminar oportunidad
          </button>
          <button onClick={onClose} className={btnGhost}>Cerrar</button>
        </div>
      </aside>
    </div>
  );
}
