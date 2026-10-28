// Consultas a Supabase para la guía de especies botánicas y sus imágenes.

import { supabase } from '../supabase'
import type { EspecieBotanica } from '../types/database'

interface FilaPlanta {
  id: number
  slug: string | null
  nombre_comun: string
  nombre_cientifico: string | null
  descripcion: string
  origen: string | null
  clima: string | null
  floracion: string | null
  dificultad: string | null
  color: string | null
  riego: string | null
  luz: string | null
  temperatura: string | null
  cuidados: string | null
  imagenes_plantas: { imagen_url: string }[] | null
}

function construirListaCuidados(fila: FilaPlanta): string[] {
  if (fila.cuidados && fila.cuidados.includes('|')) {
    return fila.cuidados
      .split('|')
      .map(item => item.trim())
      .filter(Boolean)
  }

  const lista: string[] = []
  if (fila.riego) lista.push(fila.riego)
  if (fila.luz) lista.push(fila.luz)
  if (fila.temperatura) lista.push(fila.temperatura)
  if (fila.cuidados) lista.push(fila.cuidados)
  return lista
}

export async function obtenerEspeciesBotanicas(): Promise<EspecieBotanica[]> {
  const { data, error } = await supabase
    .from('plantas')
    .select(
      'id, slug, nombre_comun, nombre_cientifico, descripcion, origen, clima, floracion, dificultad, color, riego, luz, temperatura, cuidados, imagenes_plantas(imagen_url)'
    )
    .order('id', { ascending: true })

  if (error) {
    throw new Error('No se pudieron cargar las fichas botánicas desde Supabase.')
  }

  const filas = (data ?? []) as unknown as FilaPlanta[]

  return filas.map(fila => ({
    id: fila.slug ?? String(fila.id),
    dbId: fila.id,
    name: fila.nombre_comun,
    scientific: fila.nombre_cientifico ?? '',
    origin: fila.origen ?? 'No especificado',
    climate: fila.clima ?? 'Templado',
    bloom: fila.floracion ?? 'Anual',
    difficulty: fila.dificultad ?? 'Media',
    img:
      fila.imagenes_plantas?.[0]?.imagen_url ??
      'https://images.unsplash.com/photo-1612351641432-20a0f196086c?w=900&h=1100&fit=crop&auto=format',
    description: fila.descripcion,
    care: construirListaCuidados(fila),
    color: fila.color ?? '#c5f135',
  }))
}
