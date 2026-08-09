/**
 * Shopify Admin API access — SERVER ONLY.
 *
 * Every function here takes the merchant's Admin API access token. That token
 * is a bearer credential for their entire Shopify admin, so nothing in this
 * module may ever be imported from a `"use client"` component: it is called
 * exclusively from route handlers under app/api/integrations/shopify.
 */

const API_VERSION = "2024-10"

export class ShopifyError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = "ShopifyError"
  }
}

/**
 * Normalises what a merchant might paste ("my-shop", "my-shop.myshopify.com",
 * "https://my-shop.myshopify.com/admin") into the canonical API host.
 * Returns null when the value can't be a Shopify store domain.
 */
export function normalizeShopDomain(input: string): string | null {
  let value = input.trim().toLowerCase()
  if (!value) return null

  value = value.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/:\d+$/, "")
  if (!value) return null

  if (!value.includes(".")) value = `${value}.myshopify.com`
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(value)) return null

  return value
}

async function shopifyGet<T>(shopDomain: string, accessToken: string, path: string): Promise<{ body: T; linkHeader: string | null }> {
  let res: Response
  try {
    res = await fetch(`https://${shopDomain}/admin/api/${API_VERSION}/${path}`, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })
  } catch {
    throw new ShopifyError("Could not reach Shopify. Check the store domain.", 502)
  }

  if (res.status === 401 || res.status === 403) {
    throw new ShopifyError("Shopify rejected the access token. Check the token and its scopes (read_products).", 401)
  }
  if (res.status === 404) {
    throw new ShopifyError("Shopify store not found. Check the store domain.", 404)
  }
  if (res.status === 429) {
    throw new ShopifyError("Shopify is rate limiting this store. Try the sync again in a minute.", 429)
  }
  if (!res.ok) {
    throw new ShopifyError(`Shopify returned an unexpected error (${res.status}).`, 502)
  }

  return { body: (await res.json()) as T, linkHeader: res.headers.get("link") }
}

export type ShopifyShop = {
  name: string
  myshopify_domain: string
  currency: string
}

/** Verifies the credentials by reading the shop record; throws on failure. */
export async function fetchShop(shopDomain: string, accessToken: string): Promise<ShopifyShop> {
  const { body } = await shopifyGet<{ shop: ShopifyShop }>(shopDomain, accessToken, "shop.json")
  if (!body?.shop) throw new ShopifyError("Shopify returned an empty shop record.", 502)
  return body.shop
}

export type ShopifyImage = {
  id: number
  src: string
  alt: string | null
  position: number
}

export type ShopifyVariant = {
  id: number
  price: string | null
  sku: string | null
}

export type ShopifyProduct = {
  id: number
  title: string
  handle: string
  body_html: string | null
  status: string
  variants: ShopifyVariant[] | null
  images: ShopifyImage[] | null
}

/** `<https://…page_info=abc>; rel="next"` → the page_info cursor, if any. */
function nextPageInfo(linkHeader: string | null): string | null {
  if (!linkHeader) return null
  for (const part of linkHeader.split(",")) {
    if (!/rel="next"/.test(part)) continue
    const url = part.match(/<([^>]+)>/)?.[1]
    if (!url) continue
    try {
      return new URL(url).searchParams.get("page_info")
    } catch {
      return null
    }
  }
  return null
}

const PAGE_SIZE = 250
const MAX_PAGES = 20

/** Reads the merchant's full product list, following Shopify's cursor pages. */
export async function fetchAllProducts(shopDomain: string, accessToken: string): Promise<ShopifyProduct[]> {
  const products: ShopifyProduct[] = []
  let pageInfo: string | null = null

  for (let page = 0; page < MAX_PAGES; page++) {
    const query = pageInfo
      ? `limit=${PAGE_SIZE}&page_info=${encodeURIComponent(pageInfo)}`
      : `limit=${PAGE_SIZE}`
    const { body, linkHeader }: { body: { products: ShopifyProduct[] | null }; linkHeader: string | null } =
      await shopifyGet<{ products: ShopifyProduct[] | null }>(shopDomain, accessToken, `products.json?${query}`)

    products.push(...(body.products ?? []))

    pageInfo = nextPageInfo(linkHeader)
    if (!pageInfo) break
  }

  return products
}
