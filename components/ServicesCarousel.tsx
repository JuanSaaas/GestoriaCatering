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
  const [playing, setPlaying] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setReduceMotion(preference.matches); if (preference.matches) setPlaying(false); };
    update(); preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!playing || interacting || reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SERVICIOS.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, [index, playing, interacting, reduceMotion]);

  const go = (dir: number) => { setPlaying(false); setIndex((i) => (i + dir + SERVICIOS.length) % SERVICIOS.length); };
  const actual = SERVICIOS[index];

  return (
    <section aria-label="Servicios de catering" aria-roledescription="carrusel" className="relative flex flex-col bg-ink"
      onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setPlaying(false)}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 pt-8 md:pt-10 pb-4 shrink-0">
        <span className="block text-xs uppercase tracking-[0.2em] text-gold-light mb-2">Lo que preparamos</span>
        <h2 className="font-serif text-2xl md:text-3xl text-paper">Servicios</h2>
        {!reduceMotion && <button type="button" aria-pressed={playing} onClick={() => setPlaying(!playing)} className="mt-4 border border-paper rounded-lg px-4 text-paper">{playing ? 'Pausar presentación' : 'Iniciar presentación automática'}</button>}
      </div>

      <div className="relative overflow-hidden">
        {SERVICIOS.map((s, i) => (
          <div
            key={s.n}
            className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden={i !== index}
          >
            <img
              src={s.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/65" />
          </div>
        ))}

        <div aria-live={playing ? 'off' : 'polite'} aria-atomic="true" className="relative z-10 flex items-center py-12 pb-24 min-h-[28rem]">
          <div className="max-w-[1200px] mx-auto w-full px-6 md:px-10">
            <span className="font-serif text-gold-light text-2xl md:text-3xl">{actual.n}</span>
            <h3 className="font-serif text-2xl md:text-4xl text-paper mt-2 mb-3 md:mb-4 max-w-[16ch]">{actual.title}</h3>
            <p className="text-paper max-w-[46ch] text-base leading-relaxed">{actual.text}</p>
            <p className="text-paper mt-4">Servicio {index + 1} de {SERVICIOS.length}</p>
          </div>
        </div>

        <div className="absolute bottom-4 right-6 md:right-10 z-10 flex items-center gap-3">
          <button
            type="button"
            aria-label="Servicio anterior"
            onClick={() => go(-1)}
            className="w-9 h-9 md:w-11 md:h-11 border border-white/40 text-white hover:bg-white hover:text-ink transition-colors"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Servicio siguiente"
            onClick={() => go(1)}
            className="w-9 h-9 md:w-11 md:h-11 border border-white/40 text-white hover:bg-white hover:text-ink transition-colors"
          >
            →
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-3 md:py-4 flex gap-2 overflow-x-auto shrink-0 w-full">
        {SERVICIOS.map((s, i) => (
          <button
            key={s.n}
            type="button"
            onClick={() => { setPlaying(false); setIndex(i); }}
            aria-pressed={i === index}
            className={`shrink-0 text-left text-xs px-2.5 py-1.5 md:px-3 md:py-2 border transition-colors ${
              i === index ? 'border-paper bg-paper text-ink' : 'border-white/25 text-paper/70 hover:border-white/60'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>
    </section>
  );
}
