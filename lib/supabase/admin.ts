import { createClient } from "@supabase/supabase-js"
import { firstDefined, URL_VARS, SERVICE_KEY_VARS } from "./env"

/**
 * Creates a server-side Supabase client with service role bypass.
 * Useful for admin operations, check uniqueness, or force password resets.
 */
export function createAdminClient() {
  const url = firstDefined(URL_VARS).value || ""
  const key = firstDefined(SERVICE_KEY_VARS).value || ""

  if (!url || !key) {
    console.warn("createAdminClient: Supabase URL or Service Role Key is missing.")
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
