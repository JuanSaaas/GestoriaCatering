'use client';

import { useEffect, useRef, useState } from 'react';

const LINKS = [
  { href: '#propuesta', label: 'Nuestra propuesta' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#contacto', label: 'Contacto' },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header onKeyDown={(event) => { if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); menuButton.current?.focus(); } }}
      className={`fixed top-0 inset-x-0 z-50 bg-paper border-b border-[var(--line)] shadow-md transition-all duration-300 ${
        scrolled ? 'py-0' : ''
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-4 flex justify-between items-center">
        <a href="#inicio" className="flex items-center gap-3">
          <img src="/logo-icon.png" alt="" className="h-9 w-auto" />
          <span className="font-serif italic text-lg md:text-xl whitespace-nowrap">La Mesa Perfecta</span>
        </a>
        <button ref={menuButton} type="button" className="sm:hidden rounded-lg border border-ink/20 px-3 text-sm" aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen(!menuOpen)}>Menú</button>
        <nav id="site-navigation" aria-label="Navegación principal" className={`${menuOpen ? 'flex' : 'hidden'} absolute top-full inset-x-0 bg-paper border-b border-ink/20 px-6 py-4 flex-col sm:static sm:flex sm:flex-row sm:bg-transparent sm:border-0 sm:p-0 items-center gap-4 md:gap-8`}>
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
            className="inline-flex min-h-12 items-center text-sm text-ink-soft hover:text-ink transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
