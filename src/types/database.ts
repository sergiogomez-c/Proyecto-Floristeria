// Tipos de datos de negocio y respuestas de Supabase para DeepInTheFlower.
// Evita el uso de "any" y centraliza los contratos entre las consultas y la interfaz.

export interface ProductoTienda {
  id: number
  name: string
  cat: string
  priceFormatted: string
  priceNumeric: number
  stock: number
  img: string
  tag: string | null
  large: boolean
}

export interface ItemCarritoDetalle {
  producto: ProductoTienda
  quantity: number
}

export interface EspecieBotanica {
  id: string
  dbId: number
  name: string
  scientific: string
  origin: string
  climate: string
  bloom: string
  difficulty: string
  img: string
  description: string
  care: string[]
  color: string
}

export interface ServicioDecoracion {
  id: string
  dbId: number
  label: string
  icon: string
  desc: string
  price: string
  priceNumeric: number
  items: string[]
  img: string
}

export interface DatosNuevaReserva {
  servicioId: number
  fechaEventoISO: string
  nombreContacto: string
  emailContacto: string
  telefonoContacto: string
  notas: string
  usuarioId: string | null
}

export interface PublicacionForoVista {
  id: number
  user: string
  name: string
  cat: string
  title: string
  img: string
  likes: number
  comments: number
  time: string
  tall: boolean
  likedByMe: boolean
}

export interface EstadisticasForo {
  miembrosActivos: number
  totalPublicaciones: number
  totalLikes: number
}

export interface DatosNuevaPropuesta {
  usuarioId: string | null
  nombreCompleto: string
  dni: string
  edad: number
  nacionalidad: string
  codigoPostal: string
  nombreUsuario: string
  email: string
  descripcion: string
}

export interface PerfilUsuario {
  id: string
  nombre: string
  email: string
  telefono: string | null
  rol: string
  activo: boolean
  biografia: string | null
  perfil_privado: boolean
}

export interface PedidoResumen {
  id: number
  estado: string
  total: number
  creado_en: string
}

export interface ItemListaDeseos {
  id: number
  nombreProducto: string
}
