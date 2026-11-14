const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const { NextRequest } = require('next/server');
const { PDFDocument } = require('pdf-lib');
function compile(file, dependencies = {}) {
  const output = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  new Function('exports', 'require', 'process', code)(output, name => dependencies[name] || require(name), { env: {} });
  return output;
}
const hr = compile('lib/hr.ts');
const errors = compile('lib/hrErrors.ts');
const headers = { cookie: 'lmp_crm_session=lmp-crm-session-v1' };
const request = (url) => new NextRequest(`http://localhost${url}`, { headers });

test('informe individual: todas las secciones excluyen datos de otros empleados y no modifican el estado', async () => {
  const source = hr.initialHrState();
  const employee = source.employees[0];
  const other = source.employees[1];
  source.attendance = [employee, other].map(e => ({ employeeId: e.id, in: '2026-11-13T09:00:00Z', out: '2026-11-13T17:00:00Z' }));
  source.vacations = [employee, other].map(e => ({ employeeId: e.id, start: '2026-12-01', end: '2026-12-02', status: 'pendiente', reason: 'Vacaciones de prueba' }));
  source.evaluations = [employee, other].map(e => ({ employeeId: e.id, quarter: '2026-T4', score: 4, comment: 'Buen trabajo' }));
  source.files = [employee, other].map(e => ({ employeeId: e.id, kind: 'payroll', name: 'Nómina de prueba.pdf' }));
  source.candidates = [employee, other].map(e => ({ employeeId: e.id, name: e.name, role: e.role, stage: 'contratado' }));
  // Acceder a cualquier dato descriptivo ajeno provoca un fallo en la generación.
  const guard = (item, key) => Object.defineProperty(item, key, { get() { throw new Error('Se ha incluido información ajena'); } });
  for (const e of source.employees.slice(1)) guard(e, 'name');
  guard(source.candidates[1], 'name'); guard(source.attendance[1], 'in');
  guard(source.vacations[1], 'reason'); guard(source.evaluations[1], 'comment'); guard(source.files[1], 'name');
  const route = compile('app/api/crm/rrhh/informe/route.ts', { '@/lib/hr': hr, '@/lib/hrErrors': errors, '@/lib/hrStore': { getHr: async () => source } });
  const response = await route.GET(request(`/api/crm/rrhh/informe?empleado=${employee.id}`));
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-disposition'), /informe-marta-lopez.pdf/);
  const bytes = new Uint8Array(await response.arrayBuffer());
  assert.ok((await PDFDocument.load(bytes)).getPageCount() >= 1);
  assert.equal(source.employees.length, 3); assert.equal(source.files.length, 2);
  if (process.env.REPORT_QA_DIR) { fs.mkdirSync(process.env.REPORT_QA_DIR, { recursive: true }); fs.writeFileSync(`${process.env.REPORT_QA_DIR}/informe-individual.pdf`, bytes); }
  for (const id of ['no-existe', '']) assert.equal((await route.GET(request(`/api/crm/rrhh/informe?empleado=${id}`))).status, 404);
});

test('informe general: sigue disponible; la ruta exige sesión', async () => {
  const route = compile('app/api/crm/rrhh/informe/route.ts', { '@/lib/hr': hr, '@/lib/hrErrors': errors, '@/lib/hrStore': { getHr: async () => hr.initialHrState() } });
  assert.equal((await route.GET(new NextRequest('http://localhost/api/crm/rrhh/informe'))).status, 401);
  const response = await route.GET(request('/api/crm/rrhh/informe'));
  assert.equal(response.status, 200); assert.match(response.headers.get('content-disposition'), /informe-rrhh.pdf/);
});

test('nómina: el servidor usa el titular aunque se envíe otro nombre y exige conformidad', async () => {
  const source = hr.initialHrState();
  const employee = source.employees[0];
  source.files.push({ id: 'nomina', employeeId: employee.id, name: 'Nómina de prueba.pdf', kind: 'payroll' });
  const original = await PDFDocument.create(); original.addPage(); const bytes = await original.save();
  let signedBytes;
  const route = compile('app/api/crm/rrhh/route.ts', { '@/lib/hr': hr, '@/lib/hrErrors': errors, '@/lib/hrStore': {
    updateHr: async change => { await change(source); return source; },
    readHrFile: async () => bytes, writeHrFile: async (_id, content) => { signedBytes = content; },
  } });
  const sign = accepted => route.POST(new NextRequest('http://localhost/api/crm/rrhh', { method: 'POST', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify({ type: 'sign', id: 'nomina', signer: 'Otra persona', accepted }) }));
  assert.equal((await sign(false)).status, 400); assert.equal(signedBytes, undefined);
  const response = await sign(true); assert.equal(response.status, 200);
  assert.equal((await response.json()).files[0].signer, employee.name);
  assert.equal((await PDFDocument.load(signedBytes)).getPageCount(), 2);
  if (process.env.REPORT_QA_DIR) fs.writeFileSync(`${process.env.REPORT_QA_DIR}/nomina-firmada.pdf`, signedBytes);
  assert.equal((await sign(true)).status, 400);
});
