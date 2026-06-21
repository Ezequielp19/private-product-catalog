"use client"

import { createBrowserClient } from "@supabase/ssr"
import { APP_CONFIG } from "@/src/config/app-config"

export function createClient() {
  return createBrowserClient(APP_CONFIG.supabaseUrl, APP_CONFIG.supabaseAnonKey)
}
