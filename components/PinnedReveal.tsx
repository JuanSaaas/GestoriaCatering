'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Envuelve dos secciones: `base` (lo que hay antes) y `incoming` (lo que
 * sube por encima, p.ej. Servicios). Mientras se hace scroll a través de
 * este bloque, `base` se queda fijo en pantalla (position: sticky) y
 * `incoming` se desliza desde abajo hasta cubrirlo del todo; solo entonces
 * el scroll de la página continúa con normalidad hacia lo que sigue.
 *
 * Funciona añadiendo una altura extra (`scrollSpan`) al contenedor: ese
 * espacio de scroll es el que se "consume" en avanzar la animación en vez
 * de mover la página, dando la sensación de que "se queda quieta".
 */
export default function PinnedReveal({
  base,
  incoming,
  scrollSpan = 100,
  id,
}: {
  base: React.ReactNode;
  incoming: React.ReactNode;
  /** Alto adicional (en vh) que dura la transición. Más alto = más lenta. */
  scrollSpan?: number;
  /** id opcional para anclar desde el menú (#servicios, etc). */
  id?: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0); // 0 → aún no empieza, 1 → tapado del todo
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    let raf = 0;

    const update = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      // Cuánto hemos avanzado dentro del bloque: 0 al entrar por arriba,
      // 1 cuando el bloque ha subido lo suficiente para liberar el sticky.
      const raw = total > 0 ? (-rect.top) / total : 0;
      setProgress(Math.min(1, Math.max(0, raw)));
      raf = requestAnimationFrame(update);
    };

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  if (reduceMotion) {
    // Sin animación: las dos secciones se muestran una tras otra, normal.
    return (
      <div id={id}>
        {base}
        {incoming}
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      id={id}
      style={{ height: `calc(${scrollSpan}vh + 100vh)` }}
      className="relative"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Capa de abajo: lo que ya había, se queda quieta detrás */}
        <div className="absolute inset-0">{base}</div>
        {/* Capa de arriba: Servicios, sube desde fuera de la pantalla hasta cubrirlo */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{ transform: `translateY(${(1 - progress) * 100}%)` }}
        >
          {incoming}
        </div>
      </div>
    </div>
  );
}
