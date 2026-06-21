"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"
import type { Product } from "@/lib/types"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { ShoppingCart, ImageOff } from "lucide-react"

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
      <Link
        href={`/producto/${product.id}`}
        className="relative aspect-square overflow-hidden bg-muted"
      >
        {product.imagen ? (
          <Image
            src={product.imagen || "/placeholder.svg"}
            alt={product.nombre}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-8" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/producto/${product.id}`} className="flex-1">
          <h3 className="line-clamp-1 font-medium leading-tight">
            {product.nombre}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {product.descripcion}
          </p>
        </Link>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-lg font-semibold">
            {formatPrice(product.precio)}
          </span>
          <Button
            size="sm"
            disabled={adding}
            className="w-full sm:w-auto"
            onClick={() => {
              setAdding(true)
              addItem(product)
              toast.success("Agregado al carrito", {
                description: product.nombre,
              })
              setAdding(false)
            }}
          >
            {adding ? (
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <ShoppingCart className="size-4" />
            )}
            {adding ? "Agregando..." : "Agregar"}
          </Button>
        </div>
      </div>
    </div>
  )
}
