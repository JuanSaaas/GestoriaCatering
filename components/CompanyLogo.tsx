'use client';

import { companyLogoSrc } from '@/lib/logo';

export default function CompanyLogo({
  nombre,
  sitio_web,
  email,
  logo_url,
  size = 32,
  className = '',
}: {
  nombre: string;
  sitio_web?: string | null;
  email?: string | null;
  logo_url?: string | null;
  size?: number;
  className?: string;
}) {
  const src = companyLogoSrc(nombre, { sitio_web, email, logo_url });
  return (
    <img
      src={src}
      alt={`Logo de ${nombre}`}
      width={size}
      height={size}
      className={`rounded-md object-contain bg-white border border-line shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
