import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Users, UserCheck, Clock, Package, ArrowRight } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [{ count: totalUsers }, { count: approvedUsers }, { count: pendingUsers }, { count: totalProducts }] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("approved", true),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("approved", false),
      supabase.from("products").select("*", { count: "exact", head: true }),
    ])

  const stats = [
    { label: "Usuarios totales", value: totalUsers ?? 0, icon: Users },
    { label: "Aprobados", value: approvedUsers ?? 0, icon: UserCheck },
    { label: "Pendientes", value: pendingUsers ?? 0, icon: Clock },
    { label: "Productos", value: totalProducts ?? 0, icon: Package },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8 md:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Resumen general de la tienda.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/usuarios"
          className="group flex items-center justify-between gap-4 rounded-xl border bg-card p-4 transition-colors hover:border-primary sm:p-5"
        >
          <div>
            <p className="font-medium">Gestionar usuarios</p>
            <p className="text-sm text-muted-foreground">
              Aprobar, buscar y eliminar usuarios.
            </p>
          </div>
          <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/admin/productos"
          className="group flex items-center justify-between gap-4 rounded-xl border bg-card p-4 transition-colors hover:border-primary sm:p-5"
        >
          <div>
            <p className="font-medium">Gestionar productos</p>
            <p className="text-sm text-muted-foreground">
              Crear, editar y publicar productos.
            </p>
          </div>
          <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  )
}
