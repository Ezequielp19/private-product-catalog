"use client"

import { useMemo, useState } from "react"
import type { Product } from "@/lib/types"
import { ProductCard } from "@/components/shop/product-card"
import { Input } from "@/components/ui/input"
import { Search, PackageOpen } from "lucide-react"

export function CatalogGrid({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q),
    )
  }, [products, query])

  return (
    <div className="flex flex-col gap-6">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar productos..."
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <PackageOpen className="size-10" />
          <p>No se encontraron productos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
