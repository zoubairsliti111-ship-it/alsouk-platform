// Server-side resolution of the Supabase URL + browser-safe key from the
// environment. Kept separate so both the list route (app/api/suppliers) and
// the single-supplier route (app/api/suppliers/[id]) resolve credentials the
// same way. Values are read at request time, never inlined into the client.

/** Env var names checked, in resolution order, for the Supabase project URL. */
export const URL_VARS = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"] as const

/** Env var names checked, in resolution order, for the browser-safe key. */
export const KEY_VARS = [
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_ANON_KEY",
  "SUPABASE_KEY",
] as const

/**
 * Env var names checked, in resolution order, for the server-only service-role
 * key. This key bypasses RLS, so it MUST never be exposed to the browser (no
 * `NEXT_PUBLIC_` prefix) — it is used only by server routes that need to read
 * RLS-protected data such as RFQ submissions.
 */
export const SERVICE_KEY_VARS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SERVICE_KEY",
] as const

/** Shared-secret token that gates the RFQ admin view. Server-only. */
export const ADMIN_TOKEN_VAR = "RFQ_ADMIN_TOKEN" as const

/**
 * Returns the first env var (from `names`) that holds a non-empty value.
 * Values are trimmed so an empty/whitespace-only entry is treated as absent
 * rather than sent upstream as a bogus credential.
 */
export function firstDefined(names: readonly string[]): { name?: string; value?: string } {
  for (const name of names) {
    const value = process.env[name]?.trim()
    if (value) return { name, value }
  }
  return {}
}
