// Gestión del carrito en Supabase tanto para usuarios autenticados como para visitantes sin cuenta.
// localStorage solo almacena el token UUID de sesión del visitante (nunca los artículos definitivos).

import { supabase } from '../supabase'

const GUEST_TOKEN_KEY = 'deepintheflower-cart-session'
const LEGACY_CART_KEY = 'deepintheflower-cart'

interface FilaItemCarrito {
  producto_id: number
  cantidad: number
}

function generarUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
    const random = (Math.random() * 16) | 0
    const value = char === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

export function obtenerTokenVisitante(): string {
  try {
    const actual = localStorage.getItem(GUEST_TOKEN_KEY)
    if (actual && /^[0-9a-f-]{36}$/i.test(actual)) {
      return actual
    }
    const nuevo = generarUUID()
    localStorage.setItem(GUEST_TOKEN_KEY, nuevo)
    return nuevo
  } catch {
    return generarUUID()
  }
}

function expandirCantidadesAIds(filas: FilaItemCarrito[]): number[] {
  const resultado: number[] = []
  for (const fila of filas) {
    for (let i = 0; i < fila.cantidad; i++) {
      resultado.push(fila.producto_id)
    }
  }
  return resultado
}

async function migrarCarritoAntiguoLocalStorage(
  usuarioId: string | null
): Promise<void> {
  try {
    const raw = localStorage.getItem(LEGACY_CART_KEY)
    if (!raw) return
    localStorage.removeItem(LEGACY_CART_KEY)

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return

    const conteo = new Map<number, number>()
    for (const item of parsed) {
      if (typeof item === 'number' && Number.isInteger(item) && item > 0) {
        conteo.set(item, (conteo.get(item) ?? 0) + 1)
      }
    }

    for (const [productoId, cantidad] of conteo.entries()) {
      await guardarCantidadProductoCarrito(usuarioId, productoId, cantidad)
    }
  } catch {
    // Si localStorage falla o el formato antiguo era inválido, se ignora de forma segura.
  }
}

async function obtenerOCrearCarritoUsuario(usuarioId: string): Promise<number> {
  const { data: existente, error: errorBusqueda } = await supabase
    .from('carritos')
    .select('id')
    .eq('usuario_id', usuarioId)
    .maybeSingle()

  if (errorBusqueda) {
    throw new Error('No se pudo verificar el carrito del usuario.')
  }

  if (existente?.id) {
    return existente.id as number
  }

  const { data: creado, error: errorCreacion } = await supabase
    .from('carritos')
    .insert({ usuario_id: usuarioId })
    .select('id')
    .single()

  if (errorCreacion || !creado) {
    throw new Error('No se pudo inicializar el carrito del usuario.')
  }

  return creado.id as number
}

export async function cargarCarritoDesdeSupabase(
  usuarioId: string | null
): Promise<number[]> {
  await migrarCarritoAntiguoLocalStorage(usuarioId)

  if (usuarioId) {
    const tokenVisitante = localStorage.getItem(GUEST_TOKEN_KEY)
    if (tokenVisitante && /^[0-9a-f-]{36}$/i.test(tokenVisitante)) {
      await supabase.rpc('migrar_carrito_visitante_a_usuario', {
        p_token: tokenVisitante,
      })
    }

    const { data: carrito } = await supabase
      .from('carritos')
      .select('id')
      .eq('usuario_id', usuarioId)
      .maybeSingle()

    if (!carrito?.id) return []

    const { data: items, error } = await supabase
      .from('items_carrito')
      .select('producto_id, cantidad')
      .eq('carrito_id', carrito.id)
      .order('id', { ascending: true })

    if (error) {
      throw new Error('Error al leer los productos de tu cesta.')
    }

    return expandirCantidadesAIds((items ?? []) as FilaItemCarrito[])
  }

  const token = obtenerTokenVisitante()
  const { data, error } = await supabase.rpc('obtener_carrito_visitante', {
    p_token: token,
  })

  if (error) {
    throw new Error('Error al recuperar la cesta de visitante.')
  }

  return expandirCantidadesAIds((data ?? []) as FilaItemCarrito[])
}

export async function guardarCantidadProductoCarrito(
  usuarioId: string | null,
  productoId: number,
  nuevaCantidad: number
): Promise<void> {
  if (usuarioId) {
    const carritoId = await obtenerOCrearCarritoUsuario(usuarioId)

    if (nuevaCantidad <= 0) {
      const { error } = await supabase
        .from('items_carrito')
        .delete()
        .eq('carrito_id', carritoId)
        .eq('producto_id', productoId)

      if (error) throw new Error('No se pudo quitar el producto de la cesta.')
      return
    }

    const { error } = await supabase.from('items_carrito').upsert(
      {
        carrito_id: carritoId,
        producto_id: productoId,
        cantidad: nuevaCantidad,
      },
      { onConflict: 'carrito_id,producto_id' }
    )

    if (error) throw new Error('No se pudo actualizar la cantidad en la cesta.')
    return
  }

  const token = obtenerTokenVisitante()
  const { error } = await supabase.rpc('actualizar_item_carrito_visitante', {
    p_token: token,
    p_producto_id: productoId,
    p_cantidad: nuevaCantidad,
  })

  if (error) {
    throw new Error('No se pudo guardar el producto en la cesta.')
  }
}

export async function vaciarCarritoEnSupabase(
  usuarioId: string | null
): Promise<void> {
  if (usuarioId) {
    const { data: carrito } = await supabase
      .from('carritos')
      .select('id')
      .eq('usuario_id', usuarioId)
      .maybeSingle()

    if (!carrito?.id) return

    const { error } = await supabase
      .from('items_carrito')
      .delete()
      .eq('carrito_id', carrito.id)

    if (error) throw new Error('No se pudo vaciar la cesta.')
    return
  }

  const token = obtenerTokenVisitante()
  const { error } = await supabase.rpc('vaciar_carrito_visitante', {
    p_token: token,
  })

  if (error) {
    throw new Error('No se pudo vaciar la cesta.')
  }
}
