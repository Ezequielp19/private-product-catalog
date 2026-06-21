import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/lib/types"
import { UsersTable } from "@/components/admin/users-table"

export const dynamic = "force-dynamic"

export default async function AdminUsuariosPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  const users = (data ?? []) as Profile[]

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Aprobá o eliminá las cuentas registradas.
      </p>
      <div className="mt-6">
        <UsersTable users={users} />
      </div>
    </div>
  )
}
