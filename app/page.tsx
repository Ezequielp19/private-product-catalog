import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { APP_CONFIG } from "@/src/config/app-config"
import { Badge } from "@/components/ui/badge"
import { LinkButton } from "@/components/ui/link-button"
import {
  getVisibleHomeCategories,
  HOME_SETTINGS_KEY,
  mergeHomeCategories,
  parseHomeSettings,
} from "@/lib/home-settings"
import { HowToBuyTutorial } from "@/components/shop/how-to-buy-tutorial"
import { ArrowRight, Camera, MessageCircle, ShieldCheck } from "lucide-react"

export const dynamic = "force-dynamic"

type HomeProduct = {
  id: string
  nombre: string
  descripcion: string
  imagen: string | null
  categoria: string | null
  destacado_inicio: boolean
  orden_inicio: number | null
}

function sortFeaturedProducts(products: HomeProduct[]) {
  return products
    .filter((product) => product.destacado_inicio)
    .sort((a, b) => {
      const orderA = a.orden_inicio ?? Number.MAX_SAFE_INTEGER
      const orderB = b.orden_inicio ?? Number.MAX_SAFE_INTEGER
      if (orderA !== orderB) return orderA - orderB
      return a.nombre.localeCompare(b.nombre)
    })
}

function ProductCard({ product }: { product: HomeProduct }) {
  return (
    <Link
      href={`/producto/${product.id}`}
      className="group overflow-hidden rounded-2xl border bg-background transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.imagen ? (
          <Image
            src={product.imagen}
            alt={product.nombre}
            fill
            sizes="(max-width: 640px) 50vw, 280px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="space-y-1 p-3">
        <h3 className="line-clamp-1 font-medium">{product.nombre}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {product.descripcion || "Sin descripción."}
        </p>
      </div>
    </Link>
  )
}

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: productsData }, settingsResult] = await Promise.all([
    supabase
      .from("products")
      .select("id, nombre, descripcion, imagen, categoria, destacado_inicio, orden_inicio")
      .eq("activo", true)
      .order("created_at", { ascending: false }),
    supabase.from("site_settings").select("value").eq("key", HOME_SETTINGS_KEY).maybeSingle(),
  ])

  const products = (productsData ?? []) as HomeProduct[]
  const categoryNames = Array.from(
    new Set(products.map((product) => product.categoria).filter(Boolean)),
  ) as string[]

  const savedSettings = settingsResult.error
    ? { categories: [] }
    : parseHomeSettings(settingsResult.data?.value)
  const homeCategories = getVisibleHomeCategories(
    savedSettings.categories.length > 0
      ? mergeHomeCategories(savedSettings.categories, categoryNames)
      : mergeHomeCategories(
          categoryNames.map((nombre, index) => ({
            nombre,
            visible: true,
            orden: index + 1,
          })),
          categoryNames,
        ),
  )

  const featuredProducts = sortFeaturedProducts(products).slice(0, 4)
  const heroProducts =
    featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4)

  const categorySections = homeCategories
    .map((category) => {
      const categoryProducts = products.filter(
        (product) => product.categoria === category.nombre,
      )
      const featuredInCategory = sortFeaturedProducts(categoryProducts)
      const sectionProducts =
        featuredInCategory.length > 0
          ? featuredInCategory.slice(0, 8)
          : categoryProducts.slice(0, 4)

      return {
        category,
        products: sectionProducts,
      }
    })
    .filter((section) => section.products.length > 0)

  const whatsappUrl = `https://wa.me/${APP_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    "Hola, quiero hacer una consulta sobre productos.",
  )}`

  return (
    <main className="overflow-hidden">
      <section className="border-b bg-gradient-to-b from-sky-100 via-white to-white">
        <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="relative size-14 overflow-hidden rounded-2xl border bg-white shadow-sm">
                <Image
                  src="/Gemini_Generated_Image_bfyoghbfyoghbfyo-removebg-preview.png"
                  alt={`${APP_CONFIG.companyName} logo`}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                  Mayorista
                </p>
                <p className="text-lg font-semibold">{APP_CONFIG.companyName}</p>
              </div>
            </div>

            <Badge className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.24em]">
              Venta mayorista
            </Badge>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                {APP_CONFIG.companyName} para comprar mejor, con catálogo abierto
                y precios visibles.
              </h1>
              <p className="max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
                Navegá el catálogo, consultá precios, armá tu carrito y finalizá
                tu pedido por WhatsApp sin necesidad de registrarte.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <LinkButton href="/catalogo" size="lg">
                Ver catálogo
                <ArrowRight className="size-4" />
              </LinkButton>
              <LinkButton href="/carrito" variant="outline" size="lg">
                Ver carrito
              </LinkButton>
              <LinkButton href={APP_CONFIG.instagramUrl} variant="ghost" size="lg" target="_blank" rel="noreferrer">
                <Camera className="size-4" />
                Instagram
              </LinkButton>
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              {["Catálogo abierto", "Precios visibles", "Pedido por WhatsApp"].map(
                (item) => (
                  <div key={item} className="rounded-2xl border bg-card/80 p-4">
                    <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <ShieldCheck className="size-5" />
                    </div>
                    <p className="font-medium">{item}</p>
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,.24),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,.18),_transparent_38%)]" />
            <div className="grid gap-4 rounded-[2rem] border bg-card/90 p-4 shadow-2xl shadow-primary/5 backdrop-blur">
              <div className="rounded-[1.5rem] bg-muted p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Productos destacados
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {heroProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border bg-background p-4">
                  <p className="text-sm text-muted-foreground">Contacto rápido</p>
                  <a
                    href={whatsappUrl}
                    className="mt-2 inline-flex items-center gap-2 font-medium text-primary"
                  >
                    <MessageCircle className="size-4" />
                    WhatsApp
                  </a>
                </div>
                <div className="rounded-2xl border bg-background p-4">
                  <p className="text-sm text-muted-foreground">Compra simple</p>
                  <p className="mt-2 font-medium">
                    Agregá al carrito y pedí por WhatsApp.
                  </p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border bg-gradient-to-br from-sky-100 to-white p-4">
                <p className="text-sm text-muted-foreground">Seguinos en redes</p>
                <a
                  href={APP_CONFIG.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-2 font-medium text-primary"
                >
                  <Camera className="size-4" />
                  Instagram @lmproductos
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HowToBuyTutorial />

      {categorySections.length > 0 ? (
        <section className="mx-auto max-w-6xl space-y-12 px-4 py-16">
          {categorySections.map(({ category, products: sectionProducts }) => (
            <div key={category.nombre}>
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Categoría
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                    {category.nombre}
                  </h2>
                </div>
                <Link
                  href={`/catalogo?categoria=${encodeURIComponent(category.nombre)}`}
                  className="hidden text-sm font-medium sm:inline-flex"
                >
                  Ver todo
                </Link>
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {sectionProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="rounded-3xl border border-dashed bg-card p-8 text-center text-muted-foreground">
            Aún no hay categorías configuradas para el inicio.
          </div>
        </section>
      )}
    </main>
  )
}
