"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { APP_CONFIG } from "@/src/config/app-config"
import { CartProvider, useCart } from "@/lib/cart-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LinkButton } from "@/components/ui/link-button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Camera,
  LogIn,
  LogOut,
  ShoppingCart,
  UserPlus,
  House,
  Menu,
} from "lucide-react"

type ViewerState = {
  authenticated: boolean
  admin: boolean
  approved: boolean
}

function ShopHeader({ viewer }: { viewer: ViewerState }) {
  const { count } = useCart()
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  async function logout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace("/login")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-sky-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/catalogo" className="flex items-center gap-2">
          <span className="relative size-9 overflow-hidden rounded-xl border bg-background">
            <Image
              src="/logo%20personita.png"
              alt={`${APP_CONFIG.companyName} logo`}
              fill
              sizes="36px"
              className="object-cover"
            />
          </span>
            <span className="text-lg font-semibold tracking-tight">
              {APP_CONFIG.companyName}
            </span>
          </Link>

        <nav className="hidden flex-nowrap items-center gap-1 overflow-x-auto md:flex sm:gap-2">
          <LinkButton
            href="/catalogo"
            variant={pathname === "/catalogo" ? "default" : "outline"}
            size="sm"
            className="rounded-full px-4"
          >
            Catálogo
          </LinkButton>

          {viewer.authenticated ? (
            <>
              {viewer.admin ? (
                <LinkButton
                  href="/admin"
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4"
                >
                  <LayoutDashboard className="size-4" />
                  <span className="hidden sm:inline">Admin</span>
                </LinkButton>
              ) : null}

              {viewer.approved || viewer.admin ? (
                <LinkButton
                  href="/carrito"
                  variant="outline"
                  size="sm"
                  className="relative rounded-full px-4"
                  aria-label="Carrito"
                >
                  <ShoppingCart className="size-4" />
                  <span className="hidden sm:inline">Carrito</span>
                  {count > 0 ? (
                    <Badge className="absolute -right-1 -top-1 size-5 justify-center rounded-full p-0 text-[10px]">
                      {count}
                    </Badge>
                  ) : null}
                </LinkButton>
              ) : (
                <Badge variant="secondary" className="rounded-full px-3">
                  Pendiente
                </Badge>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="rounded-full px-4"
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <LogOut className="size-4" />
                )}
                <span className="hidden sm:inline">Salir</span>
              </Button>

              <LinkButton
                href={APP_CONFIG.instagramUrl}
                target="_blank"
                rel="noreferrer"
                variant="ghost"
                size="sm"
                className="rounded-full px-3"
              >
                <Camera className="size-4" />
                <span className="hidden sm:inline">Instagram</span>
              </LinkButton>
            </>
          ) : (
            <>
              <LinkButton
                href="/login"
                variant="outline"
                size="sm"
                className="rounded-full px-4"
              >
                <LogIn className="size-4" />
                <span className="hidden sm:inline">Ingresar</span>
              </LinkButton>
              <LinkButton href="/register" size="sm" className="rounded-full px-4">
                <UserPlus className="size-4" />
                <span className="hidden sm:inline">Registrarse</span>
              </LinkButton>
            </>
          )}
        </nav>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            render={
              <button
                type="button"
                aria-label="Abrir menú"
                className="inline-flex size-10 items-center justify-center rounded-lg border border-sky-200 bg-white text-sky-950 transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 md:hidden"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[86vw] max-w-sm p-0">
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <div className="flex h-full flex-col p-4">
              <div className="mb-4 flex items-center gap-3">
                <span className="relative size-10 overflow-hidden rounded-xl border bg-background">
                  <Image
                    src="/logo%20personita.png"
                    alt={`${APP_CONFIG.companyName} logo`}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </span>
                <div>
                  <p className="font-semibold">{APP_CONFIG.companyName}</p>
                  <p className="text-xs text-muted-foreground">Menú</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <LinkButton
                  href="/catalogo"
                  variant={pathname === "/catalogo" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setMenuOpen(false)}
                >
                  Catálogo
                </LinkButton>

                {viewer.authenticated ? (
                  <>
                    {viewer.admin ? (
                      <LinkButton
                        href="/admin"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setMenuOpen(false)}
                      >
                        <LayoutDashboard className="size-4" />
                        Admin
                      </LinkButton>
                    ) : null}

                    {viewer.approved || viewer.admin ? (
                      <LinkButton
                        href="/carrito"
                        variant="outline"
                        className="w-full justify-start"
                        aria-label="Carrito"
                        onClick={() => setMenuOpen(false)}
                      >
                        <ShoppingCart className="size-4" />
                        Carrito
                        {count > 0 ? (
                          <Badge className="ml-auto size-5 justify-center rounded-full p-0 text-[10px]">
                            {count}
                          </Badge>
                        ) : null}
                      </LinkButton>
                    ) : (
                      <Badge variant="secondary" className="w-fit rounded-full px-3">
                        Pendiente
                      </Badge>
                    )}

                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={async () => {
                        await logout()
                        setMenuOpen(false)
                      }}
                      disabled={loggingOut}
                    >
                      {loggingOut ? (
                        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <LogOut className="size-4" />
                      )}
                      Salir
                    </Button>

                    <LinkButton
                      href={APP_CONFIG.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      <Camera className="size-4" />
                      Instagram
                    </LinkButton>
                  </>
                ) : (
                  <>
                    <LinkButton
                      href="/login"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setMenuOpen(false)}
                    >
                      <LogIn className="size-4" />
                      Ingresar
                    </LinkButton>
                    <LinkButton
                      href="/register"
                      className="w-full justify-start"
                      onClick={() => setMenuOpen(false)}
                    >
                      <UserPlus className="size-4" />
                      Registrarse
                    </LinkButton>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

function ShopFooter() {
  return (
    <footer className="border-t border-sky-200/70 bg-gradient-to-r from-sky-50 via-white to-blue-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-3">
          <span className="relative size-10 overflow-hidden rounded-xl border bg-background">
            <Image
              src="/Gemini_Generated_Image_bfyoghbfyoghbfyo-removebg-preview.png"
              alt={`${APP_CONFIG.companyName} logo secundario`}
              fill
              sizes="40px"
              className="object-cover"
            />
          </span>
          <div>
            <p className="font-medium text-foreground">{APP_CONFIG.companyName}</p>
            <p>Catálogo privado de productos</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="/catalogo" className="inline-flex items-center gap-2 hover:text-foreground">
            <House className="size-4" />
            Inicio
          </a>
          <a href={APP_CONFIG.instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-foreground">
            <Camera className="size-4" />
            Instagram
          </a>
          <p>&copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  )
}

export default function ShopLayout({ children }: { children: ReactNode }) {
  const [viewer, setViewer] = useState<ViewerState>({
    authenticated: false,
    admin: false,
    approved: false,
  })

  useEffect(() => {
    let active = true

    async function loadViewer() {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      const user = data.user

      if (!active) return

      if (!user) {
        setViewer({ authenticated: false, admin: false, approved: false })
        return
      }

      const admin = user.email === APP_CONFIG.adminEmail
      if (admin) {
        setViewer({ authenticated: true, admin: true, approved: true })
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("approved")
        .eq("id", user.id)
        .maybeSingle()

      if (!active) return

      setViewer({
        authenticated: true,
        admin: false,
        approved: !!profile?.approved,
      })
    }

    loadViewer()

    return () => {
      active = false
    }
  }, [])

  return (
    <CartProvider>
      <div className="flex min-h-svh flex-col">
        <ShopHeader viewer={viewer} />
        <div className="flex-1">{children}</div>
        <ShopFooter />
      </div>
    </CartProvider>
  )
}
