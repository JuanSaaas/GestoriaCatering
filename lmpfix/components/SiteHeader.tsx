'use client';

import { useEffect, useState } from 'react';

const LINKS = [
  { href: '#propuesta', label: 'Nuestra propuesta' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#contacto', label: 'Contacto' },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 bg-paper/95 backdrop-blur-md border-b border-[var(--line)] shadow-md transition-all duration-300 ${
        scrolled ? 'py-0' : ''
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-4 flex justify-between items-center">
        <a href="#inicio" className="flex items-center gap-3">
          <img src="/logo-icon.png" alt="" className="h-9 w-auto" />
          <span className="font-serif italic text-lg md:text-xl whitespace-nowrap">La Mesa Perfecta</span>
        </a>
        <nav className="flex items-center gap-5 md:gap-8">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
            className="hidden sm:inline text-sm text-ink-soft hover:text-ink transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contacto"
            className="text-xs uppercase tracking-wide border border-ink px-3 py-1.5 md:px-3.5 md:py-2 hover:bg-ink hover:text-paper transition-colors"
          >
            Presupuesto
          </a>
        </nav>
      </div>
    </header>
  );
}
