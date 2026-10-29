'use client';

import { useEffect, useState } from 'react';
import { useDialog } from './useDialog';
import { supabase } from '@/lib/supabaseClient';
import type { Oportunidad, Tarea, Nota, Empresa, Empleado } from '@/lib/types';
import { ESTADOS, FRANJA_HORARIA_LABEL, ORIGEN_CONTACTO_LABEL } from '@/lib/types';
import { eventDetails } from '@/lib/opportunityDemoDetails';
import AssignmentFields from './AssignmentFields';
import { Avatar, Icon, Section, btnGhost, eventoLabel, fmtDate, fmtMoney, inputCls, tituloOportunidad } from './ui';

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
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [failed, setFailed] = useState(false);
  const dialogRef = useDialog<HTMLDivElement>(() => { if (!busy) onClose(); });
  async function perform(action: () => Promise<void>, success: string) {
    if (busy) return;
    setBusy(true); setNotice(''); setFailed(false);
    try { await action(); setNotice('✓ ' + success); }
    catch { setFailed(true); setNotice('⚠ La acción no se pudo guardar. Revisa tu conexión y vuelve a intentarlo.'); }
    finally { setBusy(false); }
  }

  const estadoActual = ESTADOS.find((e) => e.key === oportunidad.estado)!;
  const estadoIdx = ESTADOS.findIndex((e) => e.key === oportunidad.estado);

  async function loadDetails() {
    const [{ data: t, error: taskError }, { data: n, error: noteError }] = await Promise.all([
      supabase.from('tareas').select('*').eq('oportunidad_id', oportunidad.id).order('created_at'),
      supabase.from('notas').select('*').eq('oportunidad_id', oportunidad.id).order('created_at', { ascending: false }),
    ]);
    if (taskError || noteError) { setFailed(true); setNotice('⚠ No se pudieron cargar las tareas y notas. Cierra la ficha y vuelve a abrirla para reintentar.'); return; }
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
    await perform(async () => {
    // La tarea queda asignada al empleado responsable de la oportunidad
    const { data, error } = await supabase
      .from('tareas')
      .insert({ oportunidad_id: oportunidad.id, titulo, usuario_id: oportunidad.comercial_id })
      .select()
      .single();
    if (!error && data) {
      setTareas((prev) => [...prev, data]);
      setNewTask('');
    } else throw error;
    }, 'Tarea añadida.');
  }

  async function toggleTask(t: Tarea) {
    await perform(async () => {
    const { error } = await supabase.from('tareas').update({ completada: !t.completada }).eq('id', t.id);
    if (error) throw error;
    setTareas((prev) => prev.map((x) => (x.id === t.id ? { ...x, completada: !x.completada } : x)));
    }, 'Estado de la tarea guardado.');
  }

  async function deleteTask(id: string) {
    const task = tareas.find((item) => item.id === id);
    if (!confirm(`¿Eliminar la tarea «${task?.titulo}»? Se borrará de esta oportunidad y no se puede recuperar.`)) return;
    await perform(async () => {
    const { error } = await supabase.from('tareas').delete().eq('id', id);
    if (error) throw error;
    setTareas((prev) => prev.filter((x) => x.id !== id));
    }, 'Tarea eliminada.');
  }

  async function addNote() {
    const contenido = newNote.trim();
    if (!contenido) return;
    await perform(async () => {
    const { data, error } = await supabase
      .from('notas')
      .insert({ oportunidad_id: oportunidad.id, contenido })
      .select()
      .single();
    if (!error && data) {
      setNotas((prev) => [data, ...prev]);
      setNewNote('');
    } else throw error;
    }, 'Nota añadida.');
  }

  async function deleteOpportunity() {
    if (!confirm(`¿Eliminar la oportunidad de «${tituloOportunidad(oportunidad)}»? También se eliminarán sus tareas y notas. Esta acción no se puede deshacer.`)) return;
    await perform(async () => {
      const { error } = await supabase.from('oportunidades').delete().eq('id', oportunidad.id);
      if (error) throw error;
      onDeleted(oportunidad.id);
    }, 'Oportunidad eliminada.');
  }

  const c = oportunidad.cliente;
  const evento = eventDetails(oportunidad);
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
      onClick={(e) => e.target === e.currentTarget && !busy && onClose()}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        aria-busy={busy}
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
            <button disabled={busy} onClick={onClose} aria-label="Cerrar" className="p-1.5 -mr-1.5 rounded-lg text-ink-soft hover:bg-surface shrink-0">
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de progreso del pipeline */}
          <div className="flex gap-1 mt-4" aria-hidden="true">
            {ESTADOS.slice(0, 5).map((e, i) => (
              <span
                key={e.key}
                className="h-1.5 flex-1 rounded-full transition-colors"
                style={{ backgroundColor: estadoIdx < 5 && i <= estadoIdx ? e.color : '#E2E8F0' }}
              />
            ))}
          </div>
        </div>

        {notice && <p role={failed ? 'alert' : 'status'} className="px-6 py-4 text-sm">{notice}</p>}
        {busy && <p role="status" className="px-6 py-2 text-sm">Guardando…</p>}
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
            <label htmlFor="opportunity-state" className="block font-medium mb-2">Estado de la oportunidad</label>
            <select id="opportunity-state"
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
              {dato('Franja horaria', evento.franja_horaria ? FRANJA_HORARIA_LABEL[evento.franja_horaria] : '—')}
              {dato('Ubicación del evento', evento.ubicacion_evento || '—')}
              {dato('Nº de invitados', oportunidad.num_invitados || '—')}
              {dato('Presupuesto estimado', <span className="font-semibold">{fmtMoney(oportunidad.presupuesto_estimado)}</span>)}
              {dato('Email', <a href={`mailto:${c.email}`} className="text-black hover:underline">{c.email}</a>)}
              {dato('Teléfono', c.telefono ? <a href={`tel:${c.telefono}`} className="text-black hover:underline">{c.telefono}</a> : '—')}
              {dato('Cómo nos conoció', oportunidad.como_nos_conocio ? (ORIGEN_CONTACTO_LABEL[oportunidad.como_nos_conocio] || oportunidad.como_nos_conocio) : '—')}
            </dl>
            {oportunidad.restricciones && (
              <div className="mt-4">
                <dt className="text-xs text-ink-soft mb-1">Restricciones alimentarias / alergias</dt>
                <dd className="text-sm bg-surface border border-line px-3.5 py-2.5 rounded-lg">{oportunidad.restricciones}</dd>
              </div>
            )}
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
                      className="w-4 h-4 accent-black"
                      aria-label={`Marcar «${t.titulo}» como ${t.completada ? 'pendiente' : 'completada'}`}
                      disabled={busy}
                      checked={t.completada}
                      onChange={() => toggleTask(t)}
                    />
                    <span className={t.completada ? 'line-through text-ink-soft' : ''}>{t.titulo}</span>
                    <span className="ml-auto flex items-center gap-2 shrink-0">
                      {responsable && <Avatar nombre={responsable.nombre} size={20} />}
                      <button
                        disabled={busy}
                        onClick={() => deleteTask(t.id)}
                        aria-label={`Eliminar tarea «${t.titulo}»`}
                        className="text-xs text-neutral-500 hover:text-warning  transition"
                      >
                        Eliminar
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
            <label htmlFor="new-task" className="block text-sm font-medium mt-4">Nueva tarea</label>
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <input id="new-task"
                className={inputCls}
                placeholder="Ej. Llamar para confirmar menú"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
              />
              <button disabled={busy} onClick={() => { if (!newTask.trim()) { setFailed(true); setNotice('⚠ Escribe el título de la tarea antes de añadirla.'); document.getElementById('new-task')?.focus(); return; } addTask(); }} className={btnGhost}>Añadir tarea</button>
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
            <label htmlFor="new-note" className="block text-sm font-medium mt-4">Nueva nota</label>
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <input id="new-note"
                className={inputCls}
                placeholder="Ej. Llamada de seguimiento, cambió el menú a…"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addNote()}
              />
              <button disabled={busy} onClick={() => { if (!newNote.trim()) { setFailed(true); setNotice('⚠ Escribe el contenido de la nota antes de añadirla.'); document.getElementById('new-note')?.focus(); return; } addNote(); }} className={btnGhost}>Añadir nota</button>
            </div>
          </Section>
        </div>

        {/* Pie */}
        <div className="flex flex-wrap gap-3 justify-between px-6 py-4 border-t border-line bg-surface/60">
          <button
            disabled={busy}
            onClick={deleteOpportunity}
            className="inline-flex items-center h-9 px-3.5 rounded-lg border border-warning/40 text-warning text-sm font-medium hover:bg-warning hover:text-white transition"
          >
            Eliminar oportunidad
          </button>
          <button disabled={busy} onClick={onClose} className={btnGhost}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
