import Link from 'next/link';
import ContactForm from '@/components/ContactForm';

export default function HomePage() {
  return (
    <main className="bg-paper text-ink">
      {/* Header */}
      <header className="max-w-[1200px] mx-auto px-6 md:px-10 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/logo-icon.png" alt="" className="h-9 w-auto" />
          <span className="font-serif italic text-lg md:text-xl whitespace-nowrap">La Mesa Perfecta</span>
        </div>
        <nav className="flex items-center gap-4 md:gap-7">
          <a href="#servicios" className="hidden md:inline text-sm text-ink-soft hover:text-ink">Servicios</a>
          <a href="#propuesta" className="hidden md:inline text-sm text-ink-soft hover:text-ink">Nuestra propuesta</a>
          <a href="#contacto" className="hidden md:inline text-sm text-ink-soft hover:text-ink">Contacto</a>
          <Link
            href="/crm"
            className="text-xs uppercase tracking-wide border border-ink px-3 py-1.5 md:px-3.5 md:py-2 hover:bg-ink hover:text-paper transition-colors"
          >
            CRM
          </Link>
        </nav>
      </header>

      {/* Hero: imagen de marca a sangre completa */}
      <img
        src="/hero-collage.jpg"
        alt="La Mesa Perfecta — gestoría de eventos y catering"
        className="w-full h-auto block"
      />

      {/* Franja de titular editorial */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-10 items-end">
          <h1 className="font-serif text-4xl md:text-6xl leading-[1.05]">
            Cada evento cuenta una historia.{' '}
            <span className="italic text-gold">Nosotros ponemos la mesa.</span>
          </h1>
          <div>
            <p className="text-ink-soft text-base mb-6">
              Catering y organización integral de eventos en Zaragoza: bodas, celebraciones
              privadas y encuentros de empresa, pensados al detalle desde el primer contacto
              hasta el último brindis.
            </p>
            <a
              href="#contacto"
              className="inline-block px-6 py-3.5 bg-ink text-paper text-sm tracking-wide hover:bg-gold hover:text-ink transition-colors"
            >
              Pide tu presupuesto
            </a>
          </div>
        </div>
      </section>

      {/* Cita / filosofía editorial */}
      <section className="border-t border-b border-[var(--line)]">
        <div className="max-w-[820px] mx-auto px-6 md:px-10 py-16 md:py-20 text-center">
          <span className="block text-xs uppercase tracking-[0.2em] text-gold mb-6">
            Nuestra filosofía
          </span>
          <p className="font-serif text-2xl md:text-[2rem] leading-snug text-ink">
            No servimos platos, servimos momentos. Cada menú se diseña para que la mesa
            desaparezca y solo queden la conversación, la sobremesa y el recuerdo.
          </p>
        </div>
      </section>

      {/* Bloque asimétrico: foto a sangre + texto */}
      <section id="propuesta" className="grid grid-cols-1 md:grid-cols-[1fr_1fr] items-stretch">
        <img
          src="/hero-photo.jpg"
          alt="Mesa preparada para un evento de La Mesa Perfecta"
          className="w-full h-full min-h-[360px] md:min-h-[520px] object-cover"
        />
        <div className="flex items-center px-6 md:px-14 py-14 md:py-0 bg-paper-2">
          <div>
            <span className="block text-xs uppercase tracking-[0.2em] text-gold mb-5">
              Cómo trabajamos
            </span>
            <h2 className="font-serif text-3xl md:text-4xl mb-5 leading-tight">
              Del primer boceto a la última copa
            </h2>
            <p className="text-ink-soft mb-4">
              Escuchamos primero: estilo, invitados, presupuesto y restricciones. Después
              diseñamos un menú y una puesta en escena a medida, y coordinamos cada proveedor
              para que el día del evento tú solo tengas que disfrutarlo.
            </p>
            <p className="text-ink-soft">
              Respondemos a cada solicitud en menos de 48 horas con una propuesta inicial
              orientativa.
            </p>
          </div>
        </div>
      </section>

      {/* Servicios como una carta editorial */}
      <section id="servicios" className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 md:py-20">
        <span className="block text-xs uppercase tracking-[0.2em] text-gold mb-3">
          Lo que preparamos
        </span>
        <h2 className="font-serif text-3xl md:text-4xl mb-12">Nuestra propuesta</h2>

        <div className="divide-y divide-[var(--line)] border-t border-[var(--line)]">
          {[
            {
              n: '01',
              title: 'Bodas y celebraciones',
              text: 'Menús a medida, cata previa y coordinación completa del día, para que solo tengas que disfrutarlo.',
            },
            {
              n: '02',
              title: 'Eventos corporativos',
              text: 'Comidas de empresa, coffee breaks y presentaciones, con la puntualidad y discreción que necesita tu equipo.',
            },
            {
              n: '03',
              title: 'Producción de eventos',
              text: 'Decoración, mobiliario y proveedores coordinados desde un único punto de contacto.',
            },
          ].map((s) => (
            <div key={s.n} className="grid grid-cols-1 md:grid-cols-[80px_1fr_1.4fr] gap-3 md:gap-8 py-8">
              <span className="font-serif text-2xl text-gold">{s.n}</span>
              <h3 className="font-serif text-2xl">{s.title}</h3>
              <p className="text-ink-soft">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="border-t border-[var(--line)] bg-paper-2">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 md:py-20 grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-14">
          <div>
            <span className="block text-xs uppercase tracking-[0.2em] text-gold mb-4">
              Contacto
            </span>
            <h2 className="font-serif text-3xl md:text-4xl mb-5 max-w-[12ch]">
              Cuéntanos tu evento
            </h2>
            <p className="text-ink-soft mb-8 max-w-[36ch]">
              Rellena el formulario y te contactamos en menos de 48 horas con una propuesta
              inicial.
            </p>
            <div className="text-sm text-ink-soft">
              <strong className="block text-ink font-semibold mb-1">
                La Mesa Perfecta — Gestoría de eventos y catering
              </strong>
              Zaragoza · hola@lamesaperfecta.es · 976 000 000
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-[1200px] mx-auto px-6 md:px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <img src="/logo-full.png" alt="La Mesa Perfecta" className="h-24 w-auto" />
        <div className="text-center md:text-right text-ink-soft text-sm">
          <div>© 2026 La Mesa Perfecta — Gestoría de eventos y catering S.L.</div>
          <div>Proyecto de práctica de curso.</div>
        </div>
      </footer>
    </main>
  );
}
