'use client';

import { useEffect, useState } from 'react';

export default function Hero() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <section id="inicio" className="relative min-h-[100dvh] bg-[#d9cbb7] text-ink overflow-hidden">
      <div className="absolute inset-0 flex flex-col md:flex-row">
        <div className="relative w-full md:w-[56%] min-h-[62dvh] md:min-h-0 bg-[#d9cbb7]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#e4d9c8] via-[#d9cbb7] to-[#cdbb9f]" />
        </div>

        <div className="relative w-full md:w-[44%] min-h-[38dvh] md:min-h-0 overflow-hidden">
          <img
            src="/hero-photo.jpg"
            alt="Mesa preparada para un evento de La Mesa Perfecta"
            className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-[1.4s] ease-out ${
              ready ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          />
          <div className="absolute inset-0 bg-black/5" />
        </div>
      </div>

      <div className="relative z-10 min-h-[100dvh] flex items-center px-6 md:px-10 pt-24 pb-12">
        <div className="max-w-[1200px] mx-auto w-full">
          <div className="w-full md:w-[56%] pr-0 md:pr-10">
            <p
              className={`text-xs uppercase tracking-[0.28em] text-[#a77b35] mb-5 transition-all duration-700 delay-200 ${
                ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Gestoría de eventos y catering · Zaragoza
            </p>

            <h1
              className={`font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.02] max-w-[17ch] transition-all duration-700 delay-300 ${
                ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              Cada evento cuenta una historia.{' '}
              <span className="italic text-[#b48743]">Nosotros ponemos la mesa.</span>
            </h1>

            <p
              className={`mt-6 max-w-[43ch] text-[#3f342c] text-base md:text-lg leading-relaxed transition-all duration-700 delay-500 ${
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
                className="inline-block px-7 py-3.5 bg-[#241b16] text-white text-sm tracking-wide hover:bg-[#b48743] transition-colors"
              >
                Pide tu presupuesto
              </a>
              <a href="#servicios" className="text-sm text-[#3f342c] hover:text-[#241b16] underline underline-offset-4">
                Ver servicios
              </a>
            </div>
          </div>
        </div>

        <a
          href="#propuesta"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.25em] text-[#5b4c3d]/70 animate-bounce-slow"
        >
          Descubre
        </a>
      </div>
    </section>
  );
}
