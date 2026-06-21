import Image from "next/image"
import { APP_CONFIG } from "@/src/config/app-config"
import { LinkButton } from "@/components/ui/link-button"
import { MessageCircle, Mail, ArrowRight, Camera } from "lucide-react"

export default function ContactoPage() {
  const whatsappUrl = `https://wa.me/${APP_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    "Hola, quiero hacer una consulta sobre productos.",
  )}`

  return (
    <main className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-4xl flex-col justify-center px-4 py-10">
      <div className="rounded-3xl border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-8 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <span className="relative size-12 overflow-hidden rounded-2xl border bg-white">
            <Image
              src="/logo%20personita.png"
              alt={`${APP_CONFIG.companyName} logo`}
              fill
              sizes="48px"
              className="object-cover"
            />
          </span>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Contacto</p>
            <p className="font-semibold">{APP_CONFIG.companyName}</p>
          </div>
        </div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Contacto
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Hablemos de tu pedido
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Escribinos por WhatsApp o por correo y te ayudamos con disponibilidad,
          acceso mayorista y consultas sobre el catálogo.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <a
            href={whatsappUrl}
            className="rounded-2xl border bg-background p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <MessageCircle className="size-5 text-primary" />
            <p className="mt-3 font-medium">WhatsApp</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Respuesta rapida para pedidos y consultas.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
              Abrir chat
              <ArrowRight className="size-4" />
            </span>
          </a>

          <a
            href={`mailto:${APP_CONFIG.contactEmail}`}
            className="rounded-2xl border bg-background p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <Mail className="size-5 text-primary" />
            <p className="mt-3 font-medium">Email</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Enviamos respuestas y seguimiento de pedidos.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
              Escribir correo
              <ArrowRight className="size-4" />
            </span>
          </a>

          <a
            href={APP_CONFIG.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border bg-background p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <Camera className="size-5 text-primary" />
            <p className="mt-3 font-medium">Instagram</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Novedades, productos y publicaciones.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
              Abrir perfil
              <ArrowRight className="size-4" />
            </span>
          </a>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <LinkButton href="/catalogo">Ver catálogo</LinkButton>
          <LinkButton href="/register" variant="outline">
            Registrarse
          </LinkButton>
        </div>
      </div>
    </main>
  )
}
