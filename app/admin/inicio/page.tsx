"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  ImageOff,
  Loader2,
  Save,
  Star,
} from "lucide-react"

type HomeProduct = Pick<
  Product,
  "id" | "nombre" | "categoria" | "imagen" | "activo" | "destacado_inicio" | "orden_inicio"
>

type ProductHomeState = {
  id: string
  destacadoInicio: boolean
  ordenInicio: string
}

export default function AdminInicioPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [schemaReady, setSchemaReady] = useState(true)
  const [categories, setCategories] = useState<HomeCategoryConfig[]>([])
  const [products, setProducts] = useState<HomeProduct[]>([])
  const [productStates, setProductStates] = useState<Record<string, ProductHomeState>>({})

  useEffect(() => {
    void loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const supabase = createClient()

    const schemaCheck = await Promise.all([
      supabase.from("products").select("destacado_inicio, orden_inicio").limit(1),
      supabase.from("site_settings").select("key").limit(1),
    ])

    if (schemaCheck.some((result) => result.error)) {
      setSchemaReady(false)
      setLoading(false)
      return
    }

    const [{ data: productRows }, { data: settingsRow }] = await Promise.all([
      supabase
        .from("products")
        .select("id, nombre, categoria, imagen, activo, destacado_inicio, orden_inicio")
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
    setProductStates(
      Object.fromEntries(
        loadedProducts.map((product) => [
          product.id,
          {
            id: product.id,
            destacadoInicio: !!product.destacado_inicio,
            ordenInicio:
              product.orden_inicio != null ? String(product.orden_inicio) : "",
          },
        ]),
      ),
    )
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

  const visibleCategories = categories.filter((category) => category.visible)

  function moveCategory(nombre: string, direction: -1 | 1) {
    setCategories((current) => {
      const sorted = [...current].sort((a, b) => a.orden - b.orden)
      const index = sorted.findIndex((item) => item.nombre === nombre)
      const targetIndex = index + direction
      if (index < 0 || targetIndex < 0 || targetIndex >= sorted.length) return current

      const next = [...sorted]
      const [item] = next.splice(index, 1)
      next.splice(targetIndex, 0, item)

      return next.map((entry, entryIndex) => ({
        ...entry,
        orden: entryIndex + 1,
      }))
    })
  }

  function toggleCategoryVisibility(nombre: string) {
    setCategories((current) =>
      current.map((item) =>
        item.nombre === nombre ? { ...item, visible: !item.visible } : item,
      ),
    )
  }

  function updateProductState(id: string, patch: Partial<ProductHomeState>) {
    setProductStates((current) => ({
      ...current,
      [id]: { ...current[id], ...patch },
    }))
  }

  async function saveHomeConfig() {
    setSaving(true)
    const supabase = createClient()

    const { error: settingsError } = await supabase.from("site_settings").upsert(
      {
        key: HOME_SETTINGS_KEY,
        value: { categories },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    )

    if (settingsError) {
      setSaving(false)
      toast.error("No se pudo guardar la configuracion de categorias.")
      return
    }

    const updates = Object.values(productStates)
    for (const item of updates) {
      const { error } = await supabase
        .from("products")
        .update({
          destacado_inicio: item.destacadoInicio,
          orden_inicio: item.ordenInicio.trim() ? Number(item.ordenInicio) : null,
        })
        .eq("id", item.id)

      if (error) {
        setSaving(false)
        toast.error("No se pudieron guardar los productos destacados.")
        return
      }
    }

    setSaving(false)
    toast.success("Configuracion del inicio guardada")
    await loadData()
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
            Elegí que categorias y productos aparecen primero en la home. Las categorias
            visibles se muestran en orden y dentro de cada una van los productos destacados.
          </p>
        </div>
        <Button onClick={saveHomeConfig} disabled={saving || loading} className="w-full sm:w-auto">
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
          <section className="rounded-2xl border bg-card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">1. Categorias en el inicio</h2>
                <p className="text-sm text-muted-foreground">
                  Activá las que quieras mostrar y ordenalas con las flechas.
                </p>
              </div>
              <Badge variant="secondary">{visibleCategories.length} visibles</Badge>
            </div>

            <div className="space-y-3">
              {categories.length === 0 ? (
                <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                  Todavia no hay categorias. Cargalas en los productos desde Productos.
                </p>
              ) : (
                categories
                  .slice()
                  .sort((a, b) => a.orden - b.orden)
                  .map((category, index, list) => (
                    <div
                      key={category.nombre}
                      className="flex flex-col gap-3 rounded-xl border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="rounded-full px-2.5">
                          {category.orden}
                        </Badge>
                        <div>
                          <p className="font-medium">{category.nombre}</p>
                          <p className="text-xs text-muted-foreground">
                            {(productsByCategory.get(category.nombre) ?? []).length} productos
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
                          {category.visible ? (
                            <Eye className="size-4 text-primary" />
                          ) : (
                            <EyeOff className="size-4 text-muted-foreground" />
                          )}
                          <Label htmlFor={`cat-${category.nombre}`} className="text-sm">
                            Mostrar
                          </Label>
                          <Switch
                            id={`cat-${category.nombre}`}
                            checked={category.visible}
                            onCheckedChange={() => toggleCategoryVisibility(category.nombre)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={index === 0}
                          onClick={() => moveCategory(category.nombre, -1)}
                          aria-label="Subir categoria"
                        >
                          <ArrowUp className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={index === list.length - 1}
                          onClick={() => moveCategory(category.nombre, 1)}
                          aria-label="Bajar categoria"
                        >
                          <ArrowDown className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-5">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">2. Productos destacados por categoria</h2>
              <p className="text-sm text-muted-foreground">
                Marcá los productos que quieras mostrar primero. El numero de orden define
                cual aparece antes dentro de su categoria.
              </p>
            </div>

            <div className="space-y-6">
              {categories
                .slice()
                .sort((a, b) => a.orden - b.orden)
                .map((category) => {
                  const categoryProducts = productsByCategory.get(category.nombre) ?? []
                  if (categoryProducts.length === 0) return null

                  return (
                    <div key={category.nombre} className="rounded-xl border bg-background p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <h3 className="font-medium">{category.nombre}</h3>
                        {!category.visible ? (
                          <Badge variant="secondary">Oculta en inicio</Badge>
                        ) : null}
                      </div>

                      <div className="space-y-3">
                        {categoryProducts.map((product) => {
                          const state = productStates[product.id]
                          if (!state) return null

                          return (
                            <div
                              key={product.id}
                              className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center"
                            >
                              <div className="flex min-w-0 flex-1 items-center gap-3">
                                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
                                  {product.imagen ? (
                                    <Image
                                      src={product.imagen}
                                      alt={product.nombre}
                                      fill
                                      sizes="48px"
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                      <ImageOff className="size-4" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate font-medium">{product.nombre}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {product.activo ? "Activo" : "Inactivo"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={state.destacadoInicio}
                                    onCheckedChange={(checked) =>
                                      updateProductState(product.id, {
                                        destacadoInicio: checked,
                                      })
                                    }
                                  />
                                  <span className="inline-flex items-center gap-1 text-sm">
                                    <Star className="size-3.5" />
                                    Destacar
                                  </span>
                                </div>
                                {state.destacadoInicio ? (
                                  <div className="flex items-center gap-2">
                                    <Label htmlFor={`orden-${product.id}`} className="text-sm">
                                      Orden
                                    </Label>
                                    <Input
                                      id={`orden-${product.id}`}
                                      type="number"
                                      min="1"
                                      className="w-20"
                                      value={state.ordenInicio}
                                      onChange={(e) =>
                                        updateProductState(product.id, {
                                          ordenInicio: e.target.value,
                                        })
                                      }
                                      placeholder="1"
                                    />
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
