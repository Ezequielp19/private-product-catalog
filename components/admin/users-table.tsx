"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { APP_CONFIG } from "@/src/config/app-config"
import type { Profile } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Check, X, Trash2 } from "lucide-react"

export function UsersTable({ users }: { users: Profile[] }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<Profile | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        u.nombre.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    )
  }, [users, query])

  async function setApproved(user: Profile, approved: boolean) {
    setBusyId(user.id)
    const supabase = createClient()
    const { error } = await supabase
      .from("profiles")
      .update({ approved })
      .eq("id", user.id)
    setBusyId(null)

    if (error) {
      toast.error("No se pudo actualizar el usuario.")
      return
    }

    if (approved && !user.approved) {
      const { data: sessionData } = await supabase.auth.getSession()
      const { error: emailError } = await supabase.functions.invoke(
        "send-approval-email",
        {
          headers: sessionData.session?.access_token
            ? {
                Authorization: `Bearer ${sessionData.session.access_token}`,
              }
            : undefined,
          body: {
            email: user.email,
            nombre: user.nombre,
            siteUrl: APP_CONFIG.siteUrl,
          },
        },
      )

      if (emailError) {
        console.error("[users-table] Approval email failed", emailError)
        toast.success(
          "Usuario aprobado. No se pudo enviar el email de aviso.",
        )
        router.refresh()
        return
      }
    }

    toast.success(approved ? "Usuario aprobado" : "Usuario desaprobado")
    router.refresh()
  }

  async function deleteUser() {
    if (!toDelete) return
    setBusyId(toDelete.id)
    const supabase = createClient()
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", toDelete.id)
    setBusyId(null)
    setToDelete(null)

    if (error) {
      toast.error("No se pudo eliminar el usuario.")
      return
    }
    toast.success("Usuario eliminado")
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="pl-9"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No hay usuarios.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => {
                const isAdmin = user.email === APP_CONFIG.adminEmail
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.nombre || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <Badge>Admin</Badge>
                      ) : user.approved ? (
                        <Badge className="bg-primary/15 text-primary">
                          Aprobado
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {!isAdmin && (
                          <>
                            {user.approved ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busyId === user.id}
                                onClick={() => setApproved(user, false)}
                              >
                                <X className="size-4" />
                                Desaprobar
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                disabled={busyId === user.id}
                                onClick={() => setApproved(user, true)}
                              >
                                <Check className="size-4" />
                                Aprobar
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8 text-muted-foreground hover:text-destructive"
                              disabled={busyId === user.id}
                              onClick={() => setToDelete(user)}
                              aria-label="Eliminar usuario"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar usuario</DialogTitle>
            <DialogDescription>
              ¿Seguro que querés eliminar el perfil de{" "}
              <strong>{toDelete?.nombre || toDelete?.email}</strong>? Esta acción
              no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setToDelete(null)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={busyId === toDelete?.id}
              onClick={deleteUser}
              className="w-full sm:w-auto"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
