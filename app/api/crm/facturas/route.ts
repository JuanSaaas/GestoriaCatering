import { NextRequest, NextResponse } from 'next/server';
import { getInvoices, InvoiceStorageError, retryInvoiceDocument } from '@/lib/invoiceStore';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authorized(request: NextRequest) {
  return request.cookies.get('lmp_crm_session')?.value === (process.env.CRM_SESSION_TOKEN || 'lmp-crm-session-v1');
}
function failure(error: unknown) {
  return NextResponse.json({ error: error instanceof InvoiceStorageError ? error.message : 'No se pudo completar la operación de Facturas. Vuelve a intentarlo.' }, { status: error instanceof InvoiceStorageError ? error.status : 503 });
}
export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Inicia sesión para consultar facturas.' }, { status: 401 });
  try { return NextResponse.json(await getInvoices(request.nextUrl), { headers: { 'Cache-Control': 'no-store' } }); }
  catch (error) { return failure(error); }
}
export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Inicia sesión para reintentar documentos.' }, { status: 401 });
  // The CRM session is a cookie: reject cross-origin mutations before using its authority.
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'La petición debe realizarse desde el CRM.' }, { status: 403 });
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json' || Number(request.headers.get('content-length')) > 2048) return NextResponse.json({ error: 'La petición no tiene un formato válido.' }, { status: 400 });
  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'No se pudo leer la petición. Actualiza la página e inténtalo de nuevo.' }, { status: 400 }); }
  if (!body || body.accion !== 'reintentar' || typeof body.documento_id !== 'string') return NextResponse.json({ error: 'Selecciona un documento para reintentar.' }, { status: 400 });
  try {
    await retryInvoiceDocument(body.documento_id);
    return NextResponse.json({ ok: true, mensaje: '✓ Documento preparado. El agente lo comprobará en su próxima pasada.' });
  } catch (error) { return failure(error); }
}
