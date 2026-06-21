import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { APP_CONFIG } from "@/src/config/app-config"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")
  if (user.email !== APP_CONFIG.adminEmail) redirect("/catalogo")

  return (
    <div className="flex min-h-svh flex-col bg-muted/30 md:flex-row">
      <AdminSidebar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
