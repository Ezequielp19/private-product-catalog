"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { CartItem, Product } from "@/lib/types"

const STORAGE_KEY = "lmproductos-cart"

type CartContextValue = {
  items: CartItem[]
  count: number
  total: number
  addItem: (product: Product, cantidad?: number) => void
  removeItem: (id: string) => void
  setQuantity: (id: string, cantidad: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Cargar desde localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw) as CartItem[])
    } catch {
      // ignore
    }
    setHydrated(true)
  }, [])

  // Persistir en localStorage
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore
    }
  }, [items, hydrated])

  function addItem(product: Product, cantidad = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i,
        )
      }
      return [
        ...prev,
        {
          id: product.id,
          nombre: product.nombre,
          precio: product.precio,
          imagen: product.imagen,
          cantidad,
        },
      ]
    })
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  function setQuantity(id: string, cantidad: number) {
    setItems((prev) =>
      cantidad <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, cantidad } : i)),
    )
  }

  function clear() {
    setItems([])
  }

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((acc, i) => acc + i.cantidad, 0)
    const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0)
    return { items, count, total, addItem, removeItem, setQuantity, clear }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>")
  return ctx
}
