import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const user = String(body?.user || '');
  const password = String(body?.password || '');
  const expectedUser = process.env.CRM_ADMIN_USER || 'admin';
  const expectedPassword = process.env.CRM_ADMIN_PASSWORD || '1234';

  if (user !== expectedUser || password !== expectedPassword) {
    return NextResponse.json({ ok: false, message: 'Usuario o contraseña incorrectos.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('lmp_crm_session', process.env.CRM_SESSION_TOKEN || 'lmp-crm-session-v1', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 10,
  });
  return response;
}
