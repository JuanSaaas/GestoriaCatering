import { NextRequest, NextResponse } from 'next/server';
import { getInvoiceOriginalUrl, InvoiceStorageError } from '@/lib/invoiceStore';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  if (request.cookies.get('lmp_crm_session')?.value !== (process.env.CRM_SESSION_TOKEN || 'lmp-crm-session-v1')) {
    return NextResponse.json({ error: 'Inicia sesión para abrir el original.' }, { status: 401 });
  }
  try {
    const response = NextResponse.redirect(await getInvoiceOriginalUrl(context.params.id),302);
    response.headers.set('Cache-Control','private, no-store');
    response.headers.set('Referrer-Policy','no-referrer');
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof InvoiceStorageError ? error.message : 'No se pudo abrir el original.' }, { status: error instanceof InvoiceStorageError ? error.status : 503 });
  }
}
