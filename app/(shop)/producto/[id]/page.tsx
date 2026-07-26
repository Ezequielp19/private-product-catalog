import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Product } from "@/lib/types"
import { ProductDetail } from "@/components/shop/product-detail"
import { LinkButton } from "@/components/ui/link-button"
import { ChevronLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (!data) notFound()

  const product = data as Product

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <LinkButton href="/#catalogo" variant="ghost" size="sm" className="mb-6 -ml-2">
        <ChevronLeft className="size-4" />
        Volver al catálogo
      </LinkButton>

      <ProductDetail product={product} />
    </main>
  )
}
