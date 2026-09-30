import { useState, useEffect } from 'react'

const MARQUEE_ITEMS = ['Flores · ', 'Plantas · ', 'Semillas · ', 'Macetas · ', 'Herramientas · ', 'Decoración · ']

const CATEGORIES = [
  {
    id: 'flores',
    label: 'Flores',
    tag: '01',
    desc: 'Ramos, flores de temporada y composiciones para cada ocasión.',
    img: 'https://images.unsplash.com/photo-1612351641432-20a0f196086c?w=800&h=1000&fit=crop&auto=format',
    count: '48 productos',
  },
  {
    id: 'plantas',
    label: 'Plantas',
    tag: '02',
    desc: 'Interior, exterior, tropicales. Plantas que transforman espacios.',
    img: 'https://images.unsplash.com/photo-1551970634-747846a548cb?w=800&h=1000&fit=crop&auto=format',
    count: '72 productos',
  },
  {
    id: 'semillas',
    label: 'Semillas & Cultivo',
    tag: '03',
    desc: 'Todo para cultivar desde cero. Semillas, tierra, herramientas.',
    img: 'https://images.unsplash.com/photo-1487528742387-d53d4f12488d?w=800&h=1000&fit=crop&auto=format',
    count: '130 productos',
  },
]

const FORUM_PREVIEWS = [
  { img: 'https://images.unsplash.com/photo-1598559213718-da4a925fbf71?w=400&h=500&fit=crop&auto=format', user: '@verde.urbano', title: 'Mi monstera después de 3 años' },
  { img: 'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?w=400&h=500&fit=crop&auto=format', user: '@jardin.secreto', title: 'Jardín vertical en el balcón' },
  { img: 'https://images.unsplash.com/photo-1623183074617-90611646e4ca?w=400&h=500&fit=crop&auto=format', user: '@plantmom_bcn', title: 'Primera floración 🌸' },
]

interface HomeProps {
  onNavigate: (page: string) => void
}

export default function Home({ onNavigate }: HomeProps) {
  const [hoveredCat, setHoveredCat] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div className="bg-[#080c06] min-h-screen">
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 bg-[#080c06]">
          <img
            src="https://images.unsplash.com/photo-1612351641432-20a0f196086c?w=1600&h=1200&fit=crop&auto=format"
            alt="Rosas botánicas editoriales"
            className="w-full h-full object-cover opacity-40"
            style={{ objectPosition: 'center 30%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080c06] via-[#080c0680] to-transparent" />
        </div>

        {/* Big headline */}
        <div className="relative z-10 px-6 md:px-12 lg:px-20 pb-16 md:pb-24">
          <div className="overflow-hidden mb-2">
            <p className="font-mono text-[#c5f135] text-xs tracking-[0.3em] uppercase mb-6 fade-up fade-up-delay-1">
              Floristería online · Servicio a domicilio
            </p>
          </div>
          <h1
            className="font-display text-[clamp(3.5rem,12vw,11rem)] leading-[0.88] font-black text-[#f0ede6] tracking-tight fade-up fade-up-delay-2"
          >
            Deep<br />
            <span className="italic text-[#c5f135]">in the</span><br />
            Flower
          </h1>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 fade-up fade-up-delay-3">
            <button
              onClick={() => onNavigate('shop')}
              className="group px-8 py-4 bg-[#c5f135] text-[#080c06] font-mono text-sm tracking-widest uppercase font-medium hover:bg-[#d4ff40] transition-colors duration-200"
            >
              Explorar tienda →
            </button>
            <button
              onClick={() => onNavigate('reservas')}
              className="px-8 py-4 border border-[#f0ede640] text-[#f0ede6] font-mono text-sm tracking-widest uppercase hover:border-[#c5f135] hover:text-[#c5f135] transition-colors duration-200"
            >
              Reservar decoración
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-8 md:right-12 z-10 flex flex-col items-center gap-2">
          <span className="font-mono text-[#8fa882] text-xs tracking-widest" style={{ writingMode: 'vertical-rl' }}>scroll</span>
          <div className="w-px h-12 bg-[#c5f135] opacity-60" />
        </div>
      </section>

      {/* MARQUEE */}
      <div className="border-y border-[#1e2e1a] py-4 overflow-hidden bg-[#0f1a0c]">
        <div className="marquee-track flex whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="font-display italic text-[#c5f135] text-2xl md:text-3xl font-light px-2">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="px-6 md:px-12 lg:px-20 py-20 md:py-32">
        <div className="flex items-end justify-between mb-12">
          <h2 className="font-display text-[clamp(2rem,5vw,4rem)] font-black text-[#f0ede6] leading-tight">
            Qué crece<br />
            <span className="italic text-[#8fa882]">aquí dentro</span>
          </h2>
          <button
            onClick={() => onNavigate('shop')}
            className="hidden md:block font-mono text-xs text-[#c5f135] tracking-widest uppercase hover:underline"
          >
            Ver todo →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1e2e1a]">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="relative group cursor-pointer bg-[#080c06] overflow-hidden"
              style={{ aspectRatio: '4/5' }}
              onMouseEnter={() => setHoveredCat(cat.id)}
              onMouseLeave={() => setHoveredCat(null)}
              onClick={() => onNavigate('shop')}
            >
              <img
                src={cat.img}
                alt={cat.label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                style={{ opacity: hoveredCat === cat.id ? 0.6 : 0.4 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080c06] via-transparent to-transparent" />
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
                <span className="font-mono text-[#8fa882] text-xs">{cat.tag}</span>
                <div>
                  <h3 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-black text-[#f0ede6] leading-tight mb-2">
                    {cat.label}
                  </h3>
                  <p className="text-[#8fa882] text-sm leading-relaxed mb-4 max-w-xs">{cat.desc}</p>
                  <span className="font-mono text-[#c5f135] text-xs tracking-widest">{cat.count}</span>
                </div>
              </div>
              <div
                className="absolute inset-0 border border-[#c5f135] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => onNavigate('shop')}
          className="md:hidden mt-6 w-full font-mono text-xs text-[#c5f135] tracking-widest uppercase text-center py-4 border border-[#1e2e1a]"
        >
          Ver todo →
        </button>
      </section>

      {/* STATEMENT SECTION */}
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24 bg-[#0f1a0c] border-y border-[#1e2e1a]">
        <div className="max-w-4xl">
          <p className="font-mono text-[#c5f135] text-xs tracking-[0.3em] uppercase mb-8">Nuestra filosofía</p>
          <blockquote className="font-display text-[clamp(1.8rem,4.5vw,4rem)] font-light italic text-[#f0ede6] leading-[1.15]">
            "Cada planta es una historia. Nosotros te ayudamos a contarla."
          </blockquote>
          <div className="mt-8 flex flex-wrap gap-6">
            {[['48h', 'entrega garantizada'], ['200+', 'variedades disponibles'], ['5★', 'valoración media']].map(([val, label]) => (
              <div key={label}>
                <div className="font-display text-3xl font-black text-[#c5f135]">{val}</div>
                <div className="font-mono text-[#8fa882] text-xs tracking-widest uppercase">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMUNITY PREVIEW */}
      <section className="px-6 md:px-12 lg:px-20 py-20 md:py-32">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-mono text-[#c5f135] text-xs tracking-[0.3em] uppercase mb-4">Comunidad</p>
            <h2 className="font-display text-[clamp(2rem,5vw,4rem)] font-black text-[#f0ede6] leading-tight">
              El foro<br />
              <span className="italic text-[#8fa882]">verde</span>
            </h2>
          </div>
          <button
            onClick={() => onNavigate('foro')}
            className="hidden md:block font-mono text-xs text-[#c5f135] tracking-widest uppercase hover:underline"
          >
            Unirse →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FORUM_PREVIEWS.map((post, i) => (
            <div
              key={i}
              className="group cursor-pointer"
              style={{ marginTop: i === 1 ? '2rem' : 0 }}
              onClick={() => onNavigate('foro')}
            >
              <div className="overflow-hidden bg-[#0f1a0c]" style={{ aspectRatio: '3/4' }}>
                <img
                  src={post.img}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                />
              </div>
              <div className="mt-3">
                <p className="font-mono text-[#c5f135] text-xs tracking-widest">{post.user}</p>
                <p className="font-display text-[#f0ede6] text-lg font-medium mt-1">{post.title}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => onNavigate('foro')}
          className="mt-8 md:hidden w-full font-mono text-xs text-[#c5f135] tracking-widest uppercase text-center py-4 border border-[#1e2e1a]"
        >
          Unirse al foro →
        </button>
      </section>

      {/* RESERVAS CTA */}
      <section
        className="relative overflow-hidden mx-6 md:mx-12 lg:mx-20 mb-20 md:mb-32"
        style={{ background: 'linear-gradient(135deg, #c5f135 0%, #8fc400 100%)' }}
      >
        <div className="relative z-10 p-10 md:p-16 lg:p-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <p className="font-mono text-[#080c06] text-xs tracking-[0.3em] uppercase mb-4 opacity-70">Servicio premium</p>
            <h2 className="font-display text-[clamp(2rem,5vw,4rem)] font-black text-[#080c06] leading-tight">
              Decoración floral<br />para tu fecha especial
            </h2>
            <p className="font-body text-[#080c06] mt-4 max-w-md opacity-80 text-base leading-relaxed">
              Bodas, eventos corporativos, cenas íntimas. Diseñamos la atmósfera perfecta con flores frescas.
            </p>
          </div>
          <button
            onClick={() => onNavigate('reservas')}
            className="flex-shrink-0 px-10 py-5 bg-[#080c06] text-[#c5f135] font-mono text-sm tracking-widest uppercase hover:bg-[#0f1a0c] transition-colors duration-200"
          >
            Reservar ahora →
          </button>
        </div>
        {/* Decorative large text */}
        <div
          className="absolute -right-8 -bottom-6 font-display font-black text-[12rem] leading-none text-[#080c06] opacity-10 select-none pointer-events-none"
        >
          ✿
        </div>
      </section>
    </div>
  )
}
