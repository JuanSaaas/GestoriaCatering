export type Employee = {
  id: string; name: string; role: string; department: string; email: string;
  startDate: string; photoId?: string;
  checklist: { id: string; title: string; done: boolean }[];
};
export type CandidateStage = 'nuevo' | 'entrevista' | 'oferta' | 'contratado' | 'descartado';
export const CANDIDATE_STAGES: Record<CandidateStage, string> = {
  nuevo: 'Recibido', entrevista: 'Entrevista', oferta: 'Oferta', contratado: 'Contratado', descartado: 'Descartado',
};
export type Candidate = { id: string; name: string; email: string; role: string; department: string; stage: CandidateStage; cvId?: string; employeeId?: string };
export type HrFile = { id: string; name: string; mime: string; employeeId?: string; kind: 'photo' | 'cv' | 'payroll'; createdAt: string; signedAt?: string; signer?: string; signedId?: string };
export type HrState = {
  employees: Employee[]; candidates: Candidate[]; files: HrFile[];
  attendance: { id: string; employeeId: string; in: string; out?: string }[];
  vacations: { id: string; employeeId: string; start: string; end: string; reason: string; status: 'pendiente' | 'aprobada' | 'rechazada' }[];
  evaluations: { id: string; employeeId: string; quarter: string; score: number; comment: string; createdAt: string }[];
};

export function latestAttendanceByEmployee(attendance: HrState['attendance']) {
  const latest = new Map<string, HrState['attendance'][number]>();
  for (const record of attendance) {
    const previous = latest.get(record.employeeId);
    if (!previous || new Date(record.in).getTime() > new Date(previous.in).getTime()) latest.set(record.employeeId, record);
  }
  return latest;
}

// Calendar boundaries use Madrid time; elapsed time uses real milliseconds (including DST).
function madridMidnight(calendar: Date) {
  const target = calendar.getTime();
  let instant = target;
  const formatter = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  for (let i = 0; i < 3; i++) {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(instant)).map((p) => [p.type, p.value]));
    const local = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
    instant += target - local;
  }
  return instant;
}

export function workedTime(attendance: HrState['attendance'], now = new Date()) {
  const calendar = new Date(`${now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })}T00:00:00Z`);
  const monday = new Date(calendar);
  monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
  const nextMonday = new Date(monday); nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);
  const month = new Date(Date.UTC(calendar.getUTCFullYear(), calendar.getUTCMonth(), 1));
  const nextMonth = new Date(Date.UTC(calendar.getUTCFullYear(), calendar.getUTCMonth() + 1, 1));
  function total(start: Date, end: Date) {
    const from = madridMidnight(start); const to = Math.min(madridMidnight(end), now.getTime());
    return attendance.reduce((sum, record) => {
      const inTime = new Date(record.in).getTime();
      const outTime = record.out ? new Date(record.out).getTime() : now.getTime();
      if (!Number.isFinite(inTime) || !Number.isFinite(outTime)) return sum;
      return sum + Math.max(0, Math.min(outTime, to) - Math.max(inTime, from));
    }, 0);
  }
  const sunday = new Date(nextMonday); sunday.setUTCDate(sunday.getUTCDate() - 1);
  return { weekMs: total(monday, nextMonday), monthMs: total(month, nextMonth), weekStart: monday.toISOString().slice(0, 10), weekEnd: sunday.toISOString().slice(0, 10), month: month.toISOString().slice(0, 7) };
}

export function validateSigner(signer: unknown, accepted: unknown) {
  const name = text(signer, 'Nombre de quien firma');
  if (accepted !== true) throw new Error('Confirma la conformidad con el documento.');
  return name;
}

export function onboarding(): Employee['checklist'] {
  return ['Entregar portátil', 'Crear correo corporativo', 'Configurar accesos al CRM', 'Presentar al equipo', 'Revisar documentación de incorporación']
    .map((title) => ({ id: crypto.randomUUID(), title, done: false }));
}

export function initialHrState(): HrState {
  return {
    employees: [
      { id: 'demo-marta', name: 'Marta López', role: 'Responsable comercial', department: 'Comercial', email: 'marta.lopez@lamesaperfecta.es', startDate: '2026-09-01', checklist: onboarding() },
      { id: 'demo-daniel', name: 'Daniel Ruiz', role: 'Coordinador de eventos', department: 'Operaciones', email: 'daniel.ruiz@lamesaperfecta.es', startDate: '2026-09-15', checklist: onboarding() },
      { id: 'demo-lucia', name: 'Lucía Martín', role: 'Administrativa', department: 'Administración', email: 'lucia.martin@lamesaperfecta.es', startDate: '2026-10-01', checklist: onboarding() },
    ],
    candidates: [], files: [], attendance: [], vacations: [], evaluations: [],
  };
}

function text(value: unknown, label: string, max = 200) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new Error(`${label}: introduce un valor válido.`);
  return value.trim();
}
function date(value: unknown) {
  const result = text(value, 'Fecha', 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result) || new Date(result).toISOString().slice(0, 10) !== result) throw new Error('Fecha no válida.');
  return result;
}
function email(value: unknown) {
  const result = text(value, 'Email');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw new Error('Email no válido.');
  return result;
}
export function applyHrAction(state: HrState, action: Record<string, unknown>, now = new Date()) {
  const employee = () => {
    const found = state.employees.find((e) => e.id === action.employeeId);
    if (!found) throw new Error('Empleado no encontrado.');
    return found;
  };
  const id = () => crypto.randomUUID();
  switch (action.type) {
    case 'employee': {
      const values = { name: text(action.name, 'Nombre'), role: text(action.role, 'Puesto'), department: text(action.department, 'Departamento'), email: email(action.email), startDate: date(action.startDate) };
      if (state.employees.some((e) => e.email.toLowerCase() === values.email.toLowerCase() && e.id !== action.employeeId)) throw new Error('Ya hay un empleado con ese correo.');
      if (action.employeeId) Object.assign(employee(), values);
      else state.employees.push({ id: id(), ...values, checklist: onboarding() });
      break;
    }
    case 'clock': {
      const e = employee();
      const open = state.attendance.find((a) => a.employeeId === e.id && !a.out);
      if (action.direction === 'in') {
        if (open) throw new Error('Ya hay una entrada abierta.');
        state.attendance.unshift({ id: id(), employeeId: e.id, in: now.toISOString() });
      } else if (action.direction === 'out') {
        if (!open) throw new Error('Debes fichar la entrada primero.');
        open.out = now.toISOString();
      } else throw new Error('Fichaje no válido.');
      break;
    }
    case 'vacation': {
      const e = employee(); const start = date(action.start); const end = date(action.end);
      if (end < start) throw new Error('La fecha final debe ser posterior o igual al inicio.');
      if (state.vacations.some((v) => v.employeeId === e.id && v.status !== 'rechazada' && start <= v.end && end >= v.start)) throw new Error('Ya hay una solicitud para esas fechas.');
      state.vacations.unshift({ id: id(), employeeId: e.id, start, end, reason: typeof action.reason === 'string' ? action.reason.trim().slice(0, 1000) : '', status: 'pendiente' });
      break;
    }
    case 'vacation_status': {
      const v = state.vacations.find((v) => v.id === action.id);
      if (!v || !['aprobada', 'rechazada'].includes(String(action.status))) throw new Error('Solicitud no válida.');
      v.status = action.status as 'aprobada' | 'rechazada'; break;
    }
    case 'check': {
      const item = employee().checklist.find((c) => c.id === action.id);
      if (!item || typeof action.done !== 'boolean') throw new Error('Tarea no válida.');
      item.done = action.done; break;
    }
    case 'candidate':
      state.candidates.unshift({ id: id(), name: text(action.name, 'Nombre'), email: email(action.email), role: text(action.role, 'Puesto'), department: text(action.department, 'Departamento'), stage: 'nuevo' });
      break;
    case 'candidate_stage': {
      const c = state.candidates.find((c) => c.id === action.id);
      const stage = action.stage as CandidateStage;
      if (!c || !Object.prototype.hasOwnProperty.call(CANDIDATE_STAGES, stage)) throw new Error('Candidatura no válida.');
      if (c.stage === 'contratado') throw new Error('Esta candidatura ya está contratada.');
      if (stage === 'contratado') {
        if (!c.cvId) throw new Error('Sube el CV antes de contratar.');
        const base = c.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
        const e = { id: id(), name: c.name, role: c.role, department: c.department, email: `${base}@lamesaperfecta.es`, startDate: now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' }), checklist: onboarding() };
        let suffix = 2;
        while (state.employees.some((x) => x.email === e.email)) e.email = `${base}.${suffix++}@lamesaperfecta.es`;
        state.employees.push(e); c.employeeId = e.id;
      }
      c.stage = stage; break;
    }
    case 'evaluation': {
      const e = employee(); const score = Number(action.score); const quarter = text(action.quarter, 'Trimestre', 7);
      if (!Number.isInteger(score) || score < 1 || score > 5 || !/^\d{4}-T[1-4]$/.test(quarter)) throw new Error('Nota o trimestre no válido.');
      if (state.evaluations.some((r) => r.employeeId === e.id && r.quarter === quarter)) throw new Error('Ya existe una evaluación para ese trimestre.');
      state.evaluations.unshift({ id: id(), employeeId: e.id, quarter, score, comment: text(action.comment, 'Comentario', 3000), createdAt: now.toISOString() });
      break;
    }
    default: throw new Error('Acción no válida.');
  }
}
