import { formatPrice } from "@/lib/format"
import type { Product, ProductVariant } from "@/lib/types"

export function normalizeProductVariants(
  variants: Product["variantes"],
): ProductVariant[] {
  if (!Array.isArray(variants)) return []

  return variants
    .map((variant) => ({
      nombre: typeof variant?.nombre === "string" ? variant.nombre.trim() : "",
      precio: Number(variant?.precio ?? 0),
    }))
    .filter((variant) => variant.nombre.length > 0)
}

export function hasProductVariants(product: Pick<Product, "modo_precio" | "variantes">) {
  return product.modo_precio === "variants" && normalizeProductVariants(product.variantes).length > 0
}

export function getProductMinPrice(product: Pick<Product, "precio" | "modo_precio" | "variantes">) {
  const variants = normalizeProductVariants(product.variantes)
  if (product.modo_precio === "variants" && variants.length > 0) {
    return Math.min(...variants.map((variant) => variant.precio))
  }

  return Number(product.precio ?? 0)
}

export function getProductPriceText(product: Pick<Product, "precio" | "modo_precio" | "variantes">) {
  const variants = normalizeProductVariants(product.variantes)
  if (product.modo_precio === "variants" && variants.length > 0) {
    const prices = variants.map((variant) => variant.precio)
    const min = Math.min(...prices)
    const max = Math.max(...prices)

    return min === max ? formatPrice(min) : `Desde ${formatPrice(min)}`
  }

  return formatPrice(product.precio)
}

export function getProductVariantsOrEmpty(product: Pick<Product, "variantes" | "modo_precio">) {
  return product.modo_precio === "variants" ? normalizeProductVariants(product.variantes) : []
}
