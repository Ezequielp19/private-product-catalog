import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { APP_CONFIG } from "@/src/config/app-config"

const PUBLIC_PATHS = ["/", "/login", "/register", "/recuperar", "/catalogo", "/producto", "/contacto", "/carrito"]
const AUTH_PATHS = ["/login", "/register", "/recuperar"]

function matchesPath(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`)
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    APP_CONFIG.supabaseUrl,
    APP_CONFIG.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some((path) => matchesPath(pathname, path))
  const isAdminRoute = pathname.startsWith("/admin")
  if (!user) {
    if (isPublic) return supabaseResponse
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  const isAdmin = user.email === APP_CONFIG.adminEmail

  if (AUTH_PATHS.some((path) => matchesPath(pathname, path))) {
    const url = request.nextUrl.clone()
    url.pathname = isAdmin ? "/admin" : "/catalogo"
    return NextResponse.redirect(url)
  }

  if (isAdminRoute && !isAdmin) {
    const url = request.nextUrl.clone()
    url.pathname = "/catalogo"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
