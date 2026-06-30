"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { APP_CONFIG } from "@/src/config/app-config"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { LinkButton } from "@/components/ui/link-button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Camera,
  LogIn,
  LogOut,
  ShoppingCart,
  House,
  Menu,
} from "lucide-react"

type ViewerState = {
  authenticated: boolean
  admin: boolean
  approved: boolean
}

const headerNavButtonClass =
  "h-10 min-h-10 rounded-full border-2 px-5 text-sm font-semibold shadow-sm gap-2 [&_svg]:size-[1.125rem]"

const mobileNavButtonClass =
  "h-11 w-full justify-start rounded-xl border-2 px-4 text-sm font-semibold gap-2 [&_svg]:size-[1.125rem]"

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
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-center gap-2">
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

        <nav className="hidden flex-nowrap items-center gap-2 overflow-x-auto md:flex">
          <LinkButton
            href="/catalogo"
            variant={pathname === "/catalogo" ? "default" : "outline"}
            className={headerNavButtonClass}
          >
            Catálogo
          </LinkButton>

          <LinkButton
            href="/carrito"
            variant="outline"
            className={headerNavButtonClass}
            aria-label="Carrito"
          >
            <ShoppingCart />
            <span className="hidden sm:inline">Carrito</span>
            {count > 0 ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-600 px-1.5 text-[11px] font-bold leading-none text-white">
                {count}
              </span>
            ) : null}
          </LinkButton>

          {viewer.authenticated ? (
            <>
              {viewer.admin ? (
                <LinkButton
                  href="/admin"
                  variant="outline"
                  className={headerNavButtonClass}
                >
                  <LayoutDashboard />
                  <span className="hidden sm:inline">Admin</span>
                </LinkButton>
              ) : null}

              <Button
                variant="outline"
                onClick={logout}
                className={headerNavButtonClass}
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <span className="size-[1.125rem] animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <LogOut />
                )}
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </>
          ) : (
            <LinkButton
              href="/login"
              variant="outline"
              className={headerNavButtonClass}
            >
              <LogIn />
              <span className="hidden sm:inline">Ingresar</span>
            </LinkButton>
          )}

          <LinkButton
            href={APP_CONFIG.instagramUrl}
            target="_blank"
            rel="noreferrer"
            variant="outline"
            className={headerNavButtonClass}
          >
            <Camera />
            <span className="hidden sm:inline">Instagram</span>
          </LinkButton>
        </nav>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            render={
              <button
                type="button"
                aria-label="Abrir menú"
                className="inline-flex size-11 items-center justify-center rounded-xl border-2 border-sky-200 bg-white text-sky-950 shadow-sm transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 md:hidden"
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

              <div className="flex flex-col gap-2.5">
                <LinkButton
                  href="/catalogo"
                  variant={pathname === "/catalogo" ? "default" : "outline"}
                  className={mobileNavButtonClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Catálogo
                </LinkButton>

                <LinkButton
                  href="/carrito"
                  variant="outline"
                  className={mobileNavButtonClass}
                  aria-label="Carrito"
                  onClick={() => setMenuOpen(false)}
                >
                  <ShoppingCart />
                  Carrito
                  {count > 0 ? (
                    <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-600 px-1.5 text-[11px] font-bold leading-none text-white">
                      {count}
                    </span>
                  ) : null}
                </LinkButton>

                {viewer.authenticated ? (
                  <>
                    {viewer.admin ? (
                      <LinkButton
                        href="/admin"
                        variant="outline"
                        className={mobileNavButtonClass}
                        onClick={() => setMenuOpen(false)}
                      >
                        <LayoutDashboard />
                        Admin
                      </LinkButton>
                    ) : null}

                    <Button
                      variant="outline"
                      className={mobileNavButtonClass}
                      onClick={async () => {
                        await logout()
                        setMenuOpen(false)
                      }}
                      disabled={loggingOut}
                    >
                      {loggingOut ? (
                        <span className="size-[1.125rem] animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <LogOut />
                      )}
                      Salir
                    </Button>
                  </>
                ) : (
                  <LinkButton
                    href="/login"
                    variant="outline"
                    className={mobileNavButtonClass}
                    onClick={() => setMenuOpen(false)}
                  >
                    <LogIn />
                    Ingresar
                  </LinkButton>
                )}

                <LinkButton
                  href={APP_CONFIG.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  variant="outline"
                  className={mobileNavButtonClass}
                >
                  <Camera />
                  Instagram
                </LinkButton>
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
            <p>Catálogo de productos mayoristas</p>
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
    <div className="flex min-h-svh flex-col">
      <ShopHeader viewer={viewer} />
      <div className="flex-1">{children}</div>
      <ShopFooter />
    </div>
  )
}
