import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  if (request.cookies.get('lmp_crm_session')?.value !== (process.env.CRM_SESSION_TOKEN || 'lmp-crm-session-v1')) return NextResponse.json({ error: 'Inicia sesión para guardar.' }, { status: 401 });
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Guarda desde el CRM.' }, { status: 403 });
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return NextResponse.json({ error: 'No se pudo conectar con Ventas.' }, { status: 503 });
  let input;
  try { const raw = await request.text(); if (raw.length > 5000) throw new Error(); input = JSON.parse(raw); } catch { return NextResponse.json({ error: 'No se pudieron leer los datos.' }, { status: 400 }); }
  const uuid = /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
  if (!input || !['cliente','actividad','comercial'].includes(input.tipo) || !uuid.test(input.id || '')) return NextResponse.json({ error: 'Selecciona una operación válida.' }, { status: 400 });
  const title = typeof input.nombre === 'string' ? input.nombre.trim() : '';
  const email = typeof input.email === 'string' ? input.email.trim() : '';
  if (!title || title.length > 200 || email.length > 254 || (email && !/^[^\s@]+@[^\s@]+[.][^\s@]+$/.test(email))) return NextResponse.json({ error: 'Revisa el nombre y el correo electrónico.' }, { status: 400 });
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    let table: string; let data: Record<string, unknown> = { id: input.id };
    if (input.tipo === 'actividad') {
      if (!uuid.test(input.oportunidad_id || '')) return NextResponse.json({ error: 'Selecciona una oportunidad.' }, { status: 400 });
      const date = input.fecha_limite || null;
      if (date && (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(new Date(date).getTime()) || new Date(date).toISOString().slice(0,10) !== date)) return NextResponse.json({ error: 'Introduce una fecha válida.' }, { status: 400 });
      const opportunity = await db.from('oportunidades').select('id,comercial_id').eq('id',input.oportunidad_id).abortSignal(controller.signal).maybeSingle();
      if (opportunity.error || !opportunity.data) return NextResponse.json({ error: 'La oportunidad ya no está disponible.' }, { status: 409 });
      table = 'tareas'; data = { ...data, titulo: title, oportunidad_id: opportunity.data.id, usuario_id: opportunity.data.comercial_id, fecha_limite: date, completada: false };
    } else if (input.tipo === 'cliente') {
      if ((input.telefono && (typeof input.telefono !== 'string' || input.telefono.length > 40)) || (input.empresa && (typeof input.empresa !== 'string' || input.empresa.length > 200))) return NextResponse.json({ error: 'Revisa el teléfono y la empresa.' }, { status: 400 });
      table = 'clientes'; data = { ...data, nombre: title, email: email || null, telefono: input.telefono?.trim() || null, empresa: input.empresa?.trim() || null, tipo_cliente: input.empresa?.trim() ? 'empresa' : 'particular' };
    } else { table = 'usuarios'; data = { ...data, nombre: title, email: email || null, rol: 'comercial' }; }
    const result = await db.from(table).insert(data).select('id').abortSignal(controller.signal).single();
    if (result.error?.code === '23505') return NextResponse.json({ error: 'Este registro ya existe o ya se guardó. Actualiza la lista antes de repetir.' }, { status: 409 });
    if (result.error || result.data?.id !== input.id) throw new Error();
    return NextResponse.json({ ok: true, id: result.data.id }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: 'No se pudo confirmar el guardado. Conserva los datos y actualiza antes de reintentar.' }, { status: 503 }); }
  finally { clearTimeout(timer); }
}
