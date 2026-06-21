import Link from "next/link"
import Image from "next/image"
import type { ReactNode } from "react"
import { APP_CONFIG } from "@/src/config/app-config"

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-muted/40 px-4 py-8 sm:py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2"
        >
          <span className="relative size-10 overflow-hidden rounded-xl border bg-white">
            <Image
              src="/Gemini_Generated_Image_bfyoghbfyoghbfyo-removebg-preview.png"
              alt={`${APP_CONFIG.companyName} logo`}
              fill
              sizes="40px"
              className="object-cover"
            />
          </span>
          <span className="text-xl font-semibold tracking-tight">
            {APP_CONFIG.companyName}
          </span>
        </Link>

        <div className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-6 space-y-1 text-center">
            <h1 className="text-xl font-semibold text-balance">{title}</h1>
            {subtitle ? (
              <p className="text-sm text-muted-foreground text-pretty">
                {subtitle}
              </p>
            ) : null}
          </div>
          {children}
        </div>

        {footer ? (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </div>
    </main>
  )
}
