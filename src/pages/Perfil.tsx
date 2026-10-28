// Página de Perfil de Usuario. Tipada estrictamente sin "any" y conectada a
// las tablas usuarios, publicaciones_foro, pedidos y lista_deseos de Supabase.

import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import type {
  ItemListaDeseos,
  PedidoResumen,
  PerfilUsuario,
} from '../types/database'

export default function Perfil() {
  const [userAuth, setUserAuth] = useState<User | null>(null)
  const [datosPerfil, setDatosPerfil] = useState<PerfilUsuario | null>(null)

  const [editando, setEditando] = useState(false)
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [mensaje, setMensaje] = useState('')

  const [biografia, setBiografia] = useState('')
  const [mensajeBio, setMensajeBio] = useState('')
  const [perfilPrivado, setPerfilPrivado] = useState(false)
  const [totalPostsUsuario, setTotalPostsUsuario] = useState(0)
  const [pedidos, setPedidos] = useState<PedidoResumen[]>([])
  const [wishlist, setWishlist] = useState<ItemListaDeseos[]>([])

  useEffect(() => {
    cargarDatosCompletos()
  }, [])

  async function cargarDatosCompletos() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) return
    setUserAuth(session.user)

    // 1. Cargar datos del usuario
    const { data: userData } = await supabase
      .from('usuarios')
      .select('id, nombre, email, telefono, rol, activo, biografia, perfil_privado')
      .eq('id', session.user.id)
      .maybeSingle()

    if (userData) {
      const ficha = userData as PerfilUsuario
      setDatosPerfil(ficha)
      setNombre(ficha.nombre || '')
      setTelefono(ficha.telefono || '')
      setBiografia(ficha.biografia || '')
      setPerfilPrivado(Boolean(ficha.perfil_privado))
    }

    // 2. Contar publicaciones reales del usuario en el foro
    const { count: postsCount } = await supabase
      .from('publicaciones_foro')
      .select('id', { count: 'exact', head: true })
      .eq('usuario_id', session.user.id)

    setTotalPostsUsuario(postsCount ?? 0)

    // 3. Cargar Pedidos reales
    const { data: pedidosData } = await supabase
      .from('pedidos')
      .select('id, estado, total, creado_en')
      .eq('usuario_id', session.user.id)
      .order('creado_en', { ascending: false })

    if (pedidosData) {
      setPedidos(pedidosData as PedidoResumen[])
    }

    // 4. Cargar Lista de Deseos real
    const { data: wishlistData } = await supabase
      .from('lista_deseos')
      .select('id, productos(nombre)')
      .eq('usuario_id', session.user.id)

    if (wishlistData) {
      const mapeados: ItemListaDeseos[] = (
        wishlistData as unknown as {
          id: number
          productos: { nombre: string } | { nombre: string }[] | null
        }[]
      ).map(w => {
        const prod = Array.isArray(w.productos) ? w.productos[0] : w.productos
        return {
          id: w.id,
          nombreProducto: prod?.nombre ?? 'Producto',
        }
      })
      setWishlist(mapeados)
    }
  }

  async function guardarDatosPersonales(e: React.FormEvent) {
    e.preventDefault()
    if (!userAuth) return
    setMensaje('Guardando...')

    const { error } = await supabase
      .from('usuarios')
      .update({ nombre: nombre.trim(), telefono: telefono.trim() || null })
      .eq('id', userAuth.id)

    if (error) {
      setMensaje('Error al actualizar los datos.')
      return
    }

    setMensaje('¡Datos actualizados!')
    if (datosPerfil) {
      setDatosPerfil({
        ...datosPerfil,
        nombre: nombre.trim(),
        telefono: telefono.trim() || null,
      })
    }
    setTimeout(() => {
      setEditando(false)
      setMensaje('')
    }, 1800)
  }

  async function guardarBiografia() {
    if (!userAuth) return
    setMensajeBio('Guardando...')
    const { error } = await supabase
      .from('usuarios')
      .update({ biografia })
      .eq('id', userAuth.id)

    if (error) {
      setMensajeBio('Error al guardar la biografía.')
      return
    }

    setMensajeBio('¡Biografía actualizada!')
    setTimeout(() => setMensajeBio(''), 2000)
  }

  async function togglePrivacidad() {
    if (!userAuth) return
    const previo = perfilPrivado
    const nuevoEstado = !previo
    setPerfilPrivado(nuevoEstado)

    const { error } = await supabase
      .from('usuarios')
      .update({ perfil_privado: nuevoEstado })
      .eq('id', userAuth.id)

    if (error) {
      setPerfilPrivado(previo)
    }
  }

  if (!userAuth) {
    return (
      <div className="p-20 text-center text-[#8fa882]">Cargando perfil...</div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 xl:px-16 py-12">
      <h1 className="font-display font-black text-[#f0ede6] text-3xl md:text-4xl mb-8">
        Mi Espacio
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMNA IZQUIERDA: Datos Personales */}
        <div className="lg:col-span-1 bg-[#080c06] border border-[#1e2e1a] p-6 shadow-xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-[#c5f135] text-[#080c06] rounded-full flex items-center justify-center text-4xl font-black mb-4 border-4 border-[#1e2e1a]">
              {userAuth.email?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-[#f0ede6] font-display">
              {datosPerfil?.nombre || 'Sin nombre'}
            </h2>
            <p className="text-[#8fa882] text-sm font-mono mt-1">
              {datosPerfil?.rol === 'admin' ? 'Administrador' : 'Cliente'}
            </p>
          </div>

          <div className="border-t border-[#1e2e1a] pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[#c5f135] font-mono text-xs uppercase tracking-widest">
                Datos Personales
              </h3>
              {!editando && (
                <button
                  onClick={() => setEditando(true)}
                  className="text-xs text-[#8fa882] hover:text-[#f0ede6] underline"
                >
                  Editar
                </button>
              )}
            </div>

            {editando ? (
              <form onSubmit={guardarDatosPersonales} className="space-y-4">
                <div>
                  <label className="block text-xs text-[#8fa882] mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    className="w-full bg-[#1e2e1a] text-[#f0ede6] border-none px-3 py-2 text-sm focus:ring-1 focus:ring-[#c5f135] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8fa882] mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                    className="w-full bg-[#1e2e1a] text-[#f0ede6] border-none px-3 py-2 text-sm focus:ring-1 focus:ring-[#c5f135] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8fa882] mb-1">
                    Email (solo lectura)
                  </label>
                  <input
                    type="email"
                    value={userAuth.email}
                    disabled
                    className="w-full bg-black text-[#5a6e53] border-none px-3 py-2 text-sm cursor-not-allowed"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#c5f135] text-[#080c06] py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#d4ff40]"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditando(false)}
                    className="flex-1 border border-[#1e2e1a] text-[#8fa882] py-2 text-xs uppercase tracking-wider hover:text-[#f0ede6]"
                  >
                    Cancelar
                  </button>
                </div>
                {mensaje && (
                  <p className="text-[#c5f135] text-xs mt-2">{mensaje}</p>
                )}
              </form>
            ) : (
              <div className="space-y-4 font-body text-sm text-[#f0ede6]">
                <div>
                  <span className="block text-xs text-[#8fa882]">Email</span>
                  {userAuth.email}
                </div>
                <div>
                  <span className="block text-xs text-[#8fa882]">Teléfono</span>
                  {datosPerfil?.telefono || 'No especificado'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Foro, Privacidad y Actividad */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tarjeta del Foro e Identidad */}
          <div className="bg-[#080c06] border border-[#1e2e1a] p-6 shadow-xl">
            <h3 className="text-[#c5f135] font-mono text-xs uppercase tracking-widest mb-6">
              Identidad de Comunidad
            </h3>

            <div className="flex flex-wrap items-center gap-8 mb-8">
              <div className="flex gap-6 text-center">
                <div>
                  <span className="block text-2xl font-black text-[#f0ede6]">
                    {totalPostsUsuario}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[#8fa882]">
                    Posts
                  </span>
                </div>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <span className="text-xs text-[#8fa882] font-mono">
                  {perfilPrivado ? 'Perfil Privado' : 'Perfil Público'}
                </span>
                <button
                  onClick={togglePrivacidad}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    perfilPrivado ? 'bg-[#c5f135]' : 'bg-[#1e2e1a]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-[#080c06] rounded-full transition-transform ${
                      perfilPrivado ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-[#8fa882] mb-1">
                Biografía Botánica
              </label>
              <textarea
                value={biografia}
                onChange={e => setBiografia(e.target.value)}
                className="w-full bg-[#1e2e1a] text-[#f0ede6] border-none px-3 py-2 text-sm focus:ring-1 focus:ring-[#c5f135] outline-none resize-none h-20"
                placeholder="Cuenta a la comunidad qué plantas cuidas..."
              />
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={guardarBiografia}
                className="border border-[#c5f135] text-[#c5f135] px-4 py-2 text-xs uppercase tracking-widest hover:bg-[#c5f135] hover:text-[#080c06] transition-colors"
              >
                Actualizar Biografía
              </button>
              {mensajeBio && (
                <span className="text-[#c5f135] text-xs">{mensajeBio}</span>
              )}
            </div>
          </div>

          {/* Tarjetas de Actividad (Pedidos y Wishlist REALES) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#080c06] border border-[#1e2e1a] p-6">
              <h3 className="text-[#c5f135] font-mono text-xs uppercase tracking-widest mb-4">
                Últimos Pedidos
              </h3>
              {pedidos.length === 0 ? (
                <p className="text-[#8fa882] text-sm">
                  No tienes pedidos en curso.
                </p>
              ) : (
                pedidos.map(pedido => (
                  <div
                    key={pedido.id}
                    className="text-sm text-[#f0ede6] py-3 border-b border-[#1e2e1a] flex justify-between last:border-0"
                  >
                    <span>Pedido #{pedido.id}</span>
                    <span className="text-[#c5f135]">{pedido.estado}</span>
                  </div>
                ))
              )}
            </div>

            <div className="bg-[#080c06] border border-[#1e2e1a] p-6">
              <h3 className="text-[#c5f135] font-mono text-xs uppercase tracking-widest mb-4">
                Lista de Deseos
              </h3>
              {wishlist.length === 0 ? (
                <p className="text-[#8fa882] text-sm">
                  Tu lista de deseos está vacía.
                </p>
              ) : (
                wishlist.map(item => (
                  <div
                    key={item.id}
                    className="text-sm text-[#f0ede6] py-3 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-[#1e2e1a]" />
                    <span>{item.nombreProducto}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
