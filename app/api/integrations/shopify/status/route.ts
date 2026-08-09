import { NextResponse } from "next/server"
import {
  INTEGRATIONS_TABLE,
  NO_STORE,
  PROVIDER,
  authorizeCompanyManager,
  getServiceClient,
  jsonError,
} from "@/lib/shopify/server"

export const dynamic = "force-dynamic"

export type ShopifyStatus = {
  connected: boolean
  shopDomain: string | null
  lastSyncAt: string | null
  lastSyncStatus: "success" | "partial" | "failed" | null
  lastSyncError: string | null
  syncedCount: number
  /** Products currently in ALSOUK that came from this Shopify store. */
  importedProducts: number
}

/**
 * Reports whether a company has a Shopify store connected, and how the last
 * sync went. Deliberately never returns `access_token`.
 */
export async function GET(request: Request) {
  const companyId = new URL(request.url).searchParams.get("companyId")
  const authorized = await authorizeCompanyManager(companyId)
  if (!authorized.ok) return authorized.response

  const supabase = getServiceClient()
  if (!supabase) {
    return jsonError("Store sync is not configured on this server.", 503)
  }

  const { data: integration, error } = await supabase
    .from(INTEGRATIONS_TABLE)
    .select("shop_domain,last_sync_at,last_sync_status,last_sync_error,synced_count")
    .eq("company_id", authorized.auth.companyId)
    .eq("provider", PROVIDER)
    .maybeSingle()

  if (error) {
    console.error("[shopify/status] Failed to read integration:", error)
    return jsonError("Could not read the store connection.", 500)
  }

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("company_id", authorized.auth.companyId)
    .eq("source", PROVIDER)

  const status: ShopifyStatus = {
    connected: Boolean(integration),
    shopDomain: integration?.shop_domain ?? null,
    lastSyncAt: integration?.last_sync_at ?? null,
    lastSyncStatus: integration?.last_sync_status ?? null,
    lastSyncError: integration?.last_sync_error ?? null,
    syncedCount: integration?.synced_count ?? 0,
    importedProducts: count ?? 0,
  }

  return NextResponse.json(status, { headers: NO_STORE })
}
