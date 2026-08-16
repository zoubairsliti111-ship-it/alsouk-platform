// Service-role Supabase client factory. SERVER ONLY — this key bypasses RLS,
// so it must never be imported by a "use client" file or shipped to the
// browser bundle.

import { createClient as createServiceClient, type SupabaseClient } from "@supabase/supabase-js"
import { SERVICE_KEY_VARS, URL_VARS, firstDefined } from "@/lib/supabase/env"

/**
 * Service-role Supabase client, or null when the server isn't configured.
 * Bypasses RLS entirely — use only after an explicit authorization check.
 */
export function getServiceClient(): SupabaseClient | null {
  const url = firstDefined(URL_VARS).value
  const key = firstDefined(SERVICE_KEY_VARS).value
  if (!url || !key || !/^https?:\/\//.test(url)) return null
  return createServiceClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
