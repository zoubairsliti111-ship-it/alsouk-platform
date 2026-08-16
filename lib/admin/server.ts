/**
 * Shared server-side plumbing for admin-only API routes: confirms the caller
 * is a signed-in user present in `admin_users`, then hands back a ready-to-use
 * service-role client for the write that follows.
 *
 * SERVER ONLY — the service-role key bypasses RLS. `admin_users` itself has
 * no RLS policies at all, so this check is the only gate; it must run before
 * every admin-only read or write.
 */

import { NextResponse } from "next/server"
import { createClient as createUserClient } from "@/lib/supabase/server"
import { getServiceClient } from "@/lib/supabase/service"
import type { SupabaseClient } from "@supabase/supabase-js"

export const NO_STORE = { "Cache-Control": "no-store" } as const

export function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: NO_STORE })
}

export type AdminAuthorized = { userId: string; service: SupabaseClient }

/**
 * Resolves the signed-in user from the request cookies and confirms they
 * have a row in `admin_users`. Returns a ready-to-send response on failure.
 */
export async function authorizeAdmin(): Promise<
  { ok: true; auth: AdminAuthorized } | { ok: false; response: NextResponse }
> {
  const supabase = await createUserClient()
  const { data } = await supabase.auth.getUser()
  const user = data?.user
  if (!user) return { ok: false, response: jsonError("You must be signed in.", 401) }

  const service = getServiceClient()
  if (!service) return { ok: false, response: jsonError("Server is not configured.", 503) }

  const { data: row, error } = await service
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (error) {
    console.error("[admin] admin_users lookup failed:", error)
    return { ok: false, response: jsonError("Could not verify admin access.", 500) }
  }
  if (!row) {
    return { ok: false, response: jsonError("Admin access required.", 403) }
  }

  return { ok: true, auth: { userId: user.id, service } }
}
