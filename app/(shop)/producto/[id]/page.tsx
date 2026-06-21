import Image from "next/image"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { APP_CONFIG } from "@/src/config/app-config"
import type { Product } from "@/lib/types"
import { ProductDetail } from "@/components/shop/product-detail"
import { LinkButton } from "@/components/ui/link-button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, LogIn, UserPlus } from "lucide-react"

export const dynamic = "force-dynamic"

type PublicProduct = Pick<
  Product,
  "id" | "nombre" | "descripcion" | "imagen"
> & {
  categoria: string | null
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAdmin = user?.email === APP_CONFIG.adminEmail
  const { data: profile } =
    user && !isAdmin
      ? await supabase
          .from("profiles")
          .select("approved")
          .eq("id", user.id)
          .maybeSingle()
      : { data: null }

  const canSeePrices = isAdmin || !!profile?.approved
  const query = canSeePrices
    ? "*"
    : "id, nombre, descripcion, imagen, categoria"

  const { data } = await supabase
    .from("products")
    .select(query as string)
    .eq("id", id)
    .maybeSingle()

  if (!data) notFound()

  const product = data as unknown as Product | PublicProduct

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <LinkButton href="/catalogo" variant="ghost" size="sm" className="mb-6 -ml-2">
        <ChevronLeft className="size-4" />
        Volver al catálogo
      </LinkButton>

      {canSeePrices ? (
        <ProductDetail product={product as Product} />
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted">
            {product.imagen ? (
              <Image
                src={product.imagen}
                alt={product.nombre}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : null}
          </div>

          <div className="flex flex-col gap-4">
            <Badge variant="secondary" className="w-fit rounded-full px-3 py-1">
              Catalogo público
            </Badge>
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              {product.nombre}
            </h1>
            <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
              {product.descripcion || "Sin descripcion."}
            </p>
            {"categoria" in product && product.categoria ? (
              <p className="text-sm text-muted-foreground">
                Categoria: <span className="font-medium">{product.categoria}</span>
              </p>
            ) : null}

            <div className="rounded-2xl border border-dashed bg-card p-5">
              <p className="text-sm font-medium">
                Inicia sesion para acceder a precios mayoristas
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Registrate o iniciá sesión para visualizar precios y agregar al
                carrito.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <LinkButton href="/login">
                  <LogIn className="size-4" />
                  Ingresar
                </LinkButton>
                <LinkButton href="/register" variant="outline">
                  <UserPlus className="size-4" />
                  Registrarse
                </LinkButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
