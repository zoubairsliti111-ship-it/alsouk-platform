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
import { directoryT } from "@/lib/directory-i18n"
import { getSupabaseClient } from "@/lib/supabase/client"

export type SupplierSort = "rating" | "products" | "years"

// Production stores country/city as English display names (e.g. "Tunisia",
// "Sfax") while the UI keys off short codes. Build reverse lookups from the
// English dictionary so we can resolve either a display name or a raw key.
const EN = directoryT.en
function buildReverse(map: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, label] of Object.entries(map)) out[label.toLowerCase()] = key
  return out
}
const COUNTRY_NAME_TO_KEY = buildReverse(EN.countries)
const CITY_NAME_TO_KEY = buildReverse(EN.cities)

function resolveCountry(value: string | null): CountryKey | null {
  if (!value) return null
  const v = value.trim().toLowerCase()
  if (isOneOf<CountryKey>(v, COUNTRY_KEYS)) return v
  const mapped = COUNTRY_NAME_TO_KEY[v]
  return mapped && isOneOf<CountryKey>(mapped, COUNTRY_KEYS) ? mapped : null
}

function resolveCityKey(value: string | null): string {
  if (!value) return ""
  const v = value.trim().toLowerCase()
  if (v in EN.cities) return v
  return CITY_NAME_TO_KEY[v] ?? v
}

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
  company_name: string
  monogram: string | null
  logo_color: string | null
  country: string
  city: string
  region: string
  verified: boolean
  rating: number
  reviews: number
  products: number
  years_in_business: number
  response_rate: number
  min_moq: number
  business_type: string | null
  category: string | null
}

const SUPPLIER_COLUMNS =
  "id, company_name, monogram, logo_color, country, city, region, verified, rating, reviews, products, years_in_business, response_rate, min_moq, business_type, category"

/** Maps a {@link SupplierSort} onto its physical Supabase column. */
const SORT_COLUMNS: Record<SupplierSort, string> = {
  rating: "rating",
  products: "products",
  years: "years_in_business",
}

/** Two-letter fallback monogram derived from the company name. */
function deriveMonogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")
  return (letters || name.slice(0, 2)).toUpperCase()
}

function isOneOf<T extends string>(value: string, allowed: readonly T[]): value is T {
  return (allowed as readonly string[]).includes(value)
}

/**
 * Converts a raw Supabase row into a strongly-typed {@link Supplier}, returning
 * `null` when required fields are missing or enum-like columns hold unexpected
 * values. Invalid rows are skipped rather than crashing the directory.
 */
function mapRow(row: SupplierRow): Supplier | null {
  if (!row?.id || !row.company_name) return null

  const country = resolveCountry(row.country)
  if (!country) return null
  if (!isOneOf<RegionKey>(row.region, REGION_KEYS)) return null

  const businessTypes =
    row.business_type && isOneOf<BusinessTypeKey>(row.business_type, BUSINESS_TYPE_KEYS)
      ? [row.business_type]
      : []
  const categories =
    row.category && isOneOf<CategoryKey>(row.category, CATEGORY_KEYS) ? [row.category] : []
  if (businessTypes.length === 0 || categories.length === 0) return null

  return {
    id: row.id,
    name: row.company_name,
    monogram: row.monogram?.trim() || deriveMonogram(row.company_name),
    logoColor: row.logo_color === "green" ? "green" : "blue",
    country,
    cityKey: resolveCityKey(row.city),
    region: row.region,
    verified: Boolean(row.verified),
    rating: Number(row.rating),
    reviews: Number(row.reviews),
    products: Number(row.products),
    years: Number(row.years_in_business),
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

  const sortColumn = SORT_COLUMNS[options?.sort ?? "rating"]

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
