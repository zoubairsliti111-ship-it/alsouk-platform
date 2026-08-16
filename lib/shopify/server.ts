/**
 * Shared server-side plumbing for the Shopify integration routes:
 * authorization ("is the caller a manager of this company?") and the
 * service-role Supabase client used to touch the token column and Storage.
 *
 * SERVER ONLY — the service-role key bypasses RLS.
 */

import { NextResponse } from "next/server"
import { createClient as createUserClient } from "@/lib/supabase/server"
import { getServiceClient } from "@/lib/supabase/service"

export const INTEGRATIONS_TABLE = "company_store_integrations"
export const PROVIDER = "shopify"
/** Existing bucket, reused for imported product photos (no new bucket). */
export const PRODUCT_IMAGES_BUCKET = "product-images"

export const NO_STORE = { "Cache-Control": "no-store" } as const

export function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: NO_STORE })
}

export { getServiceClient }

export type Authorized = { userId: string; companyId: string }

/**
 * Resolves the signed-in user from the request cookies and confirms they may
 * manage `companyId`, reusing the same `is_company_manager` rule that guards
 * every company-scoped RLS policy. Returns a ready-to-send response on failure.
 */
export async function authorizeCompanyManager(
  companyId: string | null | undefined,
): Promise<{ ok: true; auth: Authorized } | { ok: false; response: NextResponse }> {
  if (!companyId) return { ok: false, response: jsonError("A companyId is required.", 400) }

  const supabase = await createUserClient()
  const { data } = await supabase.auth.getUser()
  const user = data?.user
  if (!user) return { ok: false, response: jsonError("You must be signed in.", 401) }

  const { data: isManager, error } = await supabase.rpc("is_company_manager", { cid: companyId })
  if (error) {
    console.error("[shopify] is_company_manager failed:", error)
    return { ok: false, response: jsonError("Could not verify your permissions for this company.", 500) }
  }
  if (!isManager) {
    return { ok: false, response: jsonError("You don't manage this company.", 403) }
  }

  return { ok: true, auth: { userId: user.id, companyId } }
}
