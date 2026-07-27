import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import type { Product } from "@/lib/types"
import { CatalogGrid } from "@/components/shop/catalog-grid"
import {
  getVisibleHomeCategories,
  HOME_SETTINGS_KEY,
  mergeHomeCategories,
  parseHomeSettings,
} from "@/lib/home-settings"
import { HowToBuyTutorial } from "@/components/shop/how-to-buy-tutorial"

export const dynamic = "force-dynamic"

type HomeProduct = {
  id: string
  nombre: string
  descripcion: string
  imagen: string | null
  categoria: string | null
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

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const { categoria } = await searchParams
  const supabase = await createClient()

  const [{ data: catalogData }, { data: homeMetaData }, settingsResult] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("activo", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("products")
      .select("id, nombre, descripcion, imagen, categoria")
      .eq("activo", true)
      .order("created_at", { ascending: false }),
    supabase.from("site_settings").select("value").eq("key", HOME_SETTINGS_KEY).maybeSingle(),
  ])

  const catalogProducts = (catalogData ?? []) as Product[]
  const products = (homeMetaData ?? []) as HomeProduct[]

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

  const categorySections = homeCategories
    .map((category) => {
      const categoryProducts = products.filter(
        (product) => product.categoria === category.nombre,
      )
      return {
        category,
        products: categoryProducts,
      }
    })
    .filter((section) => section.products.length > 0)

  return (
    <main className="overflow-hidden">
      <section id="catalogo" className="border-b bg-gradient-to-b from-sky-50/80 to-white">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              Catálogo de productos
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Consultá precios, agregá al carrito y pedí por WhatsApp sin registrarte.
            </p>
          </div>

          <CatalogGrid products={catalogProducts} initialCategory={categoria} />
        </div>
      </section>

      <HowToBuyTutorial />

      {categorySections.length > 0 ? (
        <section className="mx-auto max-w-6xl space-y-12 px-4 py-16 lg:px-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Categorías
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Explorá por categoría
            </h2>
          </div>

          {categorySections.map(({ category, products: sectionProducts }) => (
            <div key={category.nombre}>
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Categoría
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                    {category.nombre}
                  </h3>
                </div>
                <Link
                  href={`/?categoria=${encodeURIComponent(category.nombre)}#catalogo`}
                  className="text-sm font-medium hover:underline"
                >
                  Ver en catálogo
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                {sectionProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : (
        <section className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
          <div className="rounded-3xl border border-dashed bg-card p-8 text-center text-muted-foreground">
            Aún no hay categorías configuradas para el inicio.
          </div>
        </section>
      )}
    </main>
  )
}
