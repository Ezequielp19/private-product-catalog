"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import type { Product, VariantTipo } from "@/lib/types"
import {
  getVariantPresetNames,
  hydrateVariantsFromPreset,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
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
} from "lucide-react"

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
  variantTipo: "liquid",
  variantes: [],
  activo: true,
  destacadoInicio: false,
  ordenInicio: "",
  imagen: null,
}

export default function AdminProductosPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [variantSchemaReady, setVariantSchemaReady] = useState(false)
  const [homeSchemaReady, setHomeSchemaReady] = useState(false)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [onlyActive, setOnlyActive] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminProduct | null>(null)
  const [form, setForm] = useState<ProductFormState>(emptyForm)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadProducts()
    checkSchemas()
  }, [])

  async function checkSchemas() {
    const supabase = createClient()
    const variantCheck = await supabase.from("products").select("modo_precio, variantes, tipo_variante").limit(1)
    const homeCheck = await supabase.from("products").select("destacado_inicio, orden_inicio").limit(1)
    setVariantSchemaReady(!variantCheck.error)
    setHomeSchemaReady(!homeCheck.error)
  }

  async function loadProducts() {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      toast.error("No se pudieron cargar los productos.")
      setProducts([])
      setLoading(false)
      return
    }

    setProducts((data ?? []) as AdminProduct[])
    setLoading(false)
  }

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return products.filter((product) => {
      const matchesQuery =
        !normalized ||
        product.nombre.toLowerCase().includes(normalized) ||
        product.descripcion.toLowerCase().includes(normalized) ||
        (product.categoria ?? "").toLowerCase().includes(normalized)

      const matchesActive = !onlyActive || product.activo
      return matchesQuery && matchesActive
    })
  }, [products, query, onlyActive])

  function openNew() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(product: AdminProduct) {
    const variantTipo = isVariantTipo(product.tipo_variante) ? product.tipo_variante : "liquid"
    const variants =
      product.modo_precio === "variants"
        ? hydrateVariantsFromPreset(
            variantTipo,
            normalizeProductVariants(product.variantes).map((variant) => ({
              nombre: variant.nombre,
              precio: variant.precio,
            })),
          )
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

    const homeFields = homeSchemaReady
      ? {
          destacado_inicio: form.destacadoInicio,
          orden_inicio: form.ordenInicio.trim() ? Number(form.ordenInicio) : null,
        }
      : {}

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
    await loadProducts()
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
            Gestiona el catalogo, imagenes, variantes y precios.
          </p>
          {!variantSchemaReady ? (
            <p className="mt-2 text-sm text-amber-600">
              Para usar variantes, ejecuta primero{" "}
              <span className="font-medium">scripts/005_product_variants.sql</span> y{" "}
              <span className="font-medium">scripts/006_home_and_variant_types.sql</span>.
            </p>
          ) : null}
        </div>

        <Button onClick={openNew} className="w-full sm:w-auto">
          <Plus className="size-4" />
          Nuevo producto
        </Button>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, descripcion o categoria..."
            className="pl-9"
          />
        </div>
        <Button
          variant={onlyActive ? "default" : "outline"}
          onClick={() => setOnlyActive((value) => !value)}
          className="w-full md:w-auto"
        >
          {onlyActive ? "Mostrando activos" : "Ver solo activos"}
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border bg-card">
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Inicio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  Cargando productos...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  No hay productos para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 overflow-hidden rounded-lg border bg-muted">
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
                      <div>
                        <p className="font-medium">{product.nombre}</p>
                        <p className="line-clamp-1 text-sm text-muted-foreground">
                          {product.descripcion}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.categoria || "Sin categoria"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{getProductPriceText(product)}</span>
                      <span className="text-xs text-muted-foreground">
                        {hasProductVariants(product)
                          ? product.tipo_variante === "unit"
                            ? "X1U / X6U / X12U"
                            : product.tipo_variante === "liquid"
                              ? "X1litro / X5litros / X20litros"
                              : `${normalizeProductVariants(product.variantes).length} variantes`
                          : "Sin variantes"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.destacado_inicio ? (
                      <Badge className="gap-1">
                        <Star className="size-3 fill-current" />
                        {product.orden_inicio ?? "-"}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.activo ? "default" : "secondary"}>
                      {product.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleActive(product)}
                        disabled={busyId === product.id}
                      >
                        {product.activo ? (
                          <ToggleRight className="size-4" />
                        ) : (
                          <ToggleLeft className="size-4" />
                        )}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEdit(product)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteProduct(product)}
                        disabled={busyId === product.id}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar producto" : "Nuevo producto"}</DialogTitle>
            <DialogDescription>
              Completa los datos del producto y guardalo en el catalogo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label>Imagen</Label>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative h-24 w-full overflow-hidden rounded-lg border bg-muted sm:size-20 sm:w-20">
                  {form.imagen ? (
                    <Image
                      src={form.imagen}
                      alt="Vista previa"
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <ImageOff className="size-5" />
                    </div>
                  )}
                </div>
                <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium hover:bg-accent sm:w-auto">
                  {uploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  {uploading ? "Subiendo..." : "Subir imagen"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        void uploadImage(file)
                      }
                    }}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={form.nombre}
                  onChange={(e) => setForm((current) => ({ ...current, nombre: e.target.value }))}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  value={form.categoria}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, categoria: e.target.value }))
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="precio">Precio</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={form.pricingMode === "single" ? "default" : "outline"}
                    onClick={() => setPricingMode("single")}
                  >
                    Sin variantes
                  </Button>
                  <Button
                    type="button"
                    variant={form.pricingMode === "variants" ? "default" : "outline"}
                    onClick={() => setPricingMode("variants")}
                    disabled={!variantSchemaReady}
                  >
                    Con variantes
                  </Button>
                </div>

                {form.pricingMode === "single" ? (
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
                  />
                ) : (
                  <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">
                      Elegí el tipo de presentacion para este producto.
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(Object.keys(VARIANT_PRESETS) as VariantTipo[]).map((tipo) => (
                        <Button
                          key={tipo}
                          type="button"
                          variant={form.variantTipo === tipo ? "default" : "outline"}
                          onClick={() => setVariantTipo(tipo)}
                          className="h-auto flex-col items-start gap-1 px-3 py-3 text-left"
                        >
                          <span className="font-medium">{VARIANT_PRESETS[tipo].label}</span>
                          <span className="text-xs opacity-80">
                            {VARIANT_PRESETS[tipo].description}
                          </span>
                        </Button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {form.variantes.map((variant, index) => (
                        <div
                          key={variant.nombre}
                          className="grid gap-2 md:grid-cols-[120px_1fr]"
                        >
                          <div className="flex items-center rounded-lg border bg-background px-3 text-sm font-medium">
                            {variant.nombre}
                          </div>
                          <Input
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
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <Label htmlFor="descripcion">Descripcion</Label>
                <Textarea
                  id="descripcion"
                  rows={5}
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, descripcion: e.target.value }))
                  }
                />
              </div>

              {homeSchemaReady ? (
                <div className="flex flex-col gap-3 rounded-xl border p-3 md:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <Label htmlFor="destacado-inicio">Destacar en inicio</Label>
                      <p className="text-xs text-muted-foreground">
                        Aparece primero en la pagina principal.
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
                    <div className="flex flex-col gap-2">
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
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="flex flex-col items-start justify-between gap-3 rounded-xl border p-3 sm:flex-row sm:items-center md:col-span-2">
                <div>
                  <Label htmlFor="activo">Producto activo</Label>
                  <p className="text-xs text-muted-foreground">
                    Visible para el catalogo publico.
                  </p>
                </div>
                <Switch
                  id="activo"
                  checked={form.activo}
                  onCheckedChange={(checked) =>
                    setForm((current) => ({ ...current, activo: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={saveProduct} disabled={saving || uploading} className="w-full sm:w-auto">
              {saving ? <Loader2 className="size-4 animate-spin" /> : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
