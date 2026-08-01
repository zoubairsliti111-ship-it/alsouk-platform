import { restGet, getRestConfig } from "@/lib/supabase/rest"
import type {
  Exhibition,
  ExhibitionBooth,
  ExhibitionExhibit,
  ExhibitionMedia,
  ExhibitionDocument,
  ExhibitionApplication,
  ExhibitionApplicationStatus,
} from "@/lib/domains/exhibition/types"
import { mapCompany, type CompanyRow } from "@/lib/services/companies-service"

// Raw DB Rows shapes (snake_case)
export type ExhibitionRow = {
  id: string
  name: string
  slug: string
  organizer: string
  description: string | null
  cover_url: string | null
  country: string
  city: string
  start_date: string
  end_date: string
  categories: string[] | null
  created_at?: string
  updated_at?: string
}

export type ExhibitionBoothRow = {
  id: string
  exhibition_id: string
  company_id: string
  banner_url: string | null
  description: string
  booth_number?: string | null
  category?: string | null
  is_featured?: boolean
  is_archived: boolean
  created_at?: string
  updated_at?: string
  companies?: CompanyRow | null
}

export type ExhibitionItemRow = {
  id: string
  booth_id: string
  name: string
  description: string | null
  images: string[] | null
  videos: string[] | null
  pdf_url: string | null
  brochure_url: string | null
  is_featured: boolean
  sort_order: number
  created_at?: string
  updated_at?: string
}

export type ExhibitionMediaRow = {
  id: string
  booth_id: string
  media_type: string
  url: string
  caption: string | null
  sort_order: number
  created_at?: string
}

export type ExhibitionDocumentRow = {
  id: string
  booth_id: string
  name: string
  url: string
  file_size: string | null
  sort_order: number
  created_at?: string
}

export type ExhibitionApplicationRow = {
  id: string
  exhibition_id: string
  company_id: string | null
  company_name: string
  contact_person: string
  email: string
  phone: string
  country: string
  business_category: string
  short_description: string
  message: string | null
  status: ExhibitionApplicationStatus
  review_notes: string | null
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  created_at?: string
  updated_at?: string
  exhibitions?: ExhibitionRow | null
}

// Map helpers
export function mapExhibition(row: ExhibitionRow): Exhibition {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    organizer: row.organizer,
    description: row.description,
    coverUrl: row.cover_url,
    country: row.country,
    city: row.city,
    startDate: row.start_date,
    endDate: row.end_date,
    categories: row.categories || [],
  }
}

export function mapExhibitionBooth(row: ExhibitionBoothRow): ExhibitionBooth {
  const company = row.companies ? mapCompany(row.companies) : null

  // Smart fallbacks to derive fields if they are missing/not set in the database
  const derivedCategory = row.category || (company?.primaryIndustry
    ? (company.primaryIndustry === "food" ? "Food & Agriculture"
       : company.primaryIndustry === "textiles" ? "Textiles & Apparel"
       : company.primaryIndustry)
    : "General Pavilion")

  // Generate a deterministic booth number based on the ID if not provided
  let derivedBoothNumber = row.booth_number
  if (!derivedBoothNumber) {
    const numericPart = parseInt(row.id.replace(/[^0-9]/g, "").slice(0, 3) || "1", 10) % 99 + 1
    const prefix = company?.primaryIndustry === "textiles" ? "B" : "A"
    derivedBoothNumber = `${prefix}-${numericPart < 10 ? '0' : ''}${numericPart}`
  }

  return {
    id: row.id,
    exhibitionId: row.exhibition_id,
    companyId: row.company_id,
    bannerUrl: row.banner_url,
    description: row.description,
    isArchived: Boolean(row.is_archived),
    boothNumber: derivedBoothNumber,
    category: derivedCategory,
    isFeatured: row.is_featured !== undefined ? Boolean(row.is_featured) : (company?.verificationTier === "premium"),
    company,
  }
}

export function mapExhibitionExhibit(row: ExhibitionItemRow): ExhibitionExhibit {
  return {
    id: row.id,
    boothId: row.booth_id,
    name: row.name,
    description: row.description,
    images: row.images || [],
    videos: row.videos || [],
    pdfUrl: row.pdf_url,
    brochureUrl: row.brochure_url,
    isFeatured: Boolean(row.is_featured),
    sortOrder: Number(row.sort_order) || 0,
  }
}

export function mapExhibitionMedia(row: ExhibitionMediaRow): ExhibitionMedia {
  return {
    id: row.id,
    boothId: row.booth_id,
    mediaType: row.media_type as any,
    url: row.url,
    caption: row.caption,
    sortOrder: Number(row.sort_order) || 0,
  }
}

export function mapExhibitionDocument(row: ExhibitionDocumentRow): ExhibitionDocument {
  return {
    id: row.id,
    boothId: row.booth_id,
    name: row.name,
    url: row.url,
    fileSize: row.file_size,
    sortOrder: Number(row.sort_order) || 0,
  }
}

export function mapExhibitionApplication(row: ExhibitionApplicationRow): ExhibitionApplication {
  return {
    id: row.id,
    exhibitionId: row.exhibition_id,
    companyId: row.company_id,
    companyName: row.company_name,
    contactPerson: row.contact_person,
    email: row.email,
    phone: row.phone,
    country: row.country,
    businessCategory: row.business_category,
    shortDescription: row.short_description,
    message: row.message,
    status: row.status,
    reviewNotes: row.review_notes,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    exhibition: row.exhibitions ? mapExhibition(row.exhibitions) : null,
  }
}

// MOCK DEMO DATA (Rich Tunisian/North African Content for unconfigured or local environments)
const MOCK_EXHIBITIONS: Exhibition[] = [
  {
    id: "exh-101",
    name: "Tunisia Food Expo 2026",
    slug: "tunisia-food-expo-2026",
    organizer: "APIA (Agency for Agricultural Investment Promotion)",
    description: "The premier B2B gathering of agri-food innovators, olive oil mills, date exporters, and organic producers from across North Africa and the Mediterranean basin.",
    coverUrl: "https://images.unsplash.com/photo-1543083505-590d26e24831?auto=format&fit=crop&q=80&w=1200",
    country: "TN",
    city: "tunis",
    startDate: "2026-06-15T09:00:00Z",
    endDate: "2026-06-18T18:00:00Z",
    categories: ["Food & Agriculture", "Agri-Food Tech", "Packaging & Machinery"],
  },
  {
    id: "exh-102",
    name: "Carthage Textile International 2026",
    slug: "carthage-textile-2026",
    organizer: "FENELEC / FTTH",
    description: "An elite trade exhibition showcasing Tunisian textile heritage, modern circular knitting, sustainable dyes, and technical garments connecting local factories with global buyers.",
    coverUrl: "https://images.unsplash.com/photo-1558271818-88ad117d599b?auto=format&fit=crop&q=80&w=1200",
    country: "TN",
    city: "monastir",
    startDate: "2026-09-22T09:00:00Z",
    endDate: "2026-09-25T17:00:00Z",
    categories: ["Textiles & Apparel", "Sourcing Materials", "Eco-Garments"],
  },
]

const MOCK_BOOTHS: Record<string, ExhibitionBooth[]> = {
  "tunisia-food-expo-2026": [
    {
      id: "booth-medina",
      exhibitionId: "exh-101",
      companyId: "comp-medina",
      bannerUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800",
      description: "Welcome to Medina Olive Co.'s official exhibition pavilion. Inside, explore our organic extra virgin olive oils cold-pressed using award-winning Sfax traditional millstones.",
      isArchived: false,
      boothNumber: "A-01",
      category: "Food & Agriculture",
      isFeatured: true,
      company: {
        id: "comp-medina",
        name: "Medina Olive Co.",
        slug: "medina-olive-co",
        description: "Premium Olive Oil Mill in Sfax.",
        logoUrl: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=150",
        bannerUrl: "",
        tagline: "Golden oils from ancestral sands",
        facebookUrl: "https://facebook.com",
        instagramUrl: "https://instagram.com",
        tiktokUrl: null,
        linkedinUrl: null,
        youtubeUrl: null,
        website: "https://medinaolive.com",
        websiteUrl: "https://medinaolive.com",
        websiteMode: "alsouk",
        businessEmail: "exhibition@medinaolive.com",
        phoneNumber: "+216 74 123 456",
        whatsappNumber: "+216 55 123 456",
        country: "TN",
        city: "sfax",
        postalCode: "3000",
        streetAddress: "Route de Gabes Km 4",
        businessType: "manufacturer",
        primaryIndustry: "food",
        yearEstablished: 1984,
        companySize: "50-100",
        taxIdentifier: "0123456/A/M/000",
        profileCompletion: 95,
        verified: true,
        verificationTier: "premium",
        verifiedAt: "2024-01-01T00:00:00Z",
        licenseDocumentUrl: null,
        supportedLanguages: ["en", "fr", "ar"],
        exportMarkets: ["eu", "gcc", "us"],
        metadata: {},
      },
    },
    {
      id: "booth-sahara",
      exhibitionId: "exh-101",
      companyId: "comp-sahara",
      bannerUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=800",
      description: "Sahara Dates Export presents Tunisian Deglet Nour. Pure palm delicacies, direct from our certified orchards in Tozeur, packaged sustainably for regional and worldwide distributors.",
      isArchived: false,
      boothNumber: "A-02",
      category: "Food & Agriculture",
      isFeatured: false,
      company: {
        id: "comp-sahara",
        name: "Sahara Dates Export",
        slug: "sahara-dates-export",
        description: "Superior palm fruits from Tozeur.",
        logoUrl: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&q=80&w=150",
        bannerUrl: "",
        tagline: "The gold standard of desert delicacies",
        facebookUrl: "https://facebook.com",
        instagramUrl: null,
        tiktokUrl: null,
        linkedinUrl: "https://linkedin.com",
        youtubeUrl: null,
        website: "https://saharadates.com",
        websiteUrl: "https://saharadates.com",
        websiteMode: "both",
        businessEmail: "expo@saharadates.tn",
        phoneNumber: "+216 76 987 654",
        whatsappNumber: "+216 98 765 432",
        country: "TN",
        city: "tozeur",
        postalCode: "2200",
        streetAddress: "Avenue Habib Bourguiba",
        businessType: "exporter",
        primaryIndustry: "food",
        yearEstablished: 1999,
        companySize: "20-49",
        taxIdentifier: "9876543/B/P/000",
        profileCompletion: 80,
        verified: true,
        verificationTier: "verified",
        verifiedAt: "2024-03-12T00:00:00Z",
        licenseDocumentUrl: null,
        supportedLanguages: ["en", "fr"],
        exportMarkets: ["eu", "ly", "dz"],
        metadata: {},
      },
    },
  ],
  "carthage-textile-2026": [
    {
      id: "booth-carthage",
      exhibitionId: "exh-102",
      companyId: "comp-carthage",
      bannerUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=800",
      description: "Step into Carthage Textiles' innovative virtual showcase. Review our 2026 collection of biological cotton fabrics, high-resilience yarns, and OEKO-TEX certified weaving.",
      isArchived: false,
      boothNumber: "B-15",
      category: "Textiles & Apparel",
      isFeatured: true,
      company: {
        id: "comp-carthage",
        name: "Carthage Textiles",
        slug: "carthage-textiles",
        description: "Industrial weaving and spinning factory in Monastir.",
        logoUrl: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=150",
        bannerUrl: "",
        tagline: "Weaving premium sustainability into threads",
        facebookUrl: "https://facebook.com",
        instagramUrl: "https://instagram.com",
        tiktokUrl: null,
        linkedinUrl: "https://linkedin.com",
        youtubeUrl: null,
        website: "https://carthagetextiles.com",
        websiteUrl: "https://carthagetextiles.com",
        websiteMode: "alsouk",
        businessEmail: "trade@carthagetextiles.com",
        phoneNumber: "+216 73 321 654",
        whatsappNumber: "+216 22 446 880",
        country: "TN",
        city: "monastir",
        postalCode: "5000",
        streetAddress: "Zone Industrielle Monastir",
        businessType: "manufacturer",
        primaryIndustry: "textiles",
        yearEstablished: 2005,
        companySize: "100-250",
        taxIdentifier: "1122334/T/M/000",
        profileCompletion: 90,
        verified: true,
        verificationTier: "premium",
        verifiedAt: "2024-02-15T00:00:00Z",
        licenseDocumentUrl: null,
        supportedLanguages: ["en", "fr", "ar"],
        exportMarkets: ["eu", "gcc"],
        metadata: {},
      },
    },
  ],
}

const MOCK_EXHIBITS: Record<string, ExhibitionExhibit[]> = {
  "booth-medina": [
    {
      id: "exhibit-med-1",
      boothId: "booth-medina",
      name: "Organic Extra Virgin Sfax Reserve (New Launch)",
      description: "An exclusive, high-density extra virgin olive oil made entirely from hand-harvested Chemlali olives in Sfax. Rich with green-apple and herbaceous tasting notes.",
      images: ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400"],
      videos: [],
      pdfUrl: null,
      brochureUrl: null,
      isFeatured: true,
      sortOrder: 1,
    },
    {
      id: "exhibit-med-2",
      boothId: "booth-medina",
      name: "Ancestral Mill Cold-Pressed Blend (Prototype Sample)",
      description: "Cold-pressed at temperatures strictly below 25°C using regional stone mills. Offers very low acidity (<0.3%) for ultra-premium B2B export contracts.",
      images: ["https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=400"],
      videos: [],
      pdfUrl: null,
      brochureUrl: null,
      isFeatured: false,
      sortOrder: 2,
    },
  ],
  "booth-sahara": [
    {
      id: "exhibit-sah-1",
      boothId: "booth-sahara",
      name: "Selected Deglet Nour Extra Plump Pallets (Demonstration Exhibit)",
      description: "Specially selected semi-soft dates on branches. Rich translucent golden-amber hue, sweet honey-flavored syrup pulp, packed in eco-friendly 5kg carton crates.",
      images: ["https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&q=80&w=400"],
      videos: [],
      pdfUrl: null,
      brochureUrl: null,
      isFeatured: true,
      sortOrder: 1,
    },
  ],
  "booth-carthage": [
    {
      id: "exhibit-car-1",
      boothId: "booth-carthage",
      name: "100% Bio-Organic Cotton Spun Thread (Eco Innovation)",
      description: "Unbleached, extremely high durability spun threads for circular knitting machines. OEKO-TEX Standard 100 verified.",
      images: ["https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=400"],
      videos: [],
      pdfUrl: null,
      brochureUrl: null,
      isFeatured: true,
      sortOrder: 1,
    },
  ],
}

const MOCK_MEDIA: Record<string, ExhibitionMedia[]> = {
  "booth-medina": [
    { id: "med-m-1", boothId: "booth-medina", mediaType: "image", url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600", caption: "Sfax Ancestral Groves", sortOrder: 1 },
    { id: "med-m-2", boothId: "booth-medina", mediaType: "image", url: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=600", caption: "Traditional Stone Mill Pressing", sortOrder: 2 },
    { id: "med-m-3", boothId: "booth-medina", mediaType: "video", url: "https://www.w3schools.com/html/mov_bbb.mp4", caption: "Cold Press Machinery Walkthrough", sortOrder: 3 },
  ],
  "booth-sahara": [
    { id: "sah-m-1", boothId: "booth-sahara", mediaType: "image", url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=600", caption: "Orchards in Tozeur Oasis", sortOrder: 1 },
  ],
  "booth-carthage": [
    { id: "car-m-1", boothId: "booth-carthage", mediaType: "image", url: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=600", caption: "Weaving Loom Hall", sortOrder: 1 },
  ],
}

const MOCK_DOCS: Record<string, ExhibitionDocument[]> = {
  "booth-medina": [
    { id: "med-d-1", boothId: "booth-medina", name: "Official B2B Export Catalogue 2026.pdf", url: "#", fileSize: "3.2 MB", sortOrder: 1 },
    { id: "med-d-2", boothId: "booth-medina", name: "ISO 22000 & Organic Certifications.pdf", url: "#", fileSize: "1.8 MB", sortOrder: 2 },
  ],
  "booth-sahara": [
    { id: "sah-d-1", boothId: "booth-sahara", name: "Sahara Dates - Export Specs & Logistics.pdf", url: "#", fileSize: "2.5 MB", sortOrder: 1 },
  ],
  "booth-carthage": [
    { id: "car-d-1", boothId: "booth-carthage", name: "Carthage Textiles Technical Datasheet.pdf", url: "#", fileSize: "4.1 MB", sortOrder: 1 },
  ],
}

// Global persistence of mock applications for offline/sandbox environments
const MOCK_APPLICATIONS: ExhibitionApplication[] = [
  {
    id: "app-mock-1",
    exhibitionId: "exh-101",
    companyId: null,
    companyName: "Atlas Pottery",
    contactPerson: "Amir Potter",
    email: "amir@atlaspottery.tn",
    phone: "55555555",
    country: "TN",
    businessCategory: "Handicrafts & Ceramics",
    shortDescription: "Traditional handmade ceramics from Nabeul.",
    message: "We'd like to show our new handcrafted dinner sets.",
    status: "Pending",
    reviewNotes: null,
    submittedAt: "2026-03-01T12:00:00Z",
    reviewedAt: null,
    reviewedBy: null,
    exhibition: MOCK_EXHIBITIONS[0],
  },
]

function getMockApplications(): ExhibitionApplication[] {
  if (typeof globalThis !== "undefined") {
    const g = globalThis as any
    if (!g.__mockApplications) {
      g.__mockApplications = [...MOCK_APPLICATIONS]
    }
    return g.__mockApplications
  }
  return MOCK_APPLICATIONS
}

// ===========================================================================
// Service Layer APIs
// ===========================================================================

/**
 * Returns all active exhibitions, sorting by date.
 */
export async function getExhibitions(): Promise<Exhibition[]> {
  try {
    const rows = await restGet<ExhibitionRow>("exhibitions?select=*&order=start_date.asc")
    if (!rows || rows.length === 0) return MOCK_EXHIBITIONS
    return rows.map(mapExhibition)
  } catch (err) {
    console.warn("[exhibitions-service] Failed to fetch. Using fallback mock data:", err)
    return MOCK_EXHIBITIONS
  }
}

/**
 * Returns an exhibition by slug.
 */
export async function getExhibitionBySlug(slug: string): Promise<Exhibition | null> {
  try {
    const rows = await restGet<ExhibitionRow>(`exhibitions?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`)
    if (!rows || rows.length === 0) {
      return MOCK_EXHIBITIONS.find((e) => e.slug === slug) || null
    }
    return mapExhibition(rows[0])
  } catch (err) {
    console.warn(`[exhibitions-service] Failed to fetch slug ${slug}. Using fallback mock data:`, err)
    return MOCK_EXHIBITIONS.find((e) => e.slug === slug) || null
  }
}

/**
 * Returns all booths belonging to a specific exhibition slug/ID.
 */
export async function getBoothsByExhibitionSlug(slug: string): Promise<ExhibitionBooth[]> {
  try {
    // 1. Resolve exhibition ID from slug
    const exh = await getExhibitionBySlug(slug)
    if (!exh) return []

    // 2. Load booths with joined company details
    const select = `id,exhibition_id,company_id,banner_url,description,is_archived,companies(*)`
    const rows = await restGet<ExhibitionBoothRow>(
      `exhibition_booths?select=${select}&exhibition_id=eq.${encodeURIComponent(exh.id)}&is_archived=eq.false`
    )
    if (!rows || rows.length === 0) {
      return MOCK_BOOTHS[slug] || []
    }
    return rows.map(mapExhibitionBooth)
  } catch (err) {
    console.warn(`[exhibitions-service] Failed to fetch booths for ${slug}. Using fallback mock:`, err)
    return MOCK_BOOTHS[slug] || []
  }
}

/**
 * Returns a specific booth with full details (joined exhibits, media, documents, and company).
 */
export async function getBoothDetails(id: string): Promise<ExhibitionBooth | null> {
  try {
    // Find in mock data first if it's a mock ID
    if (id.startsWith("booth-")) {
      for (const slug in MOCK_BOOTHS) {
        const found = MOCK_BOOTHS[slug].find((b) => b.id === id)
        if (found) {
          return {
            ...found,
            exhibits: MOCK_EXHIBITS[id] || [],
            media: MOCK_MEDIA[id] || [],
            documents: MOCK_DOCS[id] || [],
          }
        }
      }
    }

    const select = `id,exhibition_id,company_id,banner_url,description,is_archived,companies(*)`
    const rows = await restGet<ExhibitionBoothRow>(
      `exhibition_booths?select=${select}&id=eq.${encodeURIComponent(id)}&limit=1`
    )
    const row = rows[0]
    if (!row) return null

    const booth = mapExhibitionBooth(row)

    // Load Exhibits (via DB table exhibition_items)
    const itemsRows = await restGet<ExhibitionItemRow>(
      `exhibition_items?select=*&booth_id=eq.${encodeURIComponent(id)}&order=sort_order.asc`
    )
    booth.exhibits = itemsRows.map(mapExhibitionExhibit)

    // Load Media
    const mediaRows = await restGet<ExhibitionMediaRow>(
      `exhibition_media?select=*&booth_id=eq.${encodeURIComponent(id)}&order=sort_order.asc`
    )
    booth.media = mediaRows.map(mapExhibitionMedia)

    // Load Documents
    const docRows = await restGet<ExhibitionDocumentRow>(
      `exhibition_documents?select=*&booth_id=eq.${encodeURIComponent(id)}&order=sort_order.asc`
    )
    booth.documents = docRows.map(mapExhibitionDocument)

    return booth
  } catch (err) {
    console.warn(`[exhibitions-service] Failed to fetch booth details ${id}. Using mock search:`, err)
    // Double check mock
    for (const slug in MOCK_BOOTHS) {
      const found = MOCK_BOOTHS[slug].find((b) => b.id === id)
      if (found) {
        return {
          ...found,
          exhibits: MOCK_EXHIBITS[id] || [],
          media: MOCK_MEDIA[id] || [],
          documents: MOCK_DOCS[id] || [],
        }
      }
    }
    return null
  }
}

/**
 * Creates a new exhibition application.
 */
export async function createExhibitionApplication(
  input: Omit<ExhibitionApplication, "id" | "status" | "submittedAt" | "reviewNotes" | "reviewedAt" | "reviewedBy">
): Promise<ExhibitionApplication> {
  const cfg = getRestConfig()

  if (!cfg) {
    // Unconfigured environment: create a simulated application
    const mockApp: ExhibitionApplication = {
      ...input,
      id: `app-mock-${Math.random().toString(36).slice(2, 11)}`,
      status: "Pending",
      reviewNotes: null,
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
    }

    // Attempt to load associated exhibition info for mocks
    const mockExhibitions = MOCK_EXHIBITIONS
    const exh = mockExhibitions.find((e) => e.id === input.exhibitionId)
    if (exh) {
      mockApp.exhibition = exh
    }

    getMockApplications().push(mockApp)
    return mockApp
  }

  // Configured environment: Insert via PostgREST
  const record = {
    exhibition_id: input.exhibitionId,
    company_id: input.companyId || null,
    company_name: input.companyName,
    contact_person: input.contactPerson,
    email: input.email,
    phone: input.phone,
    country: input.country,
    business_category: input.businessCategory,
    short_description: input.shortDescription,
    message: input.message || null,
    status: "Pending",
  }

  const res = await fetch(`${cfg.url}/rest/v1/exhibition_applications`, {
    method: "POST",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "content-type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(record),
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to create application: ${res.status} ${text}`)
  }

  const rows = (await res.json()) as ExhibitionApplicationRow[]
  if (!rows || rows.length === 0) {
    throw new Error("No application row returned from database insert.")
  }

  return mapExhibitionApplication(rows[0])
}

/**
 * Returns an exhibition application by ID.
 */
export async function getExhibitionApplicationById(id: string): Promise<ExhibitionApplication | null> {
  try {
    const cfg = getRestConfig()
    if (!cfg) {
      const mockApp = getMockApplications().find((a) => a.id === id)
      return mockApp || null
    }

    const selectQuery = "*,exhibitions(*)"
    const rows = await restGet<ExhibitionApplicationRow>(
      `exhibition_applications?select=${selectQuery}&id=eq.${encodeURIComponent(id)}&limit=1`
    )
    if (!rows || rows.length === 0) return null
    return mapExhibitionApplication(rows[0])
  } catch (err) {
    console.warn(`[exhibitions-service] Failed to fetch application ID ${id}. Checking mock:`, err)
    const mockApp = getMockApplications().find((a) => a.id === id)
    return mockApp || null
  }
}

/**
 * Lists all exhibition applications for a specific exhibition.
 */
export async function getExhibitionApplicationsByExhibitionId(exhibitionId: string): Promise<ExhibitionApplication[]> {
  try {
    const cfg = getRestConfig()
    if (!cfg) {
      return getMockApplications().filter((a) => a.exhibitionId === exhibitionId)
    }

    const rows = await restGet<ExhibitionApplicationRow>(
      `exhibition_applications?select=*,exhibitions(*)&exhibition_id=eq.${encodeURIComponent(exhibitionId)}&order=created_at.desc`
    )
    return rows.map(mapExhibitionApplication)
  } catch (err) {
    console.warn(`[exhibitions-service] Failed to fetch applications for exhibition ${exhibitionId}. Falling back to mocks:`, err)
    return getMockApplications().filter((a) => a.exhibitionId === exhibitionId)
  }
}

/**
 * Checks for a duplicate application under the same email or company ID for a specific exhibition.
 */
export async function checkDuplicateApplication(
  exhibitionId: string,
  email: string,
  companyId?: string | null
): Promise<boolean> {
  try {
    const cfg = getRestConfig()
    if (!cfg) {
      const match = getMockApplications().some(
        (a) =>
          a.exhibitionId === exhibitionId &&
          (a.email.toLowerCase() === email.toLowerCase() || (companyId && a.companyId === companyId))
      )
      return match
    }

    const emailQuery = `email=eq.${encodeURIComponent(email.toLowerCase())}`
    const companyQuery = companyId ? `company_id=eq.${encodeURIComponent(companyId)}` : null

    let orClause = `and=(exhibition_id=eq.${encodeURIComponent(exhibitionId)},or=(${emailQuery}`
    if (companyQuery) {
      orClause += `,${companyQuery}`
    }
    orClause += "))"

    const rows = await restGet<ExhibitionApplicationRow>(`exhibition_applications?select=id&${orClause}&limit=1`)
    return rows && rows.length > 0
  } catch (err) {
    console.warn("[exhibitions-service] Failed to check for duplicate applications. Checking mock:", err)
    const match = getMockApplications().some(
      (a) =>
        a.exhibitionId === exhibitionId &&
        (a.email.toLowerCase() === email.toLowerCase() || (companyId && a.companyId === companyId))
    )
    return match
  }
}
