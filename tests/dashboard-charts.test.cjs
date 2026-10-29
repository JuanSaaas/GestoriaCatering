const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
function load(file, dependencies = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  new Function('exports', 'require', code)(exports, name => dependencies[name] || require(name));
  return exports;
}
const types = load('lib/types.ts');
const { summarizeEventTypes } = load('lib/dashboardCharts.ts', { './types': types });

test('gráficos: cada oportunidad abierta aparece una vez, incluidas categorías antiguas', () => {
  const result = summarizeEventTypes([
    { tipo_evento: 'boda', estado: 'nuevo', presupuesto_estimado: 1000 },
    { tipo_evento: 'boda', estado: 'negociacion', presupuesto_estimado: null },
    { tipo_evento: 'otro', tipo_evento_otro: 'Bautizo', estado: 'contactado', presupuesto_estimado: 500 },
    { tipo_evento: 'presentacion_producto', estado: 'presupuesto_enviado', presupuesto_estimado: 200 },
    { tipo_evento: 'boda', estado: 'ganado', presupuesto_estimado: 9000 },
    { tipo_evento: 'corporativo', estado: 'perdido', presupuesto_estimado: 6000 },
  ]);
  assert.equal(result.reduce((sum, item) => sum + item.n, 0), 4);
  assert.equal(result.find(item => item.key === 'boda').n, 2);
  assert.equal(result.find(item => item.key === 'boda').estimatedAmount, 1000);
  assert.deepEqual(result.find(item => item.key === 'otro').descriptions, ['Bautizo', 'presentacion producto']);
  assert.equal(result.find(item => item.key === 'otro').estimatedAmount, 700);
  assert.equal(result.find(item => item.key === 'corporativo').n, 0);
});

test('gráficos: vacío y presupuestos ausentes no inventan cantidades ni importes', () => {
  assert.ok(summarizeEventTypes([]).every(item => item.n === 0 && item.estimatedAmount === null));
  const result = summarizeEventTypes([
    { tipo_evento: null, estado: 'nuevo', presupuesto_estimado: null },
    { tipo_evento: 'otro', tipo_evento_otro: 'Bautizo', estado: 'nuevo', presupuesto_estimado: null },
    { tipo_evento: 'otro', tipo_evento_otro: 'Bautizo', estado: 'nuevo', presupuesto_estimado: 0 },
  ]).find(item => item.key === 'otro');
  assert.equal(result.n, 3);
  assert.deepEqual(result.descriptions, ['Bautizo']);
  assert.equal(result.estimatedAmount, 0);
});
