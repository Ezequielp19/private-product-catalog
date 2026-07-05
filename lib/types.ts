export type Profile = {
  id: string
  nombre: string
  email: string
  approved: boolean
  role: string
  created_at: string
}

export type VariantTipo = "liquid" | "unit"

export type Product = {
  id: string
  nombre: string
  descripcion: string
  categoria?: string | null
  precio: number
  modo_precio?: "single" | "variants" | null
  tipo_variante?: VariantTipo | null
  variantes?: Array<{
    nombre: string
    precio: number
  }> | null
  imagen: string | null
  activo: boolean
  destacado_inicio?: boolean
  orden_inicio?: number | null
  created_at: string
}

export type CartItem = {
  id: string
  nombre: string
  precio: number
  imagen: string | null
  cantidad: number
  varianteNombre?: string | null
}

export type ProductVariant = {
  nombre: string
  precio: number
}
