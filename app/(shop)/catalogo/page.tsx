import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { APP_CONFIG } from "@/src/config/app-config"
import type { Product } from "@/lib/types"
import { CatalogGrid } from "@/components/shop/catalog-grid"
import { LinkButton } from "@/components/ui/link-button"
import { Badge } from "@/components/ui/badge"
import { LogIn, Sparkles, UserPlus } from "lucide-react"

export const dynamic = "force-dynamic"

type PublicProduct = Pick<Product, "id" | "nombre" | "descripcion" | "imagen"> & {
  categoria: string | null
}

export default async function CatalogoPage() {
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
    .eq("activo", true)
    .order("created_at", { ascending: false })

  const products = (data ?? []) as unknown as Array<Product | PublicProduct>
  const categories = Array.from(
    new Set(products.map((product) => ("categoria" in product ? product.categoria : null)).filter(Boolean)),
  ).slice(0, 6) as string[]

  if (canSeePrices) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            Catologo de productos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Explorá nuestros productos y armá tu pedido.
          </p>
        </div>

        <CatalogGrid products={products as Product[]} />
      </main>
    )
  }

  const isPending = !!user && !isAdmin && !profile?.approved

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-background p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <Badge className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.24em]">
              Acceso limitado
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight text-balance">
              {isPending
                ? "Tu cuenta esta pendiente de aprobacion."
                : "Inicia sesion para acceder a precios mayoristas."}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground text-pretty">
              {isPending
                ? "Una vez aprobada podras visualizar precios, agregar productos al carrito y finalizar pedidos por WhatsApp."
                : "Mientras navegás el catálogo podes ver productos, imágenes y descripciones. Los precios quedan habilitados para usuarios aprobados."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {isPending ? (
              <LinkButton href="/pendiente" variant="outline">
                Ver estado
              </LinkButton>
            ) : (
              <>
                <LinkButton href="/login">
                  <LogIn className="size-4" />
                  Ingresar
                </LinkButton>
                <LinkButton href="/register" variant="outline">
                  <UserPlus className="size-4" />
                  Registrarse
                </LinkButton>
              </>
            )}
          </div>
        </div>
      </div>

      {categories.length > 0 ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge key={category} variant="secondary" className="rounded-full px-3 py-1">
              {category}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {(products as PublicProduct[]).map((product) => (
          <Link
            key={product.id}
            href={`/producto/${product.id}`}
            className="group overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative aspect-square overflow-hidden bg-muted">
              {product.imagen ? (
                <Image
                  src={product.imagen}
                  alt={product.nombre}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <Sparkles className="size-8" />
                </div>
              )}
            </div>
            <div className="space-y-2 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Catálogo público
                </p>
                <h2 className="mt-1 line-clamp-1 text-lg font-medium">
                  {product.nombre}
                </h2>
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {product.descripcion || "Sin descripcion."}
              </p>
              <div className="rounded-xl border border-dashed px-3 py-2 text-sm text-muted-foreground">
                Inicia sesion para acceder a precios mayoristas
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
