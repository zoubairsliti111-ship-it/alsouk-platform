import {
  BUSINESS_TYPE_KEYS,
  CATEGORY_KEYS,
  COUNTRY_KEYS,
  REGION_KEYS,
  suppliers as fallbackSuppliers,
  type BusinessTypeKey,
  type CategoryKey,
  type CountryKey,
  type RegionKey,
  type Supplier,
} from "@/lib/directory-data"
import { getSupabaseClient } from "@/lib/supabase/client"

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
 * Loads suppliers for the directory.
 *
 * Queries Supabase when it is configured, mapping and validating each row. If
 * Supabase is not configured, the request fails, or it returns no usable rows,
 * the bundled static dataset is returned so the directory always renders.
 */
export async function fetchSuppliers(): Promise<Supplier[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return fallbackSuppliers

  try {
    const { data, error } = await supabase.from(SUPPLIERS_TABLE).select(SUPPLIER_COLUMNS)
    if (error) {
      console.error("[suppliers] Supabase query failed, using bundled data:", error.message)
      return fallbackSuppliers
    }

    const mapped = (data as SupplierRow[] | null)?.map(mapRow).filter((s): s is Supplier => s !== null) ?? []
    return mapped.length > 0 ? mapped : fallbackSuppliers
  } catch (err) {
    console.error("[suppliers] Unexpected error loading suppliers, using bundled data:", err)
    return fallbackSuppliers
  }
}
