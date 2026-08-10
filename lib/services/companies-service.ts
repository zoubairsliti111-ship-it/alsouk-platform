import { restGet } from "@/lib/supabase/rest"
import type { Company, CompanyDetails, CompanySummary, CompanyMedia, CompanyWebsiteMode, CompanyVerificationTier } from "@/lib/domains/company/types"
import type { StoreSummary } from "@/lib/domains/store/types"
import { CATEGORY_COLUMNS, mapCategory, type CategoryRow } from "@/lib/services/categories-service"
import { safeExternalStoreUrl } from "@/lib/external-store"

/** Shape of a row in the Supabase `companies` table (snake_case). */
export type CompanyRow = {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  banner_url: string | null
  tagline: string | null
  facebook_url: string | null
  instagram_url: string | null
  tiktok_url: string | null
  linkedin_url: string | null
  youtube_url: string | null
  website: string | null
  website_url: string | null
  external_store_url: string | null
  website_mode: CompanyWebsiteMode | null
  business_email: string | null
  phone_number: string | null
  whatsapp_number: string | null
  country: string | null
  city: string | null
  postal_code: string | null
  street_address: string | null
  business_type: string | null
  primary_industry: string | null
  year_established: number | null
  company_size: string | null
  tax_identifier: string | null
  profile_completion: number | null
  profile_views: number | null
  verified: boolean
  verification_tier: CompanyVerificationTier | null
  verified_at: string | null
  license_document_url: string | null
  supported_languages: string[] | null
  export_markets: string[] | null
  metadata: Record<string, any> | null
  profile_level: string | null
  created_at?: string
  updated_at?: string
}

export type CompanyMediaRow = {
  id: string
  company_id: string
  media_type: string
  storage_bucket: string
  storage_path: string
  url: string
  caption: string | null
  position: number | null
  created_at: string
}

export const COMPANY_COLUMNS = [
  "id",
  "name",
  "slug",
  "description",
  "logo_url",
  "banner_url",
  "tagline",
  "facebook_url",
  "instagram_url",
  "tiktok_url",
  "linkedin_url",
  "youtube_url",
  "website",
  "website_url",
  "website_mode",
  "external_store_url",
  "business_email",
  "phone_number",
  "whatsapp_number",
  "country",
  "city",
  "postal_code",
  "street_address",
  "business_type",
  "primary_industry",
  "year_established",
  "company_size",
  "tax_identifier",
  "profile_completion",
  "profile_views",
  "verified",
  "verification_tier",
  "verified_at",
  "license_document_url",
  "supported_languages",
  "export_markets",
  "metadata",
  "profile_level",
  "created_at",
  "updated_at"
].join(",")

export const COMPANY_MEDIA_COLUMNS = [
  "id",
  "company_id",
  "media_type",
  "storage_bucket",
  "storage_path",
  "url",
  "caption",
  "position",
  "created_at"
].join(",")

/** Maps a raw company row to the domain model, or `null` when invalid. */
export function mapCompany(row: CompanyRow): Company | null {
  if (!row?.id || !row.name || !row.slug) return null
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description?.trim() || null,
    logoUrl: row.logo_url?.trim() || null,
    bannerUrl: row.banner_url?.trim() || null,
    tagline: row.tagline?.trim() || null,
    facebookUrl: row.facebook_url?.trim() || null,
    instagramUrl: row.instagram_url?.trim() || null,
    tiktokUrl: row.tiktok_url?.trim() || null,
    linkedinUrl: row.linkedin_url?.trim() || null,
    youtubeUrl: row.youtube_url?.trim() || null,
    website: row.website?.trim() || null,
    websiteUrl: row.website_url?.trim() || null,
    websiteMode: row.website_mode || "alsouk",
    externalStoreUrl: safeExternalStoreUrl(row.external_store_url),
    businessEmail: row.business_email?.trim() || null,
    phoneNumber: row.phone_number?.trim() || null,
    whatsappNumber: row.whatsapp_number?.trim() || null,
    country: row.country?.trim() || "TN",
    city: row.city?.trim() || null,
    postalCode: row.postal_code?.trim() || null,
    streetAddress: row.street_address?.trim() || null,
    businessType: row.business_type?.trim() || null,
    primaryIndustry: row.primary_industry?.trim() || null,
    yearEstablished: row.year_established ? Number(row.year_established) : null,
    companySize: row.company_size?.trim() || null,
    taxIdentifier: row.tax_identifier?.trim() || null,
    profileCompletion: row.profile_completion ? Number(row.profile_completion) : 0,
    profileViews: row.profile_views ? Number(row.profile_views) : 0,
    verified: Boolean(row.verified),
    verificationTier: row.verification_tier || "basic",
    verifiedAt: row.verified_at || null,
    licenseDocumentUrl: row.license_document_url?.trim() || null,
    supportedLanguages: row.supported_languages || [],
    exportMarkets: row.export_markets || [],
    metadata: row.metadata || {},
    profileLevel: (row.profile_level as import("@/lib/domains/company/types").ProfileLevel) || "starter",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapCompanySummary(row: CompanyRow): CompanySummary | null {
  if (!row?.id || !row.name || !row.slug) return null
  return { id: row.id, name: row.name, slug: row.slug, logoUrl: row.logo_url?.trim() || null }
}

export function mapCompanyMedia(row: CompanyMediaRow): CompanyMedia {
  return {
    id: row.id,
    companyId: row.company_id,
    mediaType: row.media_type as any,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    url: row.url,
    caption: row.caption,
    position: Number(row.position) || 0,
    createdAt: row.created_at,
  }
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
  company_media?: CompanyMediaRow[]
}

/** Loads a single company by slug with its active storefronts, categories, and media. */
export async function getCompanyBySlug(slug: string): Promise<CompanyDetails | null> {
  const select =
    `${COMPANY_COLUMNS},stores(id,name,slug,logo_url,is_active),` +
    `company_categories(categories(${CATEGORY_COLUMNS})),` +
    `company_media(${COMPANY_MEDIA_COLUMNS})`
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

  const media = (row.company_media ?? [])
    .map(mapCompanyMedia)
    .sort((a, b) => a.position - b.position)

  return { ...company, stores, categories, media }
}
