const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const output = {};
const source = ts.transpileModule(fs.readFileSync('lib/hr.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
new Function('exports', source)(output);
const { initialHrState, applyHrAction } = output;

test('horas: semana lunes-domingo, mes y turnos que cruzan limites', () => {
  const shifts = [
    { in: '2026-10-04T21:00:00Z', out: '2026-10-05T02:00:00Z' },
    { in: '2026-10-06T07:00:00Z', out: '2026-10-06T15:00:00Z' },
    { in: '2026-09-30T21:00:00Z', out: '2026-10-01T02:00:00Z' },
    { in: '2026-10-08T07:00:00Z' },
  ];
  const result = output.workedTime(shifts, new Date('2026-10-08T09:00:00Z'));
  assert.equal(result.weekStart, '2026-10-05');
  assert.equal(result.weekEnd, '2026-10-11');
  assert.equal(result.weekMs / 3600000, 14);
  assert.equal(result.monthMs / 3600000, 19);
  assert.equal(output.workedTime([], new Date('2026-10-08T09:00:00Z')).weekMs, 0);
});

test('horas: cambio de hora y domingo pertenecen a la misma semana', () => {
  const shift = [{ in: '2026-10-24T23:00:00Z', out: '2026-10-25T04:00:00Z' }];
  const sunday = output.workedTime(shift, new Date('2026-10-25T12:00:00Z'));
  assert.equal(sunday.weekMs / 3600000, 5);
  assert.equal(sunday.weekStart, '2026-10-19');
  assert.equal(output.workedTime(shift, new Date('2026-10-26T12:00:00Z')).weekMs, 0);
});

test('firma: admite otro firmante pero exige nombre y conformidad', () => {
  assert.equal(output.validateSigner('  Responsable RRHH  ', true), 'Responsable RRHH');
  for (const name of ['', '   ', null, 'x'.repeat(201)]) assert.throws(() => output.validateSigner(name, true));
  for (const consent of [false, undefined, 'true']) assert.throws(() => output.validateSigner('Responsable RRHH', consent));
});

test('horarios generales: una ultima jornada por empleado, independientemente del orden', () => {
  const latest = output.latestAttendanceByEmployee([
    { id: 'a', employeeId: 'marta', in: '2026-10-07T07:00:00Z', out: '2026-10-07T15:00:00Z' },
    { id: 'b', employeeId: 'daniel', in: '2026-10-06T07:00:00Z', out: '2026-10-06T15:00:00Z' },
    { id: 'c', employeeId: 'marta', in: '2026-10-08T07:00:00Z' },
    { id: 'd', employeeId: 'marta', in: '2026-10-05T07:00:00Z' },
  ]);
  assert.equal(latest.size, 2);
  assert.equal(latest.get('marta').id, 'c');
  assert.equal(latest.get('daniel').id, 'b');
  assert.equal(output.latestAttendanceByEmployee([]).size, 0);
});

test('fichaje: impide entradas duplicadas y salidas sin entrada', () => {
  const state = initialHrState(); const employeeId = state.employees[0].id;
  assert.throws(() => applyHrAction(state, { type: 'clock', employeeId, direction: 'out' }));
  applyHrAction(state, { type: 'clock', employeeId, direction: 'in' }, new Date('2026-10-08T07:00:00Z'));
  assert.throws(() => applyHrAction(state, { type: 'clock', employeeId, direction: 'in' }));
  applyHrAction(state, { type: 'clock', employeeId, direction: 'out' }, new Date('2026-10-08T15:00:00Z'));
  assert.equal(state.attendance[0].out, '2026-10-08T15:00:00.000Z');
});
test('vacaciones: valida fechas, evita solapamientos y registra aprobacion', () => {
  const state = initialHrState(); const employeeId = state.employees[0].id;
  assert.throws(() => applyHrAction(state, { type: 'vacation', employeeId, start: '2026-11-09', end: '2026-11-01' }));
  applyHrAction(state, { type: 'vacation', employeeId, start: '2026-11-02', end: '2026-11-06' });
  assert.throws(() => applyHrAction(state, { type: 'vacation', employeeId, start: '2026-11-04', end: '2026-11-09' }));
  applyHrAction(state, { type: 'vacation_status', id: state.vacations[0].id, status: 'aprobada' });
  assert.equal(state.vacations[0].status, 'aprobada');
});
test('contratacion: exige CV, crea correo unico y checklist una sola vez', () => {
  const state = initialHrState();
  applyHrAction(state, { type: 'candidate', name: 'Marta López', email: 'candidata@example.com', role: 'Comercial', department: 'Comercial' });
  const candidate = state.candidates[0];
  assert.throws(() => applyHrAction(state, { type: 'candidate_stage', id: candidate.id, stage: 'contratado' }));
  candidate.cvId = 'cv-test';
  applyHrAction(state, { type: 'candidate_stage', id: candidate.id, stage: 'contratado' });
  const employee = state.employees.find((e) => e.id === candidate.employeeId);
  assert.equal(employee.email, 'marta.lopez.2@lamesaperfecta.es');
  assert.equal(employee.checklist.length, 5);
  assert.ok(employee.checklist.every((c) => !c.done));
  assert.throws(() => applyHrAction(state, { type: 'candidate_stage', id: candidate.id, stage: 'contratado' }));
  assert.equal(state.employees.length, 4);
});
test('evaluaciones: notas de 1 a 5, comentario obligatorio y trimestre unico', () => {
  const state = initialHrState(); const action = { type: 'evaluation', employeeId: state.employees[0].id, quarter: '2026-T4', comment: 'Buen trabajo', score: 4 };
  assert.throws(() => applyHrAction(state, { ...action, score: 6 }));
  assert.throws(() => applyHrAction(state, { ...action, comment: ' ' }));
  applyHrAction(state, action);
  assert.throws(() => applyHrAction(state, action));
  assert.equal(state.evaluations[0].score, 4);
});
test('incorporacion: check persistente y rechazo de tareas ajenas', () => {
  const state = initialHrState(); const employee = state.employees[0];
  applyHrAction(state, { type: 'check', employeeId: employee.id, id: employee.checklist[0].id, done: true });
  assert.equal(employee.checklist[0].done, true);
  assert.throws(() => applyHrAction(state, { type: 'check', employeeId: employee.id, id: state.employees[1].checklist[0].id, done: true }));
});
