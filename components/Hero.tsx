export default function Hero() {
  return (
    <section id="inicio" className="relative min-h-[100dvh] bg-[#d9cbb7] text-ink overflow-hidden">
      <div className="relative z-10 min-h-[100dvh] flex items-center px-6 md:px-10 pt-36 sm:pt-24 pb-12">
        <div className="max-w-[1200px] mx-auto w-full">
          <div className="w-full md:w-[56%] pr-0 md:pr-10">
            <p
              className="text-xs uppercase tracking-[0.28em] text-[#715021] mb-5"
            >
              Gestoría de eventos y catering · Zaragoza
            </p>

            <h1
              className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.02] max-w-[17ch]"
            >
              Cada evento cuenta una historia.{' '}
              <span className="italic text-[#715021]">Nosotros ponemos la mesa.</span>
            </h1>

            <p
              className="mt-6 max-w-[43ch] text-[#3f342c] text-base md:text-lg leading-relaxed"
            >
              Bodas, celebraciones privadas y encuentros de empresa, pensados al detalle
              desde el primer contacto hasta el último brindis.
            </p>

            <div
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <a
                href="#contacto"
                className="inline-block px-7 py-3.5 bg-[#241b16] text-white text-sm tracking-wide hover:bg-[#715021] transition-colors"
              >
                Pide tu presupuesto
              </a>
              <a href="#servicios" className="text-sm text-[#3f342c] hover:text-[#241b16] underline underline-offset-4">
                Ver servicios
              </a>
            </div>
            <a href="#propuesta" className="inline-flex items-center min-h-12 mt-6 text-sm uppercase tracking-[0.15em] text-[#5b4c3d]">Descubre nuestra propuesta</a>
          </div>
        </div>

      </div>
      <div className="relative h-[38dvh] md:h-auto md:absolute md:inset-y-0 md:right-0 md:w-[44%] overflow-hidden">
        <img src="/hero-photo.jpg" alt="Mesa preparada para un evento de La Mesa Perfecta" className="absolute inset-0 h-full w-full object-cover object-center" />
      </div>
    </section>
  );
}
