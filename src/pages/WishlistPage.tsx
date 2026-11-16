import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import type { ProductoTienda } from '../types/database'

interface WishlistPageProps {
  user: User | null
  products: ProductoTienda[] // Recibimos el catálogo entero de App.tsx para pintar las fotos y precios
  cart: number[]
  onAddToCart: (id: number) => void
  onNavigate: (page: string) => void
}

export default function WishlistPage({ user, products, cart, onAddToCart, onNavigate }: WishlistPageProps) {
  const [wishlistedIds, setWishlistedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadWishlist()
    else setLoading(false)
  }, [user])

  async function loadWishlist() {
    const { data } = await supabase.from('lista_deseos').select('producto_id').eq('usuario_id', user!.id)
    if (data) setWishlistedIds(data.map(d => d.producto_id))
    setLoading(false)
  }

  async function removeFromWishlist(productId: number) {
    if (!user) return
    await supabase.from('lista_deseos').delete().match({ usuario_id: user.id, producto_id: productId })
    setWishlistedIds(prev => prev.filter(id => id !== productId))
  }

  // Filtramos el catálogo para mostrar solo los que tienen el ID guardado
  const myWishlist = products.filter(p => wishlistedIds.includes(p.id))

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center font-mono text-xs text-[#8fa882] uppercase tracking-widest">Cargando deseos...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 lg:px-12 min-h-[75vh]">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <button onClick={() => onNavigate('perfil')} className="text-[#8fa882] font-mono text-xs uppercase hover:text-[#c5f135] mb-4 flex items-center gap-2">
            ← Volver a Perfil
          </button>
          <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-black text-[#f0ede6] leading-[0.9]">
            Tu Lista de <span className="italic text-[#c5f135]">Deseos</span>
          </h1>
        </div>
      </div>

      {myWishlist.length === 0 ? (
        <div className="bg-[#0f1a0c] border border-[#1e2e1a] p-12 text-center">
          <p className="font-display text-2xl text-[#8fa882] mb-4">No tienes plantas en tus deseos.</p>
          <button onClick={() => onNavigate('shop')} className="bg-[#c5f135] text-[#080c06] font-mono text-xs uppercase tracking-widest px-6 py-3 font-bold hover:bg-[#d4ff40]">
            Ir a la Tienda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myWishlist.map(product => {
            const enCarrito = cart.filter(id => id === product.id).length
            const sinStock = product.stock <= 0 || enCarrito >= product.stock

            return (
              <div key={product.id} className="bg-[#0f1a0c] border border-[#1e2e1a] flex overflow-hidden">
                <img src={product.img} alt={product.name} className="w-32 h-40 object-cover opacity-80" />
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <p className="font-mono text-[10px] text-[#8fa882] uppercase tracking-widest">{product.cat}</p>
                    <h3 className="font-display text-lg text-[#f0ede6]">{product.name}</h3>
                    <p className="font-display text-[#c5f135] text-xl font-bold mt-1">{product.priceFormatted}</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button 
                      onClick={() => onAddToCart(product.id)}
                      disabled={sinStock}
                      className="flex-1 bg-[#c5f135] text-[#080c06] font-mono text-[10px] uppercase tracking-widest py-2 font-bold hover:bg-[#d4ff40] disabled:opacity-50"
                    >
                      {sinStock ? 'Sin stock' : 'Al carrito'}
                    </button>
                    <button 
                      onClick={() => removeFromWishlist(product.id)}
                      className="px-3 border border-[#1e2e1a] text-[#8fa882] hover:text-red-400 hover:border-red-400 transition-colors"
                      title="Quitar de favoritos"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}