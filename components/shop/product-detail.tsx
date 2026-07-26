"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import type { Product } from "@/lib/types"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format"
import { hasProductVariants, normalizeProductVariants } from "@/lib/product-pricing"
import { getVariantPickerLabel, normalizeVariantDisplayName } from "@/lib/variant-presets"
import { Button } from "@/components/ui/button"
import { ShoppingCart, ImageOff, Minus, Plus } from "lucide-react"

export function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [cantidad, setCantidad] = useState(1)
  const [adding, setAdding] = useState(false)
  const variants = useMemo(() => {
    const seen = new Set<string>()
    return normalizeProductVariants(product.variantes)
      .map((variant) => ({
        ...variant,
        nombre: normalizeVariantDisplayName(variant.nombre),
      }))
      .filter((variant) => {
        if (seen.has(variant.nombre)) return false
        seen.add(variant.nombre)
        return true
      })
  }, [product.variantes])
  const isVariantProduct = hasProductVariants(product) && variants.length > 0
  const [selectedVariantName, setSelectedVariantName] = useState(
    () => variants[0]?.nombre ?? "",
  )

  const selectedVariant =
    variants.find((variant) => variant.nombre === selectedVariantName) ?? variants[0]
  const selectedPrice = selectedVariant?.precio ?? product.precio
  const priceLabel = isVariantProduct
    ? selectedVariant
      ? `${normalizeVariantDisplayName(selectedVariant.nombre)} - ${formatPrice(selectedVariant.precio)}`
      : formatPrice(product.precio)
    : formatPrice(product.precio)

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
      <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
        {product.imagen ? (
          <Image
            src={product.imagen || "/placeholder.svg"}
            alt={product.nombre}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-10" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          {product.nombre}
        </h1>
        <span className="text-3xl font-bold text-primary">{priceLabel}</span>
        <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
          {product.descripcion || "Sin descripcion."}
        </p>

        {isVariantProduct ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {getVariantPickerLabel(product.tipo_variante)}
            </p>
            <div className="flex flex-wrap gap-2">
              {variants.map((variant) => (
                <Button
                  key={variant.nombre}
                  type="button"
                  variant={selectedVariantName === variant.nombre ? "default" : "outline"}
                  onClick={() => setSelectedVariantName(variant.nombre)}
                >
                  {normalizeVariantDisplayName(variant.nombre)} - {formatPrice(variant.precio)}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex w-full items-center justify-between rounded-lg border sm:w-auto">
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              onClick={() => setCantidad((c) => Math.max(1, c - 1))}
              aria-label="Disminuir cantidad"
            >
              <Minus className="size-4" />
            </Button>
            <span className="w-12 text-center font-medium">{cantidad}</span>
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              onClick={() => setCantidad((c) => c + 1)}
              aria-label="Aumentar cantidad"
            >
              <Plus className="size-4" />
            </Button>
          </div>

          <Button
            className="w-full flex-1"
            disabled={adding}
            onClick={() => {
              setAdding(true)
              addItem(product, cantidad, {
                variantName: isVariantProduct
                  ? normalizeVariantDisplayName(selectedVariant?.nombre ?? "")
                  : null,
                price: isVariantProduct ? selectedPrice : product.precio,
              })
              toast.success("Agregado al carrito", {
                description:
                  isVariantProduct && selectedVariant
                    ? `${cantidad} x ${product.nombre} - ${normalizeVariantDisplayName(selectedVariant.nombre)}`
                    : `${cantidad} x ${product.nombre}`,
              })
              setAdding(false)
            }}
          >
            {adding ? (
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <ShoppingCart className="size-4" />
            )}
            {adding ? "Agregando..." : "Agregar al carrito"}
          </Button>
        </div>
      </div>
    </div>
  )
}
