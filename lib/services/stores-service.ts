import { restGet } from "@/lib/supabase/rest"
import type { Store, StoreDetails } from "@/lib/domains/store/types"
import { CATEGORY_COLUMNS, mapCategory, type CategoryRow } from "@/lib/services/categories-service"
import {
  PRODUCT_LIST_SELECT,
  mapProductSummary,
  type ProductRow,
} from "@/lib/services/products-service"

/** Shape of a row in the Supabase `stores` table (snake_case). */
export type StoreRow = {
  id: string
  company_id: string
  name: string
  slug: string
  tagline: string | null
  description: string | null
  logo_url: string | null
  banner_url: string | null
  is_active: boolean
  created_at?: string
}

export const STORE_COLUMNS =
  "id,company_id,name,slug,tagline,description,logo_url,banner_url,is_active,created_at"

/** Maps a raw store row to the domain model, or `null` when invalid. */
export function mapStore(row: StoreRow): Store | null {
  if (!row?.id || !row.name || !row.slug) return null
  return {
    id: row.id,
    companyId: row.company_id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline?.trim() || null,
    description: row.description?.trim() || null,
    logoUrl: row.logo_url?.trim() || null,
    bannerUrl: row.banner_url?.trim() || null,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
  }
}

type StoreDetailRow = StoreRow & {
  companies?: {
    id: string
    name: string
    slug: string
    logo_url: string | null
    company_categories?: { categories: CategoryRow | null }[]
  } | null
  products?: ProductRow[]
}

/**
 * Loads an active storefront by slug with its owning company, catalogue and the
 * company's operating categories. Returns `null` when missing or inactive.
 */
export async function getStoreBySlug(slug: string): Promise<StoreDetails | null> {
  const select =
    `${STORE_COLUMNS},` +
    `companies(id,name,slug,logo_url,company_categories(categories(${CATEGORY_COLUMNS}))),` +
    `products(${PRODUCT_LIST_SELECT})`
  const rows = await restGet<StoreDetailRow>(
    `stores?select=${select}&slug=eq.${encodeURIComponent(slug)}&is_active=eq.true&limit=1`,
  )
  const row = rows[0]
  if (!row) return null
  const store = mapStore(row)
  if (!store) return null

  const products = (row.products ?? [])
    .filter((p) => p.is_active !== false)
    .map(mapProductSummary)
    .filter((p): p is NonNullable<typeof p> => p !== null)

  const categories = (row.companies?.company_categories ?? [])
    .map((cc) => (cc.categories ? mapCategory(cc.categories) : null))
    .filter((c): c is NonNullable<typeof c> => c !== null)

  return {
    ...store,
    company: row.companies
      ? {
          id: row.companies.id,
          name: row.companies.name,
          slug: row.companies.slug,
          logoUrl: row.companies.logo_url?.trim() || null,
        }
      : null,
    products,
    categories,
  }
}
