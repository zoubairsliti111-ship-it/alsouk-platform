import type { ProductDetails, ProductSummary } from "@/lib/domains/product/types"
import { fetchItem, fetchList, type ItemResult } from "@/lib/services/marketplace-api"

export type ProductQuery = {
  companyId?: string
  storeId?: string
  categoryId?: string
  limit?: number
}

/** Loads products via `/api/products`, optionally filtered. */
export function fetchProducts(query: ProductQuery = {}): Promise<ProductSummary[]> {
  const params = new URLSearchParams()
  if (query.companyId) params.set("companyId", query.companyId)
  if (query.storeId) params.set("storeId", query.storeId)
  if (query.categoryId) params.set("categoryId", query.categoryId)
  if (query.limit) params.set("limit", String(query.limit))
  const qs = params.toString()
  return fetchList<ProductSummary>(`/api/products${qs ? `?${qs}` : ""}`)
}

/** Loads a single product (with store, company, categories) via `/api/products/[id]`. */
export function fetchProductById(id: string): Promise<ItemResult<ProductDetails>> {
  return fetchItem<ProductDetails>(`/api/products/${encodeURIComponent(id)}`)
}
