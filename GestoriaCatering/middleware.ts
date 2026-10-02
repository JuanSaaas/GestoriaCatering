import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/crm') || pathname === '/crm/login') return NextResponse.next();

  const expected = process.env.CRM_SESSION_TOKEN || 'lmp-crm-session-v1';
  const session = request.cookies.get('lmp_crm_session')?.value;
  if (session === expected) return NextResponse.next();

  const login = new URL('/crm/login', request.url);
  login.searchParams.set('next', pathname);
  return NextResponse.redirect(login);
}

export const config = { matcher: ['/crm/:path*'] };
