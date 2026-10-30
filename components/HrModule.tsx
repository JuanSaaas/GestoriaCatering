'use client';

import { useDialog } from '@/components/useDialog';
import ValidatedForm from '@/components/ValidatedForm';
import { readHrResponse } from '@/lib/hrResponse';

import { useEffect, useState } from 'react';
import { ArrowDownTrayIcon, ArrowRightOnRectangleIcon, ArrowLeftOnRectangleIcon, ArrowLeftIcon, CheckIcon, ClockIcon, DocumentTextIcon, EyeIcon, PencilSquareIcon, PlusIcon, StarIcon, UserGroupIcon, XMarkIcon } from '@heroicons/react/24/outline';
import CrmShell from './CrmShell';
import DecisionControl from './DecisionControl';
import { Avatar, inputCls, btnPrimary, btnGhost } from './ui';
import { CANDIDATE_STAGES, latestAttendanceByEmployee, workedTime, type Employee, type HrFile, type HrState } from '@/lib/hr';

const GENERAL_TABS = ['Empleados', 'Horarios', 'Vacaciones', 'Selección'] as const;
const EMPLOYEE_TABS = ['Horarios', 'Solicitud de vacaciones', 'Tareas', 'Evaluaciones', 'Documentos'] as const;
type Tab = typeof GENERAL_TABS[number] | typeof EMPLOYEE_TABS[number];
type Modal = 'employee' | 'candidate' | 'vacation' | 'sign' | null;
const fileUrl = (id: string) => `/api/crm/rrhh/archivos/${id}`;
const date = (value: string) => new Date(value.length === 10 ? `${value}T12:00:00` : value).toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid', day: '2-digit', month: '2-digit', year: 'numeric' });
const time = (value: string) => new Date(value).toLocaleTimeString('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' });
const today = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
const tableHead = 'px-4 py-3 text-left text-xs font-medium text-neutral-500 whitespace-nowrap';
const cell = 'px-4 py-4 text-sm';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block min-w-0"><span className="block text-sm font-medium text-neutral-700 mb-2">{label}</span>{children}</label>;
}
function Badge({ children, tone = 'neutral', large = false }: { children: React.ReactNode; tone?: string; large?: boolean }) {
  const color = tone === 'green' ? 'bg-green-50 text-green-700' : tone === 'red' ? 'bg-red-50 text-red-700' : tone === 'amber' ? 'bg-amber-50 text-amber-700' : tone === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-neutral-100 text-neutral-600';
  return <span className={`inline-flex items-center justify-center font-medium rounded ${large ? 'min-w-[112px] min-h-10 px-4 py-2 text-sm' : 'px-2 py-1 text-xs'} ${color}`}><span aria-hidden="true" className="mr-1">{tone === 'green' ? '✓' : tone === 'red' ? '×' : tone === 'amber' ? '◷' : '•'}</span>{children}</span>;
}
function Portrait({ employee, size = 36 }: { employee: Employee; size?: number }) {
  return employee.photoId ? <img src={fileUrl(employee.photoId)} alt={employee.name} className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} /> : <Avatar nombre={employee.name} size={size} />;
}
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-neutral-500 py-12 text-center border-y border-neutral-200">{children}</p>;
}
function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useDialog<HTMLDivElement>(onClose);
  return <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90dvh] overflow-y-auto">
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-neutral-200"><h2 className="text-lg font-semibold">{title}</h2><button type="button" onClick={onClose} aria-label="Cerrar ventana" title="Cerrar" className="p-2 rounded hover:bg-neutral-100"><XMarkIcon className="w-5 h-5" /></button></div>
      <div className="p-6">{children}</div>
    </div>
  </div>;
}

export default function HrModule() {
  const [data, setData] = useState<HrState | null>(null);
  const [tab, setTab] = useState<Tab>('Empleados');
  const [selectedId, setSelectedId] = useState('');
  const [profile, setProfile] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [signing, setSigning] = useState<HrFile | null>(null);
  const [score, setScore] = useState(3);
  const [now, setNow] = useState(Date.now());
  const [candidateFilter, setCandidateFilter] = useState('todos');
  const closeModal = () => { if (!busy) setModal(null); };
  function openEmployee(id: string, section: Tab = 'Horarios') {
    setSelectedId(id); setProfile(true); setTab(section); setError(''); setNotice('');
  }
  function backToEmployees() { setProfile(false); setTab('Empleados'); setError(''); setNotice(''); }

  async function load() {
    setError('');
    try {
      const response = await fetch('/api/crm/rrhh', { cache: 'no-store' });
      const result = await readHrResponse(response);
      setData(result); setSelectedId((id) => id || result.employees[0]?.id || '');
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cargar RRHH.'); }
  }
  useEffect(() => { load(); const timer = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(timer); }, []);

  async function request(body: Record<string, unknown> | FormData, message: string): Promise<HrState | null> {
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/crm/rrhh', body instanceof FormData ? { method: 'POST', body } : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const result = await readHrResponse(response);
      setData(result); setNotice(message); setNow(Date.now()); return result;
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar.'); return null; }
    finally { setBusy(false); }
  }
  async function upload(file: File, kind: string, ownerId: string) {
    const form = new FormData(); form.set('file', file); form.set('kind', kind); form.set('ownerId', ownerId);
    return request(form, kind === 'photo' ? 'Foto actualizada.' : kind === 'cv' ? 'CV incorporado a la candidatura.' : 'Nómina guardada.');
  }

  if (!data) return <CrmShell><div className="p-6"><h1 className="text-2xl font-semibold mb-4">Recursos humanos</h1>{error ? <div role="alert">{error}<button className={`${btnGhost} ml-3`} onClick={load}>Reintentar</button></div> : <p role="status" className="text-sm text-neutral-500">Cargando equipo...</p>}</div></CrmShell>;
  const employee = data.employees.find((e) => e.id === selectedId) || data.employees[0];
  const attendance = data.attendance.filter((a) => a.employeeId === employee?.id);
  const totals = workedTime(attendance, new Date(now));
  const duration = (ms: number) => `${Math.floor(ms / 3600000)} h ${Math.floor(ms / 60000) % 60} min`;
  const open = attendance.find((a) => !a.out);
  const elapsed = open ? Math.max(0, Math.floor((now - new Date(open.in).getTime()) / 60000)) : 0;
  const vacations = profile ? data.vacations.filter((v) => v.employeeId === employee?.id) : data.vacations;
  const tabs: readonly Tab[] = profile ? EMPLOYEE_TABS : GENERAL_TABS;
  const latestAttendance = latestAttendanceByEmployee(data.attendance);
  const evaluations = data.evaluations.filter((e) => e.employeeId === employee?.id);
  const documents = data.files.filter((f) => f.kind === 'payroll' && f.employeeId === employee?.id);
  const employees = data.employees.filter((e) => `${e.name} ${e.role} ${e.department} ${e.email}`.toLowerCase().includes(search.toLowerCase()));
  const quarter = `${new Date().getFullYear()}-T${Math.ceil((new Date().getMonth() + 1) / 3)}`;
  const iconButton = 'inline-flex items-center justify-center w-9 h-9 rounded-md border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50';

  async function submitEmployee(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const result = await request({ type: 'employee', ...(editing ? { employeeId: editing.id } : {}), ...Object.fromEntries(form) }, editing ? 'Ficha actualizada.' : 'Empleado creado.');
    if (result) {
      const id = editing?.id || result.employees[result.employees.length - 1].id;
      setSelectedId(id);
      const photo = form.get('photo');
      if (photo instanceof File && photo.size && !await upload(photo, 'photo', id)) { setEditing(result.employees.find((e) => e.id === id) || null); return; }
      setModal(null);
      if (!editing) openEmployee(id);
    }
  }
  async function submitCandidate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const cv = form.get('cv') as File;
    form.set('file', cv); form.delete('cv'); form.set('kind', 'cv'); form.set('createCandidate', 'true');
    if (await request(form, 'Candidatura y CV guardados.')) setModal(null);
  }
  async function submitVacation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    if (await request({ type: 'vacation', employeeId: employee.id, ...Object.fromEntries(form) }, 'Vacaciones solicitadas.')) setModal(null);
  }
  async function submitEvaluation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const element = event.currentTarget;
    if (busy) return;
    if (await request({ type: 'evaluation', employeeId: employee.id, score, ...Object.fromEntries(form) }, 'Evaluación guardada.')) { element.reset(); setScore(3); }
  }

  return <CrmShell><div className="hr-module px-4 sm:px-6 py-6 text-neutral-900">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>{profile && <button className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black mb-4" onClick={backToEmployees}><ArrowLeftIcon className="w-4 h-4" /> Empleados</button>}<div className="flex items-center gap-3">{profile && employee ? <Portrait employee={employee} size={48} /> : <UserGroupIcon className="w-6 h-6 text-neutral-500" />}<h1 className="text-2xl font-semibold break-words">{profile ? employee?.name : 'Recursos humanos'}</h1></div><p className="text-sm text-neutral-500 mt-1">{profile ? `${employee?.role} · ${employee?.department}` : 'Equipo de La Mesa Perfecta'}</p></div>
      <a href="/api/crm/rrhh/informe" className={btnGhost}><ArrowDownTrayIcon className="w-4 h-4" /> Informe PDF</a>
    </div>
    {!profile && <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 py-6 my-4 border-y border-neutral-200">
      {[['Empleados', data.employees.length], ['En jornada', data.attendance.filter((a) => !a.out).length], ['Vacaciones pendientes', data.vacations.filter((v) => v.status === 'pendiente').length], ['Candidaturas activas', data.candidates.filter((c) => !['contratado', 'descartado'].includes(c.stage)).length]].map(([label, value]) => <div key={label}><div className="text-xs text-neutral-500">{label}</div><div className="text-2xl font-semibold tabular-nums mt-1">{value}</div></div>)}
    </div>}
    {profile && employee && <div className="flex flex-wrap justify-between items-center gap-3 py-5"><a href={`mailto:${employee.email}`} className="text-sm text-blue-600 hover:underline break-all">{employee.email}</a><button className={btnGhost} onClick={() => { setEditing(employee); setModal('employee'); }}><PencilSquareIcon className="w-4 h-4" /> Editar ficha</button></div>}
    <div role="tablist" aria-label={profile ? 'Apartados del empleado' : 'Apartados de recursos humanos'} className="flex gap-5 overflow-x-auto border-b border-neutral-200 mb-6">
      {tabs.map((t, index) => <button key={t} role="tab" id={`tab-${index}`} tabIndex={tab === t ? 0 : -1} aria-controls="hr-panel" aria-selected={tab === t} onKeyDown={(event) => {
        const target = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
        if (target !== null) { event.preventDefault(); setTab(tabs[target]); document.getElementById(`tab-${target}`)?.focus(); }
      }} onClick={() => { setTab(t); setError(''); setNotice(''); }} className={`shrink-0 text-sm py-3 border-b-2 transition ${tab === t ? 'border-black text-black font-semibold' : 'border-transparent text-neutral-500 hover:text-black'}`}>{t}</button>)}
    </div>
    {error && <div role="alert" className="mb-5 px-4 py-3 border border-red-200 bg-red-50 text-red-700 text-sm rounded-md">{error}</div>}
    {notice && <div role="status" className="mb-5 flex justify-between gap-3 px-4 py-3 border border-green-200 bg-green-50 text-green-800 text-sm rounded-md">{notice}<button onClick={() => setNotice('')} aria-label="Cerrar aviso"><XMarkIcon className="w-4 h-4" /></button></div>}
    <div id="hr-panel" tabIndex={0} role="tabpanel" aria-labelledby={`tab-${tabs.indexOf(tab)}`}>

    {tab === 'Empleados' && <>
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 justify-between mb-5"><div className="w-full sm:max-w-sm"><label htmlFor="hr-search" className="block text-sm font-medium text-neutral-700 mb-2">Buscar empleados</label><input id="hr-search" type="search" className={inputCls} aria-label="Buscar empleados" placeholder="Buscar por nombre, puesto o departamento..." value={search} onChange={(e) => setSearch(e.target.value)} /></div><button className={btnPrimary + ' h-12 shrink-0 self-start sm:self-auto'} onClick={() => { setEditing(null); setModal('employee'); }}><PlusIcon className="w-4 h-4" /> Nuevo empleado</button></div>
      <div role="region" aria-label="Empleados y datos de contacto" tabIndex={0} className="overflow-x-auto border border-neutral-200 rounded-lg bg-white"><table className="w-full"><caption className="sr-only">Empleados y datos de contacto</caption><thead className="bg-neutral-50"><tr>{['Empleado', 'Puesto y departamento', 'Correo corporativo', 'Alta', 'Acciones'].map((s, i) => <th key={i} scope="col" className={tableHead}>{s}</th>)}</tr></thead><tbody className="divide-y divide-neutral-100">{employees.map((e) => <tr key={e.id} className="hover:bg-neutral-50/60"><td className={cell}><div className="flex gap-3 items-center"><Portrait employee={e} /><button className="font-medium whitespace-nowrap hover:text-blue-600 hover:underline text-left" onClick={() => openEmployee(e.id)}>{e.name}</button></div></td><td className={cell}><div>{e.role}</div><div className="text-xs text-neutral-500 mt-1">{e.department}</div></td><td className={cell}><a className="text-blue-600 hover:underline" href={`mailto:${e.email}`}>{e.email}</a></td><td className={`${cell} whitespace-nowrap`}>{date(e.startDate)}</td><td className={cell}><div className="flex gap-2"><button title="Editar ficha" aria-label={`Editar ficha de ${e.name}`} className={iconButton} onClick={() => { setEditing(e); setModal('employee'); }}><PencilSquareIcon className="w-4 h-4" /></button><button title="Ver tareas" aria-label={`Ver tareas de ${e.name}`} className={iconButton} onClick={() => openEmployee(e.id, 'Tareas')}><CheckIcon className="w-4 h-4" /></button></div></td></tr>)}</tbody></table>{employees.length === 0 && <Empty>No hay empleados que coincidan con la búsqueda. Limpia el buscador o pulsa Nuevo empleado.</Empty>}</div>
    </>}

    {!profile && tab === 'Horarios' && <>
      <h2 className="text-base font-semibold mb-4">Última jornada por empleado</h2>
      <div role="region" aria-label="Última jornada por empleado" tabIndex={0} className="overflow-x-auto border border-neutral-200 rounded-lg bg-white">
        <table className="w-full"><caption className="sr-only">Última jornada por empleado</caption>
          <thead className="bg-neutral-50"><tr>{['Empleado', 'Último día trabajado', 'Entrada', 'Salida', 'Estado'].map((label) => <th key={label} scope="col" className={tableHead}>{label}</th>)}</tr></thead>
          <tbody className="divide-y divide-neutral-100">{data.employees.map((e) => {
            const last = latestAttendance.get(e.id);
            return <tr key={e.id} className="hover:bg-neutral-50/60">
              <td className={cell}><button onClick={() => openEmployee(e.id)} className="flex items-center gap-3 font-medium text-left hover:text-blue-600"><Portrait employee={e} /><span className="whitespace-nowrap">{e.name}</span></button></td>
              <td className={`${cell} whitespace-nowrap`}>{last ? date(last.in) : 'Sin fichajes'}</td>
              <td className={cell}>{last ? time(last.in) : '—'}</td>
              <td className={`${cell} whitespace-nowrap`}>{last?.out ? `${date(last.out)} · ${time(last.out)}` : '—'}</td>
              <td className={cell}><Badge tone={last && !last.out ? 'green' : 'neutral'}>{!last ? 'Sin registros' : last.out ? 'Finalizada' : 'En jornada'}</Badge></td>
            </tr>;
          })}</tbody>
        </table>
      </div>
    </>}

    {profile && tab === 'Horarios' && employee && <>
      <div className="grid grid-cols-1 gap-6 border-b border-neutral-200 pb-6 mb-6">
        <div><p className="text-xs font-medium text-neutral-500 uppercase">Semana actual · Lunes a domingo</p><p className="text-3xl font-semibold tabular-nums mt-2">{duration(totals.weekMs)}</p><p className="text-xs text-neutral-500 mt-2">{date(totals.weekStart)} – {date(totals.weekEnd)}</p></div>
        <div><p className="text-xs font-medium text-neutral-500 uppercase">Mes actual</p><p className="text-3xl font-semibold tabular-nums mt-2">{duration(totals.monthMs)}</p><p className="text-xs text-neutral-500 mt-2">{new Date(totals.month + '-01T12:00:00').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}{open ? ' · Jornada en curso incluida' : ''}</p></div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 border-y border-neutral-200 mb-7">
        <div className="flex items-center gap-3"><ClockIcon className="w-6 h-6 text-neutral-500" /><div className="text-sm"><div className="font-medium">{open ? 'Jornada en curso' : 'Fuera de jornada'}</div><div className="text-neutral-500 mt-1">{open ? `Entrada ${time(open.in)} · ${Math.floor(elapsed / 60)} h ${elapsed % 60} min` : 'Sin fichaje abierto'}</div></div></div>
        <button disabled={busy} className={btnPrimary} onClick={() => request({ type: 'clock', employeeId: employee.id, direction: open ? 'out' : 'in' }, open ? 'Salida registrada.' : 'Entrada registrada.')}>{open ? <ArrowLeftOnRectangleIcon className="w-4 h-4" /> : <ArrowRightOnRectangleIcon className="w-4 h-4" />}{open ? 'Fichar salida' : 'Fichar entrada'}</button>
      </div>
      <h2 className="text-base font-semibold mb-3">Registro de jornada</h2>
      {attendance.length ? <div role="region" aria-label="Registro de jornada del empleado" tabIndex={0} className="overflow-x-auto mb-8 border border-neutral-200 rounded-lg bg-white"><table className="w-full"><caption className="sr-only">Registro de jornada del empleado</caption><thead className="bg-neutral-50"><tr>{['Fecha', 'Entrada', 'Salida', 'Tiempo registrado'].map((s) => <th key={s} scope="col" className={tableHead}>{s}</th>)}</tr></thead><tbody className="divide-y divide-neutral-100">{attendance.map((a) => <tr key={a.id}><td className={cell}>{date(a.in)}</td><td className={cell}>{time(a.in)}</td><td className={cell}>{a.out ? `${date(a.out)} · ${time(a.out)}` : <Badge tone="green">En curso</Badge>}</td><td className={cell}>{a.out ? `${Math.floor((new Date(a.out).getTime() - new Date(a.in).getTime()) / 3600000)} h ${Math.floor((new Date(a.out).getTime() - new Date(a.in).getTime()) / 60000) % 60} min` : 'En curso'}</td></tr>)}</tbody></table></div> : <Empty>No hay fichajes registrados.</Empty>}
    </>}

    {(tab === 'Vacaciones' || (profile && tab === 'Solicitud de vacaciones')) && <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4"><h2 className="text-base font-semibold">{profile ? 'Mis solicitudes de vacaciones' : 'Todas las solicitudes de vacaciones'}</h2>{profile && <button className={btnGhost} onClick={() => setModal('vacation')}><PlusIcon className="w-4 h-4" /> Solicitar vacaciones</button>}</div>
      {vacations.length ? <div className="divide-y divide-neutral-200 border-y border-neutral-200">{vacations.map((v) => <div key={v.id} className="flex flex-wrap justify-between gap-3 py-4"><div>{!profile && <button className="text-sm font-semibold mb-1 hover:text-blue-600 hover:underline" onClick={() => openEmployee(v.employeeId, 'Solicitud de vacaciones')}>{data.employees.find((e) => e.id === v.employeeId)?.name || 'Empleado'}</button>}<div className="text-sm font-medium">{date(v.start)} - {date(v.end)}</div><p className="text-xs text-neutral-500 mt-1">{v.reason || 'Vacaciones'}</p></div><div className="flex flex-wrap items-center gap-3">{v.status === 'pendiente' ? <Badge large tone="amber">Pendiente</Badge> : <DecisionControl decision={v.status === 'aprobada' ? 'accept' : 'reject'} label={v.status === 'aprobada' ? 'Aceptada' : 'Rechazada'} />}{!profile && v.status === 'pendiente' && <><DecisionControl decision="accept" disabled={busy} ariaLabel={`Aceptar solicitud de vacaciones del ${date(v.start)} al ${date(v.end)}`} onClick={() => request({ type: 'vacation_status', id: v.id, status: 'aprobada' }, 'Vacaciones aprobadas.')} /><DecisionControl decision="reject" disabled={busy} ariaLabel={`Rechazar solicitud de vacaciones del ${date(v.start)} al ${date(v.end)}`} onClick={() => request({ type: 'vacation_status', id: v.id, status: 'rechazada' }, 'Solicitud rechazada.')} /></>}</div></div>)}</div> : <Empty>No hay solicitudes de vacaciones. Desde la ficha de un empleado puedes solicitar un periodo.</Empty>}
    </>}

    {profile && tab === 'Tareas' && employee && <>
      <div className="flex justify-between gap-3 mb-3"><h2 className="text-base font-semibold">Tareas de incorporación</h2><span className="text-sm text-neutral-500">{employee.checklist.filter((c) => c.done).length} de {employee.checklist.length} completadas</span></div>
      <progress className="w-full h-2 accent-blue-600 mb-6" max={employee.checklist.length} value={employee.checklist.filter((c) => c.done).length} aria-label="Progreso de incorporación" />
      <div className="divide-y divide-neutral-200 border-y border-neutral-200">{employee.checklist.map((c) => <label key={c.id} className="flex items-center gap-3 py-5 cursor-pointer"><input type="checkbox" disabled={busy} checked={c.done} onChange={(e) => request({ type: 'check', employeeId: employee.id, id: c.id, done: e.target.checked }, 'Tarea actualizada.')} className="w-4 h-4 accent-blue-600" /><span className={`text-sm ${c.done ? 'text-neutral-400 line-through' : 'text-neutral-800'}`}>{c.title}</span>{c.done && <CheckIcon className="w-4 h-4 text-green-600 ml-auto" />}</label>)}</div>
      <div className="mt-5 flex flex-wrap gap-2 text-sm"><span className="text-neutral-500">Correo asignado:</span><a href={`mailto:${employee.email}`} className="text-blue-600 hover:underline">{employee.email}</a></div>
    </>}

    {tab === 'Selección' && <>
      <div className="flex flex-wrap justify-between gap-3 mb-5"><label className="block text-base font-medium"><span className="block mb-2">Filtrar candidaturas</span><select aria-label="Filtrar candidaturas" value={candidateFilter} onChange={(e) => setCandidateFilter(e.target.value)} className={`${inputCls} max-w-[220px]`}><option value="todos">Todos los estados</option>{Object.entries(CANDIDATE_STAGES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><button className={btnPrimary} onClick={() => setModal('candidate')}><PlusIcon className="w-4 h-4" /> Nueva candidatura</button></div>
      {data.candidates.filter((c) => candidateFilter === 'todos' || c.stage === candidateFilter).length ? <div className="divide-y divide-neutral-200 border-y border-neutral-200">{data.candidates.filter((c) => candidateFilter === 'todos' || c.stage === candidateFilter).map((c) => <div key={c.id} className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between py-5"><div className="flex items-center gap-3"><Avatar nombre={c.name} size={40} /><div><div className="font-medium text-sm">{c.name}</div><div className="text-xs text-neutral-500 mt-1">{c.role} · {c.department}</div><a href={`mailto:${c.email}`} className="text-xs text-neutral-500 hover:underline">{c.email}</a></div></div><div className="flex flex-wrap items-center gap-3">{c.cvId ? <a className={btnGhost} target="_blank" rel="noreferrer" href={fileUrl(c.cvId)}><DocumentTextIcon className="w-4 h-4" /> Ver CV</a> : <label className={`${btnGhost} cursor-pointer`}>Subir CV<input type="file" aria-label={`Subir CV de ${c.name}`} accept="application/pdf" className="sr-only" disabled={busy} onChange={(e) => { if (e.target.files?.[0]) upload(e.target.files[0], 'cv', c.id); }} /></label>}{c.stage === 'contratado' ? <><Badge tone="green">Contratado</Badge><button className={btnGhost} onClick={() => openEmployee(c.employeeId || '', 'Tareas')}>Ver ficha</button></> : <label className="block text-base font-medium"><span className="block mb-2">Estado de candidatura</span><select aria-label={`Estado de ${c.name}`} className={`${inputCls} !w-auto max-w-full`} disabled={busy} value={c.stage} onChange={(e) => request({ type: 'candidate_stage', id: c.id, stage: e.target.value }, e.target.value === 'contratado' ? 'Contratación completada: ficha, correo y check de inicio creados.' : 'Estado actualizado.')} >{Object.entries(CANDIDATE_STAGES).map(([key, label]) => <option key={key} value={key} disabled={key === 'contratado' && !c.cvId}>{label}</option>)}</select></label>}</div></div>)}</div> : <Empty>No hay candidaturas en este estado. Cambia el filtro o pulsa Nueva candidatura.</Empty>}
    </>}

    {tab === 'Evaluaciones' && employee && <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(280px,2fr)] gap-4 items-start">
      <ValidatedForm key={employee.id} onSubmit={submitEvaluation} className="w-full !max-w-none space-y-4 min-w-0 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="border-b border-neutral-200 pb-4">
          <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Desarrollo profesional</p>
          <h2 className="mt-2 text-xl font-semibold">Evaluación trimestral</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">Recoge los avances de {employee.name} y acuerda los próximos objetivos.</p>
        </div>
        <fieldset disabled={busy} className="space-y-4">
          <Field label="Trimestre *"><select name="quarter" required defaultValue={quarter} className={inputCls}>{Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - 1 + i).flatMap((year) => [1, 2, 3, 4].map((q) => <option key={year + '-T' + q} value={year + '-T' + q}>{year} · Trimestre {q}</option>))}</select></Field>
          <fieldset>
            <legend className="text-sm font-medium mb-3">Valoración global *</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Valoración global del 1 al 5">
              {[1, 2, 3, 4, 5].map((n) => <label key={n} className="cursor-pointer"><input type="radio" className="sr-only peer" name="rating" value={n} checked={score === n} onChange={() => setScore(n)} aria-label={n + ' de 5'} /><span className={'flex items-center justify-center h-12 w-12 rounded-lg peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-blue-700 ' + (score >= n ? 'text-amber-600 hover:bg-amber-50' : 'text-neutral-400 hover:bg-neutral-50')}><StarIcon className={'w-8 h-8 ' + (score >= n ? 'fill-current' : '')} /></span></label>)}
            </div>
            <p className="mt-3 text-sm font-medium text-neutral-700" role="status">{['Necesita mejorar', 'En desarrollo', 'Cumple los objetivos', 'Supera los objetivos', 'Excelente'][score - 1]}</p>
          </fieldset>
          <Field label="Valoración y objetivos del trimestre *"><textarea name="comment" required maxLength={3000} rows={4} className={inputCls + ' !h-auto min-h-[120px] resize-y !py-3 leading-relaxed'} placeholder="Logros y puntos fuertes, aspectos a mejorar y objetivos concretos para el próximo trimestre." /></Field>
          <p className="text-xs text-neutral-600">Incluye ejemplos concretos y una fecha de seguimiento. Máximo 3.000 caracteres.</p>
        </fieldset>
        <div className="border-t border-neutral-200 pt-4"><button className={btnPrimary} disabled={busy}><CheckIcon className="w-4 h-4" /> {busy ? 'Guardando…' : 'Guardar evaluación'}</button></div>
      </ValidatedForm>
      <div className="rounded-xl border border-neutral-200 bg-white p-5"><h2 className="text-lg font-semibold mb-4">Historial de evaluaciones</h2>{evaluations.length ? <div className="divide-y divide-neutral-200 border-y border-neutral-200">{[...evaluations].sort((a, b) => b.quarter.localeCompare(a.quarter)).map((r) => <div key={r.id} className="py-5"><div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold">{r.quarter.replace('-T', ' · Trimestre ')}</span><span className="inline-flex gap-0.5 text-amber-600" role="img" aria-label={r.score + ' de 5 estrellas'}>{[1, 2, 3, 4, 5].map((n) => <StarIcon key={n} aria-hidden="true" className={'w-4 h-4 ' + (n <= r.score ? 'fill-current' : 'text-neutral-300')} />)}</span></div><p className="text-sm text-neutral-600 mt-3 whitespace-pre-wrap break-words">{r.comment}</p><p className="text-xs text-neutral-400 mt-2">{date(r.createdAt)}</p></div>)}</div> : <p className="text-sm text-neutral-500 py-5 border-t border-neutral-200">No hay evaluaciones de este empleado.</p>}</div>
    </div>}

    {tab === 'Documentos' && employee && <>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5"><h2 className="text-base font-semibold">Nóminas y conformidad</h2><label className={`${btnPrimary} cursor-pointer`}><PlusIcon className="w-4 h-4" /> Subir nómina<input aria-label="Subir nómina PDF" type="file" accept="application/pdf" disabled={busy} className="sr-only" onChange={(e) => { if (e.target.files?.[0]) upload(e.target.files[0], 'payroll', employee.id); e.target.value = ''; }} /></label></div>
      {documents.length ? <div className="divide-y divide-neutral-200 border-y border-neutral-200">{documents.map((f) => <div key={f.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5"><div className="flex items-center gap-3 min-w-0"><DocumentTextIcon className="w-8 h-8 text-neutral-400 shrink-0" /><div className="min-w-0"><div className="text-sm font-medium break-words">{f.name}</div><div className="text-xs text-neutral-500 mt-1">{f.signedAt ? `Firmado por ${f.signer} · ${date(f.signedAt)}` : `Subido el ${date(f.createdAt)}`}</div></div></div><div className="flex flex-wrap items-center gap-2"><Badge tone={f.signedAt ? 'green' : 'amber'}>{f.signedAt ? 'Firmado' : 'Pendiente de firma'}</Badge><a href={fileUrl(f.id)} target="_blank" rel="noreferrer" className={iconButton} title="Ver PDF original" aria-label={`Ver ${f.name}`}><EyeIcon className="w-4 h-4" /></a><a href={`${fileUrl(f.signedId || f.id)}?download=1`} className={iconButton} title={f.signedAt ? 'Descargar copia firmada' : 'Descargar PDF'} aria-label={`Descargar ${f.name}`}><ArrowDownTrayIcon className="w-4 h-4" /></a>{!f.signedAt && <button disabled={busy} className={btnGhost} onClick={() => { setSigning(f); setModal('sign'); }}><PencilSquareIcon className="w-4 h-4" /> Firmar</button>}</div></div>)}</div> : <Empty>No hay nóminas de este empleado.</Empty>}
    </>}
    </div>

    {modal && <Dialog title={modal === 'employee' ? (editing ? 'Ficha del empleado' : 'Nuevo empleado') : modal === 'candidate' ? 'Nueva candidatura' : modal === 'vacation' ? 'Solicitar vacaciones' : 'Firmar conformidad'} onClose={closeModal}>
      {error && <p role="alert" className="text-sm text-red-700 bg-red-50 p-3 mb-4 rounded">{error}</p>}
      {modal === 'employee' && <>
        {!editing && <div className="mb-4"><Field label="Foto del empleado"><input form="hr-employee-form" name="photo" type="file" accept="image/png,image/jpeg" disabled={busy} className="text-sm max-w-full" /></Field></div>}
        {editing && <div className="flex items-center gap-4 mb-5"><Portrait employee={editing} size={64} /><Field label="Foto del empleado"><input type="file" aria-label="Foto del empleado" accept="image/png,image/jpeg" disabled={busy} className="text-xs max-w-full" onChange={async (e) => { const file = e.target.files?.[0]; if (file) { const updated = await upload(file, 'photo', editing.id); if (updated) setEditing(updated.employees.find((x) => x.id === editing.id) || editing); } }} /></Field></div>}
        <ValidatedForm id="hr-employee-form" onSubmit={submitEmployee} className="space-y-4"><fieldset disabled={busy} className="grid grid-cols-1 gap-4"><Field label="Nombre completo *"><input name="name" required maxLength={200} defaultValue={editing?.name} className={inputCls} /></Field><Field label="Puesto *"><input name="role" required maxLength={200} defaultValue={editing?.role} className={inputCls} /></Field><Field label="Departamento"><select name="department" defaultValue={editing?.department || 'Comercial'} className={inputCls}>{['Comercial', 'Operaciones', 'Administración', 'Cocina', 'Dirección'].map((d) => <option key={d}>{d}</option>)}</select></Field><Field label="Fecha de alta *"><input name="startDate" type="date" required defaultValue={editing?.startDate || today()} className={inputCls} /></Field><div className="col-span-1"><Field label="Correo corporativo *"><input type="email" name="email" required defaultValue={editing?.email} className={inputCls} /></Field></div></fieldset><div className="flex justify-end gap-2 pt-4"><button type="button" className={btnGhost} onClick={closeModal}>Cancelar</button><button disabled={busy} className={btnPrimary}>{busy ? 'Guardando...' : 'Guardar ficha'}</button></div></ValidatedForm>
      </>}
      {modal === 'candidate' && <ValidatedForm onSubmit={submitCandidate} className="space-y-4"><fieldset disabled={busy} className="grid grid-cols-1 gap-4"><Field label="Nombre completo *"><input name="name" required className={inputCls} /></Field><Field label="Email de contacto *"><input type="email" name="email" required className={inputCls} /></Field><Field label="Puesto solicitado *"><input name="role" required className={inputCls} /></Field><Field label="Departamento"><select name="department" className={inputCls}>{['Comercial', 'Operaciones', 'Administración', 'Cocina', 'Dirección'].map((d) => <option key={d}>{d}</option>)}</select></Field><div className="col-span-1"><Field label="Currículum PDF *"><input name="cv" type="file" required accept="application/pdf" className="text-sm max-w-full" /></Field></div></fieldset><div className="flex justify-end gap-2 pt-4"><button type="button" className={btnGhost} onClick={closeModal}>Cancelar</button><button disabled={busy} className={btnPrimary}>{busy ? 'Guardando...' : 'Crear candidatura'}</button></div></ValidatedForm>}
      {modal === 'vacation' && <ValidatedForm onSubmit={submitVacation} className="space-y-4"><p className="text-sm font-medium">{employee.name}</p><fieldset disabled={busy} className="grid sm:grid-cols-2 gap-4"><Field label="Desde *"><input name="start" type="date" required className={inputCls} /></Field><Field label="Hasta *"><input name="end" type="date" required className={inputCls} /></Field><div className="col-span-1"><Field label="Motivo"><textarea name="reason" rows={3} maxLength={1000} className={inputCls} /></Field></div></fieldset><div className="flex justify-end gap-2 pt-4"><button type="button" className={btnGhost} onClick={closeModal}>Cancelar</button><button disabled={busy} className={btnPrimary}>{busy ? 'Enviando…' : 'Enviar solicitud'}</button></div></ValidatedForm>}
      {modal === 'sign' && signing && <ValidatedForm className="space-y-4" onSubmit={async (e) => { e.preventDefault(); const form = new FormData(e.currentTarget); if (await request({ type: 'sign', id: signing.id, signer: form.get('signer'), accepted: form.has('accepted') }, 'Conformidad registrada. Copia firmada disponible.')) setModal(null); }}><p className="text-sm font-medium break-words">{signing.name}</p><a href={fileUrl(signing.id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"><EyeIcon className="w-4 h-4" /> Revisar PDF original</a><Field label="Nombre completo de quien firma *"><input name="signer" required maxLength={200} className={inputCls} autoComplete="off" /></Field><label className="flex gap-3 text-sm items-start"><input type="checkbox" name="accepted" required className="mt-1 accent-blue-600" />Confirmo que he revisado el documento y doy mi conformidad. *</label><p className="text-xs text-neutral-500">Firma de simulación, sin certificado digital.</p><div className="flex justify-end gap-2 pt-4"><button type="button" className={btnGhost} onClick={closeModal}>Cancelar</button><button disabled={busy} className={btnPrimary}><PencilSquareIcon className="w-4 h-4" /> {busy ? 'Firmando…' : 'Firmar documento'}</button></div></ValidatedForm>}
    </Dialog>}
  </div></CrmShell>;
}
