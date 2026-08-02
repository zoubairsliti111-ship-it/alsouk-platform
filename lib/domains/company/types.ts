import type { StoreSummary } from "@/lib/domains/store/types"
import type { Category } from "@/lib/domains/category/types"

export type CompanyWebsiteMode = "external" | "alsouk" | "both"
export type CompanyVerificationTier = "basic" | "verified" | "premium"
export type ProfileLevel = "starter" | "business" | "enterprise"

export interface Company {
  id: string
  profileLevel: ProfileLevel
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  bannerUrl: string | null
  tagline: string | null

  // Digital Presence
  facebookUrl: string | null
  instagramUrl: string | null
  tiktokUrl: string | null
  linkedinUrl: string | null
  youtubeUrl: string | null

  // Website strategy
  website: string | null // Keep 'website' for backwards compatibility
  websiteUrl: string | null
  websiteMode: CompanyWebsiteMode

  // Contact & Location
  businessEmail: string | null
  phoneNumber: string | null
  whatsappNumber: string | null
  country: string | null
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
  createdAt?: string
  updatedAt?: string
}

export interface CompanySummary {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  websiteMode?: CompanyWebsiteMode
  websiteUrl?: string | null
}

export interface CompanyMedia {
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

/** A company with its storefronts, operating categories and media. */
export interface CompanyDetails extends Company {
  stores: StoreSummary[]
  categories: Category[]
  media?: CompanyMedia[]
}
