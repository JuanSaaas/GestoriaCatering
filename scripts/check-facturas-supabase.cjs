// Read-only connection check. Never prints keys or invoice contents.
const { loadEnvConfig } = require('@next/env');
const { createClient } = require('@supabase/supabase-js');
loadEnvConfig(process.cwd());

async function main() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '').trim();
  if (!url || !key) {
    console.error('Falta la URL o la clave privada de Supabase. Configura SUPABASE_SECRET_KEY o SUPABASE_SERVICE_ROLE_KEY en .env.local.');
    process.exitCode = 2;
    return;
  }
  if (new URL(url).protocol !== 'https:') throw new Error();
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const tables = ['facturas', 'factura_documentos', 'factura_intentos', 'factura_agente'];
    const results = await Promise.all(tables.map(async table => {
      const result = await db.from(table).select('id', { count: 'exact', head: true }).abortSignal(controller.signal);
      return { table, result };
    }));
    for (const { table, result } of results) {
      if (result.error) {
        console.error(`${table}: conexión no disponible (HTTP ${result.status || 0}, código ${result.error.code || 'sin código'}).`);
        process.exitCode = 1;
      } else console.log(`${table}: conexión correcta; ${result.count} registros.`);
    }
  } finally { clearTimeout(timer); }
}
main().catch(() => {
  console.error('No se pudo verificar la conexión. Revisa la configuración y la conexión a Internet.');
  process.exitCode = 1;
});
