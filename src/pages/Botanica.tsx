// Página de Botánica. Lee las especies, imágenes, metadatos y guía de cuidados
// desde las tablas plantas e imagenes_plantas de Supabase.

import { useEffect, useState } from 'react'
import { obtenerEspeciesBotanicas } from '../services/botanica'
import type { EspecieBotanica } from '../types/database'

const DIFFICULTY_COLORS: Record<string, string> = {
  'Muy baja': '#c5f135',
  Baja: '#8fc400',
  Media: '#e8c4a0',
  Alta: '#e88080',
}

export default function Botanica() {
  const [species, setSpecies] = useState<EspecieBotanica[]>([])
  const [featured, setFeatured] = useState<EspecieBotanica | null>(null)
  const [openCare, setOpenCare] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function cargarBotanica() {
    setLoading(true)
    setError(null)
    try {
      const lista = await obtenerEspeciesBotanicas()
      setSpecies(lista)
      setFeatured(lista[0] ?? null)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar las especies botánicas.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarBotanica()
  }, [])

  return (
    <div className="min-h-screen bg-[#080c06]">
      {/* Header */}
      <div className="px-6 md:px-12 lg:px-20 pt-16 pb-12 md:pt-24 border-b border-[#1e2e1a]">
        <p className="font-mono text-[#c5f135] text-xs tracking-[0.3em] uppercase mb-4">
          Conocimiento botánico
        </p>
        <h1 className="font-display text-[clamp(3rem,8vw,7rem)] font-black text-[#f0ede6] leading-[0.9]">
          Botánica
          <br />
          <span className="italic text-[#8fa882]">viva</span>
        </h1>
        <p className="mt-6 font-body text-[#8fa882] max-w-lg text-base leading-relaxed">
          Guía editorial de plantas y flores. Aprende a conocer, cultivar y entender cada especie.
        </p>
      </div>

      {loading ? (
        <div className="py-32 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-[#8fa882]">
            Cargando fichas botánicas...
          </p>
        </div>
      ) : error || !featured ? (
        <div className="py-24 text-center max-w-md mx-auto px-6">
          <p className="font-display text-[#f0ede6] text-2xl mb-3">
            Error al cargar la guía botánica
          </p>
          <p className="font-body text-[#8fa882] text-sm mb-6">
            {error ?? 'No hay especies registradas.'}
          </p>
          <button
            onClick={cargarBotanica}
            className="font-mono text-xs tracking-widest uppercase px-6 py-3 bg-[#c5f135] text-[#080c06] hover:bg-[#d4ff40] transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          {/* Species selector */}
          <div className="border-b border-[#1e2e1a] flex overflow-x-auto">
            {species.map(sp => (
              <button
                key={sp.id}
                onClick={() => {
                  setFeatured(sp)
                  setOpenCare(false)
                }}
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
                <span className="font-display text-[#f0ede6] text-xl font-bold">
                  {sp.name}
                </span>
                {featured.id === sp.id && (
                  <div
                    className="w-full h-px mt-3"
                    style={{ background: sp.color }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Featured species */}
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[70vh]">
            {/* Image */}
            <div
              className="relative overflow-hidden bg-[#0f1a0c]"
              style={{ minHeight: '400px' }}
            >
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
                    <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-black text-[#f0ede6] leading-tight">
                      {featured.name}
                    </h2>
                    <p className="font-display italic text-[#8fa882] text-xl mt-1">
                      {featured.scientific}
                    </p>
                  </div>
                  <span
                    className="font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 mt-1"
                    style={{
                      background: `${featured.color}20`,
                      color: featured.color,
                      border: `1px solid ${featured.color}40`,
                    }}
                  >
                    {DIFFICULTY_COLORS[featured.difficulty]
                      ? featured.difficulty
                      : 'Media'}
                  </span>
                </div>

                <p className="font-body text-[#c8c3b8] leading-relaxed text-base mb-8">
                  {featured.description}
                </p>

                {/* Metadata grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    ['Origen', featured.origin],
                    ['Clima', featured.climate],
                    ['Floración', featured.bloom],
                    ['Dificultad', featured.difficulty],
                  ].map(([label, value]) => (
                    <div key={label} className="border border-[#1e2e1a] p-4">
                      <p className="font-mono text-[#8fa882] text-[10px] tracking-widest uppercase mb-1">
                        {label}
                      </p>
                      <p className="font-display text-[#f0ede6] text-lg font-medium">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Care accordion */}
                <div className="border border-[#1e2e1a]">
                  <button
                    onClick={() => setOpenCare(o => !o)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="font-mono text-xs tracking-widest uppercase text-[#f0ede6]">
                      Guía de cuidados
                    </span>
                    <span
                      style={{ color: featured.color }}
                      className="font-display text-xl"
                    >
                      {openCare ? '−' : '+'}
                    </span>
                  </button>
                  {openCare && (
                    <div className="px-5 pb-5 border-t border-[#1e2e1a]">
                      <ul className="mt-4 space-y-2">
                        {featured.care.map((c, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span
                              className="font-mono text-[10px] mt-1"
                              style={{ color: featured.color }}
                            >
                              0{i + 1}
                            </span>
                            <span className="font-body text-[#c8c3b8] text-sm leading-relaxed">
                              {c}
                            </span>
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
            <p className="font-mono text-[#8fa882] text-xs tracking-[0.3em] uppercase mb-8">
              Todas las especies
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1e2e1a]">
              {species.map(sp => (
                <button
                  key={sp.id}
                  onClick={() => {
                    setFeatured(sp)
                    setOpenCare(false)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="group relative overflow-hidden bg-[#080c06] text-left"
                  style={{ aspectRatio: '3/4' }}
                >
                  <img
                    src={sp.img}
                    alt={sp.name}
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end p-5">
                    <p className="font-display text-[#f0ede6] font-bold text-xl">
                      {sp.name}
                    </p>
                    <p className="font-display italic text-[#8fa882] text-sm">
                      {sp.scientific}
                    </p>
                  </div>
                  {featured.id === sp.id && (
                    <div
                      className="absolute inset-0 border-2 pointer-events-none"
                      style={{ borderColor: sp.color }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
