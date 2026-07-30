import { createBrowserClient } from "@supabase/ssr"

/**
 * Creates a client-side Supabase client for use in Client Components.
 * Resolves Next.js prefixed environment variables at runtime.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ""

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
