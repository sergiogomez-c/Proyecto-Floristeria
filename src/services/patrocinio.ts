// Escritura de propuestas de patrocinio en Supabase.

import { supabase } from '../supabase'
import type { DatosNuevaPropuesta } from '../types/database'

export async function guardarPropuestaPatrocinio(
  datos: DatosNuevaPropuesta
): Promise<void> {
  const { error } = await supabase.from('propuestas_patrocinio').insert({
    usuario_id: datos.usuarioId,
    nombre_completo: datos.nombreCompleto.trim(),
    dni: datos.dni.trim(),
    edad: datos.edad,
    nacionalidad: datos.nacionalidad.trim(),
    codigo_postal: datos.codigoPostal.trim(),
    nombre_usuario: datos.nombreUsuario.trim(),
    email: datos.email.trim(),
    descripcion: datos.descripcion.trim(),
    estado: 'pendiente',
  })

  if (error) {
    throw new Error('No se pudo guardar tu propuesta en la base de datos.')
  }
}
