import { HrStorageError, hrErrorMessage } from '@/lib/hrErrors';
import { NextRequest, NextResponse } from 'next/server';
import { getHr, readHrFile } from '@/lib/hrStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (request.cookies.get('lmp_crm_session')?.value !== (process.env.CRM_SESSION_TOKEN || 'lmp-crm-session-v1')) return new NextResponse('No autorizado', { status: 401 });
  try {
  const state = await getHr();
  const file = state.files.find((f) => f.id === params.id || f.signedId === params.id);
  if (!file) return new NextResponse('Archivo no encontrado', { status: 404 });
    const bytes = await readHrFile(params.id);
    return new NextResponse(new Uint8Array(bytes), { headers: {
      'Content-Type': file.mime,
      'Content-Disposition': `${request.nextUrl.searchParams.has('download') ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent((file.signedId === params.id ? 'firmado-' : '') + file.name)}`,
      'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff',
    } });
  } catch (error) { return NextResponse.json({ error: hrErrorMessage(error, 'Archivo no disponible.') }, { status: error instanceof HrStorageError ? error.status : 404 }); }
}
