const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const base = 'http://127.0.0.1:3115';
const env = { ...process.env, NEXT_DIST_DIR: '.next-wcag53-check', HR_STORAGE: 'local', HR_DATA_DIR: path.resolve('tmp', `wcag-${Date.now()}`, 'rrhh-api-test'), HR_TEST_URL: base };
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3115', '-H', '127.0.0.1'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
let output = '';
server.stdout.on('data', c => { output += c; });
server.stderr.on('data', c => { output += c; });
(async () => {
  try {
    for (let i = 0; i < 60; i++) {
      if (server.exitCode !== null) throw new Error(output);
      try { if ((await fetch(`${base}/crm/login`)).ok) break; } catch {}
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    const home = await fetch(base);
    assert.equal(home.status, 200);
    const html = await home.text();
    assert.ok(html.includes('Saltar al contenido principal'));
    assert.ok(html.includes('id="contenido"'));
    assert.ok(html.includes('lang="es"'));
    require('@next/env').loadEnvConfig(process.cwd());
    const login = await fetch(`${base}/api/crm/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usuario: process.env.CRM_ADMIN_USER || 'admin', contrasena: process.env.CRM_ADMIN_PASSWORD || '1234' }) });
    assert.equal(login.status, 200);
    const cookie = login.headers.get('set-cookie').split(';')[0];
    const routes = ['/crm', '/crm/empresas', '/crm/contactos', '/crm/oportunidades', '/crm/cierres', '/crm/tareas', '/crm/rrhh', '/crm/facturas', '/crm/empleados', '/crm/empresas/wcag-test', '/crm/contactos/wcag-test', '/crm/empleados/wcag-test'];
    for (const route of routes) {
      const response = await fetch(base + route, { headers: { Cookie: cookie }, redirect: 'manual' });
      assert.equal(response.status, 200, route);
      const page = await response.text();
      assert.ok(page.includes('id="crm-contenido"'), route);
    }
    console.log('Web, acceso y 12 rutas del CRM: HTTP 200 y destino de salto correcto.');
    const tests = spawn(process.execPath, ['--test', ...fs.readdirSync('tests').filter(f => f.endsWith('.test.cjs')).map(f => `tests/${f}`)], { env, stdio: 'inherit' });
    const code = await new Promise(resolve => tests.once('exit', resolve));
    if (code !== 0) throw new Error(`Tests returned ${code}`);
  } catch (error) { console.error(error.message); console.error(output.slice(-2500)); process.exitCode = 1; }
  finally { server.kill(); }
})();
