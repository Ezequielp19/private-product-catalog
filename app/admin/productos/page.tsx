"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import type { Product } from "@/lib/types"
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
} from "lucide-react"

type AdminProduct = Product & {
  categoria: string | null
}

type ProductFormState = {
  nombre: string
  descripcion: string
  categoria: string
  precio: string
  activo: boolean
  imagen: string | null
}

const emptyForm: ProductFormState = {
  nombre: "",
  descripcion: "",
  categoria: "",
  precio: "",
  activo: true,
  imagen: null,
}

export default function AdminProductosPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
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
  }, [])

  async function loadProducts() {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("products")
      .select("id, nombre, descripcion, precio, imagen, categoria, activo, created_at")
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
    setEditing(product)
    setForm({
      nombre: product.nombre,
      descripcion: product.descripcion ?? "",
      categoria: product.categoria ?? "",
      precio: String(product.precio ?? ""),
      activo: product.activo,
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

    setSaving(true)
    const supabase = createClient()
    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      categoria: form.categoria.trim() || null,
      precio: Number(form.precio) || 0,
      activo: form.activo,
      imagen: form.imagen,
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

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8 md:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona el catalogo, imagenes, estado y precios.
          </p>
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
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  Cargando productos...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
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
                  <TableCell>${Number(product.precio || 0).toLocaleString("es-AR")}</TableCell>
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
                <Input
                  id="precio"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.precio}
                  onChange={(e) => setForm((current) => ({ ...current, precio: e.target.value }))}
                />
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
