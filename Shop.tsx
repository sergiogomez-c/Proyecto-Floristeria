import { useState } from 'react'

const CATEGORIES = ['Todo', 'Flores', 'Plantas', 'Semillas', 'Macetas', 'Herramientas']

export const PRODUCTS = [
  { id: 1, name: 'Rosa Negra de Halfeti', cat: 'Flores', price: '24,90 €', img: 'https://images.unsplash.com/photo-1612351641432-20a0f196086c?w=600&h=750&fit=crop&auto=format', tag: 'Exclusiva', large: true },
  { id: 2, name: 'Orquídea Phalaenopsis', cat: 'Flores', price: '18,50 €', img: 'https://images.unsplash.com/photo-1518343161123-c7e9ab4dc4da?w=600&h=750&fit=crop&auto=format', tag: null, large: false },
  { id: 3, name: 'Monstera Deliciosa XXL', cat: 'Plantas', price: '65,00 €', img: 'https://images.unsplash.com/photo-1598559213718-da4a925fbf71?w=600&h=750&fit=crop&auto=format', tag: 'Más vendida', large: false },
  { id: 4, name: 'Palma Tropical Areca', cat: 'Plantas', price: '48,00 €', img: 'https://images.unsplash.com/photo-1521706862577-47b053587f91?w=600&h=750&fit=crop&auto=format', tag: null, large: true },
  { id: 5, name: 'Semillas Lavanda Ecológica', cat: 'Semillas', price: '6,90 €', img: 'https://images.unsplash.com/photo-1487528742387-d53d4f12488d?w=600&h=750&fit=crop&auto=format', tag: 'Nuevo', large: false },
  { id: 6, name: 'Maceta Terracota Artesanal', cat: 'Macetas', price: '34,00 €', img: 'https://images.unsplash.com/photo-1551970634-747846a548cb?w=600&h=750&fit=crop&auto=format', tag: null, large: false },
  { id: 7, name: 'Kit Herramientas Bonsái', cat: 'Herramientas', price: '42,00 €', img: 'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?w=600&h=750&fit=crop&auto=format', tag: null, large: false },
  { id: 8, name: 'Peonía Garden Romance', cat: 'Flores', price: '19,90 €', img: 'https://images.unsplash.com/photo-1520179737749-b7752f6f56fb?w=600&h=750&fit=crop&auto=format', tag: null, large: true },
  { id: 9, name: 'Ficus Lyrata', cat: 'Plantas', price: '55,00 €', img: 'https://images.unsplash.com/photo-1525923838299-2312b60f6d69?w=600&h=750&fit=crop&auto=format', tag: 'Nuevo', large: false },
]

export default function Shop({ cart, onAddToCart, initialCategory = 'Todo' }: { cart: number[]; onAddToCart: (id: number) => void; initialCategory?: string }) {
  const [active, setActive] = useState(initialCategory)
  const [addedId, setAddedId] = useState<number | null>(null)

  const filtered = active === 'Todo' ? PRODUCTS : PRODUCTS.filter(p => p.cat === active)

  function addToCart(id: number) {
    onAddToCart(id)
    setAddedId(id)
    setTimeout(() => setAddedId(null), 1200)
  }

  return (
    <div className="min-h-screen bg-[#080c06] pt-8">
      {/* Header */}
      <div className="px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <p className="font-mono text-[#c5f135] text-xs tracking-[0.3em] uppercase mb-4">Catálogo completo</p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h1 className="font-display text-[clamp(3rem,8vw,7rem)] font-black text-[#f0ede6] leading-[0.9]">
            La<br />
            <span className="italic text-[#8fa882]">tienda</span>
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#c5f135]" />
            <span className="font-mono text-[#8fa882] text-sm">{cart.length} en el carrito</span>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-6 md:px-12 lg:px-20 border-y border-[#1e2e1a]">
        <div className="flex gap-0 overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          {CATEGORIES.map(cat => (
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
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {filtered.map(product => (
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
                <p className="font-mono text-[#8fa882] text-[10px] tracking-widest uppercase mb-1">{product.cat}</p>
                <h3 className="font-display text-[#f0ede6] text-xl font-medium">{product.name}</h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="font-display text-[#c5f135] text-2xl font-black">{product.price}</span>
                  <button
                    onClick={() => addToCart(product.id)}
                    className={`font-mono text-xs tracking-widest uppercase px-4 py-2 transition-all duration-200 ${
                      addedId === product.id
                        ? 'bg-[#c5f135] text-[#080c06]'
                        : 'border border-[#1e2e1a] text-[#8fa882] hover:border-[#c5f135] hover:text-[#c5f135]'
                    }`}
                  >
                    {addedId === product.id ? '✓ Añadido' : '+ Añadir'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-32 text-center">
            <p className="font-display text-[#8fa882] text-3xl italic">Sin productos en esta categoría aún.</p>
          </div>
        )}
      </div>
    </div>
  )
}
