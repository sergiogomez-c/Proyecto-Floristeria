// Consultas y escrituras en Supabase para servicios de decoración floral,
// disponibilidad de calendario y registro de reservas.

import { supabase } from '../supabase'
import type { DatosNuevaReserva, ServicioDecoracion } from '../types/database'

interface FilaServicio {
  id: number
  slug: string | null
  nombre: string
  icono: string | null
  descripcion: string
  precio: number | string
  precio_texto: string | null
  incluye: string[] | null
  imagen_url: string | null
}

interface FilaRangoOcupado {
  fecha_inicio: string
  fecha_fin: string
}

export async function obtenerServiciosDecoracion(): Promise<ServicioDecoracion[]> {
  const { data, error } = await supabase
    .from('servicios')
    .select('id, slug, nombre, icono, descripcion, precio, precio_texto, incluye, imagen_url')
    .eq('activo', true)
    .order('id', { ascending: true })

  if (error) {
    throw new Error('No se pudieron cargar los servicios de decoración.')
  }

  const filas = (data ?? []) as FilaServicio[]

  return filas.map(fila => {
    const precioNum = Number(fila.precio)
    return {
      id: fila.slug ?? String(fila.id),
      dbId: fila.id,
      label: fila.nombre,
      icon: fila.icono ?? '♡',
      desc: fila.descripcion,
      price: fila.precio_texto ?? `Desde ${precioNum} €`,
      priceNumeric: precioNum,
      items: Array.isArray(fila.incluye) ? fila.incluye : [],
      img:
        fila.imagen_url ??
        'https://images.unsplash.com/photo-1612351641432-20a0f196086c?w=600&h=700&fit=crop&auto=format',
    }
  })
}

export async function obtenerDiasNoDisponiblesMes(
  servicioId: number,
  anio: number,
  mesIndex: number
): Promise<Set<number>> {
  const inicioMes = new Date(Date.UTC(anio, mesIndex, 1, 0, 0, 0))
  const finMes = new Date(Date.UTC(anio, mesIndex + 1, 0, 23, 59, 59))

  const { data, error } = await supabase.rpc('obtener_fechas_ocupadas', {
    p_servicio_id: servicioId,
    p_inicio: inicioMes.toISOString(),
    p_fin: finMes.toISOString(),
  })

  if (error) {
    throw new Error('No se pudo consultar la disponibilidad del calendario.')
  }

  const diasOcupados = new Set<number>()
  const totalDiasMes = new Date(anio, mesIndex + 1, 0).getDate()

  // Marcar días pasados como no disponibles
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  for (let dia = 1; dia <= totalDiasMes; dia++) {
    const fechaDia = new Date(anio, mesIndex, dia)
    if (fechaDia < hoy) {
      diasOcupados.add(dia)
    }
  }

  const rangos = (data ?? []) as FilaRangoOcupado[]
  for (const rango of rangos) {
    const inicio = new Date(rango.fecha_inicio)
    const fin = new Date(rango.fecha_fin)

    for (let dia = 1; dia <= totalDiasMes; dia++) {
      const inicioDia = new Date(Date.UTC(anio, mesIndex, dia, 0, 0, 0))
      const finDia = new Date(Date.UTC(anio, mesIndex, dia, 23, 59, 59))
      if (inicio <= finDia && fin >= inicioDia) {
        diasOcupados.add(dia)
      }
    }
  }

  return diasOcupados
}

export async function crearReservaEnSupabase(
  datos: DatosNuevaReserva
): Promise<void> {
  const { error } = await supabase.from('reservas').insert({
    usuario_id: datos.usuarioId,
    servicio_id: datos.servicioId,
    fecha_evento: datos.fechaEventoISO,
    nombre_contacto: datos.nombreContacto.trim(),
    email_contacto: datos.emailContacto.trim(),
    telefono_contacto: datos.telefonoContacto.trim(),
    notas: datos.notas.trim() || null,
    estado: 'pendiente',
  })

  if (error) {
    throw new Error('No se pudo guardar la reserva. Inténtalo de nuevo.')
  }
}
