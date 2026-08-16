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
import { safeExternalStoreUrl } from "@/lib/external-store"

export type SupplierSort = "newest" | "products" | "years"
export const SUPPLIER_SORTS: SupplierSort[] = ["newest", "products", "years"]

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

// companies_public, not the raw companies table — companies has ~55 columns
// including tax_identifier/license_document_url/business_email that were
// never meant to be public, and per-field opt-in visibility (website/
// social/phone/whatsapp/address/company_size) can only be enforced by a
// view (RLS is row-level, not column-level — see migration 0046).
export const SUPPLIERS_TABLE = "companies_public"

export type SupplierRow = {
  id: string
  owner_id: string | null
  name: string
  business_type: string | null
  primary_industry: string | null
  country: string | null
  city: string | null
  verified: boolean
  year_established: number | null
  logo_url: string | null
  banner_url: string | null
  description: string | null
  tagline: string | null
  created_at: string
  profile_views: number | null
  external_store_url: string | null
  website_url: string | null
  facebook_url: string | null
  instagram_url: string | null
  tiktok_url: string | null
  linkedin_url: string | null
  youtube_url: string | null
  phone_number: string | null
  whatsapp_number: string | null
  street_address: string | null
  postal_code: string | null
  company_size: string | null
  products_count?: number
  cover_photo_url?: string | null
}

export const SUPPLIER_COLUMNS =
  "id,owner_id,name,business_type,primary_industry,country,city,verified,year_established,logo_url,banner_url,description,tagline,created_at,profile_views,external_store_url," +
  "website_url,facebook_url,instagram_url,tiktok_url,linkedin_url,youtube_url,phone_number,whatsapp_number,street_address,postal_code,company_size"

export const SORT_COLUMNS: Record<SupplierSort, string> = {
  newest: "created_at",
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
  const yearEstablished = row.year_established && row.year_established > 1800 ? row.year_established : null
  const years = yearEstablished !== null ? Math.max(0, currentYear - yearEstablished) : 0

  return {
    id: row.id,
    ownerId: row.owner_id || null,
    name: row.name.trim(),
    monogram: deriveMonogram(row.name),
    logoColor: "blue",
    country,
    cityKey: resolveCityKey(row.city),
    region: "capital" as RegionKey,
    verified: Boolean(row.verified),
    products: row.products_count ?? 0,
    years,
    yearEstablished,
    businessTypes: (row.business_type ? [row.business_type] : []) as BusinessTypeKey[],
    categories: (row.primary_industry ? [row.primary_industry] : []) as CategoryKey[],
    description: row.description?.trim() || row.tagline?.trim() || null,
    logoUrl: row.logo_url?.trim() || null,
    bannerUrl: row.banner_url?.trim() || null,
    profileViews: Number(row.profile_views) || 0,
    coverPhotoUrl: row.cover_photo_url?.trim() || null,
    externalStoreUrl: safeExternalStoreUrl(row.external_store_url),
    websiteUrl: row.website_url?.trim() || null,
    facebookUrl: row.facebook_url?.trim() || null,
    instagramUrl: row.instagram_url?.trim() || null,
    tiktokUrl: row.tiktok_url?.trim() || null,
    linkedinUrl: row.linkedin_url?.trim() || null,
    youtubeUrl: row.youtube_url?.trim() || null,
    phoneNumber: row.phone_number?.trim() || null,
    whatsappNumber: row.whatsapp_number?.trim() || null,
    streetAddress: row.street_address?.trim() || null,
    postalCode: row.postal_code?.trim() || null,
    companySize: row.company_size?.trim() || null,
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
