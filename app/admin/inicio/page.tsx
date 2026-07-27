"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Product } from "@/lib/types"
import {
  HOME_SETTINGS_KEY,
  mergeHomeCategories,
  parseHomeSettings,
  type HomeCategoryConfig,
} from "@/lib/home-settings"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Eye, EyeOff, Loader2, Save, Star } from "lucide-react"

type HomeProduct = Pick<Product, "id" | "nombre" | "categoria" | "imagen" | "activo">

function sortCategories(categories: HomeCategoryConfig[]) {
  return [...categories].sort((a, b) => a.orden - b.orden)
}

function promoteCategory(
  categories: HomeCategoryConfig[],
  categoryName: string,
): HomeCategoryConfig[] {
  const sorted = sortCategories(categories)
  const index = sorted.findIndex((category) => category.nombre === categoryName)
  if (index < 0) return sorted

  const [selected] = sorted.splice(index, 1)
  const next = [selected, ...sorted].map((category, orderIndex) => ({
    ...category,
    visible: category.nombre === categoryName ? true : category.visible,
    orden: orderIndex + 1,
  }))

  return next
}

export default function AdminInicioPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [schemaReady, setSchemaReady] = useState(true)
  const [categories, setCategories] = useState<HomeCategoryConfig[]>([])
  const [products, setProducts] = useState<HomeProduct[]>([])
  const [selectionMessage, setSelectionMessage] = useState("")

  useEffect(() => {
    void loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const supabase = createClient()

    const schemaCheck = await supabase.from("site_settings").select("key").limit(1)
    if (schemaCheck.error) {
      setSchemaReady(false)
      setLoading(false)
      return
    }

    const [{ data: productRows }, { data: settingsRow }] = await Promise.all([
      supabase
        .from("products")
        .select("id, nombre, categoria, imagen, activo")
        .order("nombre", { ascending: true }),
      supabase.from("site_settings").select("value").eq("key", HOME_SETTINGS_KEY).maybeSingle(),
    ])

    const loadedProducts = (productRows ?? []) as HomeProduct[]
    const categoryNames = Array.from(
      new Set(loadedProducts.map((product) => product.categoria).filter(Boolean)),
    ) as string[]

    const savedSettings = parseHomeSettings(settingsRow?.value)
    setCategories(mergeHomeCategories(savedSettings.categories, categoryNames))
    setProducts(loadedProducts)
    setLoading(false)
  }

  const productsByCategory = useMemo(() => {
    const grouped = new Map<string, HomeProduct[]>()

    for (const product of products) {
      const key = product.categoria?.trim() || "Sin categoria"
      const current = grouped.get(key) ?? []
      current.push(product)
      grouped.set(key, current)
    }

    return grouped
  }, [products])

  const orderedCategories = useMemo(() => sortCategories(categories), [categories])
  const visibleCategories = orderedCategories.filter((category) => category.visible)
  const primaryCategory = visibleCategories[0]?.nombre ?? orderedCategories[0]?.nombre ?? ""

  async function saveHomeConfig(nextCategories: HomeCategoryConfig[]) {
    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase.from("site_settings").upsert(
      {
        key: HOME_SETTINGS_KEY,
        value: { categories: nextCategories },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    )

    setSaving(false)

    if (error) {
      toast.error("No se pudo guardar la configuracion de categorias.")
      return false
    }

    setCategories(nextCategories)
    toast.success("Configuracion del inicio guardada")
    return true
  }

  async function handlePromoteCategory(categoryName: string) {
    const nextCategories = promoteCategory(categories, categoryName)
    const saved = await saveHomeConfig(nextCategories)
    if (!saved) return

    const selected = nextCategories.find((category) => category.nombre === categoryName)
    setSelectionMessage(
      `Ahora los productos de la categoria "${selected?.nombre ?? categoryName}" apareceran primero.`,
    )
    toast.success(`"${selected?.nombre ?? categoryName}" quedo primera en la web.`)
  }

  function toggleCategoryVisibility(nombre: string) {
    const nextCategories = orderedCategories.map((item) =>
      item.nombre === nombre ? { ...item, visible: !item.visible } : item,
    )
    setCategories(nextCategories)
  }

  if (!schemaReady) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <h1 className="text-2xl font-semibold">Pagina de inicio</h1>
        <p className="mt-3 text-sm text-amber-600">
          Ejecuta primero <span className="font-medium">scripts/006_home_and_variant_types.sql</span>{" "}
          en Supabase para habilitar esta seccion.
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8 md:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pagina de inicio</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Elegi una categoria principal y la web la mostrara primero. Después siguen las
            demas categorias en el orden que definas aca.
          </p>
        </div>
        <Button
          onClick={() => void saveHomeConfig(orderedCategories)}
          disabled={saving || loading}
          className="w-full sm:w-auto"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Guardar cambios
        </Button>
      </div>

      {loading ? (
        <div className="mt-10 flex items-center justify-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          <section className="rounded-3xl border bg-gradient-to-br from-sky-50 to-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  1. Categoria principal
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  La primera categoria es la que se ve antes en la web
                </h2>
              </div>
              <Badge variant="secondary">{visibleCategories.length} visibles</Badge>
            </div>

            {selectionMessage ? (
              <div className="mb-4 rounded-2xl border-2 border-primary bg-primary/10 p-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Categoria seleccionada
                </p>
                <p className="mt-2 text-2xl font-bold text-balance">
                  {selectionMessage}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Primero aparece esa categoria y luego el resto en orden.
                </p>
              </div>
            ) : (
              <div className="mb-4 rounded-2xl border border-dashed bg-background/80 p-5 text-sm text-muted-foreground">
                Tocá una categoria para moverla al primer lugar.
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {orderedCategories.length === 0 ? (
                <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">
                  Todavia no hay categorias. Cargalas en los productos desde Productos.
                </p>
              ) : (
                orderedCategories.map((category) => {
                  const isPrimary = category.nombre === primaryCategory
                  return (
                    <button
                      key={category.nombre}
                      type="button"
                      onClick={() => void handlePromoteCategory(category.nombre)}
                      className="rounded-2xl border bg-background p-4 text-left transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold">{category.nombre}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {(productsByCategory.get(category.nombre) ?? []).length} productos
                          </p>
                        </div>
                        <Badge variant={isPrimary ? "default" : "outline"} className="shrink-0">
                          {isPrimary ? "Primera" : "Elegir"}
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {isPrimary
                          ? "Esta categoria aparece primero en la web."
                          : "Tocala para ponerla primero."}
                      </p>
                    </button>
                  )
                })
              )}
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">2. Visibilidad</h2>
                <p className="text-sm text-muted-foreground">
                  Activá las categorias que quieras mostrar. Las visibles salen en la web.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {orderedCategories.map((category) => (
                <div
                  key={category.nombre}
                  className="flex flex-col gap-3 rounded-xl border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    {category.visible ? (
                      <Eye className="size-4 text-primary" />
                    ) : (
                      <EyeOff className="size-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">{category.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        {(productsByCategory.get(category.nombre) ?? []).length} productos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Mostrar</span>
                    <Switch
                      checked={category.visible}
                      onCheckedChange={() => toggleCategoryVisibility(category.nombre)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              No hace falta mover productos uno por uno. Elegi una categoria principal y la
              web la mostrara antes que las demas.
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
