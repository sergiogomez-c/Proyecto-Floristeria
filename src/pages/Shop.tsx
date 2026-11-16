import { useEffect, useState } from 'react'
import { obtenerCategoriasTienda } from '../services/tienda'
import type { ProductoTienda } from '../types/database'
import { supabase } from '../supabase'

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
  const [categories, setCategories] = useState<string[]>(['Todo', 'Flores', 'Plantas', 'Semillas', 'Macetas', 'Herramientas'])
  const [active, setActive] = useState(initialCategory)
  const [addedId, setAddedId] = useState<number | null>(null)
  
  const [wishlistToast, setWishlistToast] = useState<string | null>(null)
  const [wishlistedIds, setWishlistedIds] = useState<number[]>([]) // Memoria de corazones

  useEffect(() => {
    obtenerCategoriasTienda().then(lista => { if (lista.length > 1) setCategories(lista) }).catch(() => {})
    cargarWishlist()
  }, [])

  async function cargarWishlist() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data } = await supabase.from('lista_deseos').select('producto_id').eq('usuario_id', session.user.id)
    if (data) setWishlistedIds(data.map(d => d.producto_id))
  }

  const filtered = active === 'Todo' ? products : products.filter(p => p.cat === active)

  function addToCart(id: number) {
    onAddToCart(id)
    setAddedId(id)
    setTimeout(() => setAddedId(null), 1200)
  }

  async function handleToggleWishlist(e: React.MouseEvent, productId: number) {
    e.stopPropagation()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setWishlistToast('Inicia sesión para guardar favoritos')
      setTimeout(() => setWishlistToast(null), 2000)
      return
    }

    const isSaved = wishlistedIds.includes(productId)

    if (isSaved) {
      const { error } = await supabase.from('lista_deseos').delete().match({ usuario_id: session.user.id, producto_id: productId })
      if (!error) {
        setWishlistedIds(prev => prev.filter(id => id !== productId))
        setWishlistToast('Eliminado de deseos')
      }
    } else {
      const { error } = await supabase.from('lista_deseos').insert({ usuario_id: session.user.id, producto_id: productId })
      if (!error || error.code === '23505') {
        setWishlistedIds(prev => [...prev, productId])
        setWishlistToast('Añadido a deseos')
      }
    }
    setTimeout(() => setWishlistToast(null), 2000)
  }

  return (
    <div className="min-h-screen bg-[#080c06] pt-8 relative">
      <div className="px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <p className="font-mono text-[#c5f135] text-xs tracking-[0.3em] uppercase mb-4">Catálogo completo</p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h1 className="font-display text-[clamp(3rem,8vw,7rem)] font-black text-[#f0ede6] leading-[0.9]">
            La<br /><span className="italic text-[#8fa882]">tienda</span>
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#c5f135]" />
            <span className="font-mono text-[#8fa882] text-sm">{cart.length} en el carrito</span>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-20 border-y border-[#1e2e1a]">
        <div className="flex gap-0 overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`flex-shrink-0 font-mono text-xs tracking-widest uppercase px-5 py-4 border-r border-[#1e2e1a] transition-colors duration-150 ${active === cat ? 'bg-[#c5f135] text-[#080c06]' : 'text-[#8fa882] hover:text-[#f0ede6]'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-20 py-12 md:py-16">
        {loading ? (
          <div className="py-32 text-center"><p className="font-mono text-xs uppercase tracking-widest text-[#8fa882]">Cargando catálogo...</p></div>
        ) : error ? (
          <div className="py-24 text-center max-w-md mx-auto">
            <p className="font-display text-[#f0ede6] text-2xl mb-3">Error al cargar</p>
            <button onClick={onRetry} className="font-mono text-xs tracking-widest uppercase px-6 py-3 bg-[#c5f135] text-[#080c06]">Reintentar</button>
          </div>
        ) : (
          <>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {filtered.map(product => {
                const enCarrito = cart.filter(id => id === product.id).length
                const sinStock = product.stock <= 0 || enCarrito >= product.stock
                const isSaved = wishlistedIds.includes(product.id)
                
                return (
                  <div key={product.id} className="group relative break-inside-avoid mb-4 overflow-hidden bg-[#0f1a0c] cursor-pointer">
                    <div className="overflow-hidden relative" style={{ aspectRatio: product.large ? '3/4' : '4/5' }}>
                      <img src={product.img} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-70 group-hover:opacity-90" />
                      
                      {/* Botón de Corazón Modificado */}
                      <button
                        onClick={(e) => handleToggleWishlist(e, product.id)}
                        className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-all duration-300 backdrop-blur-md ${isSaved ? 'text-[#080c06] bg-[#c5f135] opacity-100 scale-100' : 'text-[#f0ede6] bg-[#080c06]/40 opacity-0 group-hover:opacity-100 scale-95 hover:scale-100 hover:text-[#c5f135]'}`}
                      >
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                    </div>

                    {product.tag && <div className="absolute top-4 left-4 font-mono text-[10px] tracking-widest uppercase px-3 py-1 bg-[#c5f135] text-[#080c06] z-10">{product.tag}</div>}

                    <div className="p-5">
                      <p className="font-mono text-[#8fa882] text-[10px] tracking-widest uppercase mb-1">{product.cat}</p>
                      <h3 className="font-display text-[#f0ede6] text-xl font-medium">{product.name}</h3>
                      <div className="flex items-center justify-between mt-4">
                        <span className="font-display text-[#c5f135] text-2xl font-black">{product.priceFormatted}</span>
                        <button
                          onClick={() => addToCart(product.id)}
                          disabled={sinStock}
                          className={`font-mono text-xs tracking-widest uppercase px-4 py-2 transition-all duration-200 ${addedId === product.id ? 'bg-[#c5f135] text-[#080c06]' : sinStock ? 'border border-[#1e2e1a] text-[#3a4d36] cursor-not-allowed' : 'border border-[#1e2e1a] text-[#8fa882] hover:border-[#c5f135] hover:text-[#c5f135]'}`}
                        >
                          {addedId === product.id ? '✓ Añadido' : product.stock <= 0 ? 'Agotado' : sinStock ? 'Máx. stock' : '+ Añadir'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Toast Notification semitransparente */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 pointer-events-none ${wishlistToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-[#080c06]/70 backdrop-blur-md border border-[#1e2e1a] text-[#8fa882] font-mono text-[10px] uppercase tracking-widest px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-[#c5f135]">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {wishlistToast}
        </div>
      </div>
    </div>
  )
}