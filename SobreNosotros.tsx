const team = [
  { name: 'Cleber Heber Fabra Espigares', role: 'Ideas que echan raíces', number: '01' },
  { name: 'Sergio Gómez Cuéllar', role: 'La mirada detrás de cada detalle', number: '02' },
  { name: 'Cristian Salazar', role: 'Conexiones que hacen florecer', number: '03' },
]

export default function SobreNosotros({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <main>
      <section className="relative min-h-[750px] lg:min-h-[780px] overflow-hidden border-b border-border bg-background">
        <div className="absolute inset-0 lg:left-[43%]">
          <img
            src="https://images.unsplash.com/photo-1520179737749-b7752f6f56fb?w=1400&h=1600&fit=crop&auto=format"
            alt="Flores rojas y rosadas entre sombras"
            className="h-full w-full object-cover object-center opacity-45 lg:opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
        </div>
        <div className="relative z-10 flex min-h-[750px] lg:min-h-[780px] flex-col justify-between px-6 py-12 md:px-12 lg:px-20 lg:py-16">
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-primary">
            <span className="h-px w-8 bg-primary" /> 06 / Quiénes somos
          </div>
          <div className="max-w-5xl pb-10 lg:pb-14">
            <p className="mb-8 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">Una floristería, muchas maneras de crecer.</p>
            <h1 className="font-display text-[clamp(4rem,11vw,10rem)] font-black leading-[0.85] tracking-tight text-foreground">
              La vida<br />
              <span className="italic font-light text-primary">florece</span><br />
              en compañía.
            </h1>
            <p className="mt-9 max-w-lg text-base leading-relaxed text-foreground/80 md:text-lg">
              Somos DeepInTheFlower. Un lugar para quienes creen que una flor puede cambiar una habitación, un día o una historia entera.
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-foreground/20 pt-5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <span>Barcelona · Flores con intención</span><span className="hidden sm:inline">Desliza para conocernos ↓</span>
          </div>
        </div>
      </section>

      <section className="grid gap-12 border-b border-border px-6 py-24 md:px-12 lg:grid-cols-[1fr_1.4fr] lg:gap-24 lg:px-20 lg:py-36">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-primary">01 / Lo que nos mueve</div>
        <div>
          <h2 className="font-display text-[clamp(2.8rem,6vw,6rem)] leading-[1.05] text-foreground">
            No vendemos solo flores. <span className="italic text-muted-foreground">Cultivamos formas de sentir.</span>
          </h2>
          <div className="mt-12 grid gap-8 text-base leading-relaxed text-muted-foreground sm:grid-cols-2">
            <p>Empezamos con una idea sencilla: acercar la naturaleza a la vida cotidiana. Hoy reunimos flores, plantas, semillas y objetos que invitan a mirar más despacio.</p>
            <p>También creamos espacios con decoración floral, compartimos conocimiento botánico y abrimos conversación a una comunidad que no deja de crecer.</p>
          </div>
        </div>
      </section>

      <section className="bg-card px-6 py-24 md:px-12 lg:px-20 lg:py-32">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-primary">02 / Las personas</p>
            <h2 className="font-display text-5xl text-foreground md:text-7xl">Detrás de <span className="italic">cada brote.</span></h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">Tres nombres, distintas perspectivas y una misma obsesión por hacer las cosas con cariño.</p>
        </div>
        <div className="border-t border-border">
          {team.map(person => (
            <div key={person.number} className="grid gap-3 border-b border-border py-7 md:grid-cols-[4rem_1fr_1fr] md:items-center md:gap-8 md:py-9">
              <span className="font-mono text-xs text-primary">{person.number}</span>
              <h3 className="font-display text-2xl text-foreground md:text-4xl">{person.name}</h3>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground md:text-right">{person.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-border px-6 py-24 md:px-12 lg:px-20 lg:py-32">
        <div className="absolute -right-10 -top-20 select-none font-display text-[22rem] italic leading-none text-primary/5" aria-hidden="true">✳</div>
        <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:gap-24">
          <div>
            <p className="mb-7 font-mono text-xs uppercase tracking-[0.2em] text-primary">03 / Patrocinio</p>
            <h2 className="font-display text-[clamp(3.5rem,7vw,7rem)] leading-[0.95] text-foreground">Hagamos que algo <span className="italic text-primary">crezca juntos.</span></h2>
          </div>
          <div className="flex flex-col items-start justify-end gap-8">
            <p className="max-w-md text-lg leading-relaxed text-muted-foreground">Apoyamos ideas, personas y proyectos que acercan la botánica, la creatividad y la comunidad a más gente. Si lo que haces tiene raíces, queremos escucharte.</p>
            <button onClick={() => onNavigate('patrocinio')} className="border border-primary bg-primary px-8 py-4 font-mono text-xs uppercase tracking-widest text-ink transition-colors hover:bg-transparent hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
              Descubrir patrocinio ↗
            </button>
          </div>
        </div>
      </section>

      <section id="contacto" className="bg-primary px-6 py-20 text-ink md:px-12 lg:px-20 lg:py-28">
        <div className="mb-12 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em]">
          <span className="h-px w-8 bg-current" /> 04 / Hablemos
        </div>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col items-start">
            <h2 className="font-display text-[clamp(3.8rem,8vw,8rem)] leading-[0.9]">Todo empieza con un <span className="italic">hola.</span></h2>
            <p className="mt-9 max-w-md text-base leading-relaxed opacity-80">¿Tienes una idea, una duda o simplemente ganas de hablar de flores? Escríbenos. Nos encantará conocerte.</p>
            <a href="mailto:hola@deepintheflower.com" className="mt-9 break-all border-b border-current pb-2 font-display text-2xl transition-opacity hover:opacity-60 md:text-3xl">hola@deepintheflower.com ↗</a>
            <div className="mt-14 border-t border-current/30 pt-6 font-mono text-xs uppercase tracking-widest leading-loose">
              <p>Barcelona, España</p>
              <p className="opacity-70">Encuentros con cita previa</p>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="mb-4 flex justify-between gap-4 font-mono text-xs uppercase tracking-widest">
              <span>Encuéntranos por Barcelona</span><span>41°23′ N · 2°10′ E</span>
            </div>
            <div className="min-h-[360px] flex-1 overflow-hidden border border-ink/30 bg-secondary md:min-h-[470px]">
              <iframe
                title="Mapa orientativo del centro de Barcelona"
                src="https://www.google.com/maps?q=Pla%C3%A7a%20de%20Catalunya%2C%20Barcelona&output=embed"
                className="h-full min-h-[360px] w-full md:min-h-[470px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="mt-3 font-mono text-xs opacity-70">Mapa orientativo · El punto de encuentro se confirma al concertar una cita.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
