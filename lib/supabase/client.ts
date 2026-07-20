import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// Accept either the newer publishable-key name or the anon-key name that the
// Supabase→Vercel integration injects, so existing deployments work as-is.
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * True when both public Supabase environment variables are present. Callers
 * use this to decide whether to query Supabase or surface an error state.
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
