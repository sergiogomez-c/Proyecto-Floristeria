// Página del Foro Verde. Carga categorías, publicaciones y contadores reales desde Supabase,
// gestiona likes persistentes y sube fotos reales a Supabase Storage.

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import {
  alternarLikePublicacion,
  crearPublicacionConImagen,
  obtenerCategoriasForo,
  obtenerEstadisticasForo,
  obtenerPublicacionesForo,
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

  async function cargarDatosForo() {
    setLoading(true)
    setError(null)
    try {
      const [cats, pubs, estadisticas] = await Promise.all([
        obtenerCategoriasForo(),
        obtenerPublicacionesForo(user?.id ?? null),
        obtenerEstadisticasForo(),
      ])
      setCategories(cats)
      if (cats.length > 0 && selectedCatId === 0) {
        setSelectedCatId(cats[0].id)
      }
      setPosts(pubs)
      setStats(estadisticas)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar el contenido del foro.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatosForo()
  }, [user?.id])

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
      await cargarDatosForo()
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Error al subir la publicación.'
      )
    } finally {
      setUploading(false)
    }
  }

  const col1 = filtered.filter((_, i) => i % 3 === 0)
  const col2 = filtered.filter((_, i) => i % 3 === 1)
  const col3 = filtered.filter((_, i) => i % 3 === 2)

  return (
    <div className="min-h-screen bg-[#080c06]">
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
                className={`border-2 border-dashed transition-colors duration-200 flex flex-col items-center justify-center gap-3 cursor-pointer p-4 text-center ${
                  dragging
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

      {/* Category tabs */}
      <div className="border-y border-[#1e2e1a] flex overflow-x-auto">
        {tabNames.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`flex-shrink-0 font-mono text-xs tracking-widest uppercase px-6 py-4 border-r border-[#1e2e1a] transition-colors duration-150 ${
              activeTab === cat
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
}: {
  post: PublicacionForoVista
  liked: boolean
  onLike: () => void
}) {
  return (
    <div className="group bg-[#0f1a0c] overflow-hidden cursor-pointer hover:bg-[#111e0f] transition-colors duration-200">
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
          <span className="font-mono text-[9px] tracking-widest uppercase px-2 py-1 bg-[#080c06aa] text-[#c5f135]">
            {post.cat}
          </span>
        </div>
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
        <h3 className="font-display text-[#f0ede6] text-base font-medium leading-tight mb-3">
          {post.title}
        </h3>
        <div className="flex items-center gap-4">
          <button
            onClick={e => {
              e.stopPropagation()
              onLike()
            }}
            className={`flex items-center gap-1.5 font-mono text-[10px] tracking-widest transition-colors ${
              liked ? 'text-[#c5f135]' : 'text-[#8fa882] hover:text-[#c5f135]'
            }`}
          >
            <span>{liked ? '♥' : '♡'}</span>
            {post.likes}
          </button>
          <button className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-[#8fa882] hover:text-[#f0ede6] transition-colors">
            <span>◯</span>
            {post.comments}
          </button>
        </div>
      </div>
    </div>
  )
}
