import Link from "next/link"
import { AuthShell } from "@/components/auth/auth-shell"
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Registrate y esperá la aprobación del administrador"
      footer={
        <span>
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Iniciá sesión
          </Link>
        </span>
      }
    >
      <RegisterForm />
    </AuthShell>
  )
}
