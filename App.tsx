import { useEffect, useRef, useState } from 'react'
import Home from './pages/Home'
import Shop, { PRODUCTS } from './pages/Shop'
import Botanica from './pages/Botanica'
import Reservas from './pages/Reservas'
import Foro from './pages/Foro'
import SobreNosotros from './pages/SobreNosotros'
import Patrocinio from './pages/Patrocinio'
import AuthModal from './components/AuthModal'
import Carrito from './pages/Carrito'

type Page = 'home' | 'shop' | 'botanica' | 'reservas' | 'foro' | 'nosotros' | 'patrocinio' | 'carrito'

const NAV_ITEMS: { id: Page; label: string }[] = [
  { id: 'home', label: 'Inicio' },
  { id: 'shop', label: 'Tienda' },
  { id: 'botanica', label: 'Botánica' },
  { id: 'reservas', label: 'Reservas' },
  { id: 'foro', label: 'Foro' },
  { id: 'nosotros', label: 'Sobre nosotros' },
]

function RoseMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-[72%] w-[72%]">
      <path d="M12 16c-3.5-.5-6-3-6-6.5C6 6 8.5 4 11 5c2-2 5.5-1 7 1.5 2 3.5-.5 8-6 9.5Z" />
      <path d="M7.5 9c1-2 3-3 5-2.5 2.5.5 3.5 3 2 4.5-1 1-3 .5-3-1 0-.7.5-1.2 1.2-1.5M12 16v6m0-2c-2-2-4-2.5-5-2 0 2 2 3 5 3m0-2c1.5-2 3.5-2.5 5-2-.3 2-2 3-5 3" />
    </svg>
  )
}

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [shopCategory, setShopCategory] = useState('Todo')
  const [menuOpen, setMenuOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const authTrigger = useRef<HTMLButtonElement>(null)
  const [cart, setCart] = useState<number[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('deepintheflower-cart') || '[]')
      return Array.isArray(stored)
        ? stored.filter((id): id is number => typeof id === 'number' && PRODUCTS.some(product => product.id === id))
        : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('deepintheflower-cart', JSON.stringify(cart))
    } catch {
      // The cart still works for this visit if storage is unavailable.
    }
  }, [cart])

  function removeFromCart(id: number) {
    setCart(items => {
      const index = items.indexOf(id)
      return index < 0 ? items : items.filter((_, position) => position !== index)
    })
  }

  function closeAuth() {
    setAuthOpen(false)
    authTrigger.current?.focus()
  }

  function navigate(p: string) {
    setPage(p as Page)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function navigateContact() {
    setPage('nosotros')
    setMenuOpen(false)
    requestAnimationFrame(() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }))
  }

  return (
    <div className="bg-[#080c06] min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-[#1e2e1a] bg-[#080c06ee] backdrop-blur-md">
        <div className="px-4 sm:px-6 md:px-12 xl:px-16 flex items-center justify-between gap-2 h-16">
          {/* Logo */}
          <button
            onClick={() => navigate('home')}
            className="flex shrink-0 items-center gap-2 sm:gap-3 group"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[#c5f135] flex items-center justify-center text-[#080c06] text-sm font-black select-none">
              <RoseMark />
            </div>
            <span className="font-display font-black text-[#f0ede6] text-xs sm:text-lg tracking-tight leading-none">
              Deep<span className="text-[#c5f135] italic">in the</span>Flower
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden xl:flex items-center gap-0">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`font-mono text-xs tracking-widest uppercase px-3 py-2 transition-all duration-150 ${
                  (page === item.id || (page === 'patrocinio' && item.id === 'nosotros'))
                    ? 'text-[#c5f135]'
                    : 'text-[#8fa882] hover:text-[#f0ede6]'
                }`}
              >
                {item.label}
                {(page === item.id || (page === 'patrocinio' && item.id === 'nosotros')) && (
                  <div className="w-full h-px bg-[#c5f135] mt-0.5" />
                )}
              </button>
            ))}
          </div>

          {/* CTA + hamburger */}
          <div className="flex shrink-0 items-center gap-2 xl:gap-3">
            <button
              type="button"
              onClick={() => navigate('carrito')}
              aria-label={`Abrir carrito, ${cart.length} ${cart.length === 1 ? 'producto' : 'productos'}`}
              aria-current={page === 'carrito' ? 'page' : undefined}
              className="hidden xl:flex items-center gap-2 bg-primary px-3 py-2 text-ink transition-colors hover:bg-[#d4ff40] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M3 9h18l-2 11H5L3 9ZM8 9l4-6 4 6M9 13v4m6-4v4" />
              </svg>
              <span className="font-mono text-xs">{cart.length}</span>
            </button>
            <button
              onClick={() => navigate('shop')}
              className="hidden xl:block font-mono text-xs tracking-widest uppercase px-4 py-2 bg-[#c5f135] text-[#080c06] hover:bg-[#d4ff40] transition-colors"
            >
              Comprar
            </button>
            {/* Hamburger */}
            <button
              className="xl:hidden flex flex-col gap-1.5 p-2"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Menú"
              aria-expanded={menuOpen}
            >
              <span className={`block w-5 h-px bg-[#f0ede6] transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
              <span className={`block w-5 h-px bg-[#f0ede6] transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-px bg-[#f0ede6] transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
            </button>
            <button
              ref={authTrigger}
              type="button"
              onClick={() => { setMenuOpen(false); setAuthOpen(true) }}
              aria-label="Iniciar sesión o crear cuenta"
              className="shrink-0 border border-[#8fa882] px-2 py-2 font-mono text-xs uppercase tracking-wide text-[#f0ede6] transition-colors hover:border-[#c5f135] hover:text-[#c5f135] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-4 sm:tracking-widest"
            >
              <span className="sm:hidden">Entrar</span><span className="hidden sm:inline">Iniciar sesión</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="xl:hidden border-t border-[#1e2e1a] bg-[#080c06] px-6 py-4">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`block w-full text-left font-mono text-sm tracking-widest uppercase py-3 border-b border-[#1e2e1a] transition-colors ${
                  (page === item.id || (page === 'patrocinio' && item.id === 'nosotros')) ? 'text-[#c5f135]' : 'text-[#8fa882]'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => navigate('carrito')}
                aria-label={`Abrir carrito, ${cart.length} ${cart.length === 1 ? 'producto' : 'productos'}`}
                className="flex items-center gap-2 bg-primary px-4 py-3 font-mono text-xs text-ink"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M3 9h18l-2 11H5L3 9ZM8 9l4-6 4 6M9 13v4m6-4v4" /></svg>
                {cart.length}
              </button>
              <button
                onClick={() => navigate('shop')}
                className="flex-1 bg-primary py-3 font-mono text-xs uppercase tracking-widest text-ink"
              >
                Comprar →
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Page content */}
      <div className="pt-16">
        {page === 'home' && <Home onNavigate={navigate} />}
        {page === 'shop' && <Shop key={shopCategory} cart={cart} onAddToCart={id => setCart(items => [...items, id])} initialCategory={shopCategory} />}
        {page === 'carrito' && <Carrito cart={cart} onAdd={id => setCart(items => [...items, id])} onRemove={removeFromCart} onClear={() => setCart([])} onNavigate={navigate} />}
        {page === 'botanica' && <Botanica />}
        {page === 'reservas' && <Reservas />}
        {page === 'foro' && <Foro />}
        {page === 'nosotros' && <SobreNosotros onNavigate={navigate} />}
        {page === 'patrocinio' && <Patrocinio onNavigate={navigate} />}
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1e2e1a] px-6 md:px-12 lg:px-20 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#c5f135] flex items-center justify-center text-[#080c06] font-black"><RoseMark /></div>
              <span className="font-display font-black text-[#f0ede6] text-xl">DeepInTheFlower</span>
            </div>
            <p className="font-body text-[#8fa882] text-sm leading-relaxed max-w-xs">
              Floristería online con entrega en 48h. Plantas, flores, semillas y decoración floral para cada momento.
            </p>
            <p className="font-mono text-[#3a4d36] text-xs mt-6">© 2026 DeepInTheFlower · Barcelona</p>
          </div>

          {[
            { title: 'Tienda', links: ['Flores', 'Plantas', 'Semillas', 'Macetas', 'Herramientas'] },
            { title: 'Nosotros', links: ['Sobre nosotros', 'Patrocinio', 'Botánica', 'Foro', 'Contacto'] },
          ].map(col => (
            <div key={col.title}>
              <p className="font-mono text-[#f0ede6] text-[10px] tracking-widest uppercase mb-4">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map(link => (
                  <li key={link}>
                    {col.title === 'Nosotros' ? (
                      <button
                        onClick={() => link === 'Contacto' ? navigateContact() : navigate(({ 'Sobre nosotros': 'nosotros', Patrocinio: 'patrocinio', Botánica: 'botanica', Foro: 'foro' } as Record<string, Page>)[link])}
                        className="font-body text-[#8fa882] text-sm hover:text-[#c5f135] transition-colors"
                      >
                        {link}
                      </button>
                    ) : (
                      <button
                        onClick={() => { setShopCategory(link); navigate('shop') }}
                        className="font-body text-[#8fa882] text-sm hover:text-[#c5f135] transition-colors"
                      >
                        {link}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-[#1e2e1a] flex flex-wrap gap-3">
          {['Cleber Heber Fabra', 'Sergio Gómez', 'Cristian Salazar'].map(member => (
            <span key={member} className="font-mono text-[10px] tracking-widest uppercase px-3 py-1 border border-[#1e2e1a] text-[#3a4d36]">
              {member}
            </span>
          ))}
        </div>
      </footer>
      {authOpen && <AuthModal onClose={closeAuth} />}
    </div>
  )
}
