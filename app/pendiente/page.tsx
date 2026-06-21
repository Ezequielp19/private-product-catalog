import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { APP_CONFIG } from "@/src/config/app-config"
import { LogoutButton } from "@/components/logout-button"
import { Clock } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function PendientePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  if (user.email === APP_CONFIG.adminEmail) redirect("/admin")

  const { data: profile } = await supabase
    .from("profiles")
    .select("approved, nombre")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.approved) redirect("/catalogo")

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-muted/40 px-4 py-8 sm:py-10">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 text-center shadow-sm sm:p-8">
        <span className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Clock className="size-7" />
        </span>
        <h1 className="text-xl font-semibold text-balance">
          Cuenta pendiente de aprobación
        </h1>
        <p className="mt-3 text-sm text-muted-foreground text-pretty">
          {profile?.nombre ? `Hola ${profile.nombre}, ` : ""}tu cuenta se
          encuentra pendiente de aprobación por parte del administrador. Te
          avisaremos cuando puedas acceder al catálogo.
        </p>
        <div className="mt-6 flex justify-center">
          <LogoutButton className="w-full sm:w-auto" />
        </div>
      </div>
    </main>
  )
}
