import { restGet } from "@/lib/supabase/rest"
import type { Company, CompanyDetails, CompanySummary } from "@/lib/domains/company/types"
import type { StoreSummary } from "@/lib/domains/store/types"
import { CATEGORY_COLUMNS, mapCategory, type CategoryRow } from "@/lib/services/categories-service"

/** Shape of a row in the Supabase `companies` table (snake_case). */
export type CompanyRow = {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  cover_url: string | null
  business_type: string | null
  website: string | null
  country: string | null
  city: string | null
  phone: string | null
  whatsapp: string | null
  facebook_url: string | null
  tiktok_url: string | null
  verified: boolean
  created_at?: string
}

export const COMPANY_COLUMNS =
  "id,name,slug,description,logo_url,cover_url,business_type,website,country,city," +
  "phone,whatsapp,facebook_url,tiktok_url,verified,created_at"

/** Maps a raw company row to the domain model, or `null` when invalid. */
export function mapCompany(row: CompanyRow): Company | null {
  if (!row?.id || !row.name || !row.slug) return null
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description?.trim() || null,
    logoUrl: row.logo_url?.trim() || null,
    coverUrl: row.cover_url?.trim() || null,
    businessType: row.business_type?.trim() || null,
    website: row.website?.trim() || null,
    country: row.country?.trim() || null,
    city: row.city?.trim() || null,
    phone: row.phone?.trim() || null,
    whatsapp: row.whatsapp?.trim() || null,
    facebookUrl: row.facebook_url?.trim() || null,
    tiktokUrl: row.tiktok_url?.trim() || null,
    verified: Boolean(row.verified),
    createdAt: row.created_at,
  }
}

export function mapCompanySummary(row: CompanyRow): CompanySummary | null {
  if (!row?.id || !row.name || !row.slug) return null
  return { id: row.id, name: row.name, slug: row.slug, logoUrl: row.logo_url?.trim() || null }
}

/** Loads all companies, verified first then alphabetical. */
export async function getCompanies(): Promise<Company[]> {
  const rows = await restGet<CompanyRow>(
    `companies?select=${COMPANY_COLUMNS}&order=verified.desc,name.asc`,
  )
  return rows.map(mapCompany).filter((c): c is Company => c !== null)
}

type CompanyDetailRow = CompanyRow & {
  stores?: { id: string; name: string; slug: string; logo_url: string | null; is_active: boolean }[]
  company_categories?: { categories: CategoryRow | null }[]
}

/** Loads a single company by slug with its active storefronts and categories. */
export async function getCompanyBySlug(slug: string): Promise<CompanyDetails | null> {
  const select =
    `${COMPANY_COLUMNS},stores(id,name,slug,logo_url,is_active),` +
    `company_categories(categories(${CATEGORY_COLUMNS}))`
  const rows = await restGet<CompanyDetailRow>(
    `companies?select=${select}&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  )
  const row = rows[0]
  if (!row) return null
  const company = mapCompany(row)
  if (!company) return null

  const stores: StoreSummary[] = (row.stores ?? [])
    .filter((s) => s.is_active)
    .map((s) => ({ id: s.id, name: s.name, slug: s.slug, logoUrl: s.logo_url?.trim() || null }))

  const categories = (row.company_categories ?? [])
    .map((cc) => (cc.categories ? mapCategory(cc.categories) : null))
    .filter((c): c is NonNullable<typeof c> => c !== null)

  return { ...company, stores, categories }
}
