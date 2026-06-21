"use client"

import { MessageCircle } from "lucide-react"
import { APP_CONFIG } from "@/src/config/app-config"

export function WhatsAppFloatingButton() {
  const url = `https://wa.me/${APP_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    "Hola, quiero hacer una consulta sobre productos.",
  )}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label="Abrir WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-3 text-sm font-semibold text-sky-950 shadow-lg shadow-sky-900/10 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-900/15"
    >
      <span className="inline-flex size-9 items-center justify-center rounded-full bg-green-500 text-white">
        <MessageCircle className="size-5" />
      </span>
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  )
}
