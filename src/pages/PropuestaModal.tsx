// Modal de envío de propuestas de patrocinio. Autentica o registra al usuario en Supabase Auth
// (o reutiliza su sesión activa) y guarda la propuesta en la tabla propuestas_patrocinio.

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import { guardarPropuestaPatrocinio } from '../services/patrocinio'

const fieldClass =
  'mt-2 w-full border border-accent/25 bg-sponsor px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 outline-none transition-colors focus:border-accent focus-visible:ring-1 focus-visible:ring-accent'
const labelClass = 'block font-mono text-xs uppercase tracking-widest text-foreground/70'

export default function PropuestaModal({
  onClose,
  user,
}: {
  onClose: () => void
  user: User | null
}) {
  const [accountMode, setAccountMode] = useState<'login' | 'register'>('login')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const dialogRef = useRef<HTMLDivElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    firstFieldRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  function handleKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      onClose()
      return
    }
    if (event.key !== 'Tab') return
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled])'
    )
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
    if (submitting) return
    setErrorMsg(null)
    setSuccessMsg(null)

    const formData = new FormData(event.currentTarget)
    const fullName = String(formData.get('fullName') ?? '').trim()
    const dni = String(formData.get('dni') ?? '').trim()
    const age = Number(formData.get('age') ?? 0)
    const nationality = String(formData.get('nationality') ?? '').trim()
    const postalCode = String(formData.get('postalCode') ?? '').trim()
    const username = String(formData.get('username') ?? '').trim()
    const email = String(formData.get('email') ?? user?.email ?? '').trim()
    const description = String(formData.get('description') ?? '').trim()

    if (!user && accountMode === 'register') {
      if (passwordRef.current?.value !== confirmPasswordRef.current?.value) {
        confirmPasswordRef.current?.setCustomValidity(
          'Las contraseñas no coinciden.'
        )
        confirmPasswordRef.current?.reportValidity()
        return
      }
    }

    setSubmitting(true)

    try {
      let uidFinal: string | null = user?.id ?? null
      let requiereConfirmarCorreo = false

      if (!uidFinal) {
        const password = passwordRef.current?.value ?? ''
        if (accountMode === 'login') {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (error || !data.user) {
            throw new Error(
              'No se pudo iniciar sesión con esas credenciales. Revisa tu correo y contraseña.'
            )
          }
          uidFinal = data.user.id
        } else {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { username },
            },
          })
          if (error) {
            throw new Error(error.message)
          }
          if (data.session?.user) {
            uidFinal = data.session.user.id
          } else {
            // Si el proyecto requiere confirmar el email antes de abrir sesión,
            // se registra la propuesta sin perder los datos introducidos.
            uidFinal = null
            requiereConfirmarCorreo = true
          }
        }
      }

      await guardarPropuestaPatrocinio({
        usuarioId: uidFinal,
        nombreCompleto: fullName,
        dni,
        edad: age,
        nacionalidad: nationality,
        codigoPostal: postalCode,
        nombreUsuario: username,
        email,
        descripcion: description,
      })

      if (requiereConfirmarCorreo) {
        setSuccessMsg(
          '¡Propuesta guardada correctamente! Hemos enviado un enlace de confirmación a tu correo para activar tu cuenta.'
        )
      } else {
        setSuccessMsg(
          '¡Propuesta enviada y registrada correctamente! Nuestro equipo la revisará pronto.'
        )
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'No se pudo enviar la propuesta. Tus datos siguen en el formulario.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-0 backdrop-blur-sm sm:p-6"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="proposal-title"
        onKeyDown={handleKeys}
        className="relative grid h-dvh w-full max-w-5xl overflow-y-auto border border-accent/25 bg-sponsor text-foreground shadow-2xl sm:h-auto sm:max-h-[90dvh] lg:grid-cols-[0.85fr_1.15fr]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar formulario"
          className="fixed right-5 top-5 z-10 flex h-9 w-9 items-center justify-center border border-accent/30 bg-sponsor text-xl text-accent transition-colors hover:bg-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:absolute"
        >
          ×
        </button>
        <div className="relative flex flex-col justify-between overflow-hidden border-b border-accent/20 bg-sponsor-surface p-7 sm:p-10 lg:border-b-0 lg:border-r">
          <div
            className="absolute -bottom-14 -right-8 select-none font-display text-[15rem] italic leading-none text-accent/10"
            aria-hidden="true"
          >
            ✳
          </div>
          <div className="relative">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
              DeepInTheFlower / Patrocinio
            </span>
            <h2
              id="proposal-title"
              className="mt-10 font-display text-5xl leading-[0.95] sm:text-6xl"
            >
              Tu idea puede{' '}
              <span className="italic text-accent">florecer aquí.</span>
            </h2>
            <p className="mt-7 max-w-sm leading-relaxed text-foreground/65">
              Cuéntanos quién eres y qué te gustaría hacer crecer. Este es el primer paso para conocernos.
            </p>
          </div>
          <div className="relative mt-10 border-t border-accent/25 pt-5 font-mono text-xs uppercase tracking-widest text-accent">
            01 / Presentación · 02 / Cuenta
          </div>
        </div>

        <div className="relative p-6 pt-16 sm:p-10 sm:pt-16">
          <form onSubmit={handleSubmit}>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              01 / Tus datos
            </p>
            <p className="mt-3 text-sm text-foreground/60">
              Completa tus datos y una breve descripción de tu proyecto.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <label
                className={`${labelClass} sm:col-span-2`}
                htmlFor="proposal-name"
              >
                Nombre completo
                <input
                  ref={firstFieldRef}
                  id="proposal-name"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  disabled={submitting}
                  className={fieldClass}
                  placeholder="Tu nombre y apellidos"
                />
              </label>
              <label className={labelClass} htmlFor="proposal-dni">
                DNI
                <input
                  id="proposal-dni"
                  name="dni"
                  type="text"
                  autoComplete="off"
                  required
                  disabled={submitting}
                  className={fieldClass}
                  placeholder="Documento de identidad"
                />
              </label>
              <label className={labelClass} htmlFor="proposal-age">
                Edad
                <input
                  id="proposal-age"
                  name="age"
                  type="number"
                  min="1"
                  max="120"
                  inputMode="numeric"
                  required
                  disabled={submitting}
                  className={fieldClass}
                  placeholder="Tu edad"
                />
              </label>
              <label className={labelClass} htmlFor="proposal-nationality">
                Nacionalidad
                <input
                  id="proposal-nationality"
                  name="nationality"
                  type="text"
                  autoComplete="country-name"
                  required
                  disabled={submitting}
                  className={fieldClass}
                  placeholder="Tu nacionalidad"
                />
              </label>
              <label className={labelClass} htmlFor="proposal-postal">
                Código postal
                <input
                  id="proposal-postal"
                  name="postalCode"
                  type="text"
                  autoComplete="postal-code"
                  required
                  disabled={submitting}
                  className={fieldClass}
                  placeholder="Código postal"
                />
              </label>
              <label className={labelClass} htmlFor="proposal-username">
                Nombre de usuario
                <input
                  id="proposal-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  disabled={submitting}
                  className={fieldClass}
                  placeholder="¿Cómo te llamamos aquí?"
                />
              </label>
              <label className={labelClass} htmlFor="proposal-email">
                Correo electrónico
                <input
                  id="proposal-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={user?.email ?? ''}
                  required
                  disabled={submitting}
                  className={fieldClass}
                  placeholder="tu@correo.com"
                />
              </label>
              <label
                className={`${labelClass} sm:col-span-2`}
                htmlFor="proposal-description"
              >
                Cuéntanos tu propuesta
                <textarea
                  id="proposal-description"
                  name="description"
                  rows={3}
                  required
                  disabled={submitting}
                  className={`${fieldClass} resize-y`}
                  placeholder="Qué quieres crear, cuándo y cómo imaginas nuestra colaboración"
                />
              </label>
            </div>

            {!user && (
              <div className="mt-10 border-t border-accent/20 pt-8">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                  02 / Tu cuenta
                </p>
                <p className="mt-3 text-sm text-foreground/60">
                  Elige cómo quieres acceder.
                </p>
                <div
                  className="mt-6 flex border-b border-accent/25"
                  role="group"
                  aria-label="Opciones de cuenta"
                >
                  <button
                    type="button"
                    aria-pressed={accountMode === 'login'}
                    onClick={() => {
                      setAccountMode('login')
                      setErrorMsg(null)
                    }}
                    className={`flex-1 border-b-2 px-3 py-3 font-mono text-xs uppercase tracking-widest transition-colors ${
                      accountMode === 'login'
                        ? 'border-accent text-accent'
                        : 'border-transparent text-foreground/50 hover:text-foreground'
                    }`}
                  >
                    Iniciar sesión
                  </button>
                  <button
                    type="button"
                    aria-pressed={accountMode === 'register'}
                    onClick={() => {
                      setAccountMode('register')
                      setErrorMsg(null)
                    }}
                    className={`flex-1 border-b-2 px-3 py-3 font-mono text-xs uppercase tracking-widest transition-colors ${
                      accountMode === 'register'
                        ? 'border-accent text-accent'
                        : 'border-transparent text-foreground/50 hover:text-foreground'
                    }`}
                  >
                    Crear cuenta
                  </button>
                </div>
                <p className="mt-5 text-sm text-foreground/60">
                  {accountMode === 'login'
                    ? 'Usaremos el correo indicado arriba para acceder a tu cuenta.'
                    : 'Tu cuenta utilizará el nombre de usuario y el correo indicados arriba.'}
                </p>
                <label className={`${labelClass} mt-6`} htmlFor="proposal-password">
                  Contraseña
                  <input
                    ref={passwordRef}
                    id="proposal-password"
                    name="password"
                    type="password"
                    autoComplete={
                      accountMode === 'login' ? 'current-password' : 'new-password'
                    }
                    minLength={8}
                    required
                    disabled={submitting}
                    className={fieldClass}
                    placeholder="Mínimo 8 caracteres"
                  />
                </label>
                {accountMode === 'register' && (
                  <label
                    className={`${labelClass} mt-5`}
                    htmlFor="proposal-confirm-password"
                  >
                    Confirmar contraseña
                    <input
                      ref={confirmPasswordRef}
                      id="proposal-confirm-password"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      disabled={submitting}
                      onInput={event => event.currentTarget.setCustomValidity('')}
                      className={fieldClass}
                      placeholder="Repite tu contraseña"
                    />
                  </label>
                )}
              </div>
            )}

            {errorMsg && (
              <div className="mt-8 border border-red-500/30 bg-red-500/10 p-4 text-sm leading-relaxed text-red-200">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <p
                role="status"
                className="mt-8 border border-accent/40 bg-accent/10 p-4 text-sm leading-relaxed text-accent"
              >
                {successMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || Boolean(successMsg)}
              className="mt-7 w-full border border-accent bg-accent px-6 py-4 font-mono text-xs uppercase tracking-widest text-ink transition-colors hover:bg-transparent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:opacity-50"
            >
              {submitting ? 'Enviando propuesta...' : 'Enviar propuesta ↗'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
