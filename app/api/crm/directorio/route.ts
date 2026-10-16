import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { OPORTUNIDAD_SELECT } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (request.cookies.get('lmp_crm_session')?.value !== (process.env.CRM_SESSION_TOKEN || 'lmp-crm-session-v1')) {
    return NextResponse.json({ error: 'Inicia sesión para acceder al CRM.' }, { status: 401 });
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const [e, c, o] = await Promise.all([
      supabase.from('empresas').select('*').order('nombre').abortSignal(controller.signal),
      supabase.from('clientes').select('*').order('created_at', { ascending: false }).abortSignal(controller.signal),
      supabase.from('oportunidades').select(OPORTUNIDAD_SELECT).order('created_at', { ascending: false }).abortSignal(controller.signal),
    ]);
    for (const [name, result] of [['empresas', e], ['contactos', c], ['oportunidades', o]] as const) {
      if (result.error) throw new Error(`No se pudieron cargar ${name}: ${result.error.message}`);
    }
    return NextResponse.json({ empresas: e.data, contactos: c.data, oportunidades: o.data }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo conectar con la base de datos.' }, { status: 502 });
  } finally { clearTimeout(timer); }
}
