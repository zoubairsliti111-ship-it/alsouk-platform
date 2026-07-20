import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

/**
 * True when both public Supabase environment variables are present. Callers
 * use this to decide whether to hit Supabase or fall back to bundled data,
 * so the app stays functional in environments without credentials.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey)
}

let client: SupabaseClient | null = null

/**
 * Lazily creates the Supabase browser client.
 *
 * Creation is deferred so that importing this module never throws when the
 * environment is not configured (e.g. during static builds). Returns `null`
 * when credentials are missing instead of constructing a broken client.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  if (!client) {
    client = createClient(supabaseUrl as string, supabaseKey as string)
  }
  return client
}
