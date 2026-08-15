export type CountryKey = "tn" | "ma" | "dz" | "eg" | "ly"
export type RegionKey = "capital" | "north" | "central" | "south" | "coastal"
export type CategoryKey =
  | "food"
  | "textiles"
  | "machinery"
  | "construction"
  | "handicrafts"
  | "cosmetics"
  | "leather"
  | "chemicals"
export type BusinessTypeKey = "manufacturer" | "supplier" | "exporter" | "wholesaler"

export type CompanyWebsiteMode = "external" | "alsouk" | "both"
export type CompanyVerificationTier = "basic" | "verified" | "premium"
export type ProfileLevel = "starter" | "business" | "enterprise"

export type Company = {
  id: string
  ownerId?: string | null
  profileLevel: ProfileLevel
  supplierId: string | null
  name: string
  slug: string
  tagline: string | null
  description: string | null
  logoUrl: string | null
  bannerUrl: string | null

  // Digital Presence
  facebookUrl: string | null
  instagramUrl: string | null
  tiktokUrl: string | null
  linkedinUrl: string | null
  youtubeUrl: string | null

  // Website strategy
  websiteUrl: string | null
  websiteMode: CompanyWebsiteMode
  /** The merchant's own online store hosted outside ALSOUK. */
  externalStoreUrl: string | null

  // Contact & Location
  businessEmail: string | null
  phoneNumber: string | null
  whatsappNumber: string | null
  country: string
  city: string | null
  postalCode: string | null
  streetAddress: string | null

  // Business classification
  businessType: string | null
  primaryIndustry: string | null
  yearEstablished: number | null
  companySize: string | null
  taxIdentifier: string | null

  // Profile progress & verification
  profileCompletion: number
  verified: boolean
  verificationTier: CompanyVerificationTier
  verifiedAt: string | null
  licenseDocumentUrl: string | null

  // Arrays
  supportedLanguages: string[]
  exportMarkets: string[]

  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export type CompanyMember = {
  id: string
  companyId: string
  userId: string
  role: "owner" | "admin" | "member"
  createdAt: string
}

export type CompanyMedia = {
  id: string
  companyId: string
  mediaType: "factory_photo" | "product_gallery" | "video" | "certificate"
  storageBucket: string
  storagePath: string
  url: string
  caption: string | null
  position: number
  createdAt: string
}

export type Supplier = {
  id: string
  ownerId: string | null
  name: string
  monogram: string
  logoColor: "blue" | "green"
  country: CountryKey
  cityKey: string
  region: RegionKey
  verified: boolean
  products: number
  years: number
  /** Raw founding year, or null when the company hasn't set one. Kept alongside
   *  the derived `years` count so callers can tell "founded this year" (0) apart
   *  from "unknown" (null) instead of both collapsing to the same 0. */
  yearEstablished: number | null
  businessTypes: BusinessTypeKey[]
  categories: CategoryKey[]
  /** Long-form company description shown on the profile page. */
  description: string | null
  /** Optional hero/logo image URL; falls back to the monogram when absent. */
  logoUrl: string | null
  profileViews: number
  coverPhotoUrl: string | null
  /** The merchant's own online store hosted outside ALSOUK, when set. */
  externalStoreUrl: string | null
}

/**
 * Supplier data is sourced from Supabase via fetchSuppliers() in
 * lib/supabase/suppliers-service.ts. See supabase/schema.sql and
 * supabase/seed.sql for the table definition and seed rows.
 */

export const COUNTRY_KEYS: CountryKey[] = ["tn", "ma", "dz", "eg", "ly"]
export const REGION_KEYS: RegionKey[] = ["capital", "north", "central", "south", "coastal"]
export const CATEGORY_KEYS: CategoryKey[] = [
  "food",
  "textiles",
  "machinery",
  "construction",
  "handicrafts",
  "cosmetics",
  "leather",
  "chemicals",
]
export const BUSINESS_TYPE_KEYS: BusinessTypeKey[] = [
  "manufacturer",
  "supplier",
  "exporter",
  "wholesaler",
]

export type YearsTier = "any" | "1to3" | "3to5" | "5to10" | "gt10"
export const YEARS_TIERS: YearsTier[] = ["any", "1to3", "3to5", "5to10", "gt10"]

/**
 * `yearEstablished` is null when the company never set a founding year — in
 * that case only "any" matches, since we have no real data to bucket it by.
 */
export function matchesYears(tier: YearsTier, yearEstablished: number | null): boolean {
  if (tier === "any") return true
  if (yearEstablished === null) return false
  const years = Math.max(0, new Date().getFullYear() - yearEstablished)
  switch (tier) {
    case "1to3":
      return years >= 1 && years <= 3
    case "3to5":
      return years > 3 && years <= 5
    case "5to10":
      return years > 5 && years <= 10
    case "gt10":
      return years > 10
    default:
      return true
  }
}
