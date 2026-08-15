import { restGet } from "@/lib/supabase/rest"
import {
  SUPPLIER_COLUMNS,
  SUPPLIERS_TABLE,
  mapRow,
  type SupplierRow,
} from "@/lib/supabase/suppliers-service"
import type { Supplier } from "@/lib/directory-data"
import { COMPANY_COLUMNS, mapCompany, type CompanyRow } from "@/lib/services/companies-service"
import type { Company } from "@/lib/domains/company/types"
import {
  PRODUCT_LIST_SELECT,
  mapProductSummary,
  type ProductRow,
} from "@/lib/services/products-service"
import type { ProductSummary } from "@/lib/domains/product/types"

/** Combined result of a marketplace-wide search across the core entities. */
export type SearchResults = {
  suppliers: Supplier[]
  companies: Company[]
  products: ProductSummary[]
}

const DEFAULT_PER_TYPE = 12

/**
 * Builds a PostgREST `ilike` pattern from a raw query. Characters that carry
 * meaning in a PostgREST filter (`,`, `*`, `%`, parentheses) are stripped so a
 * user term can never break out of the value or inject extra filters.
 */
function ilikePattern(q: string): string {
  const cleaned = q.replace(/[,*%()]/g, " ").trim()
  return `*${cleaned}*`
}

/**
 * Searches suppliers, companies and products in parallel for a single term.
 *
 * Each query runs server-side via {@link restGet} (browser-safe key only) and
 * relies on RLS for visibility (active stores/products, public catalogue). A
 * blank query returns empty results without hitting the database.
 */
export async function search(rawQuery: string, perType = DEFAULT_PER_TYPE): Promise<SearchResults> {
  const q = rawQuery.trim()
  if (!q) return { suppliers: [], companies: [], products: [] }

  const pattern = encodeURIComponent(ilikePattern(q))
  const limit = Math.max(1, Math.min(perType, 50))

  const [suppliers, companies, products] = await Promise.all([
    searchSuppliers(pattern, limit),
    searchCompanies(pattern, limit),
    searchProducts(pattern, limit),
  ])

  return { suppliers, companies, products }
}

async function searchSuppliers(pattern: string, limit: number): Promise<Supplier[]> {
  try {
    const rows = await restGet<SupplierRow>(
      `${SUPPLIERS_TABLE}?select=${SUPPLIER_COLUMNS}` +
        `&name=ilike.${pattern}&order=created_at.desc&limit=${limit}`,
    )
    await attachProductCounts(rows)
    return rows.map(mapRow).filter((s): s is Supplier => s !== null)
  } catch {
    return []
  }
}

/**
 * Mirrors the real product-count query in app/api/suppliers/route.ts so
 * search results show an actual catalog size instead of silently defaulting
 * to 0 (mapRow falls back to 0 when `products_count` was never set).
 */
async function attachProductCounts(rows: SupplierRow[]): Promise<void> {
  const ids = rows.map((r) => r.id).filter(Boolean)
  if (ids.length === 0) return
  try {
    const idsParam = ids.map((id) => `"${id}"`).join(",")
    const productRows = await restGet<{ company_id: string }>(
      `products?select=company_id&company_id=in.(${idsParam})&is_active=eq.true`,
    )
    const counts = new Map<string, number>()
    for (const p of productRows) counts.set(p.company_id, (counts.get(p.company_id) ?? 0) + 1)
    for (const row of rows) row.products_count = counts.get(row.id) ?? 0
  } catch (err) {
    console.error("[search] Failed to load supplier product counts:", err)
  }
}

async function searchCompanies(pattern: string, limit: number): Promise<Company[]> {
  try {
    const rows = await restGet<CompanyRow>(
      `companies?select=${COMPANY_COLUMNS}` +
        `&name=ilike.${pattern}&order=verified.desc,name.asc&limit=${limit}`,
    )
    return rows.map(mapCompany).filter((c): c is Company => c !== null)
  } catch {
    return []
  }
}

async function searchProducts(pattern: string, limit: number): Promise<ProductSummary[]> {
  try {
    const rows = await restGet<ProductRow>(
      `products?select=${PRODUCT_LIST_SELECT}` +
        `&is_active=eq.true&name=ilike.${pattern}&order=created_at.desc&limit=${limit}`,
    )
    return rows.map(mapProductSummary).filter((p): p is ProductSummary => p !== null)
  } catch {
    return []
  }
}
