import { useState } from 'react'

const SPECIES = [
  {
    id: 'rosa',
    name: 'Rosa',
    scientific: 'Rosa × hybrida',
    origin: 'Asia Central',
    climate: 'Templado',
    bloom: 'Primavera – Otoño',
    difficulty: 'Media',
    img: 'https://images.unsplash.com/photo-1612351641432-20a0f196086c?w=900&h=1100&fit=crop&auto=format',
    description: 'Símbolo universal del amor y la belleza, la rosa es una de las flores más cultivadas del mundo. Existen más de 30.000 variedades registradas, desde las silvestres hasta los híbridos de té modernos.',
    care: ['Riego profundo 2–3 veces por semana', 'Poda al inicio de primavera', 'Abono rico en potasio', 'Exposición solar mínima de 6h al día', 'Tratar pulgón con jabón potásico'],
    color: '#e8c4a0',
  },
  {
    id: 'orquidea',
    name: 'Orquídea',
    scientific: 'Phalaenopsis amabilis',
    origin: 'Asia Tropical',
    climate: 'Tropical húmedo',
    bloom: 'Invierno – Primavera',
    difficulty: 'Baja',
    img: 'https://images.unsplash.com/photo-1518343161123-c7e9ab4dc4da?w=900&h=1100&fit=crop&auto=format',
    description: 'La mariposa de la familia de las orquídeas. Con flores que duran hasta 4 meses, es ideal para interiores luminosos. Su cultivo en corteza de pino permite una aireación radical óptima.',
    care: ['Riego por inmersión cada 10 días', 'Sin exposición solar directa', 'Humedad ambiental 50–70%', 'Temperatura entre 18°C y 28°C', 'Abono foliar mensual'],
    color: '#c5a0e8',
  },
  {
    id: 'monstera',
    name: 'Monstera',
    scientific: 'Monstera deliciosa',
    origin: 'México – Panamá',
    climate: 'Tropical',
    bloom: 'Raramente en interior',
    difficulty: 'Muy baja',
    img: 'https://images.unsplash.com/photo-1598559213718-da4a925fbf71?w=900&h=1100&fit=crop&auto=format',
    description: 'La planta icónica de la arquitectura de interiores contemporánea. Sus grandes hojas perforadas (fenestradas) son una adaptación para resistir fuertes vientos tropicales dejando pasar el aire.',
    care: ['Riego cuando el sustrato esté seco', 'Luz indirecta brillante', 'Soporte o tutor a partir de 60 cm', 'Limpieza de hojas mensual', 'Trasplante cada 2 años en primavera'],
    color: '#c5f135',
  },
  {
    id: 'lavanda',
    name: 'Lavanda',
    scientific: 'Lavandula angustifolia',
    origin: 'Mediterráneo',
    climate: 'Mediterráneo seco',
    bloom: 'Junio – Agosto',
    difficulty: 'Baja',
    img: 'https://images.unsplash.com/photo-1487528742387-d53d4f12488d?w=900&h=1100&fit=crop&auto=format',
    description: 'Planta aromática con propiedades relajantes ampliamente estudiadas. Su aceite esencial es uno de los más utilizados en aromaterapia. Atrae polinizadores y repele ciertos insectos naturalmente.',
    care: ['Riego muy moderado (resistente a sequía)', 'Suelo bien drenado, calcáreo', 'Poda post-floración (nunca madera vieja)', 'Sol pleno', 'Sin abono excesivo (empobrece el aroma)'],
    color: '#a0b8e8',
  },
]

const DIFFICULTY_COLORS: Record<string, string> = {
  'Muy baja': '#c5f135',
  'Baja': '#8fc400',
  'Media': '#e8c4a0',
  'Alta': '#e88080',
}

export default function Botanica() {
  const [featured, setFeatured] = useState(SPECIES[0])
  const [openCare, setOpenCare] = useState(false)

  return (
    <div className="min-h-screen bg-[#080c06]">
      {/* Header */}
      <div className="px-6 md:px-12 lg:px-20 pt-16 pb-12 md:pt-24 border-b border-[#1e2e1a]">
        <p className="font-mono text-[#c5f135] text-xs tracking-[0.3em] uppercase mb-4">Conocimiento botánico</p>
        <h1 className="font-display text-[clamp(3rem,8vw,7rem)] font-black text-[#f0ede6] leading-[0.9]">
          Botánica
          <br />
          <span className="italic text-[#8fa882]">viva</span>
        </h1>
        <p className="mt-6 font-body text-[#8fa882] max-w-lg text-base leading-relaxed">
          Guía editorial de plantas y flores. Aprende a conocer, cultivar y entender cada especie.
        </p>
      </div>

      {/* Species selector */}
      <div className="border-b border-[#1e2e1a] flex overflow-x-auto">
        {SPECIES.map(sp => (
          <button
            key={sp.id}
            onClick={() => { setFeatured(sp); setOpenCare(false) }}
            className={`flex-shrink-0 flex flex-col items-start px-6 py-5 border-r border-[#1e2e1a] transition-all duration-200 ${
              featured.id === sp.id ? 'bg-[#0f1a0c]' : 'hover:bg-[#0a120a]'
            }`}
          >
            <span
              className="font-mono text-[10px] tracking-widest uppercase mb-1"
              style={{ color: featured.id === sp.id ? sp.color : '#8fa882' }}
            >
              {sp.scientific}
            </span>
            <span className="font-display text-[#f0ede6] text-xl font-bold">{sp.name}</span>
            {featured.id === sp.id && (
              <div className="w-full h-px mt-3" style={{ background: sp.color }} />
            )}
          </button>
        ))}
      </div>

      {/* Featured species */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[70vh]">
        {/* Image */}
        <div className="relative overflow-hidden bg-[#0f1a0c]" style={{ minHeight: '400px' }}>
          <img
            key={featured.id}
            src={featured.img}
            alt={featured.name}
            className="w-full h-full object-cover opacity-60 transition-opacity duration-500"
            style={{ position: 'absolute', inset: 0 }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#080c06]" />
          <div className="absolute bottom-8 left-8">
            <span
              className="font-display text-[7rem] font-black leading-none select-none opacity-20"
              style={{ color: featured.color }}
            >
              {featured.name[0]}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="px-8 md:px-12 py-12 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-black text-[#f0ede6] leading-tight">{featured.name}</h2>
                <p className="font-display italic text-[#8fa882] text-xl mt-1">{featured.scientific}</p>
              </div>
              <span
                className="font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 mt-1"
                style={{ background: `${featured.color}20`, color: featured.color, border: `1px solid ${featured.color}40` }}
              >
                {DIFFICULTY_COLORS[featured.difficulty] ? featured.difficulty : 'Media'}
              </span>
            </div>

            <p className="font-body text-[#c8c3b8] leading-relaxed text-base mb-8">{featured.description}</p>

            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                ['Origen', featured.origin],
                ['Clima', featured.climate],
                ['Floración', featured.bloom],
                ['Dificultad', featured.difficulty],
              ].map(([label, value]) => (
                <div key={label} className="border border-[#1e2e1a] p-4">
                  <p className="font-mono text-[#8fa882] text-[10px] tracking-widest uppercase mb-1">{label}</p>
                  <p className="font-display text-[#f0ede6] text-lg font-medium">{value}</p>
                </div>
              ))}
            </div>

            {/* Care accordion */}
            <div className="border border-[#1e2e1a]">
              <button
                onClick={() => setOpenCare(o => !o)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-mono text-xs tracking-widest uppercase text-[#f0ede6]">Guía de cuidados</span>
                <span style={{ color: featured.color }} className="font-display text-xl">{openCare ? '−' : '+'}</span>
              </button>
              {openCare && (
                <div className="px-5 pb-5 border-t border-[#1e2e1a]">
                  <ul className="mt-4 space-y-2">
                    {featured.care.map((c, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="font-mono text-[10px] mt-1" style={{ color: featured.color }}>0{i + 1}</span>
                        <span className="font-body text-[#c8c3b8] text-sm leading-relaxed">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* All species mini-grid */}
      <div className="px-6 md:px-12 lg:px-20 py-16 md:py-24 border-t border-[#1e2e1a]">
        <p className="font-mono text-[#8fa882] text-xs tracking-[0.3em] uppercase mb-8">Todas las especies</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1e2e1a]">
          {SPECIES.map(sp => (
            <button
              key={sp.id}
              onClick={() => { setFeatured(sp); setOpenCare(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="group relative overflow-hidden bg-[#080c06] text-left"
              style={{ aspectRatio: '3/4' }}
            >
              <img
                src={sp.img}
                alt={sp.name}
                className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500"
              />
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <p className="font-display text-[#f0ede6] font-bold text-xl">{sp.name}</p>
                <p className="font-display italic text-[#8fa882] text-sm">{sp.scientific}</p>
              </div>
              {featured.id === sp.id && (
                <div className="absolute inset-0 border-2 pointer-events-none" style={{ borderColor: sp.color }} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
