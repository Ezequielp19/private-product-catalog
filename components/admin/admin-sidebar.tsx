"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { APP_CONFIG } from "@/src/config/app-config"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LinkButton } from "@/components/ui/link-button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Package2,
  Users,
  LogOut,
  Store,
  Menu,
  Camera,
} from "lucide-react"

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/productos", label: "Productos", icon: Package2 },
]

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  async function logout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace("/login")
    router.refresh()
  }

  return (
    <div className="flex h-full flex-col gap-1">
      <div className="flex items-center gap-2 px-3 py-4">
        <span className="relative size-9 overflow-hidden rounded-xl border bg-background">
          <Image
            src="/logo%20personita.png"
            alt={`${APP_CONFIG.companyName} logo`}
            fill
            sizes="36px"
            className="object-cover"
          />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold">{APP_CONFIG.companyName}</p>
          <p className="text-xs text-muted-foreground">Panel admin</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2">
        {links.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <link.icon className="size-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t p-2">
        <LinkButton
          href="/catalogo"
          variant="ghost"
          size="sm"
          className="justify-start"
          onClick={onNavigate}
        >
          <Store className="size-4" />
          Ver catálogo
        </LinkButton>

        <Button
          variant="ghost"
          className="justify-start text-muted-foreground"
          size="sm"
          onClick={logout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <LogOut className="size-4" />
          )}
          Cerrar sesión
        </Button>

        <LinkButton
          href={APP_CONFIG.instagramUrl}
          target="_blank"
          rel="noreferrer"
          variant="ghost"
          size="sm"
          className="justify-start"
        >
          <Camera className="size-4" />
          Instagram
        </LinkButton>
      </div>
    </div>
  )
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r bg-card md:block">
        <div className="sticky top-0 h-svh">
          <NavContent />
        </div>
      </aside>

      <div className="sticky top-0 z-40 flex items-center gap-3 border-b bg-card px-4 py-3 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <button
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-lg border border-sky-200 bg-white text-sky-950 transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              />
            }
          >
            <Menu className="size-4" />
            <span className="sr-only">Abrir menú</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <NavContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <span className="font-semibold">{APP_CONFIG.companyName} · Admin</span>
      </div>
    </>
  )
}
