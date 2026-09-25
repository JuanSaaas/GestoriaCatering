'use client';

import { useEffect, useState } from 'react';

const SERVICIOS = [
  {
    n: '01',
    title: 'Bodas y celebraciones',
    text: 'Diseñamos el día entero: cata previa, menú a medida, servicio de sala y coordinación con floristas, música y espacio. Tú te ocupas de los invitados; nosotros, de que cada plato y cada brindis lleguen en el momento justo.',
    image:
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=80',
  },
  {
    n: '02',
    title: 'Eventos corporativos',
    text: 'Comidas de empresa, presentaciones y convenciones con puntualidad de reloj. Coffee breaks, cócteles y menús ejecutivos pensados para que tu equipo y tus clientes se sientan atendidos sin que la agenda se resienta.',
    image:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80',
  },
  {
    n: '03',
    title: 'Producción de eventos',
    text: 'Un único interlocutor para decoración, mobiliario, iluminación y proveedores. Montamos la escenografía, coordinamos horarios y desmontamos al terminar: producción integral para que el evento se vea y se viva como lo imaginaste.',
    image:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80',
  },
  {
    n: '04',
    title: 'Comuniones y bautizos',
    text: 'Celebraciones familiares con menús para todos los paladares —incluido el de los más pequeños— y un servicio cercano, sin estridencias. Mesas cuidadosas, ritmos pausados y un ambiente que invita a quedarse un rato más.',
    image:
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1600&q=80',
  },
  {
    n: '05',
    title: 'Cumpleaños y aniversarios',
    text: 'Desde una mesa íntima hasta una fiesta grande: menú, tarta, brindis y el detalle que convierte una fecha en un recuerdo. Adaptamos cocina y servicio al carácter de quien se celebra.',
    image:
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1600&q=80',
  },
  {
    n: '06',
    title: 'Catering a domicilio',
    text: 'Llevamos cocina de evento a tu casa o al espacio que elijas. Montaje, servicio y recogida incluidos, para que el anfitrión también se siente a la mesa.',
    image:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80',
  },
];

export default function ServicesCarousel() {
  const [index, setIndex] = useState(0);

  // Cambia de slide sola cada 6.5s. Cada interacción manual (flechas o
  // selector) reinicia este intervalo para no saltar justo después de elegir.
  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SERVICIOS.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, [index]);

  const go = (dir: number) => setIndex((i) => (i + dir + SERVICIOS.length) % SERVICIOS.length);
  const actual = SERVICIOS[index];

  return (
    <section id="servicios" className="relative">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 pt-12 md:pt-14 pb-6">
        <span className="block text-xs uppercase tracking-[0.2em] text-gold mb-3">Lo que preparamos</span>
        <h2 className="font-serif text-3xl md:text-4xl">Servicios</h2>
      </div>

      <div className="relative min-h-[68svh] md:min-h-[72svh] overflow-hidden bg-ink">
        {SERVICIOS.map((s, i) => (
          <div
            key={s.n}
            className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden={i !== index}
          >
            <img
              src={s.image}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover object-center ${i === index ? 'animate-kenburns' : ''}`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/25" />
          </div>
        ))}

        <div className="relative z-10 min-h-[68svh] md:min-h-[72svh] flex items-center">
          <div className="max-w-[1200px] mx-auto w-full px-6 md:px-10 py-14 md:py-0">
            <span className="font-serif text-gold-light text-3xl">{actual.n}</span>
            <h3 className="font-serif text-3xl md:text-5xl text-paper mt-3 mb-5 max-w-[16ch]">{actual.title}</h3>
            <p className="text-paper/85 max-w-[46ch] text-base md:text-lg leading-relaxed">{actual.text}</p>
          </div>
        </div>

        <div className="absolute bottom-6 right-6 md:right-10 z-10 flex items-center gap-3">
          <button
            type="button"
            aria-label="Servicio anterior"
            onClick={() => go(-1)}
            className="w-11 h-11 border border-white/40 text-white hover:bg-white hover:text-ink transition-colors"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Servicio siguiente"
            onClick={() => go(1)}
            className="w-11 h-11 border border-white/40 text-white hover:bg-white hover:text-ink transition-colors"
          >
            →
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-6 flex gap-2 overflow-x-auto">
        {SERVICIOS.map((s, i) => (
          <button
            key={s.n}
            type="button"
            onClick={() => setIndex(i)}
            className={`shrink-0 text-left text-xs md:text-sm px-3 py-2 border transition-colors ${
              i === index ? 'border-ink bg-ink text-paper' : 'border-[var(--line)] text-ink-soft hover:border-ink'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>
    </section>
  );
}
