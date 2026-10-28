// Consultas a Supabase para el catálogo de productos y categorías de la tienda.

import { supabase } from '../supabase'
import type { ProductoTienda } from '../types/database'

const formatoPrecio = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

interface FilaCategoria {
  id: number
  nombre: string
  slug: string
}

interface FilaProducto {
  id: number
  nombre: string
  descripcion: string
  precio: number | string
  stock: number
  activo: boolean
  imagen_url: string | null
  etiqueta: string | null
  destacado_grande: boolean
  categorias_productos: { nombre: string } | { nombre: string }[] | null
}

function extraerNombreCategoria(
  relacion: FilaProducto['categorias_productos']
): string {
  if (!relacion) return 'General'
  if (Array.isArray(relacion)) {
    return relacion[0]?.nombre ?? 'General'
  }
  return relacion.nombre
}

export async function obtenerCategoriasTienda(): Promise<string[]> {
  const { data, error } = await supabase
    .from('categorias_productos')
    .select('id, nombre, slug')
    .order('id', { ascending: true })

  if (error) {
    throw new Error('No se pudieron cargar las categorías de la tienda.')
  }

  const filas = (data ?? []) as FilaCategoria[]
  return ['Todo', ...filas.map(c => c.nombre)]
}

export async function obtenerProductosTienda(): Promise<ProductoTienda[]> {
  const { data, error } = await supabase
    .from('productos')
    .select(
      'id, nombre, descripcion, precio, stock, activo, imagen_url, etiqueta, destacado_grande, categorias_productos(nombre)'
    )
    .eq('activo', true)
    .order('id', { ascending: true })

  if (error) {
    throw new Error('No se pudo cargar el catálogo de productos.')
  }

  const filas = (data ?? []) as unknown as FilaProducto[]

  return filas.map(fila => {
    const precioNum = Number(fila.precio)
    return {
      id: fila.id,
      name: fila.nombre,
      cat: extraerNombreCategoria(fila.categorias_productos),
      priceNumeric: precioNum,
      priceFormatted: `${formatoPrecio.format(precioNum)} €`,
      stock: fila.stock,
      img:
        fila.imagen_url ??
        'https://images.unsplash.com/photo-1612351641432-20a0f196086c?w=600&h=750&fit=crop&auto=format',
      tag: fila.etiqueta,
      large: Boolean(fila.destacado_grande),
    }
  })
}
