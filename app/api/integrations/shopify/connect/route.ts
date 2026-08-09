import { NextResponse } from "next/server"
import { ShopifyError, fetchShop, normalizeShopDomain } from "@/lib/shopify/admin-api"
import {
  INTEGRATIONS_TABLE,
  NO_STORE,
  PROVIDER,
  authorizeCompanyManager,
  getServiceClient,
  jsonError,
} from "@/lib/shopify/server"

export const dynamic = "force-dynamic"

type ConnectBody = {
  companyId?: string
  shopDomain?: string
  accessToken?: string
}

/**
 * Connects a company's Shopify store.
 *
 * The access token arrives here once, over the request body, and is written
 * straight to a column that is unreadable to browser clients. It is never
 * echoed back — the response only confirms which shop was connected.
 */
export async function POST(request: Request) {
  let body: ConnectBody
  try {
    body = (await request.json()) as ConnectBody
  } catch {
    return jsonError("Invalid request body.", 400)
  }

  const authorized = await authorizeCompanyManager(body.companyId)
  if (!authorized.ok) return authorized.response

  const shopDomain = normalizeShopDomain(body.shopDomain ?? "")
  if (!shopDomain) {
    return jsonError("Enter your Shopify store domain, for example my-shop.myshopify.com", 400)
  }

  const accessToken = body.accessToken?.trim()
  if (!accessToken) {
    return jsonError("Enter the Admin API access token from your Shopify custom app.", 400)
  }

  const supabase = getServiceClient()
  if (!supabase) {
    return jsonError("Store sync is not configured on this server.", 503)
  }

  // Prove the credentials work before storing them, so a merchant never ends
  // up with a "connected" store that silently fails on every sync.
  let shopName: string
  try {
    const shop = await fetchShop(shopDomain, accessToken)
    shopName = shop.name
  } catch (err) {
    if (err instanceof ShopifyError) return jsonError(err.message, err.status === 401 ? 400 : err.status)
    console.error("[shopify/connect] Unexpected verification error:", err)
    return jsonError("Could not verify the Shopify credentials.", 500)
  }

  const { error } = await supabase.from(INTEGRATIONS_TABLE).upsert(
    {
      company_id: authorized.auth.companyId,
      provider: PROVIDER,
      shop_domain: shopDomain,
      access_token: accessToken,
      last_sync_status: null,
      last_sync_error: null,
    },
    { onConflict: "company_id,provider" },
  )

  if (error) {
    console.error("[shopify/connect] Failed to save integration:", error)
    return jsonError("Could not save the store connection.", 500)
  }

  return NextResponse.json({ connected: true, shopDomain, shopName }, { headers: NO_STORE })
}

/** Disconnects the store. Imported products are left in place. */
export async function DELETE(request: Request) {
  const companyId = new URL(request.url).searchParams.get("companyId")
  const authorized = await authorizeCompanyManager(companyId)
  if (!authorized.ok) return authorized.response

  const supabase = getServiceClient()
  if (!supabase) {
    return jsonError("Store sync is not configured on this server.", 503)
  }

  const { error } = await supabase
    .from(INTEGRATIONS_TABLE)
    .delete()
    .eq("company_id", authorized.auth.companyId)
    .eq("provider", PROVIDER)

  if (error) {
    console.error("[shopify/connect] Failed to delete integration:", error)
    return jsonError("Could not disconnect the store.", 500)
  }

  return NextResponse.json({ connected: false }, { headers: NO_STORE })
}
