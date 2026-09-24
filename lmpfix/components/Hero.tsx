'use client';

import { useEffect, useState } from 'react';

export default function Hero() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <section id="inicio" className="relative min-h-[100dvh] bg-[#1a1512] text-paper overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src="/hero-collage.jpg"
          alt="La Mesa Perfecta — gestoría de eventos y catering"
          className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-[1.4s] ease-out ${
            ready ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/80" />
        <div className="absolute inset-y-0 left-0 w-full md:w-[68%] bg-gradient-to-r from-black/75 via-black/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/65 to-transparent" />
      </div>

      <div className="relative z-10 min-h-[100dvh] flex flex-col justify-end px-6 md:px-10 pb-16 md:pb-20 pt-28">
        <div className="max-w-[1200px] mx-auto w-full">
          <p
            className={`text-xs uppercase tracking-[0.28em] text-gold-light mb-5 transition-all duration-700 delay-200 ${
              ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Gestoría de eventos y catering · Zaragoza
          </p>
          <h1
            className={`font-serif text-4xl sm:text-5xl md:text-7xl leading-[1.05] max-w-[18ch] transition-all duration-700 delay-300 ${
              ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Cada evento cuenta una historia.{' '}
            <span className="italic text-gold-light">Nosotros ponemos la mesa.</span>
          </h1>
          <p
            className={`mt-6 max-w-[42ch] text-paper text-base md:text-lg transition-all duration-700 delay-500 ${
              ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Bodas, celebraciones privadas y encuentros de empresa, pensados al detalle
            desde el primer contacto hasta el último brindis.
          </p>
          <div
            className={`mt-8 flex flex-wrap items-center gap-4 transition-all duration-700 delay-700 ${
              ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <a
              href="#contacto"
              className="inline-block px-7 py-3.5 bg-paper text-ink text-sm tracking-wide hover:bg-gold hover:text-ink transition-colors"
            >
              Pide tu presupuesto
            </a>
            <a href="#servicios" className="text-sm text-paper/80 hover:text-paper underline underline-offset-4">
              Ver servicios
            </a>
          </div>
        </div>

        <a
          href="#propuesta"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.25em] text-paper/60 animate-bounce-slow"
        >
          Descubre
        </a>
      </div>
    </section>
  );
}
