"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Loader2, Upload, ImageOff } from "lucide-react"

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
}) {
  const router = useRouter()
  const isEdit = !!product

  const [nombre, setNombre] = useState(product?.nombre ?? "")
  const [descripcion, setDescripcion] = useState(product?.descripcion ?? "")
  const [precio, setPrecio] = useState(String(product?.precio ?? ""))
  const [activo, setActivo] = useState(product?.activo ?? true)
  const [imagen, setImagen] = useState<string | null>(product?.imagen ?? null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split(".").pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage
      .from("products")
      .upload(path, file, { upsert: true })

    if (error) {
      toast.error("Error al subir la imagen.")
      setUploading(false)
      return
    }
    const { data } = supabase.storage.from("products").getPublicUrl(path)
    setImagen(data.publicUrl)
    setUploading(false)
  }

  async function save() {
    if (!nombre.trim()) {
      toast.error("El nombre es obligatorio.")
      return
    }
    setSaving(true)
    const supabase = createClient()
    const payload = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio: Number(precio) || 0,
      activo,
      imagen,
    }

    const { error } = isEdit
      ? await supabase.from("products").update(payload).eq("id", product!.id)
      : await supabase.from("products").insert(payload)

    setSaving(false)

    if (error) {
      toast.error("No se pudo guardar el producto.")
      return
    }
    toast.success(isEdit ? "Producto actualizado" : "Producto creado")
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar producto" : "Nuevo producto"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Imagen</Label>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-lg border bg-muted sm:size-20 sm:w-20">
                {imagen ? (
                  <Image
                    src={imagen || "/placeholder.svg"}
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
                  onChange={handleImage}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del producto"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción del producto"
              rows={4}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="precio">Precio</Label>
            <Input
              id="precio"
              type="number"
              min="0"
              step="0.01"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="activo">Producto activo</Label>
              <p className="text-xs text-muted-foreground">
                Visible en el catálogo para usuarios aprobados.
              </p>
            </div>
            <Switch id="activo" checked={activo} onCheckedChange={setActivo} />
          </div>
        </div>

          <DialogFooter className="gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
          <Button onClick={save} disabled={saving || uploading} className="w-full sm:w-auto">
            {saving ? <Loader2 className="size-4 animate-spin" /> : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
