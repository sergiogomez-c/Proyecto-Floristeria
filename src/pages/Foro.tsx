import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import {
  alternarLikePublicacion,
  crearPublicacionConImagen,
  obtenerCategoriasForo,
  obtenerEstadisticasForo,
  obtenerPublicacionesForo,
  eliminarPublicacion
} from '../services/foro'
import type { EstadisticasForo, PublicacionForoVista } from '../types/database'

interface CategoriaForoItem {
  id: number
  nombre: string
}

export default function Foro({ user, onOpenAuth }: { user: User | null, onOpenAuth: () => void }) {
  const [categories, setCategories] = useState<CategoriaForoItem[]>([])
  const [posts, setPosts] = useState<PublicacionForoVista[]>([])
  const [stats, setStats] = useState<EstadisticasForo>({ miembrosActivos: 0, totalPublicaciones: 0, totalLikes: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('Todo')
  
  // Estados de subida
  const [showUpload, setShowUpload] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [titleInput, setTitleInput] = useState('')
  const [descInput, setDescInput] = useState('') // <-- NUEVO ESTADO PARA DESCRIPCIÓN
  const [selectedCatId, setSelectedCatId] = useState<number>(0)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [likeInFlight, setLikeInFlight] = useState<Set<number>>(new Set())

  // Estado para la nueva vista de detalle tipo Feed
  const [activeFeedIndex, setActiveFeedIndex] = useState<number | null>(null)

  async function cargarDatosForo() {
    setLoading(true)
    setError(null)
    try {
      const cats = await obtenerCategoriasForo()
      setCategories(cats)
      if (cats.length > 0 && selectedCatId === 0) setSelectedCatId(cats[0].id)
    } catch (err) { console.error("Fallo categorías:", err) }

    try {
      const pubs = await obtenerPublicacionesForo(user?.id ?? null)
      const estadisticas = await obtenerEstadisticasForo()
      setPosts(pubs)
      setStats(estadisticas)
    } catch (err: any) {
      setError(`Error de base de datos: ${err.message || JSON.stringify(err)}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargarDatosForo() }, [user?.id])

  useEffect(() => {
    if (showUpload || activeFeedIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [showUpload, activeFeedIndex])

  const tabNames = ['Todo', ...categories.map(c => c.nombre)]
  const filtered = activeTab === 'Todo' ? posts : posts.filter(p => p.cat === activeTab)

  async function handleToggleLike(post: PublicacionForoVista) {
    if (!user) return onOpenAuth()
    if (likeInFlight.has(post.id)) return
    setLikeInFlight(prev => new Set(prev).add(post.id))
    
    const estabaMarcado = post.likedByMe
    const delta = estabaMarcado ? -1 : 1

    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likedByMe: !estabaMarcado, likes: p.likes + delta } : p))
    try {
      await alternarLikePublicacion(user.id, post.id, estabaMarcado)
    } catch {
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likedByMe: estabaMarcado, likes: p.likes - delta } : p))
    } finally {
      setLikeInFlight(prev => { const next = new Set(prev); next.delete(post.id); return next })
    }
  }

  async function handleDeletePost(post: PublicacionForoVista) {
    if (!window.confirm('¿Seguro que quieres borrar esta publicación?')) return;
    try {
      await eliminarPublicacion(post.id)
      setPosts(prev => prev.filter(p => p.id !== post.id))
      setStats(prev => ({ ...prev, totalPublicaciones: prev.totalPublicaciones - 1 }))
      if (activeFeedIndex !== null) setActiveFeedIndex(null) // Cierra el feed si borras desde ahí
    } catch (err) {
      alert("No se pudo borrar: " + (err as Error).message)
    }
  }

  async function handlePublish() {
    if (!user || uploading) return
    if (!selectedFile) return setUploadError('Selecciona una imagen.')
    if (!titleInput.trim()) return setUploadError('Escribe un título.')
    const catId = selectedCatId || categories[0]?.id
    if (!catId) return setUploadError('Selecciona categoría.')

    setUploading(true)
    setUploadError(null)
    try {
      await crearPublicacionConImagen({
        usuarioId: user.id,
        categoriaId: catId,
        titulo: titleInput,
        descripcion: descInput, // <-- ENVIAMOS LA DESCRIPCIÓN
        archivo: selectedFile,
      })
      setShowUpload(false)
      setSelectedFile(null)
      setTitleInput('')
      setDescInput('')
      await cargarDatosForo()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al subir.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080c06] relative">
      <div className="px-6 md:px-12 lg:px-20 pt-16 pb-12 md:pt-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="font-display text-[clamp(3rem,8vw,7rem)] font-black text-[#f0ede6] leading-[0.9]">El foro <span className="italic text-[#8fa882]">verde</span></h1>
        </div>
        <button onClick={() => user ? setShowUpload(true) : onOpenAuth()} className="px-8 py-4 bg-[#c5f135] text-[#080c06] font-mono text-sm tracking-widest uppercase font-medium hover:bg-[#d4ff40]">
          + Subir foto
        </button>
      </div>

      {/* MODAL DE SUBIDA ACTUALIZADO */}
      {showUpload && (
        <div className="fixed inset-0 bg-[#080c06cc] backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0f1a0c] border border-[#1e2e1a] w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between px-8 py-5 border-b border-[#1e2e1a]">
              <h2 className="font-display text-[#f0ede6] text-2xl font-bold">Subir foto</h2>
              <button onClick={() => setShowUpload(false)} className="text-[#8fa882] text-xl">✕</button>
            </div>
            <div className="p-8 space-y-5">
              {/* Zona drag and drop (igual que antes) */}
              <div className="border-2 border-dashed border-[#1e2e1a] flex flex-col items-center justify-center gap-3 p-4 h-32">
                <input type="file" accept="image/*" onChange={e => { if(e.target.files?.[0]) setSelectedFile(e.target.files[0]) }} />
              </div>
              <input type="text" value={titleInput} onChange={e => setTitleInput(e.target.value)} placeholder="Título del proyecto..." className="w-full bg-[#080c06] border border-[#1e2e1a] px-4 py-3 text-[#f0ede6]" />
              
              {/* NUEVO CAMPO DESCRIPCIÓN */}
              <textarea 
                value={descInput} 
                onChange={e => setDescInput(e.target.value)} 
                placeholder="Descripción (opcional)... Cuenta más detalles, cuidados, etc." 
                className="w-full bg-[#080c06] border border-[#1e2e1a] px-4 py-3 text-[#f0ede6] h-24 resize-none"
              />
              
              <select value={selectedCatId} onChange={e => setSelectedCatId(Number(e.target.value))} className="w-full bg-[#080c06] border border-[#1e2e1a] px-4 py-3 text-[#f0ede6]">
                <option value={0} disabled>Selecciona una categoría...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              {uploadError && <p className="text-red-400">{uploadError}</p>}
              <button onClick={handlePublish} className="w-full py-3 bg-[#c5f135] text-[#080c06] uppercase font-bold">{uploading ? 'Publicando...' : 'Publicar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* VISTA DE DETALLE / FEED INFINITO (EL BOCETO) */}
      {activeFeedIndex !== null && (
        <div className="fixed inset-0 bg-[#080c06] z-50 overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth">
          <button onClick={() => setActiveFeedIndex(null)} className="fixed top-6 right-6 z-[60] bg-[#1e2e1a] text-[#f0ede6] w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#c5f135] hover:text-[#080c06] transition-colors">
            ✕
          </button>
          
          <div className="max-w-7xl mx-auto pt-10 pb-32">
             {/* Renderizamos desde el índice seleccionado hacia adelante para que pueda scrollear abajo */}
             {filtered.slice(activeFeedIndex).map((post, idx) => (
                <div key={post.id} className="min-h-[90vh] flex items-center justify-center snap-start snap-always py-10 px-4">
                   <VistaDetallePublicacion 
                     post={post} 
                     user={user} 
                     onLike={() => handleToggleLike(post)} 
                     isOwner={user?.id === post.usuario_id}
                     onDelete={() => handleDeletePost(post)}
                     onRequireAuth={onOpenAuth}
                   />
                </div>
             ))}
             
             {activeFeedIndex >= filtered.length - 1 && (
               <div className="text-center py-20 text-[#8fa882] font-mono text-xs uppercase tracking-widest">
                 Has llegado al final
               </div>
             )}
          </div>
        </div>
      )}

      {/* Grid Principal */}
      <div className="px-6 md:px-12 lg:px-20 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((post, index) => (
            <div key={post.id} className="relative group cursor-pointer border border-[#1e2e1a]" onClick={() => setActiveFeedIndex(index)}>
               <img src={post.img} className="w-full aspect-square object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-4 transition-opacity">
                  <p className="text-[#f0ede6] font-bold">{post.title}</p>
                  <p className="text-[#c5f135] text-sm">👍 {post.likes} 💬 {post.comments}</p>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// COMPONENTE EXCLUSIVO PARA LA VISTA DETALLADA DEL BOCETO
function VistaDetallePublicacion({ post, user, onLike, isOwner, onDelete, onRequireAuth }: any) {
  function irAlPerfil() {
    alert(`Próximamente: Navegar al perfil de ${post.user}. Aquí validaremos si es privado.`);
  }

  return (
    <div className="w-full max-w-6xl bg-[#0f1a0c] border border-[#1e2e1a] flex flex-col md:flex-row gap-0 shadow-2xl relative">
      
      {/* IZQUIERDA: FOTO, BARRA Y DESCRIPCIÓN (70%) */}
      <div className="flex-1 flex flex-col border-r border-[#1e2e1a]">
         {/* La Foto */}
         <div className="bg-black w-full flex items-center justify-center h-[50vh] md:h-[65vh]">
            <img src={post.img} alt={post.title} className="max-w-full max-h-full object-contain" />
         </div>
         
         {/* Barra: Perfil, Titulo, Stats */}
         <div className="border-y border-[#1e2e1a] bg-[#152312] p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <button onClick={irAlPerfil} className="font-mono text-[#c5f135] text-sm tracking-widest uppercase hover:underline">
                 @{post.user}
               </button>
               <span className="text-[#8fa882]">|</span>
               <h3 className="font-display text-[#f0ede6] text-lg font-bold">{post.title}</h3>
            </div>
            
            <div className="flex items-center gap-6">
               <button onClick={(e) => { e.stopPropagation(); onLike(); }} className={`flex items-center gap-2 font-mono text-xs ${post.likedByMe ? 'text-[#c5f135]' : 'text-[#8fa882] hover:text-[#c5f135]'}`}>
                 <span className="text-lg">👍</span> {post.likes}
               </button>
               <div className="flex items-center gap-2 font-mono text-xs text-[#8fa882]">
                 <span className="text-lg">💬</span> {post.comments}
               </div>
               {isOwner && (
                 <button onClick={onDelete} className="text-red-500 hover:text-red-400 font-mono text-xs ml-4">BORRAR</button>
               )}
            </div>
         </div>

         {/* Descripción */}
         <div className="p-6 bg-[#0a100a] min-h-[120px]">
            {post.descripcion ? (
              <p className="font-body text-[#f0ede6] text-sm leading-relaxed whitespace-pre-wrap">{post.descripcion}</p>
            ) : (
              <p className="font-body text-[#3a4d36] text-sm italic">Sin descripción.</p>
            )}
         </div>
      </div>

      {/* DERECHA: COMENTARIOS INDEPENDIENTES (30%) */}
      <SeccionComentarios 
         postId={post.id} 
         user={user} 
         onRequireAuth={onRequireAuth}
      />
      
      {/* Flecha indicadora para el siguiente post */}
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-[#8fa882] animate-bounce flex flex-col items-center opacity-50">
         <span className="font-mono text-[10px] uppercase mb-1">Siguiente publicación</span>
         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
      </div>
    </div>
  )
}

// COMPONENTE AISLADO PARA COMENTARIOS (Arregla el bug de envío)
function SeccionComentarios({ postId, user, onRequireAuth, onCommentAdded }: any) {
  const [comentarios, setComentarios] = useState<any[]>([])
  const [nuevo, setNuevo] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Estados para el estilo Instagram
  const [respondiendoA, setRespondiendoA] = useState<{id: number, usuario: string} | null>(null)
  const [mostrarRespuestas, setMostrarRespuestas] = useState<Record<number, boolean>>({})

  async function fetchComentarios() {
    const { data } = await supabase
      .from('comentarios')
      .select('id, contenido, creado_en, respuesta_a_id, usuarios!usuario_id(nombre), likes_comentarios(usuario_id)')
      .eq('publicacion_id', postId)
      .order('creado_en', { ascending: true })

    if (data) {
      // 1. Procesar formato
      const procesados = data.map(c => ({
        id: c.id,
        contenido: c.contenido,
        respuesta_a_id: c.respuesta_a_id,
        usuario: Array.isArray(c.usuarios) ? c.usuarios[0]?.nombre || 'Usuario' : (c.usuarios as any)?.nombre || 'Usuario',
        likesCount: c.likes_comentarios?.length || 0,
        likedByMe: user ? c.likes_comentarios?.some((l:any) => l.usuario_id === user.id) : false,
        respuestas: [] as any[]
      }))

      // 2. Agrupar hilos (Padres e Hijos)
      const padres = procesados.filter(c => !c.respuesta_a_id)
      const hijos = procesados.filter(c => c.respuesta_a_id)

      padres.forEach(p => {
         p.respuestas = hijos.filter(h => h.respuesta_a_id === p.id)
      })

      setComentarios(padres)
    }
    setLoading(false)
  }

  useEffect(() => { fetchComentarios() }, [postId, user?.id])

  async function toggleLikeComentario(comentarioId: number, currentlyLiked: boolean) {
    if (!user) return onRequireAuth()

    // Truco visual rápido (Optimistic UI)
    const updateLikes = (lista: any[]): any[] => lista.map(c => {
      if (c.id === comentarioId) return { ...c, likedByMe: !currentlyLiked, likesCount: c.likesCount + (currentlyLiked ? -1 : 1) }
      if (c.respuestas) return { ...c, respuestas: updateLikes(c.respuestas) }
      return c
    })
    setComentarios(updateLikes(comentarios))

    // Base de datos
    if (currentlyLiked) {
      await supabase.from('likes_comentarios').delete().eq('comentario_id', comentarioId).eq('usuario_id', user.id)
    } else {
      await supabase.from('likes_comentarios').insert({ comentario_id: comentarioId, usuario_id: user.id })
    }
  }

  async function enviarComentario(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return onRequireAuth()
    if (!nuevo.trim()) return

    const textoGuardar = nuevo
    const idPadre = respondiendoA?.id || null // Si es respuesta, coge el ID del padre
    
    setNuevo('') 
    setRespondiendoA(null)

    const { data, error } = await supabase
      .from('comentarios')
      .insert({ publicacion_id: postId, usuario_id: user.id, contenido: textoGuardar, respuesta_a_id: idPadre })
      .select('id, contenido, respuesta_a_id, usuarios!usuario_id(nombre)')
      .single()

    if (!error && data) {
      // Forzar recarga para que se ponga en su sitio exacto del hilo
      await fetchComentarios() 
      if (onCommentAdded) onCommentAdded() // <- ¡ESTO ACTUALIZA EL CONTADOR DE FUERA!
      if (idPadre) setMostrarRespuestas(prev => ({ ...prev, [idPadre]: true })) // Abre el hilo si respondes
    } else {
      alert("Error de Supabase: " + (error?.message || "Desconocido"))
    }
  }

  // Sub-componente para pintar un comentario (sirve para padres y respuestas)
  const PintarComentario = ({ c, esRespuesta = false }: any) => (
    <div className={`group ${esRespuesta ? 'mt-3' : 'mt-4'}`}>
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <p className="font-mono text-[#c5f135] text-[10px] uppercase inline-block mr-2">{c.usuario}</p>
          <span className="font-body text-[#f0ede6] text-sm break-words">{c.contenido}</span>
          
          <div className="flex items-center gap-4 mt-1 opacity-80">
            <button onClick={() => setRespondiendoA({id: esRespuesta ? c.respuesta_a_id : c.id, usuario: c.usuario})} className="text-[#8fa882] hover:text-white text-[10px] uppercase font-bold transition-colors">
              Responder
            </button>
            {c.likesCount > 0 && <span className="text-[#8fa882] text-[10px]">{c.likesCount} {c.likesCount === 1 ? 'Me gusta' : 'Me gustas'}</span>}
          </div>
        </div>

        {/* Botón de Like (Corazón) */}
        <button onClick={() => toggleLikeComentario(c.id, c.likedByMe)} className={`text-xs p-1 transition-transform active:scale-150 ${c.likedByMe ? 'text-red-500' : 'text-[#8fa882] hover:text-red-400'}`}>
           {c.likedByMe ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Desplegable de respuestas (solo se pinta si es un comentario padre y tiene respuestas) */}
      {!esRespuesta && c.respuestas?.length > 0 && (
         <div className="mt-2 ml-4 border-l border-[#1e2e1a] pl-4">
           <button onClick={() => setMostrarRespuestas(prev => ({...prev, [c.id]: !prev[c.id]}))} className="text-[#8fa882] hover:text-white text-[10px] flex items-center gap-2 font-mono transition-colors">
             <span className="w-4 h-[1px] bg-[#3a4d36]"></span>
             {mostrarRespuestas[c.id] ? 'Ocultar respuestas' : `Ver respuestas (${c.respuestas.length})`}
           </button>
           
           {/* Pintamos las respuestas de forma recursiva */}
           {mostrarRespuestas[c.id] && c.respuestas.map((r: any) => (
              <PintarComentario key={r.id} c={r} esRespuesta={true} />
           ))}
         </div>
      )}
    </div>
  )

  return (
    <div className="w-full md:w-[380px] h-[50vh] md:h-auto flex flex-col bg-[#080c06]">
      <div className="p-4 border-b border-[#1e2e1a] shrink-0">
         <h4 className="font-mono text-[#c5f135] text-xs tracking-widest uppercase">Comentarios</h4>
      </div>
      
      {/* ZONA DE SCROLL */}
      <div className="flex-1 overflow-y-auto p-4 border-b border-[#1e2e1a]">
        {loading ? <p className="text-[#3a4d36] text-xs font-mono">Cargando...</p> : comentarios.length === 0 ? <p className="text-[#3a4d36] text-xs font-mono">Sé el primero en comentar.</p> : (
          comentarios.map(c => <PintarComentario key={c.id} c={c} />)
        )}
      </div>

      {/* AVISO DE A QUIÉN RESPONDES */}
      {respondiendoA && (
        <div className="px-4 py-2 bg-[#0f1a0c] flex justify-between items-center border-b border-[#1e2e1a]">
          <span className="text-[10px] text-[#8fa882] font-mono">Respondiendo a <strong className="text-[#c5f135]">{respondiendoA.usuario}</strong></span>
          <button onClick={() => setRespondiendoA(null)} className="text-white text-xs">✕</button>
        </div>
      )}

      <form onSubmit={enviarComentario} className="shrink-0 p-4 flex gap-2">
        <input type="text" value={nuevo} onChange={e => setNuevo(e.target.value)} placeholder="Añade un comentario..." className="flex-1 bg-[#0f1a0c] border border-[#1e2e1a] text-sm text-[#f0ede6] px-3 py-2 focus:outline-none focus:border-[#c5f135]" />
        <button type="submit" disabled={!nuevo.trim()} className="bg-[#c5f135] text-[#080c06] px-4 font-mono text-[10px] font-bold uppercase disabled:opacity-50 transition-opacity">Enviar</button>
      </form>
    </div>
  )
}