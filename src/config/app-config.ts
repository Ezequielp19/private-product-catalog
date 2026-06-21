export const APP_CONFIG = {
  companyName: "LMProductos",
  supabaseUrl: "https://zghmknmcqdwzzenqkpvh.supabase.co",
  supabaseAnonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG1rbm1jcWR3enplbnFrcHZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NTI3NDgsImV4cCI6MjA5NzUyODc0OH0.Hck0R0a7NT2LAkHy61gjyVI4U4oWzLhjVmEmPSRgAyc",
  adminEmail: "lmproductos@gmail.com",
  adminPassword: "lmproductos",
  contactEmail: "lmproductos@gmail.com",
  siteUrl: "https://lmproductos.online",
  whatsappNumber: "5493476618321",
  instagramUrl: "https://www.instagram.com/lmproductos?utm_source=qr&igsh=b2pub3VjbXd0YjRs",
} as const

export type AppConfig = typeof APP_CONFIG
