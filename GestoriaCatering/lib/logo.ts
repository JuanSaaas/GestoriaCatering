import type { Empresa } from './types';

function slugifyNombre(nombre: string) {
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

export function domainFromUrlOrEmail(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.includes('@')) {
    const host = trimmed.split('@')[1]?.toLowerCase();
    return host || null;
  }
  try {
    const url = trimmed.startsWith('http') ? new URL(trimmed) : new URL(`https://${trimmed}`);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/** Favicon / logo estimado a partir del nombre, web o email de la empresa. */
export function companyLogoSrc(
  nombre: string,
  extras?: { sitio_web?: string | null; email?: string | null; logo_url?: string | null }
) {
  if (extras?.logo_url) return extras.logo_url;
  const domain =
    domainFromUrlOrEmail(extras?.sitio_web) ||
    domainFromUrlOrEmail(extras?.email) ||
    (slugifyNombre(nombre) ? `${slugifyNombre(nombre)}.com` : null);
  if (domain) {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre || '?')}&background=111111&color=ffffff&size=128&bold=true`;
}

export function logoFromEmpresa(empresa: Pick<Empresa, 'nombre' | 'sitio_web' | 'email' | 'logo_url'> | null | undefined) {
  if (!empresa) return null;
  return companyLogoSrc(empresa.nombre, empresa);
}
