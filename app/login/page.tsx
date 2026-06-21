import Link from "next/link"
import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="Ingresá a tu cuenta para ver el catálogo"
      footer={
        <span>
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Registrate
          </Link>
        </span>
      }
    >
      <LoginForm />
      <div className="mt-4 text-center text-sm">
        <Link
          href="/recuperar"
          className="text-muted-foreground hover:text-foreground hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </AuthShell>
  )
}
