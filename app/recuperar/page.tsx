import Link from "next/link"
import { AuthShell } from "@/components/auth/auth-shell"
import { RecuperarForm } from "@/components/auth/recuperar-form"

export default function RecuperarPage() {
  return (
    <AuthShell
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace a tu email"
      footer={
        <span>
          <Link href="/login" className="font-medium text-primary hover:underline">
            Volver a iniciar sesión
          </Link>
        </span>
      }
    >
      <RecuperarForm />
    </AuthShell>
  )
}
