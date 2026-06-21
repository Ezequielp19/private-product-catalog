export type Profile = {
  id: string
  nombre: string
  email: string
  approved: boolean
  role: string
  created_at: string
}

export type Product = {
  id: string
  nombre: string
  descripcion: string
  precio: number
  imagen: string | null
  activo: boolean
  created_at: string
}

export type CartItem = {
  id: string
  nombre: string
  precio: number
  imagen: string | null
  cantidad: number
}
