/**
 * Shared server-side plumbing for the booth self-service routes: confirms
 * the caller manages the company that owns a given booth, reusing the same
 * `is_company_manager` RPC as products/stores/Shopify. Unlike the Shopify
 * helper (which hands off to a service-role client), this returns the
 * caller's own session-bound client — writes go through it so the booth
 * RLS policies (`is_company_manager(company_id)`) are the real enforcement,
 * not just this in-route check.
 */

import { NextResponse } from "next/server"
import { createClient as createUserClient } from "@/lib/supabase/server"
import { getBoothCompanyId } from "@/lib/services/exhibitions-service"
import type { SupabaseClient } from "@supabase/supabase-js"

export function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } })
}

export type BoothOwnerAuthorized = { userId: string; companyId: string; client: SupabaseClient }

export async function authorizeBoothOwner(
  boothId: string | null | undefined,
): Promise<{ ok: true; auth: BoothOwnerAuthorized } | { ok: false; response: NextResponse }> {
  if (!boothId) return { ok: false, response: jsonError("A boothId is required.", 400) }

  const companyId = await getBoothCompanyId(boothId)
  if (!companyId) return { ok: false, response: jsonError("Booth not found.", 404) }

  const client = await createUserClient()
  const { data } = await client.auth.getUser()
  const user = data?.user
  if (!user) return { ok: false, response: jsonError("You must be signed in.", 401) }

  const { data: isManager, error } = await client.rpc("is_company_manager", { cid: companyId })
  if (error) {
    console.error("[exhibitions] is_company_manager failed:", error)
    return { ok: false, response: jsonError("Could not verify your permissions for this booth.", 500) }
  }
  if (!isManager) {
    return { ok: false, response: jsonError("You don't manage this booth.", 403) }
  }

  return { ok: true, auth: { userId: user.id, companyId, client } }
}
