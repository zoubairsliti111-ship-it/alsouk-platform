import type { StoreDetails } from "@/lib/domains/store/types"
import { fetchItem, type ItemResult } from "@/lib/services/marketplace-api"

/** Loads a storefront (company + products + categories) via `/api/stores/[slug]`. */
export function fetchStoreBySlug(slug: string): Promise<ItemResult<StoreDetails>> {
  return fetchItem<StoreDetails>(`/api/stores/${encodeURIComponent(slug)}`)
}
