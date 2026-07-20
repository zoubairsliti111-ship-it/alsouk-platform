import {
  BUSINESS_TYPE_KEYS,
  CATEGORY_KEYS,
  COUNTRY_KEYS,
  REGION_KEYS,
  type BusinessTypeKey,
  type CategoryKey,
  type CountryKey,
  type RegionKey,
  type Supplier,
} from "@/lib/directory-data"
import { getSupabaseClient } from "@/lib/supabase/client"

export type SupplierSort = "rating" | "products" | "years"

/** Result of a suppliers query, including a coarse error flag for the UI. */
export type SuppliersResult = {
  suppliers: Supplier[]
  /** True when the request could not be completed (unconfigured or failed). */
  error: boolean
}

/** Name of the Supabase table backing the supplier directory. */
export const SUPPLIERS_TABLE = "suppliers"

/** Shape of a row as stored in the Supabase `suppliers` table (snake_case). */
type SupplierRow = {
  id: string
  name: string
  monogram: string
  logo_color: string
  country: string
  city_key: string
  region: string
  verified: boolean
  rating: number
  reviews: number
  products: number
  years: number
  response_rate: number
  min_moq: number
  business_types: string[] | null
  categories: string[] | null
}

const SUPPLIER_COLUMNS =
  "id, name, monogram, logo_color, country, city_key, region, verified, rating, reviews, products, years, response_rate, min_moq, business_types, categories"

function isOneOf<T extends string>(value: string, allowed: readonly T[]): value is T {
  return (allowed as readonly string[]).includes(value)
}

/**
 * Converts a raw Supabase row into a strongly-typed {@link Supplier}, returning
 * `null` when required fields are missing or enum-like columns hold unexpected
 * values. Invalid rows are skipped rather than crashing the directory.
 */
function mapRow(row: SupplierRow): Supplier | null {
  if (!row?.id || !row.name) return null
  if (!isOneOf<CountryKey>(row.country, COUNTRY_KEYS)) return null
  if (!isOneOf<RegionKey>(row.region, REGION_KEYS)) return null

  const businessTypes = (row.business_types ?? []).filter((b): b is BusinessTypeKey =>
    isOneOf<BusinessTypeKey>(b, BUSINESS_TYPE_KEYS),
  )
  const categories = (row.categories ?? []).filter((c): c is CategoryKey =>
    isOneOf<CategoryKey>(c, CATEGORY_KEYS),
  )
  if (businessTypes.length === 0 || categories.length === 0) return null

  return {
    id: row.id,
    name: row.name,
    monogram: row.monogram,
    logoColor: row.logo_color === "green" ? "green" : "blue",
    country: row.country,
    cityKey: row.city_key,
    region: row.region,
    verified: Boolean(row.verified),
    rating: Number(row.rating),
    reviews: Number(row.reviews),
    products: Number(row.products),
    years: Number(row.years),
    responseRate: Number(row.response_rate),
    minMoq: Number(row.min_moq),
    businessTypes,
    categories,
  }
}

/**
 * Loads suppliers from Supabase, mapping and validating each row.
 *
 * Returns `{ suppliers: [], error: true }` when Supabase is not configured or
 * the query fails, so the UI can show an explicit error/empty state rather than
 * silently rendering stale mock data.
 *
 * @param options.sort  optional server-side ordering (defaults to rating desc)
 * @param options.limit optional row cap (e.g. for the home "Featured" section)
 */
export async function fetchSuppliers(options?: {
  sort?: SupplierSort
  limit?: number
}): Promise<SuppliersResult> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    console.error(
      "[suppliers] Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY). See .env.example.",
    )
    return { suppliers: [], error: true }
  }

  const sortColumn = options?.sort === "products" ? "products" : options?.sort === "years" ? "years" : "rating"

  try {
    let query = supabase.from(SUPPLIERS_TABLE).select(SUPPLIER_COLUMNS).order(sortColumn, { ascending: false })
    if (options?.limit) query = query.limit(options.limit)

    const { data, error } = await query
    if (error) {
      console.error("[suppliers] Supabase query failed:", error.message)
      return { suppliers: [], error: true }
    }

    const mapped = (data as SupplierRow[] | null)?.map(mapRow).filter((s): s is Supplier => s !== null) ?? []
    return { suppliers: mapped, error: false }
  } catch (err) {
    console.error("[suppliers] Unexpected error loading suppliers:", err)
    return { suppliers: [], error: true }
  }
}
