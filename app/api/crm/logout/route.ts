import { NextResponse } from 'next/server';
export async function POST(request: Request) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('lmp_crm_session', '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}
