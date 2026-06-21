"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useState } from "react"

export function LogoutButton({
  variant = "outline",
  className,
  withIcon = true,
}: {
  variant?: "outline" | "ghost" | "default" | "secondary"
  className?: string
  withIcon?: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function logout() {
    if (loading) return
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace("/login")
    router.refresh()
  }

  return (
    <Button
      variant={variant}
      className={className}
      onClick={logout}
      disabled={loading}
    >
      {withIcon ? <LogOut className="size-4" /> : null}
      Cerrar sesión
    </Button>
  )
}
