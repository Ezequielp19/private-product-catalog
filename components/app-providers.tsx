"use client"

import type { ReactNode } from "react"
import { CartProvider } from "@/lib/cart-context"
import { CartFloatingButton } from "@/components/cart-floating-button"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartFloatingButton />
    </CartProvider>
  )
}
