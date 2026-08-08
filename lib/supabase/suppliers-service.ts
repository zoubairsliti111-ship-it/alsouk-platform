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
import { SITE_URL } from "@/lib/site"

export type SupplierSort = "rating" | "products" | "years"
export const SUPPLIER_SORTS: SupplierSort[] = ["rating", "products", "years"]

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

export type SuppliersResult = {
  suppliers: Supplier[]
  error: boolean
}

export const SUPPLIERS_TABLE = "companies"

export type SupplierRow = {
  id: string
  name: string
  business_type: string | null
  primary_industry: string | null
  country: string | null
  city: string | null
  verified: boolean
  year_established: number | null
  logo_url: string | null
  description: string | null
  tagline: string | null
  created_at: string
  profile_views: number | null
  products_count?: number
}

export const SUPPLIER_COLUMNS =
  "id,name,business_type,primary_industry,country,city,verified,year_established,logo_url,description,tagline,created_at,profile_views"

export const SORT_COLUMNS: Record<SupplierSort, string> = {
  rating: "created_at",
  products: "created_at",
  years: "year_established",
}

function deriveMonogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")
  return (letters || name.slice(0, 2)).toUpperCase()
}

function isOneOf<T extends string>(value: string, allowed: readonly T[]): value is T {
  return (allowed as readonly string[]).includes(value)
}

export function mapRow(row: SupplierRow): Supplier | null {
  if (!row?.id || !row.name?.trim()) return null

  const country = resolveCountry(row.country) ?? "tn"
  const currentYear = new Date().getFullYear()
  const years =
    row.year_established && row.year_established > 1800
      ? Math.max(0, currentYear - row.year_established)
      : 0

  return {
    id: row.id,
    name: row.name.trim(),
    monogram: deriveMonogram(row.name),
    logoColor: "blue",
    country,
    cityKey: resolveCityKey(row.city),
    region: "capital" as RegionKey,
    verified: Boolean(row.verified),
    rating: 0,
    reviews: 0,
    products: row.products_count ?? 0,
    years,
    responseRate: 0,
    minMoq: 0,
    businessTypes: (row.business_type ? [row.business_type] : []) as BusinessTypeKey[],
    categories: (row.primary_industry ? [row.primary_industry] : []) as CategoryKey[],
    description: row.description?.trim() || row.tagline?.trim() || null,
    logoUrl: row.logo_url?.trim() || null,
    profileViews: Number(row.profile_views) || 0,
  }
}

export async function fetchSuppliers(options?: {
  sort?: SupplierSort
  limit?: number
  cache?: RequestCache
}): Promise<SuppliersResult> {
  const params = new URLSearchParams()
  if (options?.sort) params.set("sort", options.sort)
  if (options?.limit) params.set("limit", String(options.limit))
  const qs = params.toString()

  const baseUrl = typeof window === "undefined" ? SITE_URL : ""
  try {
    const res = await fetch(`${baseUrl}/api/suppliers${qs ? `?${qs}` : ""}`, { cache: options?.cache ?? "no-store" })
    if (!res.ok) {
      console.error("[suppliers] /api/suppliers responded", res.status)
      return { suppliers: [], error: true }
    }
    const json = (await res.json()) as Partial<SuppliersResult>
    return { suppliers: json.suppliers ?? [], error: Boolean(json.error) }
  } catch (err) {
    console.error("[suppliers] Failed to load suppliers:", err)
    return { suppliers: [], error: true }
  }
}

export type SupplierResult = {
  supplier: Supplier | null
  error: boolean
  notFound: boolean
}

export async function fetchSupplierById(id: string): Promise<SupplierResult> {
  try {
    const res = await fetch(`/api/suppliers/${encodeURIComponent(id)}`, { cache: "no-store" })
    if (res.status === 404) {
      return { supplier: null, error: false, notFound: true }
    }
    if (!res.ok) {
      console.error("[suppliers] /api/suppliers/[id] responded", res.status)
      return { supplier: null, error: true, notFound: false }
    }
    const json = (await res.json()) as Partial<SupplierResult>
    return {
      supplier: json.supplier ?? null,
      error: Boolean(json.error),
      notFound: Boolean(json.notFound),
    }
  } catch (err) {
    console.error("[suppliers] Failed to load supplier:", err)
    return { supplier: null, error: true, notFound: false }
  }
}
