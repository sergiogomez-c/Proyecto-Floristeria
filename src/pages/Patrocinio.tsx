import { useRef, useState } from 'react'
import PropuestaModal from './PropuestaModal'

const areas = [
  { number: '01', title: 'Proyectos con raíces', description: 'Iniciativas de jardinería, educación ambiental o cultivo urbano que hacen sitio a lo verde.' },
  { number: '02', title: 'Talento que florece', description: 'Artistas, creadores y colectivos que usan las flores como lenguaje para contar algo nuevo.' },
  { number: '03', title: 'Comunidad en acción', description: 'Encuentros, talleres y propuestas locales que unen a personas alrededor de la naturaleza.' },
]

export default function Patrocinio({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [proposalOpen, setProposalOpen] = useState(false)
  const proposalTrigger = useRef<HTMLButtonElement>(null)

  function closeProposal() {
    setProposalOpen(false)
    proposalTrigger.current?.focus()
  }

  return (
    <main className="bg-sponsor text-foreground">
      <section className="relative min-h-[680px] overflow-hidden border-b border-accent/20 px-6 py-12 md:px-12 lg:px-20 lg:py-16">
        <div className="absolute inset-0 lg:left-[48%]">
          <img
            src="https://images.unsplash.com/photo-1487528742387-d53d4f12488d?w=1300&h=1600&fit=crop&auto=format"
            alt="Flores en un entorno botánico de luz tenue"
            className="h-full w-full object-cover opacity-30 lg:opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-sponsor via-sponsor/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-sponsor via-transparent to-transparent" />
        </div>
        <div className="relative z-10 flex min-h-[580px] flex-col items-start justify-between">
          <button onClick={() => onNavigate('nosotros')} className="font-mono text-xs uppercase tracking-widest text-accent transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">← Volver a sobre nosotros</button>
          <div className="max-w-4xl pb-10">
            <p className="mb-8 font-mono text-xs uppercase tracking-[0.3em] text-accent">DeepInTheFlower / Colaboraciones</p>
            <h1 className="font-display text-[clamp(4rem,10vw,9rem)] leading-[0.9] tracking-tight">Crecer es mejor <span className="italic font-light text-accent">juntos.</span></h1>
            <p className="mt-9 max-w-xl text-lg leading-relaxed text-foreground/75">Nuestro programa de patrocinio nace para impulsar ideas que compartan nuestra forma de mirar el mundo: con curiosidad, sensibilidad y ganas de dejar una huella viva.</p>
          </div>
          <span className="border-t border-accent/30 pt-5 font-mono text-xs uppercase tracking-widest text-accent">Patrocinio con propósito · Barcelona</span>
        </div>
      </section>

      <section className="grid gap-12 border-b border-accent/20 px-6 py-24 md:px-12 lg:grid-cols-[1fr_1.5fr] lg:gap-24 lg:px-20 lg:py-32">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">01 / Nuestra manera de apoyar</p>
        <div>
          <h2 className="font-display text-[clamp(3rem,6vw,6rem)] leading-[1.05]">Una alianza que va <span className="italic text-accent">más allá del logo.</span></h2>
          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-foreground/65">No creemos en patrocinios de escaparate. Nos interesan las colaboraciones que aportan algo real a ambos lados: conversaciones, experiencias y nuevas posibilidades para la comunidad.</p>
          <div className="mt-12 grid gap-6 border-t border-accent/20 pt-8 sm:grid-cols-2">
            <div><span className="font-mono text-xs uppercase tracking-widest text-accent">Lo que podemos aportar</span><p className="mt-4 leading-relaxed text-foreground/70">Producto floral, asesoramiento botánico, difusión en nuestros espacios o creación conjunta de experiencias, según cada proyecto.</p></div>
            <div><span className="font-mono text-xs uppercase tracking-widest text-accent">Lo que buscamos</span><p className="mt-4 leading-relaxed text-foreground/70">Ideas originales, compromiso con las personas y una conexión honesta con la naturaleza. No hace falta ser un proyecto grande.</p></div>
          </div>
        </div>
      </section>

      <section className="border-b border-accent/20 px-6 py-24 md:px-12 lg:px-20 lg:py-32">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div><p className="mb-6 font-mono text-xs uppercase tracking-[0.25em] text-accent">02 / Dónde ponemos la energía</p><h2 className="font-display text-5xl md:text-7xl">Ideas que <span className="italic">nos inspiran.</span></h2></div>
          <p className="max-w-xs text-sm leading-relaxed text-foreground/60">Estas son algunas direcciones posibles. Si tu idea no cabe en una etiqueta, también queremos conocerla.</p>
        </div>
        <div className="grid border-l border-t border-accent/20 md:grid-cols-3">
          {areas.map(area => (
            <article key={area.number} className="flex min-h-[330px] flex-col justify-between border-b border-r border-accent/20 p-7 lg:p-10">
              <span className="font-mono text-xs text-accent">{area.number} / 03</span>
              <div><h3 className="font-display text-3xl italic md:text-4xl">{area.title}</h3><p className="mt-5 leading-relaxed text-foreground/60">{area.description}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-12 border-b border-accent/20 px-6 py-24 md:px-12 lg:grid-cols-2 lg:gap-24 lg:px-20 lg:py-32">
        <div><p className="mb-6 font-mono text-xs uppercase tracking-[0.25em] text-accent">03 / Cómo funciona</p><h2 className="font-display text-5xl leading-tight md:text-7xl">De la primera idea a <span className="italic text-accent">hacerla florecer.</span></h2></div>
        <div className="border-t border-accent/20">
          {[
            ['01', 'Cuéntanos tu proyecto', 'Quién eres, qué estás creando, para quién y cuándo te gustaría ponerlo en marcha.'],
            ['02', 'Encontramos el encaje', 'Revisamos cada propuesta y, si compartimos visión, hablamos de la colaboración más útil.'],
            ['03', 'Lo hacemos realidad', 'Acordamos juntos el apoyo, los tiempos y cómo dar visibilidad al proyecto.'],
          ].map(([number, title, description]) => (
            <div key={number} className="grid gap-4 border-b border-accent/20 py-7 sm:grid-cols-[3rem_1fr] sm:gap-6"><span className="font-mono text-xs text-accent">{number}</span><div><h3 className="font-display text-2xl">{title}</h3><p className="mt-3 max-w-md leading-relaxed text-foreground/60">{description}</p></div></div>
          ))}
        </div>
      </section>

      <section className="bg-sponsor-surface px-6 py-24 md:px-12 lg:px-20 lg:py-32">
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.25em] text-accent">04 / Tu propuesta</p>
        <div className="flex flex-wrap items-end justify-between gap-12">
          <div className="max-w-4xl"><h2 className="font-display text-[clamp(3.5rem,8vw,8rem)] leading-[0.95]">¿Y si empezamos <span className="italic text-accent">por un hola?</span></h2><p className="mt-8 max-w-xl text-lg leading-relaxed text-foreground/65">Envíanos una breve presentación con tu idea, ubicación, fechas y el tipo de apoyo que imaginas. Estudiaremos la propuesta contigo, sin fórmulas cerradas.</p></div>
          <button ref={proposalTrigger} type="button" onClick={() => setProposalOpen(true)} className="inline-block border border-accent bg-accent px-8 py-4 font-mono text-xs uppercase tracking-widest text-ink transition-colors hover:bg-transparent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Enviar propuesta ↗</button>
        </div>
        <p className="mt-12 border-t border-accent/20 pt-5 font-mono text-xs text-foreground/50">Cada colaboración se valora de forma individual; el envío de una propuesta no implica su aceptación.</p>
      </section>
      {proposalOpen && <PropuestaModal onClose={closeProposal} />}
    </main>
  )
}
