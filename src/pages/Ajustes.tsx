import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import type { PerfilUsuario } from '../types/database'

type Pestana = 'cuenta' | 'direccion' | 'privacidad' | 'notificaciones'

export default function Ajustes({ user }: { user: User | null }) {
  const [activeTab, setActiveTab] = useState<Pestana>('cuenta')
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'ok' | 'error' } | null>(null)

  // Estados de los formularios
  const [newPassword, setNewPassword] = useState('')
  const [form, setForm] = useState({
    direccion: '',
    ciudad: '',
    codigo_postal: '',
    notificaciones_ofertas: true,
    notificaciones_foro: true,
    perfil_privado: false,
    mostrar_wishlist: true,
    mostrar_likes: true,
  })

  useEffect(() => {
    if (user) cargarPerfil()
  }, [user])

  async function cargarPerfil() {
    if (!user) return
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setPerfil(data as PerfilUsuario)
      setForm({
        direccion: data.direccion || '',
        ciudad: data.ciudad || '',
        codigo_postal: data.codigo_postal || '',
        notificaciones_ofertas: data.notificaciones_ofertas ?? true,
        notificaciones_foro: data.notificaciones_foro ?? true,
        perfil_privado: data.perfil_privado ?? false,
        mostrar_wishlist: data.mostrar_wishlist ?? true,
        mostrar_likes: data.mostrar_likes ?? true,
      })
    }
    setLoading(false)
  }

  async function guardarCambios() {
    if (!user) return
    setSaving(true)
    setMensaje(null)

    const { error } = await supabase
      .from('usuarios')
      .update({
        direccion: form.direccion.trim() || null,
        ciudad: form.ciudad.trim() || null,
        codigo_postal: form.codigo_postal.trim() || null,
        notificaciones_ofertas: form.notificaciones_ofertas,
        notificaciones_foro: form.notificaciones_foro,
        perfil_privado: form.perfil_privado,
        mostrar_wishlist: form.mostrar_wishlist,
        mostrar_likes: form.mostrar_likes,
      })
      .eq('id', user.id)

    if (error) {
      setMensaje({ texto: 'Error al guardar los ajustes.', tipo: 'error' })
    } else {
      setMensaje({ texto: 'Ajustes guardados correctamente.', tipo: 'ok' })
      setTimeout(() => setMensaje(null), 3000)
    }
    setSaving(false)
  }

  async function actualizarPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!newPassword || newPassword.length < 8) {
      setMensaje({ texto: 'La contraseña debe tener al menos 8 caracteres.', tipo: 'error' })
      return
    }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    
    if (error) {
      setMensaje({ texto: error.message, tipo: 'error' })
    } else {
      setMensaje({ texto: 'Contraseña actualizada de forma segura.', tipo: 'ok' })
      setNewPassword('')
      setTimeout(() => setMensaje(null), 3000)
    }
    setSaving(false)
  }

  async function cerrarTodasLasSesiones() {
    setSaving(true)
    // Esto invalida la sesión actual y cualquier otra abierta en otros dispositivos
    await supabase.auth.signOut({ scope: 'global' })
    // La redirección la maneja App.tsx al detectar que no hay sesión
  }

  if (!user || loading) {
    return <div className="min-h-[60vh] flex items-center justify-center font-mono text-xs text-[#8fa882] uppercase tracking-widest">Cargando ajustes...</div>
  }

  const PESTANAS: { id: Pestana; label: string; icon: string }[] = [
    { id: 'cuenta', label: 'Seguridad y Acceso', icon: '⚿' },
    { id: 'direccion', label: 'Libreta de Direcciones', icon: '⌂' },
    { id: 'privacidad', label: 'Privacidad Extendida', icon: '👁' },
    { id: 'notificaciones', label: 'Notificaciones', icon: '✉' },
  ]

  const inputClass = "w-full bg-[#1e2e1a] border border-[#1e2e1a] px-4 py-3 text-[#f0ede6] font-body text-sm focus:outline-none focus:border-[#c5f135] transition-colors"
  const labelClass = "font-mono text-[10px] tracking-widest uppercase text-[#8fa882] block mb-2 mt-5"

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 lg:px-12 min-h-[75vh]">
      <div className="mb-10">
        <p className="font-mono text-[#c5f135] text-xs tracking-[0.3em] uppercase mb-4">Configuración</p>
        <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-black text-[#f0ede6] leading-[0.9]">
          Tus <span className="italic text-[#8fa882]">Ajustes</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-10">
        {/* Menú lateral */}
        <div className="flex flex-col gap-2">
          {PESTANAS.map(p => (
            <button
              key={p.id}
              onClick={() => { setActiveTab(p.id); setMensaje(null); }}
              className={`flex items-center gap-3 px-5 py-4 text-left font-mono text-xs uppercase tracking-widest transition-colors ${
                activeTab === p.id ? 'bg-[#c5f135] text-[#080c06] font-bold' : 'bg-[#0f1a0c] text-[#8fa882] hover:text-[#f0ede6] hover:bg-[#1e2e1a]'
              }`}
            >
              <span className="text-base">{p.icon}</span> {p.label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="bg-[#0f1a0c] border border-[#1e2e1a] p-8 md:p-12 shadow-xl">
          {mensaje && (
            <div className={`mb-6 p-4 text-sm font-mono tracking-wide ${mensaje.tipo === 'error' ? 'bg-red-500/10 border border-red-500/30 text-red-200' : 'bg-[#c5f13515] border border-[#c5f13530] text-[#c5f135]'}`}>
              {mensaje.texto}
            </div>
          )}

          {/* TAB 1: SEGURIDAD */}
          {activeTab === 'cuenta' && (
            <div className="space-y-8">
              <div>
                <h3 className="font-display text-2xl text-[#f0ede6] mb-2">Cambiar Contraseña</h3>
                <p className="text-sm text-[#8fa882] mb-6">Actualiza tu contraseña para mantener tu cuenta segura.</p>
                <form onSubmit={actualizarPassword} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="font-mono text-[10px] tracking-widest uppercase text-[#8fa882] block mb-2">Nueva Contraseña</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 8 caracteres" className={inputClass} disabled={saving} />
                  </div>
                  <button type="submit" disabled={saving} className="h-[46px] px-6 bg-[#c5f135] text-[#080c06] font-mono text-xs tracking-widest uppercase font-medium hover:bg-[#d4ff40] transition-colors disabled:opacity-50">
                    Actualizar
                  </button>
                </form>
              </div>

              <div className="border-t border-[#1e2e1a] pt-8">
                <h3 className="font-display text-2xl text-[#f0ede6] mb-2">Gestión de Sesiones</h3>
                <p className="text-sm text-[#8fa882] mb-6">¿Iniciaste sesión en un ordenador público y olvidaste cerrarla? Cierra todas las sesiones activas en todos tus dispositivos instantáneamente.</p>
                <button onClick={cerrarTodasLasSesiones} disabled={saving} className="px-6 py-3 border border-red-500/50 text-red-400 font-mono text-xs tracking-widest uppercase hover:bg-red-500/10 transition-colors">
                  Cerrar sesión en todos los dispositivos
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DIRECCIÓN */}
          {activeTab === 'direccion' && (
            <div>
              <h3 className="font-display text-2xl text-[#f0ede6] mb-2">Datos de Envío</h3>
              <p className="text-sm text-[#8fa882] mb-6">Guarda tu dirección por defecto para acelerar tus futuras compras.</p>
              
              <label className={labelClass}>Dirección completa (Calle, Número, Piso)</label>
              <input type="text" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} className={inputClass} placeholder="Ej. Carrer de les Flors, 12, 3º A" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Ciudad</label>
                  <input type="text" value={form.ciudad} onChange={e => setForm({...form, ciudad: e.target.value})} className={inputClass} placeholder="Barcelona" />
                </div>
                <div>
                  <label className={labelClass}>Código Postal</label>
                  <input type="text" value={form.codigo_postal} onChange={e => setForm({...form, codigo_postal: e.target.value})} className={inputClass} placeholder="08001" />
                </div>
              </div>

              <button onClick={guardarCambios} disabled={saving} className="mt-8 px-8 py-4 bg-[#c5f135] text-[#080c06] font-mono text-sm tracking-widest uppercase font-bold hover:bg-[#d4ff40] transition-colors">
                Guardar Dirección
              </button>
            </div>
          )}

          {/* TAB 3: PRIVACIDAD */}
          {activeTab === 'privacidad' && (
            <div>
              <h3 className="font-display text-2xl text-[#f0ede6] mb-2">Privacidad Extendida</h3>
              <p className="text-sm text-[#8fa882] mb-8">Controla qué información es visible para otros miembros de la comunidad botánica.</p>
              
              <div className="space-y-6">
                <ToggleOption label="Perfil Privado" description="Si se activa, otros usuarios no podrán ver tu perfil haciendo clic en tu nombre en el foro." checked={form.perfil_privado} onChange={v => setForm({...form, perfil_privado: v})} />
                <div className="w-full h-px bg-[#1e2e1a]"></div>
                <ToggleOption label="Mostrar Lista de Deseos" description="Permite que otros usuarios vean qué plantas o productos deseas en tu perfil público." checked={form.mostrar_wishlist} onChange={v => setForm({...form, mostrar_wishlist: v})} disabled={form.perfil_privado} />
                <div className="w-full h-px bg-[#1e2e1a]"></div>
                <ToggleOption label="Mostrar Likes Dados" description="Muestra en tu perfil público el recuento total de likes que has repartido en el foro." checked={form.mostrar_likes} onChange={v => setForm({...form, mostrar_likes: v})} disabled={form.perfil_privado} />
              </div>

              <button onClick={guardarCambios} disabled={saving} className="mt-10 px-8 py-4 bg-[#c5f135] text-[#080c06] font-mono text-sm tracking-widest uppercase font-bold hover:bg-[#d4ff40] transition-colors">
                Aplicar Privacidad
              </button>
            </div>
          )}

          {/* TAB 4: NOTIFICACIONES */}
          {activeTab === 'notificaciones' && (
            <div>
              <h3 className="font-display text-2xl text-[#f0ede6] mb-2">Comunicaciones</h3>
              <p className="text-sm text-[#8fa882] mb-8">Decide cómo quieres que DeepInTheFlower se comunique contigo.</p>
              
              <div className="space-y-6">
                <ToggleOption label="Boletín y Ofertas Botánicas" description="Recibe correos esporádicos con nuevos ingresos de plantas, semillas y descuentos exclusivos." checked={form.notificaciones_ofertas} onChange={v => setForm({...form, notificaciones_ofertas: v})} />
                <div className="w-full h-px bg-[#1e2e1a]"></div>
                <ToggleOption label="Actividad del Foro" description="Recibe un resumen semanal con las mejores publicaciones de la comunidad y respuestas a tus posts." checked={form.notificaciones_foro} onChange={v => setForm({...form, notificaciones_foro: v})} />
              </div>

              <button onClick={guardarCambios} disabled={saving} className="mt-10 px-8 py-4 bg-[#c5f135] text-[#080c06] font-mono text-sm tracking-widest uppercase font-bold hover:bg-[#d4ff40] transition-colors">
                Actualizar Notificaciones
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ToggleOption({ label, description, checked, onChange, disabled = false }: { label: string, description: string, checked: boolean, onChange: (val: boolean) => void, disabled?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-4 ${disabled ? 'opacity-40' : ''}`}>
      <div>
        <h4 className="font-body text-[#f0ede6] text-base">{label}</h4>
        <p className="font-body text-sm text-[#8fa882] mt-1">{description}</p>
      </div>
      <button 
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`shrink-0 w-12 h-6 rounded-full p-1 transition-colors mt-1 ${checked ? 'bg-[#c5f135]' : 'bg-[#1e2e1a]'}`}
      >
        <div className={`w-4 h-4 bg-[#080c06] rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
      </button>
    </div>
  )
}