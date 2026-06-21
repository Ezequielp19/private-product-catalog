import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Toaster } from '@/components/ui/sonner'
import { APP_CONFIG } from '@/src/config/app-config'
import { WhatsAppFloatingButton } from '@/components/whatsapp-floating-button'
import './globals.css'

export const metadata: Metadata = {
  title: `${APP_CONFIG.companyName} | Catálogo de productos`,
  description: `Catálogo privado de productos de ${APP_CONFIG.companyName}. Registrate y solicitá acceso.`,
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#dbeafe' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="light">
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <WhatsAppFloatingButton />
        <Toaster richColors position="top-center" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
