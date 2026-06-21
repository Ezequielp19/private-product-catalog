import { Resend } from "npm:resend"

type ApprovalEmailPayload = {
  email?: string
  nombre?: string
  siteUrl?: string
}

type JwtPayload = {
  email?: string
}

const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "lmproductos@gmail.com"
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders,
      ...(init.headers ?? {}),
    },
  })
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".")
  if (parts.length < 2) return null

  const base64Url = parts[1]
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")

  try {
    return JSON.parse(atob(padded)) as JwtPayload
  } catch {
    return null
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 })
  }

  const authHeader = req.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  const tokenPayload = token ? decodeJwtPayload(token) : null

  if (tokenPayload?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    console.error("[send-approval-email] Forbidden invocation")
    return json({ error: "Forbidden" }, { status: 403 })
  }

  const apiKey = Deno.env.get("RESEND_API_KEY")
  if (!apiKey) {
    console.error("[send-approval-email] RESEND_API_KEY is not set")
    return json({ error: "Missing RESEND_API_KEY" }, { status: 500 })
  }

  let payload: ApprovalEmailPayload
  try {
    payload = (await req.json()) as ApprovalEmailPayload
  } catch (error) {
    console.error("[send-approval-email] Invalid JSON payload", error)
    return json({ error: "Invalid JSON payload" }, { status: 400 })
  }

  const email = payload.email?.trim()
  const nombre = payload.nombre?.trim() || "Hola"
  const siteUrl = (payload.siteUrl?.trim() || Deno.env.get("APP_URL") || "https://lmproductos.online").replace(/\/$/, "")

  if (!email) {
    return json({ error: "Missing email" }, { status: 400 })
  }

  const resend = new Resend(apiKey)

  try {
    const html = `
      <div style="font-family:Arial,sans-serif;background:#f8fbff;color:#0f172a;padding:24px">
        <div style="max-width:640px;margin:0 auto;background:white;border:1px solid #dbeafe;border-radius:20px;padding:32px">
          <h1 style="margin:0 0 16px;font-size:24px;line-height:1.2;color:#0f172a">Tu cuenta fue aprobada</h1>
          <p style="margin:0 0 12px;font-size:16px;line-height:1.6">Hola ${escapeHtml(nombre)},</p>
          <p style="margin:0 0 12px;font-size:16px;line-height:1.6">Tu cuenta en LMProductos fue aprobada y ya podés iniciar sesión para ver el catálogo y continuar con tus pedidos.</p>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.6">Ingresá acá: <a href="${siteUrl}" style="color:#2563eb;text-decoration:none">${siteUrl}</a></p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#475569">Si tenés dudas, respondé este correo o contactanos por WhatsApp.</p>
        </div>
      </div>
    `

    const text = [
      `Hola ${nombre},`,
      "",
      "Tu cuenta en LMProductos fue aprobada y ya podés iniciar sesión para ver el catálogo y continuar con tus pedidos.",
      "",
      `Ingresá acá: ${siteUrl}`,
      "",
      "Si tenés dudas, respondé este correo o contactanos por WhatsApp.",
    ].join("\n")

    const result = await resend.emails.send({
      from: "LMProductos <noreply@lmproductos.online>",
      to: [email],
      subject: "Tu cuenta fue aprobada.",
      text,
      html,
    })

    if (result.error) {
      console.error("[send-approval-email] Resend error", result.error)
      return json({ error: "Failed to send email" }, { status: 502 })
    }

    return json({ ok: true, id: result.data?.id ?? null })
  } catch (error) {
    console.error("[send-approval-email] Unexpected error", error)
    return json({ error: "Unexpected error" }, { status: 500 })
  }
})
