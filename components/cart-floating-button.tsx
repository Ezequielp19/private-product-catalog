"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/cart-context"

export function CartFloatingButton() {
  const { count } = useCart()
  const pathname = usePathname()

  if (pathname === "/carrito") return null

  return (
    <Link
      href="/carrito"
      aria-label={count > 0 ? `Carrito con ${count} productos` : "Ir al carrito"}
      className="fixed bottom-[5.75rem] right-5 z-50 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-3 text-sm font-semibold text-sky-950 shadow-lg shadow-sky-900/10 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-900/15"
    >
      <span className="relative inline-flex size-9 items-center justify-center rounded-full bg-sky-600 text-white">
        <ShoppingCart className="size-5" />
        {count > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 flex size-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </span>
      <span className="hidden sm:inline">Carrito</span>
    </Link>
  )
}
