import { createClient } from "./client"
import { type Company, type CompanyMember, type CompanyMedia } from "@/lib/directory-data"

export type DBCompanyRow = {
  id: string
  supplier_id: string | null
  name: string
  slug: string
  tagline: string | null
  description: string | null
  logo_url: string | null
  banner_url: string | null
  facebook_url: string | null
  instagram_url: string | null
  tiktok_url: string | null
  linkedin_url: string | null
  youtube_url: string | null
  website_url: string | null
  website_mode: any
  business_email: string | null
  phone_number: string | null
  whatsapp_number: string | null
  country: string
  city: string | null
  postal_code: string | null
  street_address: string | null
  business_type: string | null
  primary_industry: string | null
  year_established: number | null
  company_size: string | null
  tax_identifier: string | null
  profile_completion: number
  verified: boolean
  verification_tier: any
  verified_at: string | null
  license_document_url: string | null
  supported_languages: string[]
  export_markets: string[]
  metadata: any
  created_at: string
  updated_at: string
}

export function mapCompanyRow(row: DBCompanyRow): Company {
  return {
    id: row.id,
    supplierId: row.supplier_id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline,
    description: row.description,
    logoUrl: row.logo_url,
    bannerUrl: row.banner_url,
    facebookUrl: row.facebook_url,
    instagramUrl: row.instagram_url,
    tiktokUrl: row.tiktok_url,
    linkedinUrl: row.linkedin_url,
    youtubeUrl: row.youtube_url,
    websiteUrl: row.website_url,
    websiteMode: row.website_mode || "alsouk",
    businessEmail: row.business_email,
    phoneNumber: row.phone_number,
    whatsappNumber: row.whatsapp_number,
    country: row.country,
    city: row.city,
    postalCode: row.postal_code,
    streetAddress: row.street_address,
    businessType: row.business_type,
    primaryIndustry: row.primary_industry,
    yearEstablished: row.year_established,
    companySize: row.company_size,
    taxIdentifier: row.tax_identifier,
    profileCompletion: row.profile_completion ?? 0,
    verified: Boolean(row.verified),
    verificationTier: row.verification_tier || "basic",
    verifiedAt: row.verified_at,
    licenseDocumentUrl: row.license_document_url,
    supportedLanguages: row.supported_languages || [],
    exportMarkets: row.export_markets || [],
    metadata: row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * Calculates profile completion percentage based on field completeness.
 */
export function calculateProfileCompletion(company: Partial<Company>): number {
  const fields: (keyof Company)[] = [
    "name",
    "tagline",
    "description",
    "logoUrl",
    "bannerUrl",
    "websiteUrl",
    "businessEmail",
    "phoneNumber",
    "whatsappNumber",
    "country",
    "city",
    "streetAddress",
    "businessType",
    "primaryIndustry",
    "yearEstablished",
    "companySize",
    "taxIdentifier",
  ]

  let completed = 0
  fields.forEach((field) => {
    const val = company[field]
    if (val !== undefined && val !== null && val !== "") {
      completed++
    }
  })

  // Add points for social presence, languages, and export markets if they have items
  if (company.facebookUrl || company.instagramUrl || company.tiktokUrl || company.linkedinUrl || company.youtubeUrl) {
    completed++
  }
  if (company.supportedLanguages && company.supportedLanguages.length > 0) {
    completed++
  }
  if (company.exportMarkets && company.exportMarkets.length > 0) {
    completed++
  }

  const totalFields = fields.length + 3
  return Math.round((completed / totalFields) * 100)
}

/**
 * Fetches the company for a user. Since a company has members, we look in `company_members`.
 */
export async function fetchCompanyForUser(userId: string): Promise<Company | null> {
  const supabase = createClient()

  // 1. Get company membership
  const { data: membership, error: memError } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", userId)
    .maybeSingle()

  if (memError || !membership) {
    // Fallback: Check legacy owner_id column in case transition is progressive or seed is old
    const { data: legacyCompany, error: legacyError } = await supabase
      .from("companies")
      .select("*")
      .eq("owner_id", userId)
      .maybeSingle()

    if (!legacyError && legacyCompany) {
      return mapCompanyRow(legacyCompany as any)
    }
    return null
  }

  // 2. Fetch full company profile
  const { data: company, error: compError } = await supabase
    .from("companies")
    .select("*")
    .eq("id", membership.company_id)
    .maybeSingle()

  if (compError || !company) return null
  return mapCompanyRow(company as any)
}

/**
 * Creates a company profile and links the user as the 'owner' member.
 */
export async function createCompany(userId: string, companyInput: Partial<Company>): Promise<Company | null> {
  const supabase = createClient()

  const completion = calculateProfileCompletion(companyInput)

  const insertData = {
    name: companyInput.name || "My Company",
    slug: companyInput.slug || `company-${Math.random().toString(36).substring(2, 9)}`,
    tagline: companyInput.tagline || null,
    description: companyInput.description || null,
    logo_url: companyInput.logoUrl || null,
    banner_url: companyInput.bannerUrl || null,
    facebook_url: companyInput.facebookUrl || null,
    instagram_url: companyInput.instagramUrl || null,
    tiktok_url: companyInput.tiktokUrl || null,
    linkedin_url: companyInput.linkedinUrl || null,
    youtube_url: companyInput.youtubeUrl || null,
    website_url: companyInput.websiteUrl || null,
    website_mode: companyInput.websiteMode || "alsouk",
    business_email: companyInput.businessEmail || null,
    phone_number: companyInput.phoneNumber || null,
    whatsapp_number: companyInput.whatsappNumber || null,
    country: companyInput.country || "TN",
    city: companyInput.city || null,
    postal_code: companyInput.postalCode || null,
    street_address: companyInput.streetAddress || null,
    business_type: companyInput.businessType || null,
    primary_industry: companyInput.primaryIndustry || null,
    year_established: companyInput.yearEstablished || null,
    company_size: companyInput.companySize || null,
    tax_identifier: companyInput.taxIdentifier || null,
    profile_completion: completion,
    supported_languages: companyInput.supportedLanguages || [],
    export_markets: companyInput.exportMarkets || [],
    metadata: companyInput.metadata || {},
  }

  const { data: company, error: compError } = await supabase
    .from("companies")
    .insert(insertData)
    .select()
    .single()

  if (compError || !company) {
    console.error("Error creating company:", compError)
    return null
  }

  // Link the creator user as the 'owner' in company_members
  const { error: memError } = await supabase
    .from("company_members")
    .insert({
      company_id: company.id,
      user_id: userId,
      role: "owner"
    })

  if (memError) {
    console.error("Error adding initial owner membership:", memError)
  }

  return mapCompanyRow(company as any)
}

/**
 * Updates a company profile and computes profile completion.
 */
export async function updateCompany(companyId: string, companyInput: Partial<Company>): Promise<Company | null> {
  const supabase = createClient()

  const completion = calculateProfileCompletion(companyInput)

  const updateData: Record<string, any> = {
    name: companyInput.name,
    tagline: companyInput.tagline,
    description: companyInput.description,
    logo_url: companyInput.logoUrl,
    banner_url: companyInput.bannerUrl,
    facebook_url: companyInput.facebookUrl,
    instagram_url: companyInput.instagramUrl,
    tiktok_url: companyInput.tiktokUrl,
    linkedin_url: companyInput.linkedinUrl,
    youtube_url: companyInput.youtubeUrl,
    website_url: companyInput.websiteUrl,
    website_mode: companyInput.websiteMode,
    business_email: companyInput.businessEmail,
    phone_number: companyInput.phoneNumber,
    whatsapp_number: companyInput.whatsappNumber,
    country: companyInput.country,
    city: companyInput.city,
    postal_code: companyInput.postalCode,
    street_address: companyInput.streetAddress,
    business_type: companyInput.businessType,
    primary_industry: companyInput.primaryIndustry,
    year_established: companyInput.yearEstablished,
    company_size: companyInput.companySize,
    tax_identifier: companyInput.taxIdentifier,
    profile_completion: completion,
    supported_languages: companyInput.supportedLanguages,
    export_markets: companyInput.exportMarkets,
    metadata: companyInput.metadata,
  }

  // Filter out undefined properties to prevent overwriting existing data with undefined
  Object.keys(updateData).forEach((key) => {
    if (updateData[key] === undefined) {
      delete updateData[key]
    }
  })

  const { data: company, error } = await supabase
    .from("companies")
    .update(updateData)
    .eq("id", companyId)
    .select()
    .single()

  if (error || !company) {
    console.error("Error updating company:", error)
    return null
  }

  return mapCompanyRow(company as any)
}
