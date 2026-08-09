import { NextResponse } from "next/server"
import type { SupabaseClient } from "@supabase/supabase-js"
import { ShopifyError, fetchAllProducts, fetchShop, type ShopifyProduct } from "@/lib/shopify/admin-api"
import {
  INTEGRATIONS_TABLE,
  NO_STORE,
  PRODUCT_IMAGES_BUCKET,
  PROVIDER,
  authorizeCompanyManager,
  getServiceClient,
  jsonError,
} from "@/lib/shopify/server"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/** At most this many photos per product are imported. */
const MAX_IMAGES_PER_PRODUCT = 5
/** Skip anything larger — Shopify originals can be very large. */
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

type SyncBody = { companyId?: string }

export type SyncResult = {
  status: "success" | "partial" | "failed"
  fetched: number
  imported: number
  failed: number
  /** Human-readable reasons, capped so the response stays small. */
  errors: string[]
}

function stripHtml(html: string | null): string | null {
  if (!html) return null
  const text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
  return text || null
}

/** Stable, collision-free slug so re-syncs keep hitting the same row. */
function buildSlug(product: ShopifyProduct): string {
  const base = (product.handle || product.title || "product")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60)
  return `${base || "product"}-sh${product.id}`
}

function parsePrice(product: ShopifyProduct): number | null {
  const raw = product.variants?.[0]?.price
  if (raw === null || raw === undefined || raw === "") return null
  const value = Number(raw)
  return Number.isFinite(value) && value >= 0 ? value : null
}

function extensionFor(src: string, contentType: string | null): string {
  const fromType = contentType?.split(";")[0]?.split("/")[1]
  if (fromType && /^[a-z0-9]+$/i.test(fromType)) return fromType.toLowerCase()
  const fromPath = src.split("?")[0].split(".").pop()
  return fromPath && /^[a-z0-9]{2,5}$/i.test(fromPath) ? fromPath.toLowerCase() : "jpg"
}

/**
 * Copies a product's Shopify photos into the existing `product-images` bucket
 * and rewrites its `product_images` rows to match. Deterministic paths +
 * upsert make this safe to run again after a failed sync.
 */
async function importImages(
  supabase: SupabaseClient,
  companyId: string,
  productId: string,
  product: ShopifyProduct,
): Promise<void> {
  const images = (product.images ?? [])
    .slice()
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .slice(0, MAX_IMAGES_PER_PRODUCT)

  const rows: {
    product_id: string
    storage_bucket: string
    storage_path: string
    url: string
    alt: string | null
    position: number
    is_primary: boolean
  }[] = []

  for (const [index, image] of images.entries()) {
    const response = await fetch(image.src, { cache: "no-store" })
    if (!response.ok) continue

    const contentType = response.headers.get("content-type")
    const bytes = new Uint8Array(await response.arrayBuffer())
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_IMAGE_BYTES) continue

    const path = `${companyId}/shopify/${product.id}-${index}.${extensionFor(image.src, contentType)}`
    const { error: uploadError } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(path, bytes, { contentType: contentType || "image/jpeg", upsert: true, cacheControl: "3600" })
    if (uploadError) {
      console.error("[shopify/sync] Image upload failed:", uploadError)
      continue
    }

    const { data: urlData } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path)
    rows.push({
      product_id: productId,
      storage_bucket: PRODUCT_IMAGES_BUCKET,
      storage_path: path,
      url: urlData.publicUrl,
      alt: image.alt,
      position: index,
      is_primary: index === 0,
    })
  }

  // Replace rather than merge: a photo removed in Shopify must disappear here
  // too, and dropping the old rows first avoids the one-primary-per-product
  // unique index rejecting the new primary.
  await supabase.from("product_images").delete().eq("product_id", productId)
  if (rows.length > 0) {
    const { error } = await supabase.from("product_images").insert(rows)
    if (error) console.error("[shopify/sync] Image rows insert failed:", error)
  }
}

/** The storefront imported products are attached to (products.store_id is NOT NULL). */
async function resolveStoreId(supabase: SupabaseClient, companyId: string, companyName: string | null): Promise<string | null> {
  const { data: existing } = await supabase
    .from("stores")
    .select("id")
    .eq("company_id", companyId)
    .limit(1)
    .maybeSingle()
  if (existing?.id) return existing.id

  const { data: created, error } = await supabase
    .from("stores")
    .insert({
      company_id: companyId,
      name: companyName || "Store",
      slug: `store-${companyId.slice(0, 8)}`,
      is_active: true,
    })
    .select("id")
    .single()

  if (error) {
    console.error("[shopify/sync] Could not create a store for the company:", error)
    return null
  }
  return created?.id ?? null
}

/**
 * Pulls the merchant's real Shopify catalog into `products` / `product_images`.
 *
 * Re-runnable by design: products are matched on (company_id, source,
 * external_id) so a second run updates rather than duplicates, and a run that
 * fails halfway reports exactly what failed instead of leaving the catalog in
 * a silently broken state.
 */
export async function POST(request: Request) {
  let body: SyncBody
  try {
    body = (await request.json()) as SyncBody
  } catch {
    return jsonError("Invalid request body.", 400)
  }

  const authorized = await authorizeCompanyManager(body.companyId)
  if (!authorized.ok) return authorized.response
  const { companyId } = authorized.auth

  const supabase = getServiceClient()
  if (!supabase) return jsonError("Store sync is not configured on this server.", 503)

  const { data: integration, error: integrationError } = await supabase
    .from(INTEGRATIONS_TABLE)
    .select("shop_domain,access_token")
    .eq("company_id", companyId)
    .eq("provider", PROVIDER)
    .maybeSingle()

  if (integrationError) {
    console.error("[shopify/sync] Failed to read integration:", integrationError)
    return jsonError("Could not read the store connection.", 500)
  }
  if (!integration) {
    return jsonError("Connect a Shopify store before syncing.", 400)
  }

  const recordFailure = async (message: string) => {
    await supabase
      .from(INTEGRATIONS_TABLE)
      .update({ last_sync_at: new Date().toISOString(), last_sync_status: "failed", last_sync_error: message })
      .eq("company_id", companyId)
      .eq("provider", PROVIDER)
  }

  let currency = "TND"
  let shopifyProducts: ShopifyProduct[]
  try {
    const shop = await fetchShop(integration.shop_domain, integration.access_token)
    if (shop.currency) currency = shop.currency
    shopifyProducts = await fetchAllProducts(integration.shop_domain, integration.access_token)
  } catch (err) {
    const message = err instanceof ShopifyError ? err.message : "Could not read products from Shopify."
    await recordFailure(message)
    return jsonError(message, err instanceof ShopifyError ? err.status : 502)
  }

  const { data: companyRow } = await supabase.from("companies").select("name").eq("id", companyId).maybeSingle()
  const storeId = await resolveStoreId(supabase, companyId, companyRow?.name ?? null)
  if (!storeId) {
    const message = "Your company has no storefront yet, so products can't be imported."
    await recordFailure(message)
    return jsonError(message, 500)
  }

  const { data: existingRows } = await supabase
    .from("products")
    .select("id,external_id")
    .eq("company_id", companyId)
    .eq("source", PROVIDER)
  const existingByExternalId = new Map<string, string>()
  for (const row of (existingRows ?? []) as { id: string; external_id: string | null }[]) {
    if (row.external_id) existingByExternalId.set(row.external_id, row.id)
  }

  const errors: string[] = []
  let imported = 0

  for (const product of shopifyProducts) {
    const externalId = String(product.id)
    const fields = {
      store_id: storeId,
      company_id: companyId,
      name: product.title?.trim() || `Shopify product ${externalId}`,
      slug: buildSlug(product),
      sku: product.variants?.[0]?.sku?.trim() || null,
      description: stripHtml(product.body_html),
      price: parsePrice(product),
      currency,
      is_active: product.status === "active",
      source: PROVIDER,
      external_id: externalId,
    }

    try {
      const existingId = existingByExternalId.get(externalId)
      let productId = existingId

      if (existingId) {
        const { error } = await supabase.from("products").update(fields).eq("id", existingId)
        if (error) throw new Error(error.message)
      } else {
        const { data: inserted, error } = await supabase.from("products").insert(fields).select("id").single()
        if (error) throw new Error(error.message)
        productId = inserted?.id
      }

      if (!productId) throw new Error("the product row could not be resolved")

      await importImages(supabase, companyId, productId, product)
      imported++
    } catch (err) {
      const reason = err instanceof Error ? err.message : "unknown error"
      console.error(`[shopify/sync] Product ${externalId} failed:`, reason)
      if (errors.length < 5) errors.push(`${fields.name}: ${reason}`)
    }
  }

  const failed = shopifyProducts.length - imported
  const status: SyncResult["status"] = failed === 0 ? "success" : imported === 0 ? "failed" : "partial"

  await supabase
    .from(INTEGRATIONS_TABLE)
    .update({
      last_sync_at: new Date().toISOString(),
      last_sync_status: status,
      last_sync_error:
        failed === 0 ? null : `${failed} product${failed === 1 ? "" : "s"} could not be imported. ${errors.join(" | ")}`,
      synced_count: imported,
    })
    .eq("company_id", companyId)
    .eq("provider", PROVIDER)

  const result: SyncResult = { status, fetched: shopifyProducts.length, imported, failed, errors }
  return NextResponse.json(result, { headers: NO_STORE })
}
