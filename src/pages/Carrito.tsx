import { PRODUCTS } from './Shop'

type CarritoProps = {
  cart: number[]
  onAdd: (id: number) => void
  onRemove: (id: number) => void
  onClear: () => void
  onNavigate: (page: string) => void
}

function priceInCents(price: string) {
  return Math.round(Number(price.replace(' €', '').replace(',', '.')) * 100)
}

const currency = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

export default function Carrito({ cart, onAdd, onRemove, onClear, onNavigate }: CarritoProps) {
  const items = PRODUCTS.filter(product => cart.includes(product.id)).map(product => ({
    ...product,
    quantity: cart.filter(id => id === product.id).length,
  }))
  const subtotal = items.reduce((sum, product) => sum + priceInCents(product.price) * product.quantity, 0)

  return (
    <main className="min-h-screen bg-ink text-foreground">
      <section className="border-b border-border px-6 py-16 md:px-12 md:py-24 lg:px-20">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="mb-6 font-mono text-xs uppercase tracking-widest text-primary">Tu selección / {String(cart.length).padStart(2, '0')}</p>
            <h1 className="font-display text-6xl leading-none md:text-8xl">Tu <span className="italic text-primary">cesta.</span></h1>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">Un pequeño jardín de cosas que te han gustado. Revísalo antes de seguir explorando.</p>
        </div>
      </section>

      {items.length === 0 ? (
        <section className="flex min-h-[480px] flex-col items-center justify-center px-6 py-20 text-center">
          <span aria-hidden="true" className="font-display text-8xl italic text-primary/40">✳</span>
          <h2 className="mt-6 font-display text-4xl md:text-5xl">Aquí todavía no ha brotado nada.</h2>
          <p className="mt-4 max-w-md text-muted-foreground">Tu cesta está vacía. Date una vuelta por la tienda y encuentra algo que te haga florecer.</p>
          <button onClick={() => onNavigate('shop')} className="mt-9 bg-primary px-7 py-4 font-mono text-xs uppercase tracking-widest text-ink transition-colors hover:bg-[#d4ff40] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Explorar tienda ↗</button>
        </section>
      ) : (
        <section className="grid gap-12 px-6 py-12 md:px-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16 lg:px-20 lg:py-20">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-5">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{items.length} {items.length === 1 ? 'producto diferente' : 'productos diferentes'}</p>
              <button onClick={onClear} className="font-mono text-xs uppercase tracking-widest text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary">Vaciar cesta</button>
            </div>
            {items.map(product => (
              <article key={product.id} className="grid grid-cols-[100px_1fr] gap-5 border-b border-border py-7 sm:grid-cols-[140px_1fr] sm:gap-8">
                <img src={product.img} alt={product.name} className="h-32 w-full object-cover sm:h-40" />
                <div className="flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:gap-6">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{product.cat}</p>
                    <h2 className="mt-2 font-display text-xl leading-tight sm:text-2xl">{product.name}</h2>
                    <p className="mt-3 font-mono text-sm text-primary">{product.price} / unidad</p>
                  </div>
                  <div className="flex flex-wrap items-end justify-between gap-4 sm:flex-col sm:items-end">
                    <span className="font-display text-xl text-foreground">{currency.format(priceInCents(product.price) * product.quantity / 100)}</span>
                    <div className="flex items-center border border-border font-mono text-sm">
                      <button onClick={() => onRemove(product.id)} aria-label={`Quitar una unidad de ${product.name}`} className="px-3 py-2 text-primary transition-colors hover:bg-secondary">−</button>
                      <span className="min-w-8 text-center" aria-label={`${product.quantity} unidades`}>{product.quantity}</span>
                      <button onClick={() => onAdd(product.id)} aria-label={`Añadir una unidad de ${product.name}`} className="px-3 py-2 text-primary transition-colors hover:bg-secondary">+</button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
            <button onClick={() => onNavigate('shop')} className="mt-8 font-mono text-xs uppercase tracking-widest text-primary transition-colors hover:text-foreground">← Seguir comprando</button>
          </div>
          <aside className="h-fit border border-border bg-card p-6 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Resumen de la cesta</p>
            <div className="mt-8 flex justify-between gap-5 border-b border-border pb-5 text-sm text-muted-foreground"><span>Productos ({cart.length})</span><span>{currency.format(subtotal / 100)}</span></div>
            <div className="mt-5 flex items-baseline justify-between gap-4"><span className="font-display text-2xl">Subtotal</span><span className="font-display text-3xl text-primary">{currency.format(subtotal / 100)}</span></div>
            <p className="mt-6 border-t border-border pt-5 text-sm leading-relaxed text-muted-foreground">El envío no está incluido. Los pedidos y pagos aún no están habilitados en esta versión de la tienda.</p>
          </aside>
        </section>
      )}
    </main>
  )
}
