import ContactForm from '@/components/ContactForm';
import Hero from '@/components/Hero';
import Reveal from '@/components/Reveal';
import ServicesCarousel from '@/components/ServicesCarousel';
import SiteHeader from '@/components/SiteHeader';

export default function HomePage() {
  return (
    <main className="bg-paper text-ink">
      <SiteHeader />
      <Hero />

      <section className="border-b border-[var(--line)]">
        <Reveal className="max-w-[820px] mx-auto px-6 md:px-10 py-12 md:py-16 text-center">
          <span className="block text-xs uppercase tracking-[0.2em] text-gold mb-6">Nuestra filosofía</span>
          <p className="font-serif text-2xl md:text-[2rem] leading-snug text-ink">
            No servimos platos, servimos momentos. Cada menú se diseña para que la mesa
            desaparezca y solo queden la conversación, la sobremesa y el recuerdo.
          </p>
        </Reveal>
      </section>

      <section id="propuesta" className="grid grid-cols-1 md:grid-cols-[42%_58%] items-start bg-paper-2">
        <div className="bg-[#1a1512] h-[320px] md:h-full">
          <img
            src="/salon-eventos.png"
            alt="Mesa preparada para un evento de La Mesa Perfecta"
            className="w-full h-full object-cover object-[50%_30%]"
          />
        </div>
        <div className="flex items-center px-6 md:px-14 py-10 md:py-14 bg-paper-2">
          <Reveal className="max-w-[560px]">
            <span className="block text-xs uppercase tracking-[0.2em] text-gold mb-5">Nuestra propuesta</span>
            <h2 className="font-serif text-3xl md:text-4xl mb-5 leading-tight">Del primer boceto a la última copa</h2>
            <p className="text-ink-soft mb-4 leading-relaxed">
              Empezamos escuchando. Antes de hablar de menús, nos sentamos contigo para entender
              el carácter del evento: quién se sienta a la mesa, qué historia quieres contar, el
              presupuesto real y las restricciones —alimentarias, de horario o de espacio— que hay
              que respetar. Esa conversación es el briefing con el que trabajamos todo el equipo.
            </p>
            <p className="text-ink-soft mb-4 leading-relaxed">
              A partir de ahí diseñamos una propuesta a medida: menú, maridaje, puesta en escena y
              ritmo del servicio. Coordinamos cocina, sala y proveedores externos (flor, música,
              mobiliario, espacio) desde un único punto de contacto, con un calendario claro de
              catas, pruebas y confirmaciones. El día del evento tú no gestionas nada: llegas, te
              sientas y disfrutas.
            </p>
            <p className="text-ink-soft mb-4 leading-relaxed">
              Trabajamos en Zaragoza y alrededores, tanto en fincas y palacios como en oficinas,
              jardines o en casa. Cada servicio se escala al número de invitados y al tono que
              buscas: íntimo, corporativo o de gran celebración, con la misma exigencia de detalle.
            </p>
            <p className="text-ink-soft leading-relaxed">
              Respondemos a cada solicitud en menos de 48 horas con una propuesta inicial
              orientativa —menú, tiempos y presupuesto— para que puedas decidir con calma. Si
              encajamos, afinamos juntos hasta el último detalle.
            </p>
          </Reveal>
        </div>
      </section>

      <ServicesCarousel />

      <section id="contacto" className="border-t border-[var(--line)] bg-paper-2">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-12 md:py-16 grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-10 md:gap-12">
          <Reveal>
            <span className="block text-xs uppercase tracking-[0.2em] text-gold mb-4">Contacto</span>
            <h2 className="font-serif text-3xl md:text-4xl mb-5 max-w-[12ch]">Cuéntanos tu evento</h2>
            <p className="text-ink-soft mb-8 max-w-[36ch]">
              Rellena el formulario y te contactamos en menos de 48 horas con una propuesta inicial.
            </p>
            <div className="text-sm text-ink-soft">
              <strong className="block text-ink font-semibold mb-1">
                La Mesa Perfecta — Gestoría de eventos y catering
              </strong>
              Zaragoza · hola@lamesaperfecta.es · 976 000 000
            </div>
          </Reveal>
          <Reveal delay={120}>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      <footer className="max-w-[1200px] mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-5">
        <img src="/logo-full.png" alt="La Mesa Perfecta" className="h-20 md:h-24 w-auto max-w-[260px] object-contain" />
        <div className="text-center md:text-right text-ink-soft text-sm">
          <div>© 2026 La Mesa Perfecta — Gestoría de eventos y catering S.L.</div>
          <div>Proyecto de práctica de curso.</div>
        </div>
      </footer>
    </main>
  );
}
