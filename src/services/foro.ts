// Consultas y escrituras para el Foro: categorías, publicaciones, subida de imágenes
// a Supabase Storage, likes sin duplicados y contadores reales.

import { supabase } from '../supabase'
import type { EstadisticasForo, PublicacionForoVista } from '../types/database'

interface FilaCategoriaForo {
  id: number
  nombre: string
}

interface FilaPublicacion {
  id: number
  usuario_id: string | null
  categoria_id: number
  titulo: string
  creado_en: string
  autor_handle: string | null
  autor_nombre: string | null
  formato_alto: boolean | null
  likes_base: number | null
  comentarios_base: number | null
  categorias_foro: { nombre: string } | { nombre: string }[] | null
  usuarios: { nombre: string; email: string } | { nombre: string; email: string }[] | null
  imagenes_publicacion: { imagen_url: string }[] | null
  me_gusta: { usuario_id: string }[] | null
  comentarios: { id: number }[] | null
}

function formatearTiempoRelativo(fechaISO: string): string {
  const fecha = new Date(fechaISO)
  const segundos = Math.max(1, Math.floor((Date.now() - fecha.getTime()) / 1000))

  if (segundos < 3600) {
    const minutos = Math.max(1, Math.floor(segundos / 60))
    return `hace ${minutos}m`
  }
  if (segundos < 86400) {
    const horas = Math.floor(segundos / 3600)
    return `hace ${horas}h`
  }
  const dias = Math.floor(segundos / 86400)
  return `hace ${dias}d`
}

export async function obtenerCategoriasForo(): Promise<FilaCategoriaForo[]> {
  const { data, error } = await supabase
    .from('categorias_foro')
    .select('id, nombre')
    .order('id', { ascending: true })

  if (error) {
    throw new Error('No se pudieron cargar las categorías del foro.')
  }

  return (data ?? []) as FilaCategoriaForo[]
}

export async function obtenerPublicacionesForo(
  usuarioActualId: string | null
): Promise<PublicacionForoVista[]> {
  const { data, error } = await supabase
    .from('publicaciones_foro')
    .select(
      `
      id,
      usuario_id,
      categoria_id,
      titulo,
      creado_en,
      autor_handle,
      autor_nombre,
      formato_alto,
      likes_base,
      comentarios_base,
      categorias_foro(nombre),
      usuarios(nombre, email),
      imagenes_publicacion(imagen_url),
      me_gusta(usuario_id),
      comentarios(id)
    `
    )
    .eq('estado', 'publicada')
    .order('creado_en', { ascending: false })

  if (error) {
    throw new Error('No se pudieron cargar las publicaciones del foro.')
  }

  const filas = (data ?? []) as unknown as FilaPublicacion[]

  return filas.map(fila => {
    const catRel = Array.isArray(fila.categorias_foro)
      ? fila.categorias_foro[0]
      : fila.categorias_foro
    const usrRel = Array.isArray(fila.usuarios) ? fila.usuarios[0] : fila.usuarios

    const nombreAutor =
      fila.autor_nombre ||
      usrRel?.nombre ||
      (usrRel?.email ? usrRel.email.split('@')[0] : 'Comunidad')

    const handleAutor =
      fila.autor_handle ||
      `@${nombreAutor.toLowerCase().replace(/\s+/g, '.')}`

    const listaLikes = fila.me_gusta ?? []
    const likedByMe = Boolean(
      usuarioActualId && listaLikes.some(l => l.usuario_id === usuarioActualId)
    )

    return {
      id: fila.id,
      user: handleAutor.startsWith('@') ? handleAutor : `@${handleAutor}`,
      name: nombreAutor,
      cat: catRel?.nombre ?? 'Mis plantas',
      title: fila.titulo,
      img:
        fila.imagenes_publicacion?.[0]?.imagen_url ??
        'https://images.unsplash.com/photo-1598559213718-da4a925fbf71?w=500&h=650&fit=crop&auto=format',
      likes: (fila.likes_base ?? 0) + listaLikes.length,
      comments: (fila.comentarios_base ?? 0) + (fila.comentarios?.length ?? 0),
      time: formatearTiempoRelativo(fila.creado_en),
      tall: Boolean(fila.formato_alto),
      likedByMe,
    }
  })
}

export async function obtenerEstadisticasForo(): Promise<EstadisticasForo> {
  const { data, error } = await supabase.rpc('obtener_estadisticas_foro')

  if (error || !Array.isArray(data) || data.length === 0) {
    throw new Error('No se pudieron cargar las estadísticas de la comunidad.')
  }

  const fila = data[0] as {
    miembros_activos: number
    total_publicaciones: number
    total_likes: number
  }

  return {
    miembrosActivos: Number(fila.miembros_activos ?? 0),
    totalPublicaciones: Number(fila.total_publicaciones ?? 0),
    totalLikes: Number(fila.total_likes ?? 0),
  }
}

export async function crearPublicacionConImagen(params: {
  usuarioId: string
  categoriaId: number
  titulo: string
  archivo: File
}): Promise<void> {
  const extension = params.archivo.name.split('.').pop()?.toLowerCase() || 'jpg'
  const nombreSeguro = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`
  const rutaStorage = `${params.usuarioId}/${nombreSeguro}`

  const { error: errorSubida } = await supabase.storage
    .from('foro-imagenes')
    .upload(rutaStorage, params.archivo, {
      cacheControl: '3600',
      upsert: false,
    })

  if (errorSubida) {
    throw new Error('No se pudo subir la imagen a Supabase Storage.')
  }

  const { data: urlData } = supabase.storage
    .from('foro-imagenes')
    .getPublicUrl(rutaStorage)

  // Obtener el nombre de perfil del usuario para guardarlo en la publicación
  const { data: perfil } = await supabase
    .from('usuarios')
    .select('nombre, email')
    .eq('id', params.usuarioId)
    .maybeSingle()

  const nombreVisible =
    perfil?.nombre?.trim() || perfil?.email?.split('@')[0] || 'Usuario'
  const handleVisible = `@${nombreVisible.toLowerCase().replace(/\s+/g, '.')}`

  const { data: publicacionCreada, error: errorPub } = await supabase
    .from('publicaciones_foro')
    .insert({
      usuario_id: params.usuarioId,
      categoria_id: params.categoriaId,
      titulo: params.titulo.trim(),
      contenido: params.titulo.trim(),
      estado: 'publicada',
      autor_nombre: nombreVisible,
      autor_handle: handleVisible,
      formato_alto: false,
      likes_base: 0,
      comentarios_base: 0,
    })
    .select('id')
    .single()

  if (errorPub || !publicacionCreada) {
    throw new Error('No se pudo registrar la publicación en la base de datos.')
  }

  const { error: errorImg } = await supabase.from('imagenes_publicacion').insert({
    publicacion_id: publicacionCreada.id,
    imagen_url: urlData.publicUrl,
    texto_alternativo: params.titulo.trim(),
  })

  if (errorImg) {
    throw new Error('La publicación se creó, pero falló el registro de su imagen.')
  }
}

export async function alternarLikePublicacion(
  usuarioId: string,
  publicacionId: number,
  yaTieneLike: boolean
): Promise<void> {
  if (yaTieneLike) {
    const { error } = await supabase
      .from('me_gusta')
      .delete()
      .eq('usuario_id', usuarioId)
      .eq('publicacion_id', publicacionId)

    if (error) throw new Error('No se pudo retirar el me gusta.')
    return
  }

  const { error } = await supabase.from('me_gusta').upsert(
    {
      usuario_id: usuarioId,
      publicacion_id: publicacionId,
    },
    { onConflict: 'usuario_id,publicacion_id' }
  )

  if (error) {
    throw new Error('No se pudo registrar el me gusta.')
  }
}
