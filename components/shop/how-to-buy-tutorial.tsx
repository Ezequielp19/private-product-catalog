import Link from "next/link"
import { LinkButton } from "@/components/ui/link-button"
import { APP_CONFIG } from "@/src/config/app-config"
import {
  ArrowRight,
  BookOpen,
  MessageCircle,
  Search,
  ShoppingCart,
  UserRound,
} from "lucide-react"

const steps = [
  {
    number: "1",
    title: "Explorá el catálogo",
    description:
      "Entrá al catálogo, filtrá por categoría o buscá por nombre. Los precios están visibles sin registrarte.",
    example: {
      label: "Ejemplo",
      content: (
        <>
          Buscás <span className="font-medium text-foreground">"Lavandina"</span> en{" "}
          <span className="font-medium text-foreground">Limpieza del hogar</span> y abrís
          el producto que te interesa.
        </>
      ),
    },
    icon: Search,
    href: "/catalogo",
    cta: "Ir al catálogo",
  },
  {
    number: "2",
    title: "Elegí presentación y cantidad",
    description:
      "Si el producto tiene variantes, seleccioná la que necesitás y la cantidad antes de agregar.",
    example: {
      label: "Ejemplo",
      content: (
        <div className="space-y-2">
          <p>
            Producto suelto:{" "}
            <span className="font-medium text-foreground">x5 litros</span> × 2 unidades
          </p>
          <p>
            Producto por unidad:{" "}
            <span className="font-medium text-foreground">x6 U</span> × 1 unidad
          </p>
        </div>
      ),
    },
    icon: ShoppingCart,
    href: "/catalogo",
    cta: "Ver productos",
  },
  {
    number: "3",
    title: "Revisá tu carrito",
    description:
      "Podés entrar desde el botón Carrito del menú o usar el carrito flotante. Ahí ves el resumen y el total.",
    example: {
      label: "Ejemplo de pedido",
      content: (
        <ul className="space-y-1.5 text-foreground/90">
          <li>• Lavandina (x5 litros) x2 — $4.500</li>
          <li>• Desinfectante (x1 U) x1 — $1.200</li>
          <li className="border-t border-sky-200/80 pt-1.5 font-medium text-foreground">
            Total: $10.200
          </li>
        </ul>
      ),
    },
    icon: ShoppingCart,
    href: "/carrito",
    cta: "Ver carrito",
  },
  {
    number: "4",
    title: "Completá tus datos",
    description:
      "Antes de enviar el pedido, completá tu nombre y correo electrónico. Podés agregar una aclaración opcional.",
    example: {
      label: "Ejemplo",
      content: (
        <div className="space-y-1">
          <p>
            Nombre: <span className="font-medium text-foreground">María Gómez</span>
          </p>
          <p>
            Email:{" "}
            <span className="font-medium text-foreground">maria@email.com</span>
          </p>
          <p>
            Aclaración:{" "}
            <span className="font-medium text-foreground">Entregar después de las 17 hs.</span>
          </p>
        </div>
      ),
    },
    icon: UserRound,
    href: "/carrito",
    cta: "Ir al checkout",
  },
  {
    number: "5",
    title: "Finalizá por WhatsApp",
    description:
      "Tocá Finalizar por WhatsApp y se abre el chat con tu pedido listo para enviar.",
    example: {
      label: "Mensaje que se envía",
      content: (
        <div className="rounded-lg bg-green-50 p-3 text-xs leading-relaxed text-green-950">
          <p>Hola {APP_CONFIG.companyName}.</p>
          <p className="mt-2">Quiero realizar el siguiente pedido:</p>
          <p className="mt-2">- Lavandina (x5 litros) x2 - $4.500</p>
          <p>- Desinfectante (x1 U) x1 - $1.200</p>
          <p className="mt-2 font-medium">Total: $10.200</p>
          <p className="mt-2">Nombre: María Gómez</p>
          <p>Email: maria@email.com</p>
          <p className="mt-2">Aclaración: Entregar después de las 17 hs.</p>
        </div>
      ),
    },
    icon: MessageCircle,
    href: "/carrito",
    cta: "Hacer mi pedido",
  },
] as const

export function HowToBuyTutorial() {
  return (
    <section className="border-b bg-gradient-to-b from-white via-sky-50/60 to-white">
      <div className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-1.5 text-sm font-medium text-sky-800 shadow-sm">
            <BookOpen className="size-4" />
            Tutorial de compra
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Cómo comprar en {APP_CONFIG.companyName} en 5 pasos
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground sm:text-lg">
            Comprar es simple: elegís productos, armás el carrito y cerrás el pedido
            por WhatsApp. Sin registro, sin complicaciones.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {steps.map((step) => (
            <article
              key={step.number}
              className="flex flex-col rounded-3xl border bg-card p-5 shadow-sm transition hover:border-sky-200 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-lg font-bold text-white">
                  {step.number}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 inline-flex items-center gap-2 text-sky-700">
                    <step.icon className="size-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                      Paso {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-dashed border-sky-200 bg-sky-50/50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
                  {step.example.label}
                </p>
                <div className="text-sm leading-relaxed text-muted-foreground">
                  {step.example.content}
                </div>
              </div>

              <div className="mt-4">
                <Link
                  href={step.href}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  {step.cta}
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border bg-gradient-to-r from-sky-600 to-sky-700 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-100">
                Resumen rápido
              </p>
              <p className="mt-2 text-xl font-semibold sm:text-2xl">
                Catálogo → Carrito → WhatsApp. Listo.
              </p>
              <p className="mt-2 text-sm text-sky-100">
                Si tenés dudas, también podés escribirnos directo por WhatsApp antes de
                comprar.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <LinkButton
                href="/catalogo"
                size="lg"
                className="bg-white text-sky-700 hover:bg-sky-50"
              >
                Empezar a comprar
                <ArrowRight className="size-4" />
              </LinkButton>
              <LinkButton
                href={`https://wa.me/${APP_CONFIG.whatsappNumber}?text=${encodeURIComponent("Hola, tengo una consulta antes de hacer mi pedido.")}`}
                target="_blank"
                rel="noreferrer"
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <MessageCircle className="size-4" />
                Consultar
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
