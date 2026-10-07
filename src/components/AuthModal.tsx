import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
// IMPORTANTE: Ajusta esta ruta dependiendo de dónde guardaste supabase.ts
import { supabase } from '../supabase' 

const inputClass = 'mt-2 w-full border border-accent/25 bg-sponsor px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 outline-none transition-colors focus:border-accent focus-visible:ring-1 focus-visible:ring-accent'
const labelClass = 'block font-mono text-xs uppercase tracking-widest text-foreground/70'

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  
  const dialogRef = useRef<HTMLDivElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    emailRef.current?.focus()
    return () => { document.body.style.overflow = previousOverflow }
  }, [])

  function handleKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      onClose()
      return
    }
    if (event.key !== 'Tab') return
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled])')
    if (!focusable?.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    
    const email = emailRef.current?.value || ''
    const password = passwordRef.current?.value || ''

    if (mode === 'register') {
      const confirm = confirmRef.current?.value || ''
      if (password !== confirm) {
        confirmRef.current?.setCustomValidity('Las contraseñas no coinciden.')
        confirmRef.current?.reportValidity()
        return
      }
      
      const username = (document.getElementById('auth-username') as HTMLInputElement)?.value || ''

      setLoading(true)
      // Llamada real a Supabase para registrar
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username } // Guardamos el nombre de usuario como metadato
        }
      })
      setLoading(false)

      if (error) {
        setErrorMsg(error.message)
      } else {
        setSuccessMsg('¡Cuenta creada! Revisa la bandeja de entrada de tu correo para confirmarla.')
      }

    } else {
      // Llamada real a Supabase para iniciar sesión
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      setLoading(false)

      if (error) {
        setErrorMsg('Credenciales incorrectas o usuario no encontrado.')
      } else {
        setSuccessMsg('¡Acceso concedido!')
        // Cerramos el modal automáticamente tras 1 segundo
        setTimeout(() => {
          onClose()
        }, 1000)
      }
    }
  }

  function switchMode(nextMode: 'login' | 'register') {
    setMode(nextMode)
    setErrorMsg('')
    setSuccessMsg('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-4 backdrop-blur-sm sm:p-6" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="auth-title" onKeyDown={handleKeys} className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto border border-accent/30 bg-sponsor-surface p-6 text-foreground shadow-2xl sm:p-10">
        <button type="button" onClick={onClose} aria-label="Cerrar acceso" className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center border border-accent/30 bg-sponsor text-xl text-accent transition-colors hover:bg-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">×</button>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">DeepInTheFlower / Tu espacio</p>
        <h2 id="auth-title" className="mt-8 max-w-sm font-display text-4xl leading-tight sm:text-5xl">Un lugar para <span className="italic text-accent">echar raíces.</span></h2>
        <p className="mt-4 text-sm leading-relaxed text-foreground/65">Accede a tu espacio o crea una cuenta para formar parte de nuestra comunidad.</p>

        <div className="mt-8 flex border-b border-accent/25" role="group" aria-label="Opciones de acceso">
          <button type="button" aria-pressed={mode === 'login'} onClick={() => switchMode('login')} className={`flex-1 border-b-2 px-3 py-3 font-mono text-xs uppercase tracking-widest transition-colors ${mode === 'login' ? 'border-accent text-accent' : 'border-transparent text-foreground/50 hover:text-foreground'}`}>Iniciar sesión</button>
          <button type="button" aria-pressed={mode === 'register'} onClick={() => switchMode('register')} className={`flex-1 border-b-2 px-3 py-3 font-mono text-xs uppercase tracking-widest transition-colors ${mode === 'register' ? 'border-accent text-accent' : 'border-transparent text-foreground/50 hover:text-foreground'}`}>Crear cuenta</button>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          {mode === 'register' && (
            <label className={labelClass} htmlFor="auth-username">Nombre de usuario
              <input id="auth-username" name="username" type="text" autoComplete="username" required disabled={loading} className={inputClass} placeholder="Elige cómo quieres llamarte" />
            </label>
          )}
          <label className={labelClass} htmlFor="auth-email">Correo electrónico
            <input ref={emailRef} id="auth-email" name="email" type="email" autoComplete="email" required disabled={loading} className={inputClass} placeholder="tu@correo.com" />
          </label>
          <label className={labelClass} htmlFor="auth-password">Contraseña
            <input ref={passwordRef} id="auth-password" name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} required disabled={loading} className={inputClass} placeholder="Mínimo 8 caracteres" />
          </label>
          {mode === 'register' && (
            <label className={labelClass} htmlFor="auth-confirm">Confirmar contraseña
              <input ref={confirmRef} id="auth-confirm" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required disabled={loading} onInput={event => event.currentTarget.setCustomValidity('')} className={inputClass} placeholder="Repite tu contraseña" />
            </label>
          )}

          {errorMsg && (
            <p className="border border-red-500/30 bg-red-500/10 p-4 text-sm leading-relaxed text-red-200">
              {errorMsg}
            </p>
          )}
          
          {successMsg && (
            <p className="border border-green-500/30 bg-green-500/10 p-4 text-sm leading-relaxed text-green-200">
              {successMsg}
            </p>
          )}

          <button type="submit" disabled={loading} className="w-full border border-accent bg-accent px-6 py-4 font-mono text-xs uppercase tracking-widest text-ink transition-colors hover:bg-transparent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:opacity-50">
            {loading ? 'Procesando...' : `Validar ${mode === 'login' ? 'acceso' : 'registro'} ↗`}
          </button>
        </form>
      </div>
    </div>
  )
}