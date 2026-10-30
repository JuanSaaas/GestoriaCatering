import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  if (request.cookies.get('lmp_crm_session')?.value !== (process.env.CRM_SESSION_TOKEN || 'lmp-crm-session-v1')) return NextResponse.json({ error: 'Inicia sesión para consultar el equipo.' }, { status: 401 });
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return NextResponse.json({ error: 'No se pudo conectar con el equipo comercial.' }, { status: 503 });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const [users, opportunities] = await Promise.all([
      db.from('usuarios').select('id,nombre,email,rol').order('nombre').abortSignal(controller.signal),
      db.from('oportunidades').select('id,comercial_id,presupuesto_estimado,estado').abortSignal(controller.signal),
    ]);
    if (users.error || opportunities.error) throw new Error();
    return NextResponse.json({ miembros: users.data, oportunidades: opportunities.data }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: 'No se pudo cargar el equipo. Vuelve a intentarlo.' }, { status: 503 }); }
  finally { clearTimeout(timer); }
}
