import { NextRequest, NextResponse } from 'next/server';

// Credenciales y token de sesión en variables de entorno; con valores por
// defecto para que el proyecto funcione "de fábrica" en desarrollo, pero
// CRM_README.md pide cambiarlos antes de publicar en producción.
const ADMIN_USER = process.env.CRM_ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.CRM_ADMIN_PASSWORD || '1234';
const SESSION_TOKEN = process.env.CRM_SESSION_TOKEN || 'lmp-crm-session-v1';

export async function POST(request: NextRequest) {
  let usuario = '';
  let contrasena = '';

  try {
    const body = await request.json();
    usuario = String(body.usuario ?? '').trim();
    contrasena = String(body.contrasena ?? '');
  } catch {
    return NextResponse.json({ error: 'Solicitud no válida.' }, { status: 400 });
  }

  if (usuario !== ADMIN_USER || contrasena !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Usuario o contraseña incorrectos.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  // httpOnly: el token de sesión nunca es visible ni accesible desde el
  // JavaScript del navegador, solo viaja en la cabecera Cookie de cada
  // petición y lo valida middleware.ts en el servidor.
  response.cookies.set('lmp_crm_session', SESSION_TOKEN, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12, // 12 horas
  });
  return response;
}
