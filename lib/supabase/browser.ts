import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Browser-side Supabase client used for authenticated reads/writes. RLS is
 * enforced with the signed-in user's JWT, so this client can safely run in the
 * browser with the public anon/publishable key. A single instance is memoised
 * per tab so auth state and realtime subscriptions are shared.
 */
let client: SupabaseClient | null = null

export function getSupabaseBrowserClient(): SupabaseClient {
  if (client) return client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) {
    throw new Error("Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL / key).")
  }
  client = createBrowserClient(url, key)
  return client
}

/** True when the public Supabase env vars are present (client can be built). */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  )
}
