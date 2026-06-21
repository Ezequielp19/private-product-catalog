"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format"
import { APP_CONFIG } from "@/src/config/app-config"
import { Button } from "@/components/ui/button"
import { LinkButton } from "@/components/ui/link-button"
import { Separator } from "@/components/ui/separator"
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ImageOff,
  MessageCircle,
  Loader2,
} from "lucide-react"

export default function CarritoPage() {
  const { items, total, count, removeItem, setQuantity, clear } = useCart()
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [busyItemId, setBusyItemId] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user
      if (!user) return
      setEmail(user.email ?? "")
      const { data: profile } = await supabase
        .from("profiles")
        .select("nombre")
        .eq("id", user.id)
        .maybeSingle()
      setNombre(profile?.nombre ?? "")
    })
  }, [])

  const whatsappUrl = useMemo(() => {
    const lineas = items
      .map((i) => `• ${i.nombre} x${i.cantidad} — ${formatPrice(i.precio * i.cantidad)}`)
      .join("\n")

    const mensaje =
      `Hola ${APP_CONFIG.companyName}.\n\n` +
      `Quiero realizar el siguiente pedido:\n\n` +
      `${lineas}\n\n` +
      `Total: ${formatPrice(total)}\n\n` +
      `Nombre: ${nombre}\n` +
      `Email: ${email}\n\n` +
      `Gracias.`

    return `https://wa.me/${APP_CONFIG.whatsappNumber}?text=${encodeURIComponent(
      mensaje,
    )}`
  }, [email, nombre, items, total])

  function checkout() {
    if (checkoutLoading) return
    setCheckoutLoading(true)

    if (typeof window !== "undefined") {
      if (window.self !== window.top) {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer")
      } else {
        window.location.href = whatsappUrl
      }
    }
  }

  function updateQuantity(id: string, quantity: number) {
    setBusyItemId(id)
    setQuantity(id, quantity)
    setBusyItemId(null)
  }

  function deleteItem(id: string) {
    setBusyItemId(id)
    removeItem(id)
    setBusyItemId(null)
  }

  async function emptyCart() {
    setClearing(true)
    clear()
    setClearing(false)
  }

  if (count === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <ShoppingCart className="size-10" />
          <p>Tu carrito está vacío.</p>
          <LinkButton href="/catalogo">Ir al catálogo</LinkButton>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Tu carrito</h1>
        <Button variant="ghost" size="sm" onClick={emptyCart} disabled={clearing}>
          {clearing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          {clearing ? "Vaciando..." : "Vaciar"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ul className="flex flex-col gap-3 lg:col-span-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.imagen ? (
                  <Image
                    src={item.imagen}
                    alt={item.nombre}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageOff className="size-5" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-medium">{item.nombre}</p>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(item.precio)}
                </p>
              </div>

              <div className="flex items-center rounded-lg border">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                  aria-label="Disminuir"
                  disabled={busyItemId === item.id}
                >
                  <Minus className="size-3.5" />
                </Button>
                <span className="w-8 text-center text-sm font-medium">
                  {item.cantidad}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                  aria-label="Aumentar"
                  disabled={busyItemId === item.id}
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>

              <div className="w-full text-left font-semibold sm:w-24 sm:text-right">
                {formatPrice(item.precio * item.cantidad)}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="size-8 self-end text-muted-foreground hover:text-destructive sm:self-auto"
                onClick={() => deleteItem(item.id)}
                aria-label="Eliminar"
                disabled={busyItemId === item.id}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Resumen</h2>
          <Separator className="my-4" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Productos</span>
            <span>{count}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          <Button
            className="mt-5 w-full"
            size="lg"
            onClick={checkout}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <MessageCircle className="size-4" />
            )}
            {checkoutLoading ? "Abriendo WhatsApp..." : "Finalizar por WhatsApp"}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Te abriremos WhatsApp con el pedido listo para enviar.
          </p>
        </div>
      </div>
    </main>
  )
}
