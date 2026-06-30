import { createClient } from "@/lib/supabase/server"
import type { Product } from "@/lib/types"
import { CatalogGrid } from "@/components/shop/catalog-grid"

export const dynamic = "force-dynamic"

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const { categoria } = await searchParams
  const supabase = await createClient()

  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("activo", true)
    .order("created_at", { ascending: false })

  const products = (data ?? []) as Product[]

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          Catologo de productos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Explorá nuestros productos, consultá precios y armá tu pedido.
        </p>
      </div>

      <CatalogGrid products={products} initialCategory={categoria} />
    </main>
  )
}
