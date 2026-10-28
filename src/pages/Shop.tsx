// Página de Tienda. Lee las categorías y los productos reales desde Supabase,
// respetando la disponibilidad de stock y mostrando errores reales sin listas de respaldo.

import { useEffect, useState } from 'react'
import { obtenerCategoriasTienda } from '../services/tienda'
import type { ProductoTienda } from '../types/database'

interface ShopProps {
  products: ProductoTienda[]
  loading: boolean
  error: string | null
  onRetry: () => void
  cart: number[]
  onAddToCart: (id: number) => void
  initialCategory?: string
}

export default function Shop({
  products,
  loading,
  error,
  onRetry,
  cart,
  onAddToCart,
  initialCategory = 'Todo',
}: ShopProps) {
  const [categories, setCategories] = useState<string[]>([
    'Todo',
    'Flores',
    'Plantas',
    'Semillas',
    'Macetas',
    'Herramientas',
  ])
  const [active, setActive] = useState(initialCategory)
  const [addedId, setAddedId] = useState<number | null>(null)

  useEffect(() => {
    obtenerCategoriasTienda()
      .then(lista => {
        if (lista.length > 1) setCategories(lista)
      })
      .catch(() => {
        // Si falla la lectura de categorías secundarias, el error principal se muestra en el catálogo
      })
  }, [])

  const filtered =
    active === 'Todo' ? products : products.filter(p => p.cat === active)

  function addToCart(id: number) {
    onAddToCart(id)
    setAddedId(id)
    setTimeout(() => setAddedId(null), 1200)
  }

  return (
    <div className="min-h-screen bg-[#080c06] pt-8">
      {/* Header */}
      <div className="px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <p className="font-mono text-[#c5f135] text-xs tracking-[0.3em] uppercase mb-4">
          Catálogo completo
        </p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h1 className="font-display text-[clamp(3rem,8vw,7rem)] font-black text-[#f0ede6] leading-[0.9]">
            La
            <br />
            <span className="italic text-[#8fa882]">tienda</span>
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#c5f135]" />
            <span className="font-mono text-[#8fa882] text-sm">
              {cart.length} en el carrito
            </span>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-6 md:px-12 lg:px-20 border-y border-[#1e2e1a]">
        <div className="flex gap-0 overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`flex-shrink-0 font-mono text-xs tracking-widest uppercase px-5 py-4 border-r border-[#1e2e1a] transition-colors duration-150 ${
                active === cat
                  ? 'bg-[#c5f135] text-[#080c06]'
                  : 'text-[#8fa882] hover:text-[#f0ede6]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div className="px-6 md:px-12 lg:px-20 py-12 md:py-16">
        {loading ? (
          <div className="py-32 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-[#8fa882]">
              Cargando catálogo desde Supabase...
            </p>
          </div>
        ) : error ? (
          <div className="py-24 text-center max-w-md mx-auto">
            <p className="font-display text-[#f0ede6] text-2xl mb-3">
              No se pudo cargar el catálogo
            </p>
            <p className="font-body text-[#8fa882] text-sm mb-6">{error}</p>
            <button
              onClick={onRetry}
              className="font-mono text-xs tracking-widest uppercase px-6 py-3 bg-[#c5f135] text-[#080c06] hover:bg-[#d4ff40] transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {filtered.map(product => {
                const enCarrito = cart.filter(id => id === product.id).length
                const sinStock = product.stock <= 0 || enCarrito >= product.stock
                return (
                  <div
                    key={product.id}
                    className="group relative break-inside-avoid mb-4 overflow-hidden bg-[#0f1a0c] cursor-pointer"
                  >
                    <div
                      className="overflow-hidden"
                      style={{ aspectRatio: product.large ? '3/4' : '4/5' }}
                    >
                      <img
                        src={product.img}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-70 group-hover:opacity-90"
                      />
                    </div>

                    {product.tag && (
                      <div className="absolute top-4 left-4 font-mono text-[10px] tracking-widest uppercase px-3 py-1 bg-[#c5f135] text-[#080c06]">
                        {product.tag}
                      </div>
                    )}

                    <div className="p-5">
                      <p className="font-mono text-[#8fa882] text-[10px] tracking-widest uppercase mb-1">
                        {product.cat}
                      </p>
                      <h3 className="font-display text-[#f0ede6] text-xl font-medium">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between mt-4">
                        <span className="font-display text-[#c5f135] text-2xl font-black">
                          {product.priceFormatted}
                        </span>
                        <button
                          onClick={() => addToCart(product.id)}
                          disabled={sinStock}
                          className={`font-mono text-xs tracking-widest uppercase px-4 py-2 transition-all duration-200 ${
                            addedId === product.id
                              ? 'bg-[#c5f135] text-[#080c06]'
                              : sinStock
                              ? 'border border-[#1e2e1a] text-[#3a4d36] cursor-not-allowed'
                              : 'border border-[#1e2e1a] text-[#8fa882] hover:border-[#c5f135] hover:text-[#c5f135]'
                          }`}
                        >
                          {addedId === product.id
                            ? '✓ Añadido'
                            : product.stock <= 0
                            ? 'Agotado'
                            : sinStock
                            ? 'Máx. stock'
                            : '+ Añadir'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {filtered.length === 0 && (
              <div className="py-32 text-center">
                <p className="font-display text-[#8fa882] text-3xl italic">
                  Sin productos en esta categoría aún.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
