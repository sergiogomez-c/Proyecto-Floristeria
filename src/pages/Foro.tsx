// Página del Foro Verde. Carga categorías, publicaciones y contadores reales desde Supabase,
// gestiona likes persistentes (pulgar arriba) y sube fotos reales a Supabase Storage.
// Incluye sistema funcional de comentarios conectados a la tabla 'comentarios'.

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import {
  alternarLikePublicacion,
  crearPublicacionConImagen,
  obtenerCategoriasForo,
  obtenerEstadisticasForo,
  obtenerPublicacionesForo,
  eliminarPublicacion,
} from '../services/foro'
import type { EstadisticasForo, PublicacionForoVista } from '../types/database'

interface CategoriaForoItem {
  id: number
  nombre: string
}

export default function Foro({
  user,
  onOpenAuth,
}: {
  user: User | null
  onOpenAuth: () => void
}) {
  const [categories, setCategories] = useState<CategoriaForoItem[]>([])
  const [posts, setPosts] = useState<PublicacionForoVista[]>([])
  const [stats, setStats] = useState<EstadisticasForo>({
    miembrosActivos: 0,
    totalPublicaciones: 0,
    totalLikes: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState('Todo')
  const [showUpload, setShowUpload] = useState(false)
  const [dragging, setDragging] = useState(false)

  // Estados del formulario de subida
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [titleInput, setTitleInput] = useState('')
  const [selectedCatId, setSelectedCatId] = useState<number>(0)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [likeInFlight, setLikeInFlight] = useState<Set<number>>(new Set())

  // Estados para los comentarios
  const [activePostForComments, setActivePostForComments] = useState<PublicacionForoVista | null>(null)
  const [comentarios, setComentarios] = useState<{ id: number, texto: string, usuario: string, fecha: string }[]>([])
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [loadingComentarios, setLoadingComentarios] = useState(false)

  async function cargarDatosForo() {
    setLoading(true)
    setError(null)
    try {
      const cats = await obtenerCategoriasForo()
      setCategories(cats)
      if (cats.length > 0 && selectedCatId === 0) {
        setSelectedCatId(cats[0].id)
      }
    } catch (err) {
      console.error("Fallo al cargar categorías:", err)
    }

    try {
      const pubs = await obtenerPublicacionesForo(user?.id ?? null)
      const estadisticas = await obtenerEstadisticasForo()

      setPosts(pubs)
      setStats(estadisticas)
    } catch (err: any) {
      console.error("Error detallado de Supabase:", err);
      setError(`Error de base de datos: ${err.message || JSON.stringify(err)}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatosForo()
  }, [user?.id])

  useEffect(() => {
    if (showUpload || activePostForComments) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [showUpload, activePostForComments])

  const tabNames = ['Todo', ...categories.map(c => c.nombre)]
  const filtered =
    activeTab === 'Todo' ? posts : posts.filter(p => p.cat === activeTab)

  async function handleToggleLike(post: PublicacionForoVista) {
    if (!user) {
      onOpenAuth()
      return
    }
    if (likeInFlight.has(post.id)) return

    setLikeInFlight(prev => new Set(prev).add(post.id))
    const estabaMarcado = post.likedByMe
    const delta = estabaMarcado ? -1 : 1

    setPosts(prev =>
      prev.map(p =>
        p.id === post.id
          ? { ...p, likedByMe: !estabaMarcado, likes: p.likes + delta }
          : p
      )
    )
    setStats(prev => ({ ...prev, totalLikes: prev.totalLikes + delta }))

    try {
      await alternarLikePublicacion(user.id, post.id, estabaMarcado)
    } catch {
      // Revertir en caso de error
      setPosts(prev =>
        prev.map(p =>
          p.id === post.id
            ? { ...p, likedByMe: estabaMarcado, likes: p.likes - delta }
            : p
        )
      )
      setStats(prev => ({ ...prev, totalLikes: prev.totalLikes - delta }))
    } finally {
      setLikeInFlight(prev => {
        const next = new Set(prev)
        next.delete(post.id)
        return next
      })
    }
  }

  async function handleDeletePost(post: PublicacionForoVista) {
    if (!window.confirm('¿Seguro que quieres borrar esta publicación? Esta acción no se puede deshacer.')) return;
    
    try {
      await eliminarPublicacion(post.id)
      // Lo quitamos de la pantalla al instante
      setPosts(prev => prev.filter(p => p.id !== post.id))
      setStats(prev => ({ ...prev, totalPublicaciones: prev.totalPublicaciones - 1 }))
    } catch (err) {
      alert("No se pudo borrar: " + (err as Error).message)
    }
  }

  function handleOpenUpload() {
    if (!user) {
      onOpenAuth()
      return
    }
    setUploadError(null)
    setShowUpload(true)
  }

  async function handlePublish() {
    if (!user || uploading) return
    if (!selectedFile) {
      setUploadError('Selecciona una imagen para publicar.')
      return
    }
    if (!titleInput.trim()) {
      setUploadError('Escribe un título para describir tu proyecto.')
      return
    }
    const catId = selectedCatId || categories[0]?.id
    if (!catId) {
      setUploadError('Selecciona una categoría válida.')
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      await crearPublicacionConImagen({
        usuarioId: user.id,
        categoriaId: catId,
        titulo: titleInput,
        archivo: selectedFile,
      })
      setShowUpload(false)
      setSelectedFile(null)
      setTitleInput('')
      await cargarDatosForo() // Recargamos para ver el post nuevo
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Error al subir la publicación.'
      )
    } finally {
      setUploading(false)
    }
  }

  // --- LÓGICA DE COMENTARIOS ---
  async function abrirComentarios(post: PublicacionForoVista) {
    if (!user) {
      onOpenAuth()
      return
    }
    setActivePostForComments(post)
    setLoadingComentarios(true)
    setComentarios([])

    // Cargar comentarios reales de Supabase
    const { data, error } = await supabase
      .from('comentarios')
      .select('id, texto, creado_en, usuarios(nombre)')
      .eq('publicacion_id', post.id)
      .order('creado_en', { ascending: true })

    if (!error && data) {
      setComentarios(data.map(c => ({
        id: c.id,
        texto: c.texto,
        usuario: Array.isArray(c.usuarios) ? c.usuarios[0]?.nombre || 'Usuario' : (c.usuarios as any)?.nombre || 'Usuario',
        fecha: new Date(c.creado_en).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
      })))
    }
    setLoadingComentarios(false)
  }

  async function enviarComentario(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !activePostForComments || !nuevoComentario.trim()) return

    const textoGuardar = nuevoComentario
    setNuevoComentario('') // Limpiar input rápido para UX

    const { data, error } = await supabase
      .from('comentarios')
      .insert({
        publicacion_id: activePostForComments.id,
        usuario_id: user.id,
        texto: textoGuardar
      })
      .select('id, texto, creado_en, usuarios(nombre)')
      .single()

    if (!error && data) {
      // Actualizamos la lista local del modal
      setComentarios(prev => [...prev, {
        id: data.id,
        texto: data.texto,
        usuario: Array.isArray(data.usuarios) ? data.usuarios[0]?.nombre || 'Yo' : (data.usuarios as any)?.nombre || 'Yo',
        fecha: 'Ahora mismo'
      }])

      // Actualizamos el contador visual en el muro principal
      setPosts(prev => prev.map(p =>
        p.id === activePostForComments.id ? { ...p, comments: p.comments + 1 } : p
      ))
    }
  }

  const col1 = filtered.filter((_, i) => i % 3 === 0)
  const col2 = filtered.filter((_, i) => i % 3 === 1)
  const col3 = filtered.filter((_, i) => i % 3 === 2)

  return (
    <div className="min-h-screen bg-[#080c06] relative">
      {/* Header */}
      <div className="px-6 md:px-12 lg:px-20 pt-16 pb-12 md:pt-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <p className="font-mono text-[#c5f135] text-xs tracking-[0.3em] uppercase mb-4">
            Comunidad botánica
          </p>
          <h1 className="font-display text-[clamp(3rem,8vw,7rem)] font-black text-[#f0ede6] leading-[0.9]">
            El foro
            <br />
            <span className="italic text-[#8fa882]">verde</span>
          </h1>
          <p className="mt-4 font-body text-[#8fa882] max-w-md leading-relaxed">
            Comparte tu proyecto. Inspira a otros apasionados por las plantas.
          </p>
        </div>
        <button
          onClick={handleOpenUpload}
          className="flex-shrink-0 flex items-center gap-3 px-8 py-4 bg-[#c5f135] text-[#080c06] font-mono text-sm tracking-widest uppercase font-medium hover:bg-[#d4ff40] transition-colors"
        >
          <span className="text-lg">+</span> Subir foto
        </button>
      </div>

      {/* Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-[#080c06cc] backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0f1a0c] border border-[#1e2e1a] w-full max-w-lg">
            <div className="flex items-center justify-between px-8 py-5 border-b border-[#1e2e1a]">
              <h2 className="font-display text-[#f0ede6] text-2xl font-bold">
                Subir foto
              </h2>
              <button
                onClick={() => setShowUpload(false)}
                disabled={uploading}
                className="font-mono text-[#8fa882] hover:text-[#f0ede6] text-xl"
              >
                ✕
              </button>
            </div>
            <div className="p-8 space-y-5">
              <div
                className={`border-2 border-dashed transition-colors duration-200 flex flex-col items-center justify-center gap-3 cursor-pointer p-4 text-center ${dragging
                  ? 'border-[#c5f135] bg-[#c5f13510]'
                  : 'border-[#1e2e1a] hover:border-[#3a4d36]'
                  }`}
                style={{ height: '200px' }}
                onDragOver={e => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => {
                  e.preventDefault()
                  setDragging(false)
                  const file = e.dataTransfer.files?.[0]
                  if (file && file.type.startsWith('image/')) {
                    setSelectedFile(file)
                  }
                }}
              >
                <span className="text-4xl text-[#3a4d36]">⊕</span>
                <p className="font-body text-[#8fa882] text-sm">
                  {selectedFile
                    ? `Archivo seleccionado: ${selectedFile.name}`
                    : 'Arrastra tu foto aquí o'}
                </p>
                <label className="font-mono text-xs tracking-widest uppercase text-[#c5f135] cursor-pointer hover:underline">
                  Seleccionar archivo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) setSelectedFile(file)
                    }}
                  />
                </label>
              </div>
              <div>
                <label className="font-mono text-[10px] tracking-widest uppercase text-[#8fa882] block mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={titleInput}
                  disabled={uploading}
                  onChange={e => setTitleInput(e.target.value)}
                  placeholder="Describe tu proyecto..."
                  className="w-full bg-[#080c06] border border-[#1e2e1a] px-4 py-3 text-[#f0ede6] font-body text-sm placeholder:text-[#3a4d36] focus:outline-none focus:border-[#c5f135] transition-colors"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] tracking-widest uppercase text-[#8fa882] block mb-2">
                  Categoría
                </label>
                <select
                  value={selectedCatId}
                  disabled={uploading}
                  onChange={e => setSelectedCatId(Number(e.target.value))}
                  className="w-full bg-[#080c06] border border-[#1e2e1a] px-4 py-3 text-[#f0ede6] font-body text-sm focus:outline-none focus:border-[#c5f135] transition-colors"
                >
                  <option value={0} disabled>Selecciona una categoría...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {uploadError && (
                <p className="border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
                  {uploadError}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpload(false)}
                  disabled={uploading}
                  className="flex-1 py-3 border border-[#1e2e1a] font-mono text-xs tracking-widest uppercase text-[#8fa882] hover:border-[#f0ede6] hover:text-[#f0ede6] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePublish}
                  disabled={uploading}
                  className="flex-1 py-3 bg-[#c5f135] text-[#080c06] font-mono text-xs tracking-widest uppercase font-medium hover:bg-[#d4ff40] transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Publicando...' : 'Publicar →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Comentarios */}
      {activePostForComments && (
        <div className="fixed inset-0 bg-[#080c06cc] backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0f1a0c] border border-[#1e2e1a] w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-8 py-5 border-b border-[#1e2e1a] shrink-0">
              <h2 className="font-display text-[#f0ede6] text-2xl font-bold">
                Comentarios
              </h2>
              <button
                onClick={() => setActivePostForComments(null)}
                className="font-mono text-[#8fa882] hover:text-[#f0ede6] text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-8 flex flex-col md:flex-row gap-8 overflow-hidden h-full">
              {/* Foto del post para dar contexto (Oculta en móvil muy pequeño) */}
              <div className="hidden md:block w-1/3 shrink-0">
                <img src={activePostForComments.img} alt="Post" className="w-full aspect-[4/5] object-cover border border-[#1e2e1a]" />
                <p className="mt-3 font-display text-[#f0ede6] text-lg leading-tight">{activePostForComments.title}</p>
                <p className="font-mono text-[#8fa882] text-[10px] mt-1 uppercase tracking-widest">De: {activePostForComments.user}</p>
              </div>

              <div className="flex-1 flex flex-col h-full min-h-[300px]">
                {/* Lista de comentarios */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-5 mb-4">
                  {loadingComentarios ? (
                    <p className="text-center font-mono text-[#8fa882] text-xs py-10 uppercase tracking-widest">Cargando debate...</p>
                  ) : comentarios.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-10">
                      <p className="font-display text-[#8fa882] text-xl italic mb-2">Sé el primero en comentar</p>
                      <p className="font-mono text-[#3a4d36] text-[10px] uppercase tracking-widest">Rompe el hielo botánico</p>
                    </div>
                  ) : (
                    comentarios.map(c => (
                      <div key={c.id} className="bg-[#080c06] p-4 border border-[#1e2e1a]">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-mono text-[#c5f135] text-[10px] tracking-widest uppercase">{c.usuario}</span>
                          <span className="font-mono text-[#3a4d36] text-[10px]">{c.fecha}</span>
                        </div>
                        <p className="font-body text-[#f0ede6] text-sm">{c.texto}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Formulario para comentar */}
                <form onSubmit={enviarComentario} className="shrink-0 flex gap-3 pt-4 border-t border-[#1e2e1a]">
                  <input
                    type="text"
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    placeholder="Escribe tu comentario..."
                    className="flex-1 bg-[#080c06] border border-[#1e2e1a] px-4 py-3 text-[#f0ede6] font-body text-sm focus:outline-none focus:border-[#c5f135]"
                  />
                  <button
                    type="submit"
                    disabled={!nuevoComentario.trim()}
                    className="bg-[#c5f135] text-[#080c06] px-6 font-mono text-xs uppercase tracking-widest font-bold hover:bg-[#d4ff40] disabled:opacity-50 transition-colors"
                  >
                    Enviar
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="border-y border-[#1e2e1a] flex overflow-x-auto">
        {tabNames.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`flex-shrink-0 font-mono text-xs tracking-widest uppercase px-6 py-4 border-r border-[#1e2e1a] transition-colors duration-150 ${activeTab === cat
              ? 'bg-[#c5f135] text-[#080c06]'
              : 'text-[#8fa882] hover:text-[#f0ede6]'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="px-6 md:px-12 lg:px-20 py-5 flex items-center gap-8 border-b border-[#1e2e1a] bg-[#0a100a]">
        {[
          [String(stats.miembrosActivos), 'miembros activos'],
          [String(stats.totalPublicaciones), 'publicaciones'],
          [String(stats.totalLikes), 'likes dados'],
        ].map(([val, label]) => (
          <div key={label} className="flex items-center gap-2">
            <span className="font-display text-[#c5f135] font-black text-lg">
              {val}
            </span>
            <span className="font-mono text-[#8fa882] text-[10px] tracking-widest uppercase hidden sm:block">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Masonry grid */}
      <div className="px-6 md:px-12 lg:px-20 py-12">
        {loading ? (
          <div className="py-32 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-[#8fa882]">
              Cargando publicaciones de la comunidad...
            </p>
          </div>
        ) : error ? (
          <div className="py-24 text-center max-w-md mx-auto">
            <p className="font-display text-[#f0ede6] text-2xl mb-3">
              No se pudo cargar el foro
            </p>
            <p className="font-body text-[#8fa882] text-sm mb-6">{error}</p>
            <button
              onClick={cargarDatosForo}
              className="font-mono text-xs tracking-widest uppercase px-6 py-3 bg-[#c5f135] text-[#080c06] hover:bg-[#d4ff40] transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 text-center">
            <p className="font-display text-[#8fa882] text-3xl italic">
              Sin publicaciones en esta categoría.
            </p>
          </div>
        ) : (
          <div className="hidden md:grid grid-cols-3 gap-4 items-start">
            {[col1, col2, col3].map((col, ci) => (
              <div key={ci} className="space-y-4">
                {col.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    liked={post.likedByMe}
                    onLike={() => handleToggleLike(post)}
                    onComment={() => abrirComentarios(post)}
                    isOwner={user?.id === post.usuario_id}
                    onDelete={() => handleDeletePost(post)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Mobile: single column */}
        {!loading && !error && (
          <div className="md:hidden space-y-4">
            {filtered.map(post => (
              <PostCard
                key={post.id}
                post={post}
                liked={post.likedByMe}
                onLike={() => handleToggleLike(post)}
                onComment={() => abrirComentarios(post)}
                isOwner={user?.id === post.usuario_id}
                onDelete={() => handleDeletePost(post)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PostCard({
  post,
  liked,
  onLike,
  onComment,
  isOwner,
  onDelete
}: {
  post: PublicacionForoVista
  liked: boolean
  onLike: () => void
  onComment: () => void
  isOwner: boolean
  onDelete: () => void
}) {
  return (
    <div className="group bg-[#0f1a0c] overflow-hidden hover:bg-[#111e0f] transition-colors duration-200 border border-[#1e2e1a]">
      <div
        className="overflow-hidden relative"
        style={{ aspectRatio: post.tall ? '3/4' : '4/3' }}
      >
        <img
          src={post.img}
          alt={post.title}
          className="w-full h-full object-cover opacity-75 group-hover:opacity-90 transition-all duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1a0c] via-transparent to-transparent opacity-80" />
        <div className="absolute top-3 left-3">
          <span className="font-mono text-[9px] tracking-widest uppercase px-2 py-1 bg-[#080c06aa] backdrop-blur text-[#c5f135]">
            {post.cat}
          </span>
        </div>
        {/* Botón de borrar (NUEVO) */}
        {isOwner && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="absolute top-3 right-3 p-2 bg-[#080c06aa] backdrop-blur rounded-full text-[#8fa882] hover:text-red-500 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
            title="Borrar publicación"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
            </svg>
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-[#1e2e1a] flex items-center justify-center">
            <span className="text-[#c5f135] text-[10px]">{post.name[0]}</span>
          </div>
          <span className="font-mono text-[#c5f135] text-[10px] tracking-widest">
            {post.user}
          </span>
          <span className="font-mono text-[#3a4d36] text-[10px] ml-auto">
            {post.time}
          </span>
        </div>
        <h3 className="font-display text-[#f0ede6] text-base font-medium leading-tight mb-4">
          {post.title}
        </h3>
        <div className="flex items-center gap-5">
          <button
            onClick={e => {
              e.stopPropagation()
              onLike()
            }}
            className={`flex items-center gap-1.5 font-mono text-[11px] tracking-widest transition-transform hover:scale-110 ${liked ? 'text-[#c5f135]' : 'text-[#8fa882] hover:text-[#c5f135]'
              }`}
          >
            <span className="text-sm">
              {/* Pulgar arriba SVG */}
              <svg aria-hidden="true" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
              </svg>
            </span>
            {post.likes}
          </button>

          <button
            onClick={e => {
              e.stopPropagation()
              onComment()
            }}
            className="flex items-center gap-1.5 font-mono text-[11px] tracking-widest text-[#8fa882] hover:text-[#f0ede6] transition-transform hover:scale-110"
          >
            <span className="text-sm">
              {/* Icono de Bocadillo de chat SVG */}
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </span>
            {post.comments}
          </button>
        </div>
      </div>
    </div>
  )
}