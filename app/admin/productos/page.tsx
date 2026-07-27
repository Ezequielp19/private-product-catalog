"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import type { Product, VariantTipo } from "@/lib/types"
import {
  getVariantPresetNames,
  hydrateVariantsFromPreset,
  inferVariantTipoFromNames,
  isVariantTipo,
  VARIANT_PRESETS,
} from "@/lib/variant-presets"
import {
  getProductPriceText,
  hasProductVariants,
  normalizeProductVariants,
} from "@/lib/product-pricing"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  Upload,
  ImageOff,
  ToggleLeft,
  ToggleRight,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const PAGE_SIZE = 10

type AdminProduct = Product

type ProductPricingMode = "single" | "variants"

type ProductVariantForm = {
  nombre: string
  precio: string
}

type ProductFormState = {
  nombre: string
  descripcion: string
  categoria: string
  precio: string
  pricingMode: ProductPricingMode
  variantTipo: VariantTipo
  variantes: ProductVariantForm[]
  activo: boolean
  destacadoInicio: boolean
  ordenInicio: string
  imagen: string | null
}

function createDefaultVariants(tipo: VariantTipo): ProductVariantForm[] {
  return getVariantPresetNames(tipo).map((nombre) => ({ nombre, precio: "" }))
}

const emptyForm: ProductFormState = {
  nombre: "",
  descripcion: "",
  categoria: "",
  precio: "",
  pricingMode: "single",
  variantTipo: "unit",
  variantes: [],
  activo: true,
  destacadoInicio: false,
  ordenInicio: "",
  imagen: null,
}

function variantSummary(product: AdminProduct) {
  if (!hasProductVariants(product)) return "Precio único"
  if (
    product.tipo_variante === "unit" ||
    inferVariantTipoFromNames(product.variantes) === "unit"
  ) {
    return "x 1u · x 6u · x 12u"
  }
  if (
    product.tipo_variante === "liquid" ||
    inferVariantTipoFromNames(product.variantes) === "liquid"
  ) {
    return "x1litro · x5litros · x20litros"
  }
  return `${normalizeProductVariants(product.variantes).length} variantes`
}

export default function AdminProductosPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [variantSchemaReady, setVariantSchemaReady] = useState(false)
  const [homeSchemaReady, setHomeSchemaReady] = useState(false)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [onlyActive, setOnlyActive] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminProduct | null>(null)
  const [form, setForm] = useState<ProductFormState>(emptyForm)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    setPage(1)
  }, [debouncedQuery, onlyActive])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const normalized = debouncedQuery.toLowerCase()
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let request = supabase
      .from("products")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })

    if (onlyActive) {
      request = request.eq("activo", true)
    }

    if (normalized) {
      const pattern = `%${normalized.replace(/[%_]/g, "")}%`
      request = request.or(
        `nombre.ilike.${pattern},descripcion.ilike.${pattern},categoria.ilike.${pattern}`,
      )
    }

    const { data, error, count } = await request.range(from, to)

    if (error) {
      toast.error("No se pudieron cargar los productos.")
      setProducts([])
      setTotalCount(0)
      setLoading(false)
      return
    }

    setProducts((data ?? []) as AdminProduct[])
    setTotalCount(count ?? 0)
    setLoading(false)
  }, [debouncedQuery, onlyActive, page])

  useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  useEffect(() => {
    void checkSchemas()
  }, [])

  async function checkSchemas() {
    const supabase = createClient()
    const variantCheck = await supabase
      .from("products")
      .select("modo_precio, variantes, tipo_variante")
      .limit(1)
    const homeCheck = await supabase
      .from("products")
      .select("destacado_inicio, orden_inicio")
      .limit(1)
    setVariantSchemaReady(!variantCheck.error)
    setHomeSchemaReady(!homeCheck.error)
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, totalCount)

  function openNew() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(product: AdminProduct) {
    const normalizedVariants = normalizeProductVariants(product.variantes).map((variant) => ({
      nombre: variant.nombre,
      precio: variant.precio,
    }))
    const inferredTipo = inferVariantTipoFromNames(normalizedVariants)
    const variantTipo = isVariantTipo(product.tipo_variante)
      ? product.tipo_variante
      : inferredTipo ?? "unit"
    const variants =
      product.modo_precio === "variants"
        ? hydrateVariantsFromPreset(variantTipo, normalizedVariants)
        : []

    setEditing(product)
    setForm({
      nombre: product.nombre,
      descripcion: product.descripcion ?? "",
      categoria: product.categoria ?? "",
      precio: String(product.precio ?? ""),
      pricingMode: product.modo_precio === "variants" ? "variants" : "single",
      variantTipo,
      variantes: variants,
      activo: product.activo,
      destacadoInicio: !!product.destacado_inicio,
      ordenInicio: product.orden_inicio != null ? String(product.orden_inicio) : "",
      imagen: product.imagen ?? null,
    })
    setDialogOpen(true)
  }

  async function uploadImage(file: File) {
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split(".").pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from("products").upload(path, file, {
      upsert: true,
    })

    if (error) {
      toast.error("No se pudo subir la imagen.")
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from("products").getPublicUrl(path)
    setForm((current) => ({ ...current, imagen: data.publicUrl }))
    setUploading(false)
  }

  async function saveProduct() {
    if (!form.nombre.trim()) {
      toast.error("El nombre es obligatorio.")
      return
    }

    const homeFields = {
      destacado_inicio: form.destacadoInicio,
      orden_inicio: form.ordenInicio.trim() ? Number(form.ordenInicio) : null,
    }

    if (form.pricingMode === "variants") {
      if (!variantSchemaReady) {
        toast.error("Falta aplicar la migracion de variantes.")
        return
      }

      const presetVariants = hydrateVariantsFromPreset(
        form.variantTipo,
        form.variantes.map((variant) => ({
          nombre: variant.nombre,
          precio: variant.precio,
        })),
      )
      const hasMissingPrice = presetVariants.some((variant) => !variant.precio.trim())

      if (hasMissingPrice) {
        toast.error(`Completa el precio de ${VARIANT_PRESETS[form.variantTipo].description}.`)
        return
      }

      const variantPayload = presetVariants.map((variant) => ({
        nombre: variant.nombre,
        precio: Number(variant.precio) || 0,
      }))
      const basePrice = Math.min(...variantPayload.map((variant) => variant.precio))

      setSaving(true)
      const supabase = createClient()
      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        categoria: form.categoria.trim() || null,
        precio: basePrice,
        modo_precio: "variants" as const,
        tipo_variante: form.variantTipo,
        variantes: variantPayload,
        activo: form.activo,
        imagen: form.imagen,
        ...homeFields,
      }

      const { error } = editing
        ? await supabase.from("products").update(payload).eq("id", editing.id)
        : await supabase.from("products").insert(payload)

      setSaving(false)

      if (error) {
        toast.error("No se pudo guardar el producto.")
        return
      }

      toast.success(editing ? "Producto actualizado" : "Producto creado")
      setDialogOpen(false)
      await loadProducts()
      return
    }

    setSaving(true)
    const supabase = createClient()
    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      categoria: form.categoria.trim() || null,
      precio: Number(form.precio) || 0,
      modo_precio: "single" as const,
      tipo_variante: null,
      variantes: [],
      activo: form.activo,
      imagen: form.imagen,
      ...homeFields,
    }

    const { error } = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload)

    setSaving(false)

    if (error) {
      toast.error("No se pudo guardar el producto.")
      return
    }

    toast.success(editing ? "Producto actualizado" : "Producto creado")
    setDialogOpen(false)
    await loadProducts()
  }

  async function toggleActive(product: AdminProduct) {
    setBusyId(product.id)
    const supabase = createClient()
    const { error } = await supabase
      .from("products")
      .update({ activo: !product.activo })
      .eq("id", product.id)

    setBusyId(null)

    if (error) {
      toast.error("No se pudo actualizar el estado.")
      return
    }

    await loadProducts()
  }

  async function deleteProduct(product: AdminProduct) {
    if (!confirm(`Eliminar ${product.nombre}?`)) return
    setBusyId(product.id)
    const supabase = createClient()
    const { error } = await supabase.from("products").delete().eq("id", product.id)
    setBusyId(null)

    if (error) {
      toast.error("No se pudo eliminar el producto.")
      return
    }

    toast.success("Producto eliminado")
    if (products.length === 1 && page > 1) {
      setPage((current) => current - 1)
    } else {
      await loadProducts()
    }
  }

  function updateVariantPrice(index: number, value: string) {
    setForm((current) => ({
      ...current,
      variantes: current.variantes.map((variant, currentIndex) =>
        currentIndex === index ? { ...variant, precio: value } : variant,
      ),
    }))
  }

  function setPricingMode(pricingMode: ProductPricingMode) {
    setForm((current) => ({
      ...current,
      pricingMode,
      variantes:
        pricingMode === "variants" ? createDefaultVariants(current.variantTipo) : [],
    }))
  }

  function fillAllVariantPricesFromSingle() {
    setForm((current) => {
      if (!current.precio.trim()) return current
      return {
        ...current,
        variantes: current.variantes.map((variant) => ({
          ...variant,
          precio: current.precio,
        })),
      }
    })
  }

  function setVariantTipo(variantTipo: VariantTipo) {
    setForm((current) => ({
      ...current,
      variantTipo,
      variantes:
        current.pricingMode === "variants" ? createDefaultVariants(variantTipo) : current.variantes,
    }))
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8 md:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Listado paginado de a {PAGE_SIZE} productos. Buscá, editá precios y variantes.
          </p>
        </div>

        <Button onClick={openNew} className="w-full sm:w-auto">
          <Plus className="size-4" />
          Nuevo producto
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, descripción o categoría..."
            className="pl-9"
          />
        </div>
        <Button
          variant={onlyActive ? "default" : "outline"}
          onClick={() => setOnlyActive((value) => !value)}
          className="w-full sm:w-auto"
        >
          {onlyActive ? "Solo activos" : "Todos los productos"}
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>
          {totalCount === 0
            ? "Sin resultados"
            : `Mostrando ${rangeStart}-${rangeEnd} de ${totalCount} productos`}
        </span>
        <span>
          Página {page} de {totalPages}
        </span>
      </div>

      <div className="mt-3 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border bg-card py-16 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card py-16 text-center text-muted-foreground">
            No hay productos para mostrar.
          </div>
        ) : (
          products.map((product) => (
            <article
              key={product.id}
              className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border bg-muted">
                  {product.imagen ? (
                    <Image
                      src={product.imagen}
                      alt={product.nombre}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <ImageOff className="size-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{product.nombre}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.categoria || "Sin categoría"}
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="font-medium">{getProductPriceText(product)}</span>
                    <span className="text-muted-foreground"> · {variantSummary(product)}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                {product.destacado_inicio ? (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="size-3 fill-current" />
                    Inicio #{product.orden_inicio ?? "-"}
                  </Badge>
                ) : null}
                <Badge variant={product.activo ? "default" : "secondary"}>
                  {product.activo ? "Activo" : "Inactivo"}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleActive(product)}
                  disabled={busyId === product.id}
                  aria-label={product.activo ? "Desactivar" : "Activar"}
                >
                  {product.activo ? (
                    <ToggleRight className="size-4" />
                  ) : (
                    <ToggleLeft className="size-4" />
                  )}
                </Button>
                <Button size="sm" onClick={() => openEdit(product)}>
                  <Pencil className="size-4" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteProduct(product)}
                  disabled={busyId === product.id}
                  aria-label="Eliminar"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          ))
        )}
      </div>

      {totalCount > PAGE_SIZE ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ChevronLeft className="size-4" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            Siguiente
            <ChevronRight className="size-4" />
          </Button>
        </div>
      ) : null}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="shrink-0 border-b px-5 py-4 text-left">
            <DialogTitle>{editing ? "Editar producto" : "Nuevo producto"}</DialogTitle>
            <DialogDescription>
              Completá por secciones. Guardá al final cuando termines.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-4">
            <div className="space-y-6">
              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  1. Datos del producto
                </h3>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="relative mx-auto size-24 shrink-0 overflow-hidden rounded-xl border bg-muted sm:mx-0">
                    {form.imagen ? (
                      <Image
                        src={form.imagen}
                        alt="Vista previa"
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <ImageOff className="size-6" />
                      </div>
                    )}
                  </div>
                  <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/30 px-4 py-6 text-sm font-medium hover:bg-muted/50">
                    {uploading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}
                    {uploading ? "Subiendo imagen..." : "Subir imagen del producto"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) void uploadImage(file)
                      }}
                      disabled={uploading}
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={form.nombre}
                    onChange={(e) =>
                      setForm((current) => ({ ...current, nombre: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Input
                    id="categoria"
                    value={form.categoria}
                    onChange={(e) =>
                      setForm((current) => ({ ...current, categoria: e.target.value }))
                    }
                    placeholder="Ej: Envases y tapas"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    rows={3}
                    value={form.descripcion}
                    onChange={(e) =>
                      setForm((current) => ({ ...current, descripcion: e.target.value }))
                    }
                    placeholder="Opcional"
                  />
                </div>
              </section>

              <Separator />

              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  2. Precios
                </h3>

                <div className="grid grid-cols-2 gap-2 rounded-xl border bg-muted/20 p-1">
                  <button
                    type="button"
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-medium transition",
                      form.pricingMode === "single"
                        ? "bg-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => setPricingMode("single")}
                  >
                    Un solo precio
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-medium transition",
                      form.pricingMode === "variants"
                        ? "bg-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => setPricingMode("variants")}
                    disabled={!variantSchemaReady}
                  >
                    Con variantes
                  </button>
                </div>

                {form.pricingMode === "single" ? (
                  <div className="space-y-2">
                    <Label htmlFor="precio">Precio</Label>
                    <Input
                      id="precio"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.precio}
                      onChange={(e) =>
                        setForm((current) => ({ ...current, precio: e.target.value }))
                      }
                      placeholder="0"
                      className="max-w-xs"
                    />
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Para tapas, gatillos o accesorios: elegí{" "}
                      <strong>Con variantes → Por unidades</strong>. Para líquidos:{" "}
                      <strong>Por litros</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 rounded-xl border bg-muted/10 p-4">
                    <p className="text-sm font-medium">Tipo de variantes</p>
                    <div className="space-y-2">
                      {(Object.keys(VARIANT_PRESETS) as VariantTipo[]).map((tipo) => (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => setVariantTipo(tipo)}
                          className={cn(
                            "w-full rounded-xl border px-4 py-3 text-left transition",
                            form.variantTipo === tipo
                              ? "border-sky-500 bg-sky-50 ring-1 ring-sky-500/30"
                              : "bg-background hover:border-sky-200",
                          )}
                        >
                          <p className="font-medium">{VARIANT_PRESETS[tipo].label}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {VARIANT_PRESETS[tipo].description}
                          </p>
                        </button>
                      ))}
                    </div>

                    {form.precio.trim() ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={fillAllVariantPricesFromSingle}
                      >
                        Usar ${form.precio} en las 3 variantes
                      </Button>
                    ) : null}

                    <div className="space-y-3">
                      <p className="text-sm font-medium">Precio por variante</p>
                      {form.variantes.map((variant, index) => (
                        <div key={variant.nombre} className="space-y-1.5">
                          <Label htmlFor={`variant-${index}`}>{variant.nombre}</Label>
                          <Input
                            id={`variant-${index}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={variant.precio}
                            onChange={(e) => updateVariantPrice(index, e.target.value)}
                            placeholder="Precio"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <Separator />

              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  3. Publicación
                </h3>

                <div className="flex items-center justify-between gap-3 rounded-xl border p-4">
                  <div>
                    <Label htmlFor="activo">Producto activo</Label>
                    <p className="text-xs text-muted-foreground">Visible en el catálogo.</p>
                  </div>
                  <Switch
                    id="activo"
                    checked={form.activo}
                    onCheckedChange={(checked) =>
                      setForm((current) => ({ ...current, activo: checked }))
                    }
                  />
                </div>

                {homeSchemaReady ? (
                  <div className="space-y-3 rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <Label htmlFor="destacado-inicio">Destacar en inicio</Label>
                        <p className="text-xs text-muted-foreground">
                          Aparece primero en la home.
                        </p>
                      </div>
                      <Switch
                        id="destacado-inicio"
                        checked={form.destacadoInicio}
                        onCheckedChange={(checked) =>
                          setForm((current) => ({ ...current, destacadoInicio: checked }))
                        }
                      />
                    </div>
                    {form.destacadoInicio ? (
                      <div className="space-y-2">
                        <Label htmlFor="orden-inicio">Orden en inicio</Label>
                        <Input
                          id="orden-inicio"
                          type="number"
                          min="1"
                          value={form.ordenInicio}
                          onChange={(e) =>
                            setForm((current) => ({ ...current, ordenInicio: e.target.value }))
                          }
                          placeholder="1 = primero"
                          className="max-w-[8rem]"
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </section>
            </div>
          </div>

          <DialogFooter className="shrink-0 gap-2 border-t bg-muted/20 px-5 py-4 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={saveProduct}
              disabled={saving || uploading}
              className="w-full sm:w-auto"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : "Guardar producto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
