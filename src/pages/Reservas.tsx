// Página de Reservas. Lee los servicios y los días ocupados desde Supabase,
// y registra la reserva real antes de mostrar la confirmación al usuario.

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import {
  crearReservaEnSupabase,
  obtenerDiasNoDisponiblesMes,
  obtenerServiciosDecoracion,
} from '../services/reservas'
import type { ServicioDecoracion } from '../types/database'

const MONTHS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]
const NOW = new Date()

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDay(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function Reservas({ user }: { user: User | null }) {
  const [services, setServices] = useState<ServicioDecoracion[]>([])
  const [selectedService, setSelectedService] = useState<string>('boda')
  const [loadingServices, setLoadingServices] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [currentMonth, setCurrentMonth] = useState(NOW.getMonth())
  const [currentYear, setCurrentYear] = useState(NOW.getFullYear())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [unavailableDays, setUnavailableDays] = useState<Set<number>>(new Set())

  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function cargarServicios() {
    setLoadingServices(true)
    setLoadError(null)
    try {
      const lista = await obtenerServiciosDecoracion()
      setServices(lista)
      if (lista.length > 0) {
        setSelectedService(lista[0].id)
      }
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar los servicios de decoración.'
      )
    } finally {
      setLoadingServices(false)
    }
  }

  useEffect(() => {
    cargarServicios()
  }, [])

  const service =
    services.find(s => s.id === selectedService) ?? services[0] ?? null

  useEffect(() => {
    if (!service) return
    let cancelado = false

    obtenerDiasNoDisponiblesMes(service.dbId, currentYear, currentMonth)
      .then(ocupados => {
        if (!cancelado) {
          setUnavailableDays(ocupados)
          if (selectedDay && ocupados.has(selectedDay)) {
            setSelectedDay(null)
          }
        }
      })
      .catch(() => {
        if (!cancelado) {
          setUnavailableDays(new Set())
        }
      })

    return () => {
      cancelado = true
    }
  }, [service?.dbId, currentYear, currentMonth])

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDay(currentYear, currentMonth)

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(y => y - 1)
    } else {
      setCurrentMonth(m => m - 1)
    }
    setSelectedDay(null)
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(y => y + 1)
    } else {
      setCurrentMonth(m => m + 1)
    }
    setSelectedDay(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!service || !selectedDay || submitting) return

    setSubmitting(true)
    setSubmitError(null)

    const fechaEventoISO = new Date(
      Date.UTC(currentYear, currentMonth, selectedDay, 12, 0, 0)
    ).toISOString()

    try {
      await crearReservaEnSupabase({
        servicioId: service.dbId,
        fechaEventoISO,
        nombreContacto: form.name,
        emailContacto: form.email,
        telefonoContacto: form.phone,
        notas: form.notes,
        usuarioId: user?.id ?? null,
      })
      setUnavailableDays(prev => new Set(prev).add(selectedDay))
      setSubmitted(true)
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al guardar tu reserva.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080c06]">
      {/* Header */}
      <div className="px-6 md:px-12 lg:px-20 pt-16 pb-12 md:pt-24">
        <p className="font-mono text-[#c5f135] text-xs tracking-[0.3em] uppercase mb-4">
          Servicio de decoración
        </p>
        <h1 className="font-display text-[clamp(3rem,8vw,7rem)] font-black text-[#f0ede6] leading-[0.9]">
          Reserva
          <br />
          <span className="italic text-[#8fa882]">tu fecha</span>
        </h1>
      </div>

      {loadingServices ? (
        <div className="py-32 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-[#8fa882]">
            Cargando servicios disponibles...
          </p>
        </div>
      ) : loadError || !service ? (
        <div className="py-24 text-center max-w-md mx-auto px-6">
          <p className="font-display text-[#f0ede6] text-2xl mb-3">
            No se pudieron cargar los servicios
          </p>
          <p className="font-body text-[#8fa882] text-sm mb-6">
            {loadError ?? 'Sin servicios activos.'}
          </p>
          <button
            onClick={cargarServicios}
            className="font-mono text-xs tracking-widest uppercase px-6 py-3 bg-[#c5f135] text-[#080c06] hover:bg-[#d4ff40] transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          {/* Service selector */}
          <div className="px-6 md:px-12 lg:px-20 mb-12">
            <p className="font-mono text-[#8fa882] text-xs tracking-widest uppercase mb-6">
              01 — Elige el servicio
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1e2e1a]">
              {services.map(svc => (
                <button
                  key={svc.id}
                  onClick={() => {
                    setSelectedService(svc.id)
                    setSelectedDay(null)
                  }}
                  className={`relative group overflow-hidden text-left transition-all duration-300 ${
                    selectedService === svc.id
                      ? 'bg-[#0f1a0c]'
                      : 'bg-[#080c06] hover:bg-[#0a120a]'
                  }`}
                >
                  <div className="relative overflow-hidden" style={{ height: '200px' }}>
                    <img
                      src={svc.img}
                      alt={svc.label}
                      className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080c06] to-transparent" />
                    <span className="absolute top-4 left-4 text-4xl">{svc.icon}</span>
                    {selectedService === svc.id && (
                      <div className="absolute inset-0 border border-[#c5f135] pointer-events-none" />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-[#f0ede6] text-2xl font-bold mb-2">
                      {svc.label}
                    </h3>
                    <p className="font-body text-[#8fa882] text-sm leading-relaxed mb-4">
                      {svc.desc}
                    </p>
                    <p className="font-mono text-[#c5f135] text-sm">{svc.price}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected service details */}
            <div className="mt-4 bg-[#0f1a0c] border border-[#1e2e1a] p-6">
              <p className="font-mono text-[#8fa882] text-[10px] tracking-widest uppercase mb-3">
                Incluye
              </p>
              <div className="flex flex-wrap gap-3">
                {service.items.map(item => (
                  <span
                    key={item}
                    className="font-mono text-xs px-3 py-1.5 border border-[#1e2e1a] text-[#c8c3b8]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar + Form */}
          <div className="px-6 md:px-12 lg:px-20 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Calendar */}
            <div>
              <p className="font-mono text-[#8fa882] text-xs tracking-widest uppercase mb-6">
                02 — Selecciona la fecha
              </p>
              <div className="bg-[#0f1a0c] border border-[#1e2e1a]">
                {/* Month nav */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2e1a]">
                  <button
                    onClick={prevMonth}
                    className="font-mono text-[#8fa882] hover:text-[#c5f135] transition-colors text-xl"
                  >
                    ←
                  </button>
                  <span className="font-display text-[#f0ede6] text-xl font-medium">
                    {MONTHS[currentMonth]} {currentYear}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="font-mono text-[#8fa882] hover:text-[#c5f135] transition-colors text-xl"
                  >
                    →
                  </button>
                </div>

                {/* Day labels */}
                <div className="grid grid-cols-7 border-b border-[#1e2e1a]">
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                    <div
                      key={d}
                      className="py-3 text-center font-mono text-[#8fa882] text-[10px] tracking-widest"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 p-2 gap-1">
                  {Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }).map(
                    (_, i) => (
                      <div key={`e${i}`} />
                    )
                  )}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                    const unavailable = unavailableDays.has(day)
                    const selected = selectedDay === day
                    return (
                      <button
                        key={day}
                        disabled={unavailable}
                        onClick={() => setSelectedDay(day)}
                        className={`aspect-square flex items-center justify-center font-mono text-sm transition-all duration-150 ${
                          selected
                            ? 'bg-[#c5f135] text-[#080c06] font-bold'
                            : unavailable
                            ? 'text-[#2a3626] cursor-not-allowed line-through'
                            : 'text-[#c8c3b8] hover:bg-[#1e2e1a] hover:text-[#f0ede6]'
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>

                <div className="px-6 py-4 border-t border-[#1e2e1a] flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#c5f135]" />
                    <span className="font-mono text-[10px] text-[#8fa882] uppercase tracking-widest">
                      Seleccionado
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#1e2e1a]" />
                    <span className="font-mono text-[10px] text-[#8fa882] uppercase tracking-widest">
                      No disponible
                    </span>
                  </div>
                </div>
              </div>

              {selectedDay && (
                <div className="mt-4 px-5 py-4 bg-[#c5f135] text-[#080c06] flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <p className="font-mono text-xs tracking-widest uppercase">
                      Fecha seleccionada
                    </p>
                    <p className="font-display text-lg font-bold">
                      {selectedDay} de {MONTHS[currentMonth]} de {currentYear}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <div>
              <p className="font-mono text-[#8fa882] text-xs tracking-widest uppercase mb-6">
                03 — Tus datos de contacto
              </p>

              {submitted ? (
                <div className="bg-[#0f1a0c] border border-[#c5f135] p-12 text-center">
                  <div className="font-display text-6xl text-[#c5f135] mb-4">✿</div>
                  <h3 className="font-display text-[#f0ede6] text-3xl font-bold mb-3">
                    ¡Reserva recibida!
                  </h3>
                  <p className="font-body text-[#8fa882] leading-relaxed">
                    Te contactaremos en las próximas 24h para confirmar todos los detalles de tu decoración floral.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setSelectedDay(null)
                      setForm({ name: '', email: '', phone: '', notes: '' })
                    }}
                    className="mt-8 font-mono text-xs tracking-widest uppercase text-[#c5f135] border border-[#c5f135] px-6 py-3 hover:bg-[#c5f135] hover:text-[#080c06] transition-colors"
                  >
                    Nueva reserva
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    {
                      label: 'Nombre completo',
                      key: 'name',
                      type: 'text',
                      placeholder: 'María García López',
                    },
                    {
                      label: 'Email',
                      key: 'email',
                      type: 'email',
                      placeholder: 'maria@ejemplo.com',
                    },
                    {
                      label: 'Teléfono',
                      key: 'phone',
                      type: 'tel',
                      placeholder: '+34 600 000 000',
                    },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="font-mono text-[10px] tracking-widest uppercase text-[#8fa882] block mb-2">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        required
                        disabled={submitting}
                        placeholder={field.placeholder}
                        value={form[field.key as keyof typeof form]}
                        onChange={e =>
                          setForm(f => ({ ...f, [field.key]: e.target.value }))
                        }
                        className="w-full bg-[#0f1a0c] border border-[#1e2e1a] px-4 py-3 text-[#f0ede6] font-body text-sm placeholder:text-[#3a4d36] focus:outline-none focus:border-[#c5f135] transition-colors"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="font-mono text-[10px] tracking-widest uppercase text-[#8fa882] block mb-2">
                      Notas adicionales
                    </label>
                    <textarea
                      rows={4}
                      disabled={submitting}
                      placeholder="Cuéntanos sobre tu evento, preferencias de flores, colores..."
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      className="w-full bg-[#0f1a0c] border border-[#1e2e1a] px-4 py-3 text-[#f0ede6] font-body text-sm placeholder:text-[#3a4d36] focus:outline-none focus:border-[#c5f135] transition-colors resize-none"
                    />
                  </div>

                  {/* Summary */}
                  <div className="bg-[#0f1a0c] border border-[#1e2e1a] p-5">
                    <p className="font-mono text-[10px] tracking-widest uppercase text-[#8fa882] mb-3">
                      Resumen de reserva
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-body text-[#8fa882] text-sm">
                          Servicio
                        </span>
                        <span className="font-display text-[#f0ede6] font-medium">
                          {service.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-body text-[#8fa882] text-sm">Fecha</span>
                        <span className="font-display text-[#f0ede6] font-medium">
                          {selectedDay
                            ? `${selectedDay} ${MONTHS[currentMonth]} ${currentYear}`
                            : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-[#1e2e1a] pt-2 mt-2">
                        <span className="font-body text-[#8fa882] text-sm">
                          Precio base
                        </span>
                        <span className="font-display text-[#c5f135] font-black">
                          {service.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  {submitError && (
                    <p className="border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                      {submitError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={!selectedDay || submitting}
                    className={`w-full py-5 font-mono text-sm tracking-widest uppercase transition-all duration-200 ${
                      selectedDay && !submitting
                        ? 'bg-[#c5f135] text-[#080c06] hover:bg-[#d4ff40]'
                        : 'bg-[#1e2e1a] text-[#3a4d36] cursor-not-allowed'
                    }`}
                  >
                    {submitting
                      ? 'Guardando reserva...'
                      : selectedDay
                      ? 'Confirmar reserva →'
                      : 'Selecciona una fecha primero'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
