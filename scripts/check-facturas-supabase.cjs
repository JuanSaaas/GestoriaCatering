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
    const tables = {
      facturas: 'id,iva_importe,estado_revision,revision_version,revisado_en,datos_extraidos',
      factura_documentos: 'id,archivo_ruta', factura_intentos: 'id', factura_agente: 'id',
    };
    const results = await Promise.all(Object.entries(tables).map(async ([table, columns]) => {
      const result = await db.from(table).select(columns, { count: 'exact', head: true }).abortSignal(controller.signal);
      return { table, result };
    }));
    for (const { table, result } of results) {
      if (result.error) {
        console.error(`${table}: conexión no disponible (HTTP ${result.status || 0}, código ${result.error.code || 'sin código'}).`);
        process.exitCode = 1;
      } else console.log(`${table}: conexión correcta; ${result.count} registros.`);
    }
    // Nonexistent ID: verifies the real function and permissions without changing a record.
    const review = await db.rpc('revisar_factura', { p_factura_id: '00000000-0000-0000-0000-000000000000', p_version: 0, p_accion: 'guardar', p_datos: {} }).abortSignal(controller.signal);
    if (review.error?.code !== 'P0002') {
      console.error('Revisión de facturas: función no disponible o respuesta inesperada.');
      process.exitCode = 1;
    } else console.log('Revisión de facturas: función y permisos correctos (sin modificar registros).');
  } finally { clearTimeout(timer); }
}
main().catch(() => {
  console.error('No se pudo verificar la conexión. Revisa la configuración y la conexión a Internet.');
  process.exitCode = 1;
});
