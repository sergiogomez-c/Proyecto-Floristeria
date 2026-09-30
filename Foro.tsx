import { useState } from 'react'

const CATEGORIES = ['Todo', 'Mis plantas', 'Jardines', 'Proyectos DIY', 'Flores cortadas']

const POSTS = [
  {
    id: 1, user: '@verde.urbano', name: 'Carlos M.', cat: 'Mis plantas',
    title: 'Mi monstera después de 3 años de cuidados',
    img: 'https://images.unsplash.com/photo-1598559213718-da4a925fbf71?w=500&h=650&fit=crop&auto=format',
    likes: 284, comments: 31, time: 'hace 2h', tall: true,
  },
  {
    id: 2, user: '@jardin.secreto', name: 'Laia F.',  cat: 'Jardines',
    title: 'Jardín vertical en el balcón de 6m²',
    img: 'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?w=500&h=400&fit=crop&auto=format',
    likes: 193, comments: 18, time: 'hace 5h', tall: false,
  },
  {
    id: 3, user: '@plantmom_bcn', name: 'Sara T.', cat: 'Flores cortadas',
    title: 'Primera floración de mi orquídea silvestre 🌸',
    img: 'https://images.unsplash.com/photo-1623183074617-90611646e4ca?w=500&h=620&fit=crop&auto=format',
    likes: 412, comments: 57, time: 'hace 8h', tall: true,
  },
  {
    id: 4, user: '@roots_bcn', name: 'Tomàs R.', cat: 'Proyectos DIY',
    title: 'Macetero de cemento hecho en casa',
    img: 'https://images.unsplash.com/photo-1551970634-747846a548cb?w=500&h=450&fit=crop&auto=format',
    likes: 167, comments: 22, time: 'hace 1d', tall: false,
  },
  {
    id: 5, user: '@botanica.mia', name: 'Ana S.', cat: 'Mis plantas',
    title: 'Propagación de suculentas: 6 meses de proceso',
    img: 'https://images.unsplash.com/photo-1521706862577-47b053587f91?w=500&h=680&fit=crop&auto=format',
    likes: 338, comments: 44, time: 'hace 2d', tall: true,
  },
  {
    id: 6, user: '@campo_viu', name: 'Jordi P.', cat: 'Jardines',
    title: 'Remodelación completa del jardín trasero',
    img: 'https://images.unsplash.com/photo-1525923838299-2312b60f6d69?w=500&h=400&fit=crop&auto=format',
    likes: 220, comments: 29, time: 'hace 3d', tall: false,
  },
  {
    id: 7, user: '@flor_silv', name: 'Marta C.', cat: 'Flores cortadas',
    title: 'Composición de peonías para boda íntima',
    img: 'https://images.unsplash.com/photo-1520179737749-b7752f6f56fb?w=500&h=650&fit=crop&auto=format',
    likes: 509, comments: 63, time: 'hace 4d', tall: true,
  },
  {
    id: 8, user: '@lavanda_field', name: 'Núria A.', cat: 'Proyectos DIY',
    title: 'Lavandario en terraza: año 1',
    img: 'https://images.unsplash.com/photo-1487528742387-d53d4f12488d?w=500&h=400&fit=crop&auto=format',
    likes: 145, comments: 19, time: 'hace 5d', tall: false,
  },
]

export default function Foro() {
  const [activeTab, setActiveTab] = useState('Todo')
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())
  const [showUpload, setShowUpload] = useState(false)
  const [dragging, setDragging] = useState(false)

  const filtered = activeTab === 'Todo' ? POSTS : POSTS.filter(p => p.cat === activeTab)

  function toggleLike(id: number) {
    setLikedPosts(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const col1 = filtered.filter((_, i) => i % 3 === 0)
  const col2 = filtered.filter((_, i) => i % 3 === 1)
  const col3 = filtered.filter((_, i) => i % 3 === 2)

  return (
    <div className="min-h-screen bg-[#080c06]">
      {/* Header */}
      <div className="px-6 md:px-12 lg:px-20 pt-16 pb-12 md:pt-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <p className="font-mono text-[#c5f135] text-xs tracking-[0.3em] uppercase mb-4">Comunidad botánica</p>
          <h1 className="font-display text-[clamp(3rem,8vw,7rem)] font-black text-[#f0ede6] leading-[0.9]">
            El foro<br />
            <span className="italic text-[#8fa882]">verde</span>
          </h1>
          <p className="mt-4 font-body text-[#8fa882] max-w-md leading-relaxed">
            Comparte tu proyecto. Inspira a otros apasionados por las plantas.
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
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
              <h2 className="font-display text-[#f0ede6] text-2xl font-bold">Subir foto</h2>
              <button onClick={() => setShowUpload(false)} className="font-mono text-[#8fa882] hover:text-[#f0ede6] text-xl">✕</button>
            </div>
            <div className="p-8 space-y-5">
              <div
                className={`border-2 border-dashed transition-colors duration-200 flex flex-col items-center justify-center gap-3 cursor-pointer ${
                  dragging ? 'border-[#c5f135] bg-[#c5f13510]' : 'border-[#1e2e1a] hover:border-[#3a4d36]'
                }`}
                style={{ height: '200px' }}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false) }}
              >
                <span className="text-4xl text-[#3a4d36]">⊕</span>
                <p className="font-body text-[#8fa882] text-sm">Arrastra tu foto aquí o</p>
                <label className="font-mono text-xs tracking-widest uppercase text-[#c5f135] cursor-pointer hover:underline">
                  Seleccionar archivo
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              </div>
              <div>
                <label className="font-mono text-[10px] tracking-widest uppercase text-[#8fa882] block mb-2">Título</label>
                <input
                  type="text"
                  placeholder="Describe tu proyecto..."
                  className="w-full bg-[#080c06] border border-[#1e2e1a] px-4 py-3 text-[#f0ede6] font-body text-sm placeholder:text-[#3a4d36] focus:outline-none focus:border-[#c5f135] transition-colors"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] tracking-widest uppercase text-[#8fa882] block mb-2">Categoría</label>
                <select className="w-full bg-[#080c06] border border-[#1e2e1a] px-4 py-3 text-[#f0ede6] font-body text-sm focus:outline-none focus:border-[#c5f135] transition-colors">
                  {CATEGORIES.filter(c => c !== 'Todo').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpload(false)}
                  className="flex-1 py-3 border border-[#1e2e1a] font-mono text-xs tracking-widest uppercase text-[#8fa882] hover:border-[#f0ede6] hover:text-[#f0ede6] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowUpload(false)}
                  className="flex-1 py-3 bg-[#c5f135] text-[#080c06] font-mono text-xs tracking-widest uppercase font-medium hover:bg-[#d4ff40] transition-colors"
                >
                  Publicar →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="border-y border-[#1e2e1a] flex overflow-x-auto">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`flex-shrink-0 font-mono text-xs tracking-widest uppercase px-6 py-4 border-r border-[#1e2e1a] transition-colors duration-150 ${
              activeTab === cat ? 'bg-[#c5f135] text-[#080c06]' : 'text-[#8fa882] hover:text-[#f0ede6]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="px-6 md:px-12 lg:px-20 py-5 flex items-center gap-8 border-b border-[#1e2e1a] bg-[#0a100a]">
        {[['847', 'miembros activos'], ['2.3k', 'publicaciones'], ['12k', 'likes dados']].map(([val, label]) => (
          <div key={label} className="flex items-center gap-2">
            <span className="font-display text-[#c5f135] font-black text-lg">{val}</span>
            <span className="font-mono text-[#8fa882] text-[10px] tracking-widest uppercase hidden sm:block">{label}</span>
          </div>
        ))}
      </div>

      {/* Masonry grid */}
      <div className="px-6 md:px-12 lg:px-20 py-12">
        {filtered.length === 0 ? (
          <div className="py-32 text-center">
            <p className="font-display text-[#8fa882] text-3xl italic">Sin publicaciones en esta categoría.</p>
          </div>
        ) : (
          <div className="hidden md:grid grid-cols-3 gap-4 items-start">
            {[col1, col2, col3].map((col, ci) => (
              <div key={ci} className="space-y-4">
                {col.map(post => (
                  <PostCard key={post.id} post={post} liked={likedPosts.has(post.id)} onLike={() => toggleLike(post.id)} />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Mobile: single column */}
        <div className="md:hidden space-y-4">
          {filtered.map(post => (
            <PostCard key={post.id} post={post} liked={likedPosts.has(post.id)} onLike={() => toggleLike(post.id)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function PostCard({ post, liked, onLike }: {
  post: typeof POSTS[0]
  liked: boolean
  onLike: () => void
}) {
  return (
    <div className="group bg-[#0f1a0c] overflow-hidden cursor-pointer hover:bg-[#111e0f] transition-colors duration-200">
      <div className="overflow-hidden relative" style={{ aspectRatio: post.tall ? '3/4' : '4/3' }}>
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
          <span className="font-mono text-[#c5f135] text-[10px] tracking-widest">{post.user}</span>
          <span className="font-mono text-[#3a4d36] text-[10px] ml-auto">{post.time}</span>
        </div>
        <h3 className="font-display text-[#f0ede6] text-base font-medium leading-tight mb-3">{post.title}</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={e => { e.stopPropagation(); onLike() }}
            className={`flex items-center gap-1.5 font-mono text-[10px] tracking-widest transition-colors ${
              liked ? 'text-[#c5f135]' : 'text-[#8fa882] hover:text-[#c5f135]'
            }`}
          >
            <span>{liked ? '♥' : '♡'}</span>
            {post.likes + (liked ? 1 : 0)}
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
