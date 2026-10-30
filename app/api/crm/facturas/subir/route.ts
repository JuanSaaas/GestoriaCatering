import { NextRequest, NextResponse } from 'next/server';
import { InvoiceUploadError, MAX_INVOICE_BYTES, saveInvoiceUpload } from '@/lib/invoiceUploads';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (request.cookies.get('lmp_crm_session')?.value !== (process.env.CRM_SESSION_TOKEN || 'lmp-crm-session-v1')) return NextResponse.json({ error: 'Inicia sesión para subir facturas.' }, { status: 401 });
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Sube la factura desde el CRM.' }, { status: 403 });
  if (!request.headers.get('content-type')?.startsWith('multipart/form-data;')) return NextResponse.json({ error: 'Selecciona un archivo para subir.' }, { status: 400 });
  const limit = MAX_INVOICE_BYTES + 128 * 1024;
  if (Number(request.headers.get('content-length')) > limit) return NextResponse.json({ error: 'La factura supera los 20 MB.' }, { status: 413 });
  try {
    if (!request.body) throw new InvoiceUploadError('Selecciona una factura para subir.');
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const next = await reader.read();
        if (next.done) break;
        size += next.value.length;
        if (size > limit) { await reader.cancel(); throw new InvoiceUploadError('La factura supera los 20 MB.', 413); }
        chunks.push(next.value);
      }
    } finally { reader.releaseLock(); }
    let form: FormData;
    try { form = await new Response(Buffer.concat(chunks), { headers: { 'Content-Type': request.headers.get('content-type')! } }).formData(); }
    catch { throw new InvoiceUploadError('No se pudo leer el archivo. Vuelve a seleccionarlo.'); }
    const files = form.getAll('archivo');
    if (files.length !== 1 || typeof files[0] === 'string') throw new InvoiceUploadError('Selecciona una factura por envío.');
    const file = files[0];
    const saved = await saveInvoiceUpload(file.name, Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ ok: true, ...saved }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof InvoiceUploadError ? error.message : 'No se pudo guardar la factura. Inténtalo de nuevo.' }, { status: error instanceof InvoiceUploadError ? error.status : 503 });
  }
}
