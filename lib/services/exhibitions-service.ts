import { restGet, getRestConfig } from "@/lib/supabase/rest"
import type {
  Exhibition,
  ExhibitionBooth,
  ExhibitionExhibit,
  ExhibitionMedia,
  ExhibitionDocument,
  ExhibitionApplication,
  ExhibitionApplicationStatus,
  ExhibitionFavorite,
  ExhibitionRecentlyViewed,
  ExhibitionMeeting,
  ExhibitionMeetingStatus,
  ExhibitionVisitorNote,
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
  logo_url?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  website?: string | null
}

export type ExhibitionBoothRow = {
  id: string
  exhibition_id: string
  company_id: string
  banner_url: string | null
  logo_url?: string | null
  description: string
  booth_number?: string | null
  category?: string | null
  is_featured?: boolean
  is_archived: boolean
  status?: string | null
  title?: string | null
  short_description?: string | null
  contact_person?: string | null
  contact_phone?: string | null
  contact_whatsapp?: string | null
  contact_email?: string | null
  contact_website?: string | null
  created_at?: string
  updated_at?: string
  companies?: CompanyRow | null
}

export type ExhibitionItemRow = {
  id: string
  booth_id: string
  name: string
  short_description?: string | null
  description: string | null
  images: string[] | null
  videos: string[] | null
  pdf_url: string | null
  brochure_url: string | null
  is_featured: boolean
  sort_order: number
  category?: string | null
  status?: string | null
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
  thumbnail_url?: string | null
  created_at?: string
  is_cover?: boolean
}

export type ExhibitionDocumentRow = {
  id: string
  booth_id: string
  name: string
  url: string
  file_size: string | null
  sort_order: number
  language?: string | null
  description?: string | null
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
    logoUrl: row.logo_url || null,
    contactEmail: row.contact_email || null,
    contactPhone: row.contact_phone || null,
    website: row.website || null,
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
    logoUrl: row.logo_url || null,
    description: row.description,
    isArchived: Boolean(row.is_archived),
    boothNumber: derivedBoothNumber,
    category: derivedCategory,
    isFeatured: row.is_featured !== undefined ? Boolean(row.is_featured) : (company?.verificationTier === "premium"),
    status: (row.status || "Draft") as "Draft" | "Submitted" | "Published" | "Archived",
    title: row.title || null,
    shortDescription: row.short_description || null,
    contactPerson: row.contact_person || null,
    contactPhone: row.contact_phone || null,
    contactWhatsapp: row.contact_whatsapp || null,
    contactEmail: row.contact_email || null,
    contactWebsite: row.contact_website || null,
    company,
  }
}

export function mapExhibitionExhibit(row: ExhibitionItemRow): ExhibitionExhibit {
  return {
    id: row.id,
    boothId: row.booth_id,
    name: row.name,
    shortDescription: row.short_description || null,
    description: row.description,
    images: row.images || [],
    videos: row.videos || [],
    pdfUrl: row.pdf_url,
    brochureUrl: row.brochure_url,
    isFeatured: Boolean(row.is_featured),
    sortOrder: Number(row.sort_order) || 0,
    category: row.category || null,
    status: (row.status || "Draft") as "Draft" | "Submitted" | "Published" | "Archived",
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
    thumbnailUrl: row.thumbnail_url || null,
    isCover: row.is_cover !== undefined ? Boolean(row.is_cover) : false
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
    language: row.language || null,
    description: row.description || null,
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
    description: "The premier B2B gathering of agri-food innovators, olive oil mills, date exporters, and organic producers from across North African and the Mediterranean basin.",
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
      shortDescription: "An exclusive, high-density extra virgin olive oil made entirely in Sfax.",
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
      shortDescription: "Cold-pressed at temperatures strictly below 25°C using traditional stone mills.",
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
      shortDescription: "Specially selected semi-soft dates on branches, pure Tozeur quality.",
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
      shortDescription: "Unbleached, high durability spun threads, OEKO-TEX Standard 100 verified.",
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

export function getMockBooths(): Record<string, ExhibitionBooth[]> {
  if (typeof globalThis !== "undefined") {
    const g = globalThis as any
    if (!g.__mockBooths) {
      g.__mockBooths = JSON.parse(JSON.stringify(MOCK_BOOTHS))
    }
    return g.__mockBooths
  }
  return MOCK_BOOTHS
}

// ===========================================================================
// Service Layer APIs
// ===========================================================================

/**
 * Returns all active exhibitions, sorting by date.
 */
export function getMockExhibitions(): Exhibition[] {
  if (typeof globalThis !== "undefined") {
    const g = globalThis as any
    if (!g.__mockExhibitions) {
      g.__mockExhibitions = JSON.parse(JSON.stringify(MOCK_EXHIBITIONS))
    }
    return g.__mockExhibitions
  }
  return MOCK_EXHIBITIONS
}

/**
 * Returns all active exhibitions, sorting by date.
 */
export async function getExhibitions(): Promise<Exhibition[]> {
  try {
    const rows = await restGet<ExhibitionRow>("exhibitions?select=*&order=start_date.asc")
    if (!rows || rows.length === 0) return getMockExhibitions()
    return rows.map(mapExhibition)
  } catch (err) {
    console.warn("[exhibitions-service] Failed to fetch. Using fallback mock data:", err)
    return getMockExhibitions()
  }
}

/**
 * Returns an exhibition by slug.
 */
export async function getExhibitionBySlug(slug: string): Promise<Exhibition | null> {
  try {
    const rows = await restGet<ExhibitionRow>(`exhibitions?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`)
    if (!rows || rows.length === 0) {
      return getMockExhibitions().find((e) => e.slug === slug) || null
    }
    return mapExhibition(rows[0])
  } catch (err) {
    console.warn(`[exhibitions-service] Failed to fetch slug ${slug}. Using fallback mock data:`, err)
    return getMockExhibitions().find((e) => e.slug === slug) || null
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
      return getMockBooths()[slug] || []
    }
    return rows.map(mapExhibitionBooth)
  } catch (err) {
    console.warn(`[exhibitions-service] Failed to fetch booths for ${slug}. Using fallback mock:`, err)
    return getMockBooths()[slug] || []
  }
}

/**
 * Returns a specific booth with full details (joined exhibits, media, documents, and company).
 */
export async function getBoothDetails(id: string): Promise<ExhibitionBooth | null> {
  try {
    const mockData = getMockBooths()
    // Find in mock data first if it's a mock ID
    if (id.startsWith("booth-")) {
      for (const slug in mockData) {
        const found = mockData[slug].find((b) => b.id === id)
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

    const select = `id,exhibition_id,company_id,banner_url,logo_url,description,status,title,short_description,contact_person,contact_phone,contact_whatsapp,contact_email,contact_website,companies(*)`
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
    const mockData = getMockBooths()
    for (const slug in mockData) {
      const found = mockData[slug].find((b) => b.id === id)
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

/**
 * Updates an exhibition booth details as a draft.
 */
export async function saveBoothDraft(
  id: string,
  data: {
    title?: string | null
    shortDescription?: string | null
    description?: string | null
    bannerUrl?: string | null
    logoUrl?: string | null
    category?: string | null
    status?: "Draft" | "Submitted" | "Published" | "Archived"
  }
): Promise<ExhibitionBooth> {
  const cfg = getRestConfig()

  if (!cfg || id.startsWith("booth-")) {
    // Modify mock data
    const mockData = getMockBooths()
    let foundBooth: ExhibitionBooth | null = null
    for (const slug in mockData) {
      const idx = mockData[slug].findIndex((b) => b.id === id)
      if (idx !== -1) {
        const existing = mockData[slug][idx]
        const updated: ExhibitionBooth = {
          ...existing,
          title: data.title !== undefined ? data.title : existing.title,
          shortDescription: data.shortDescription !== undefined ? data.shortDescription : existing.shortDescription,
          description: data.description !== undefined && data.description !== null ? data.description : existing.description,
          bannerUrl: data.bannerUrl !== undefined ? data.bannerUrl : existing.bannerUrl,
          logoUrl: data.logoUrl !== undefined ? data.logoUrl : existing.logoUrl,
          category: data.category !== undefined && data.category !== null ? data.category : existing.category,
          status: data.status !== undefined ? data.status : "Draft",
          updatedAt: new Date().toISOString(),
        }
        mockData[slug][idx] = updated
        foundBooth = updated
        break
      }
    }

    if (!foundBooth) {
      throw new Error(`Mock booth not found with ID ${id}`)
    }
    return foundBooth
  }

  // Real database PostgREST update
  const record: Record<string, any> = {
    updated_at: new Date().toISOString(),
    status: data.status !== undefined ? data.status : "Draft",
  }
  if (data.title !== undefined) record.title = data.title
  if (data.shortDescription !== undefined) record.short_description = data.shortDescription
  if (data.description !== undefined) record.description = data.description
  if (data.bannerUrl !== undefined) record.banner_url = data.bannerUrl
  if (data.logoUrl !== undefined) record.logo_url = data.logoUrl
  if (data.category !== undefined) record.category = data.category

  const res = await fetch(`${cfg.url}/rest/v1/exhibition_booths?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
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
    throw new Error(`Failed to update booth draft: ${res.status} ${text}`)
  }

  const rows = (await res.json()) as ExhibitionBoothRow[]
  if (!rows || rows.length === 0) {
    throw new Error(`No booth row returned after database update for ID ${id}`)
  }

  return mapExhibitionBooth(rows[0])
}

// ===========================================================================
// Exhibits (Exhibition items) B2B CRUD operations
// ===========================================================================

export function getMockExhibits(): Record<string, ExhibitionExhibit[]> {
  if (typeof globalThis !== "undefined") {
    const g = globalThis as any
    if (!g.__mockExhibits) {
      g.__mockExhibits = JSON.parse(JSON.stringify(MOCK_EXHIBITS))
    }
    return g.__mockExhibits
  }
  return MOCK_EXHIBITS
}

/**
 * Returns all exhibits belonging only to this booth, sorted by sort_order.
 */
export async function getExhibitsForBooth(boothId: string): Promise<ExhibitionExhibit[]> {
  try {
    const cfg = getRestConfig()
    if (!cfg || boothId.startsWith("booth-")) {
      const mockData = getMockExhibits()
      const list = mockData[boothId] || []
      return list.sort((a, b) => a.sortOrder - b.sortOrder)
    }

    const rows = await restGet<ExhibitionItemRow>(
      `exhibition_items?select=*&booth_id=eq.${encodeURIComponent(boothId)}&order=sort_order.asc`
    )
    return rows.map(mapExhibitionExhibit)
  } catch (err) {
    console.warn(`[exhibitions-service] getExhibitsForBooth error:`, err)
    const mockData = getMockExhibits()
    const list = mockData[boothId] || []
    return list.sort((a, b) => a.sortOrder - b.sortOrder)
  }
}

/**
 * Creates a new exhibit.
 */
export async function createExhibit(
  data: Omit<ExhibitionExhibit, "id">
): Promise<ExhibitionExhibit> {
  const cfg = getRestConfig()
  const boothId = data.boothId

  if (!cfg || boothId.startsWith("booth-")) {
    const mockData = getMockExhibits()
    if (!mockData[boothId]) {
      mockData[boothId] = []
    }
    const newExhibit: ExhibitionExhibit = {
      ...data,
      id: `exhibit-${Math.random().toString(36).slice(2, 11)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockData[boothId].push(newExhibit)
    return newExhibit
  }

  // Database insert via PostgREST
  const record = {
    booth_id: data.boothId,
    name: data.name,
    short_description: data.shortDescription || null,
    description: data.description,
    images: data.images || [],
    videos: data.videos || [],
    pdf_url: data.pdfUrl || null,
    brochure_url: data.brochureUrl || null,
    is_featured: Boolean(data.isFeatured),
    sort_order: Number(data.sortOrder) || 0,
    category: data.category || null,
    status: data.status || "Draft",
  }

  const res = await fetch(`${cfg.url}/rest/v1/exhibition_items`, {
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
    throw new Error(`Failed to create exhibit: ${res.status} ${text}`)
  }

  const rows = (await res.json()) as ExhibitionItemRow[]
  if (!rows || rows.length === 0) {
    throw new Error("No exhibit row returned from database insert.")
  }

  return mapExhibitionExhibit(rows[0])
}

/**
 * Updates an exhibit.
 */
export async function updateExhibit(
  id: string,
  data: Partial<ExhibitionExhibit>
): Promise<ExhibitionExhibit> {
  const cfg = getRestConfig()

  if (!cfg || id.startsWith("exhibit-")) {
    const mockData = getMockExhibits()
    let found: ExhibitionExhibit | null = null
    for (const bId in mockData) {
      const idx = mockData[bId].findIndex((e) => e.id === id)
      if (idx !== -1) {
        const existing = mockData[bId][idx]
        const updated: ExhibitionExhibit = {
          ...existing,
          ...data,
          updatedAt: new Date().toISOString(),
        }
        mockData[bId][idx] = updated
        found = updated
        break
      }
    }
    if (!found) {
      throw new Error(`Mock exhibit not found with ID ${id}`)
    }
    return found
  }

  // Database update
  const record: Record<string, any> = {
    updated_at: new Date().toISOString(),
  }
  if (data.name !== undefined) record.name = data.name
  if (data.shortDescription !== undefined) record.short_description = data.shortDescription
  if (data.description !== undefined) record.description = data.description
  if (data.images !== undefined) record.images = data.images
  if (data.videos !== undefined) record.videos = data.videos
  if (data.pdfUrl !== undefined) record.pdf_url = data.pdfUrl
  if (data.brochureUrl !== undefined) record.brochure_url = data.brochureUrl
  if (data.isFeatured !== undefined) record.is_featured = Boolean(data.isFeatured)
  if (data.sortOrder !== undefined) record.sort_order = Number(data.sortOrder)
  if (data.category !== undefined) record.category = data.category
  if (data.status !== undefined) record.status = data.status

  const res = await fetch(`${cfg.url}/rest/v1/exhibition_items?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
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
    throw new Error(`Failed to update exhibit: ${res.status} ${text}`)
  }

  const rows = (await res.json()) as ExhibitionItemRow[]
  if (!rows || rows.length === 0) {
    throw new Error(`No exhibit row returned after update for ID ${id}`)
  }

  return mapExhibitionExhibit(rows[0])
}

/**
 * Deletes an exhibit.
 */
export async function deleteExhibit(id: string): Promise<boolean> {
  const cfg = getRestConfig()

  if (!cfg || id.startsWith("exhibit-")) {
    const mockData = getMockExhibits()
    for (const bId in mockData) {
      const idx = mockData[bId].findIndex((e) => e.id === id)
      if (idx !== -1) {
        mockData[bId].splice(idx, 1)
        return true
      }
    }
    return false
  }

  const res = await fetch(`${cfg.url}/rest/v1/exhibition_items?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
    },
  })

  return res.ok
}

/**
 * Duplicates an exhibit.
 */
export async function duplicateExhibit(id: string): Promise<ExhibitionExhibit> {
  const cfg = getRestConfig()

  if (!cfg || id.startsWith("exhibit-")) {
    const mockData = getMockExhibits()
    let src: ExhibitionExhibit | null = null
    let bIdKey: string = ""
    for (const bId in mockData) {
      const found = mockData[bId].find((e) => e.id === id)
      if (found) {
        src = found
        bIdKey = bId
        break
      }
    }

    if (!src) throw new Error(`Exhibit to duplicate not found: ${id}`)

    const copy: ExhibitionExhibit = {
      ...src,
      id: `exhibit-${Math.random().toString(36).slice(2, 11)}`,
      name: `${src.name} (Copy)`,
      sortOrder: src.sortOrder + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "Draft",
    }
    mockData[bIdKey].push(copy)
    return copy
  }

  // Real Database Duplication
  const rows = await restGet<ExhibitionItemRow>(`exhibition_items?select=*&id=eq.${encodeURIComponent(id)}&limit=1`)
  const srcRow = rows[0]
  if (!srcRow) throw new Error(`Exhibit to duplicate not found in database: ${id}`)

  const record = {
    booth_id: srcRow.booth_id,
    name: `${srcRow.name} (Copy)`,
    short_description: srcRow.short_description || null,
    description: srcRow.description,
    images: srcRow.images || [],
    videos: srcRow.videos || [],
    pdf_url: srcRow.pdf_url || null,
    brochure_url: srcRow.brochure_url || null,
    is_featured: Boolean(srcRow.is_featured),
    sort_order: (Number(srcRow.sort_order) || 0) + 1,
    category: srcRow.category || null,
    status: "Draft",
  }

  const res = await fetch(`${cfg.url}/rest/v1/exhibition_items`, {
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
    throw new Error(`Failed to duplicate database exhibit: ${res.status} ${text}`)
  }

  const resultRows = (await res.json()) as ExhibitionItemRow[]
  if (!resultRows || resultRows.length === 0) {
    throw new Error("No duplicated row returned from database insert.")
  }

  return mapExhibitionExhibit(resultRows[0])
}

/**
 * Updates sort orders for all exhibits of a booth.
 */
export async function updateExhibitsSortOrder(
  boothId: string,
  orderedIds: string[]
): Promise<boolean> {
  const cfg = getRestConfig()

  if (!cfg || boothId.startsWith("booth-")) {
    const mockData = getMockExhibits()
    const list = mockData[boothId] || []
    orderedIds.forEach((id, index) => {
      const idx = list.findIndex((e) => e.id === id)
      if (idx !== -1) {
        list[idx].sortOrder = index + 1
      }
    })
    return true
  }

  // Update in DB (sequentially)
  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i]
    await fetch(`${cfg.url}/rest/v1/exhibition_items?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ sort_order: i + 1 }),
      cache: "no-store",
    })
  }

  return true
}

// ===========================================================================
// Organizer Review Workspace APIs (TASK 007)
// ===========================================================================

/**
 * Gets the list of exhibition applications with search, status filtering, and sorting.
 */
export async function getApplicationsList(params: {
  search?: string
  status?: string
  sort?: "newest" | "oldest"
}): Promise<ExhibitionApplication[]> {
  try {
    const cfg = getRestConfig()
    if (!cfg) {
      // Offline/Mock Filter and Sort
      let list = [...getMockApplications()]

      if (params.status && params.status !== "all") {
        list = list.filter((a) => a.status.toLowerCase() === params.status?.toLowerCase())
      }

      if (params.search) {
        const query = params.search.toLowerCase()
        list = list.filter(
          (a) =>
            a.companyName.toLowerCase().includes(query) ||
            a.contactPerson.toLowerCase().includes(query) ||
            a.email.toLowerCase().includes(query) ||
            a.businessCategory.toLowerCase().includes(query)
        )
      }

      if (params.sort === "oldest") {
        list.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
      } else {
        list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      }

      return list
    }

    // Build PostgREST query
    let queryStr = "select=*,exhibitions(*)"
    if (params.status && params.status !== "all") {
      queryStr += `&status=eq.${encodeURIComponent(params.status)}`
    }

    // Perform fetch
    let rows = await restGet<ExhibitionApplicationRow>(`exhibition_applications?${queryStr}`)

    if (params.search) {
      const q = params.search.toLowerCase()
      rows = rows.filter(
        (r) =>
          r.company_name.toLowerCase().includes(q) ||
          r.contact_person.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.business_category.toLowerCase().includes(q)
      )
    }

    const list = rows.map(mapExhibitionApplication)

    if (params.sort === "oldest") {
      list.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
    } else {
      list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    }

    return list
  } catch (err) {
    console.warn("[exhibitions-service] Failed to getApplicationsList. Falling back to mocks:", err)
    return getMockApplications()
  }
}

/**
 * Approves an application, updating status and auto-creating an empty Draft booth.
 */
export async function approveApplication(
  id: string,
  reviewNotes?: string
): Promise<ExhibitionApplication> {
  const cfg = getRestConfig()
  const now = new Date().toISOString()

  if (!cfg || id.startsWith("app-mock-")) {
    const list = getMockApplications()
    const idx = list.findIndex((a) => a.id === id)
    if (idx === -1) {
      throw new Error(`Application not found: ${id}`)
    }

    const app = list[idx]
    const updated: ExhibitionApplication = {
      ...app,
      status: "Approved",
      reviewNotes: reviewNotes || null,
      reviewedAt: now,
    }
    list[idx] = updated

    // Generate and provision a corresponding empty booth inside MOCK_BOOTHS
    const mockBooths = getMockBooths()
    const companyId = app.companyId || `comp-${Math.random().toString(36).slice(2, 11)}`
    const boothId = `booth-${Math.random().toString(36).slice(2, 11)}`

    const newBooth: ExhibitionBooth = {
      id: boothId,
      exhibitionId: app.exhibitionId,
      companyId: companyId,
      description: `Welcome to our virtual booth pavilion for ${app.companyName}. We showcase premium ${app.businessCategory} solutions.`,
      isArchived: false,
      status: "Draft",
      boothNumber: `C-${Math.floor(Math.random() * 80) + 10}`,
      category: app.businessCategory,
      isFeatured: false,
      title: app.companyName,
      shortDescription: app.shortDescription,
      contactPerson: app.contactPerson,
      contactPhone: app.phone,
      contactEmail: app.email,
      logoUrl: null,
      bannerUrl: null,
      company: {
        id: companyId,
        name: app.companyName,
        slug: app.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: app.shortDescription,
        primaryIndustry: app.businessCategory.toLowerCase().includes("food") ? "food" : "textiles",
        city: "tunis",
        country: "TN",
        verified: false,
        verificationTier: "none",
        profileCompletion: 20,
        taxIdentifier: "",
        businessType: "manufacturer",
        yearEstablished: 2026,
        companySize: "10-19",
        supportedLanguages: ["en", "fr"],
        exportMarkets: ["eu"],
        metadata: {},
      }
    }

    // Determine the correct exhibition bucket slug
    const exhibitions = await getExhibitions()
    const exh = exhibitions.find((e) => e.id === app.exhibitionId)
    const exhSlug = exh?.slug || "tunisia-food-expo-2026"

    if (!mockBooths[exhSlug]) {
      mockBooths[exhSlug] = []
    }
    mockBooths[exhSlug].push(newBooth)

    return updated
  }

  // 1. Update the application status in the database
  const resApp = await fetch(`${cfg.url}/rest/v1/exhibition_applications?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "content-type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      status: "Approved",
      review_notes: reviewNotes || null,
      reviewed_at: now,
    }),
    cache: "no-store",
  })

  if (!resApp.ok) {
    const text = await resApp.text()
    throw new Error(`Failed to approve application: ${resApp.status} ${text}`)
  }

  const appRows = (await resApp.json()) as ExhibitionApplicationRow[]
  if (!appRows || appRows.length === 0) {
    throw new Error("No application returned after approving.")
  }

  const application = mapExhibitionApplication(appRows[0])

  // 2. Automatically create an empty booth in the database
  // Resolve unique companyId (generate a fallback if none exists)
  const resolvedCompanyId = application.companyId || "00000000-0000-0000-0000-000000000000"

  const recordBooth = {
    exhibition_id: application.exhibitionId,
    company_id: resolvedCompanyId,
    description: `Welcome to our virtual booth pavilion for ${application.companyName}. We showcase premium ${application.businessCategory} solutions.`,
    status: "Draft",
    title: application.companyName,
    short_description: application.shortDescription,
    category: application.businessCategory,
    contact_person: application.contactPerson,
    contact_phone: application.phone,
    contact_email: application.email,
    is_archived: false,
    is_featured: false,
  }

  const resBooth = await fetch(`${cfg.url}/rest/v1/exhibition_booths`, {
    method: "POST",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(recordBooth),
    cache: "no-store",
  })

  if (!resBooth.ok) {
    const text = await resBooth.text()
    console.warn("[exhibitions-service] Auto draft booth creation warning:", text)
  }

  return application
}

/**
 * Rejects an application, updating status and review notes.
 */
export async function rejectApplication(
  id: string,
  reviewNotes: string
): Promise<ExhibitionApplication> {
  const cfg = getRestConfig()
  const now = new Date().toISOString()

  if (!cfg || id.startsWith("app-mock-")) {
    const list = getMockApplications()
    const idx = list.findIndex((a) => a.id === id)
    if (idx === -1) {
      throw new Error(`Application not found: ${id}`)
    }

    const app = list[idx]
    const updated: ExhibitionApplication = {
      ...app,
      status: "Rejected",
      reviewNotes: reviewNotes || null,
      reviewedAt: now,
    }
    list[idx] = updated
    return updated
  }

  const resApp = await fetch(`${cfg.url}/rest/v1/exhibition_applications?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "content-type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      status: "Rejected",
      review_notes: reviewNotes || null,
      reviewed_at: now,
    }),
    cache: "no-store",
  })

  if (!resApp.ok) {
    const text = await resApp.text()
    throw new Error(`Failed to reject application: ${resApp.status} ${text}`)
  }

  const appRows = (await resApp.json()) as ExhibitionApplicationRow[]
  if (!appRows || appRows.length === 0) {
    throw new Error("No application returned after rejecting.")
  }

  return mapExhibitionApplication(appRows[0])
}

// ===========================================================================
// Organizer Dashboard Specific Helpers
// ===========================================================================

/**
 * Updates an exhibition details.
 */
export async function updateExhibition(
  id: string,
  data: Partial<Omit<Exhibition, "id" | "slug">>
): Promise<Exhibition> {
  const cfg = getRestConfig()

  if (!cfg || id.startsWith("exh-")) {
    const list = getMockExhibitions()
    const idx = list.findIndex((e) => e.id === id)
    if (idx === -1) {
      throw new Error(`Exhibition not found: ${id}`)
    }

    const updated: Exhibition = {
      ...list[idx],
      ...data,
      categories: data.categories || list[idx].categories,
      updatedAt: new Date().toISOString(),
    }
    list[idx] = updated
    return updated
  }

  // Database update via PostgREST
  const record: Record<string, any> = {
    updated_at: new Date().toISOString(),
  }
  if (data.name !== undefined) record.name = data.name
  if (data.organizer !== undefined) record.organizer = data.organizer
  if (data.description !== undefined) record.description = data.description
  if (data.coverUrl !== undefined) record.cover_url = data.coverUrl
  if (data.country !== undefined) record.country = data.country
  if (data.city !== undefined) record.city = data.city
  if (data.startDate !== undefined) record.start_date = data.startDate
  if (data.endDate !== undefined) record.end_date = data.endDate
  if (data.categories !== undefined) record.categories = data.categories
  if (data.logoUrl !== undefined) record.logo_url = data.logoUrl
  if (data.contactEmail !== undefined) record.contact_email = data.contactEmail
  if (data.contactPhone !== undefined) record.contact_phone = data.contactPhone
  if (data.website !== undefined) record.website = data.website

  const res = await fetch(`${cfg.url}/rest/v1/exhibitions?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
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
    throw new Error(`Failed to update exhibition: ${res.status} ${text}`)
  }

  const rows = (await res.json()) as ExhibitionRow[]
  if (!rows || rows.length === 0) {
    throw new Error(`No exhibition row returned after update for ID ${id}`)
  }

  return mapExhibition(rows[0])
}

/**
 * Retrieves stats for the organizer dashboard.
 */
export async function getOrganizerDashboardStats(exhibitionId: string) {
  const apps = await getExhibitionApplicationsByExhibitionId(exhibitionId)

  // To load booths, we need the exhibition slug to search in mocks
  const exhibitions = await getExhibitions()
  const exh = exhibitions.find((e) => e.id === exhibitionId)
  const slug = exh?.slug || "tunisia-food-expo-2026"

  let booths: ExhibitionBooth[] = []
  try {
    const cfg = getRestConfig()
    if (!cfg) {
      booths = getMockBooths()[slug] || []
    } else {
      const select = `id,exhibition_id,company_id,banner_url,description,is_archived,booth_number,category,status,title,short_description,companies(*)`
      const rows = await restGet<ExhibitionBoothRow>(
        `exhibition_booths?select=${select}&exhibition_id=eq.${encodeURIComponent(exhibitionId)}`
      )
      booths = rows.map(mapExhibitionBooth)
    }
  } catch (err) {
    console.warn("Failed to fetch booths for stats:", err)
    booths = getMockBooths()[slug] || []
  }

  const totalApplications = apps.length
  const pendingApplications = apps.filter((a) => a.status === "Pending").length
  const approvedBoothCount = booths.length // All booths in table are approved
  const publishedBoothCount = booths.filter((b) => b.status === "Published" && !b.isArchived).length

  return {
    totalApplications,
    pendingApplications,
    approvedBoothCount,
    publishedBoothCount,
    visitorsPlaceholder: 4250,
    meetingsPlaceholder: 184,
  }
}

/**
 * Assigns a booth number (and optionally a category) to a booth.
 */
export async function assignBoothDetails(
  boothId: string,
  data: {
    boothNumber?: string | null
    category?: string | null
  }
): Promise<ExhibitionBooth> {
  const cfg = getRestConfig()

  if (!cfg || boothId.startsWith("booth-")) {
    const mockData = getMockBooths()
    let foundBooth: ExhibitionBooth | null = null
    for (const slug in mockData) {
      const idx = mockData[slug].findIndex((b) => b.id === boothId)
      if (idx !== -1) {
        const existing = mockData[slug][idx]
        const updated: ExhibitionBooth = {
          ...existing,
          boothNumber: data.boothNumber !== undefined ? (data.boothNumber || "") : existing.boothNumber,
          category: data.category !== undefined ? (data.category || "") : existing.category,
          updatedAt: new Date().toISOString(),
        }
        mockData[slug][idx] = updated
        foundBooth = updated
        break
      }
    }
    if (!foundBooth) {
      throw new Error(`Booth not found with ID ${boothId}`)
    }
    return foundBooth
  }

  // Database update
  const record: Record<string, any> = {
    updated_at: new Date().toISOString(),
  }
  if (data.boothNumber !== undefined) record.booth_number = data.boothNumber
  if (data.category !== undefined) record.category = data.category

  const res = await fetch(`${cfg.url}/rest/v1/exhibition_booths?id=eq.${encodeURIComponent(boothId)}`, {
    method: "PATCH",
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
    throw new Error(`Failed to assign booth details: ${res.status} ${text}`)
  }

  const rows = (await res.json()) as ExhibitionBoothRow[]
  if (!rows || rows.length === 0) {
    throw new Error(`No booth row returned after update for ID ${boothId}`)
  }

  return mapExhibitionBooth(rows[0])
}

/**
 * Updates a booth status (Draft, Published, Archived, etc.).
 */
export async function updateBoothStatus(
  boothId: string,
  status: "Draft" | "Submitted" | "Published" | "Archived"
): Promise<ExhibitionBooth> {
  const cfg = getRestConfig()

  if (!cfg || boothId.startsWith("booth-")) {
    const mockData = getMockBooths()
    let foundBooth: ExhibitionBooth | null = null
    for (const slug in mockData) {
      const idx = mockData[slug].findIndex((b) => b.id === boothId)
      if (idx !== -1) {
        const existing = mockData[slug][idx]
        const updated: ExhibitionBooth = {
          ...existing,
          status,
          isArchived: status === "Archived" ? true : existing.isArchived,
          updatedAt: new Date().toISOString(),
        }
        mockData[slug][idx] = updated
        foundBooth = updated
        break
      }
    }
    if (!foundBooth) {
      throw new Error(`Booth not found with ID ${boothId}`)
    }
    return foundBooth
  }

  // Database update
  const record: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  }
  if (status === "Archived") {
    record.is_archived = true
  } else if (status === "Published") {
    record.is_archived = false
  }

  const res = await fetch(`${cfg.url}/rest/v1/exhibition_booths?id=eq.${encodeURIComponent(boothId)}`, {
    method: "PATCH",
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
    throw new Error(`Failed to update booth status: ${res.status} ${text}`)
  }

  const rows = (await res.json()) as ExhibitionBoothRow[]
  if (!rows || rows.length === 0) {
    throw new Error(`No booth row returned after update for ID ${boothId}`)
  }

  return mapExhibitionBooth(rows[0])
}

/**
 * Loads analytics statistics for the exhibition.
 */
export async function loadStatistics(exhibitionId: string) {
  const apps = await getExhibitionApplicationsByExhibitionId(exhibitionId)

  const exhibitions = await getExhibitions()
  const exh = exhibitions.find((e) => e.id === exhibitionId)
  const slug = exh?.slug || "tunisia-food-expo-2026"

  let booths: ExhibitionBooth[] = []
  try {
    const cfg = getRestConfig()
    if (!cfg) {
      booths = getMockBooths()[slug] || []
    } else {
      const select = `id,exhibition_id,company_id,banner_url,description,is_archived,booth_number,category,status,title,short_description,companies(*)`
      const rows = await restGet<ExhibitionBoothRow>(
        `exhibition_booths?select=${select}&exhibition_id=eq.${encodeURIComponent(exhibitionId)}`
      )
      booths = rows.map(mapExhibitionBooth)
    }
  } catch (err) {
    console.warn("Failed to fetch booths for statistics:", err)
    booths = getMockBooths()[slug] || []
  }

  // 1. Applications Metrics
  const totalApps = apps.length
  const approvedApps = apps.filter((a) => a.status === "Approved").length
  const rejectedApps = apps.filter((a) => a.status === "Rejected").length
  const pendingApps = apps.filter((a) => a.status === "Pending").length

  // 2. Booths Metrics
  const publishedBooths = booths.filter((b) => b.status === "Published" && !b.isArchived).length
  const draftBooths = booths.filter((b) => (b.status === "Draft" || b.status === "Submitted") && !b.isArchived).length
  const archivedBooths = booths.filter((b) => b.isArchived || b.status === "Archived").length

  // 3. Country Breakdown
  const countryCounts: Record<string, number> = {}
  apps.forEach((a) => {
    const country = a.country || "TN"
    countryCounts[country] = (countryCounts[country] || 0) + 1
  })
  const countries = Object.entries(countryCounts).map(([code, count]) => ({
    code,
    name: code === "TN" ? "Tunisia" : code,
    count,
  }))

  // 4. Category Breakdown
  const categoryCounts: Record<string, number> = {}
  booths.forEach((b) => {
    const cat = b.category || "General Pavilion"
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
  })
  const categories = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count,
  }))

  // 5. Top/Most Viewed Booths (Using some beautiful placeholder distributions with real company names)
  const topBooths = booths.map((b, i) => ({
    id: b.id,
    companyName: b.title || b.company?.name || "Premium Exhibitor",
    boothNumber: b.boothNumber || "A-01",
    views: 1240 - i * 350 > 100 ? 1240 - i * 350 : 120,
    contacts: 85 - i * 25 > 10 ? 85 - i * 25 : 8,
  })).sort((a, b) => b.views - a.views)

  return {
    applications: {
      total: totalApps,
      approved: approvedApps,
      rejected: rejectedApps,
      pending: pendingApps,
    },
    booths: {
      total: booths.length,
      published: publishedBooths,
      draft: draftBooths,
      archived: archivedBooths,
    },
    countries,
    categories,
    topBooths,
  }
}

/**
 * Updates review notes on any application directly.
 */
export async function updateApplicationReviewNotes(
  id: string,
  reviewNotes: string
): Promise<ExhibitionApplication> {
  const cfg = getRestConfig()

  if (!cfg || id.startsWith("app-mock-")) {
    const list = getMockApplications()
    const idx = list.findIndex((a) => a.id === id)
    if (idx === -1) {
      throw new Error(`Application not found: ${id}`)
    }

    const app = list[idx]
    const updated: ExhibitionApplication = {
      ...app,
      reviewNotes,
    }
    list[idx] = updated
    return updated
  }

  const resApp = await fetch(`${cfg.url}/rest/v1/exhibition_applications?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "content-type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      review_notes: reviewNotes,
    }),
    cache: "no-store",
  })

  if (!resApp.ok) {
    const text = await resApp.text()
    throw new Error(`Failed to update review notes: ${resApp.status} ${text}`)
  }

  const appRows = (await resApp.json()) as ExhibitionApplicationRow[]
  if (!appRows || appRows.length === 0) {
    throw new Error("No application returned after updating review notes.")
  }

  return mapExhibitionApplication(appRows[0])
}

// ===========================================================================
// Visitor Experience & B2B Networking Service Layer (TASK 009)
// ===========================================================================

// Mock global persistence fallbacks for local sandbox development
const MOCK_FAVORITES: ExhibitionFavorite[] = []
const MOCK_RECENTLY_VIEWED: ExhibitionRecentlyViewed[] = []
const MOCK_MEETINGS: ExhibitionMeeting[] = [
  {
    id: "meet-mock-1",
    visitorId: "visitor-local",
    boothId: "booth-medina",
    companyId: "comp-medina",
    preferredDate: "2026-06-16",
    preferredTime: "10:00 - 11:00",
    purpose: "Explore olive oil export contracts",
    expectedVolume: "5,000 - 10,000 Liters",
    preferredLanguage: "French",
    notes: "We want to purchase cold-pressed reserve for EU distribution.",
    status: "Pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "meet-mock-2",
    visitorId: "visitor-local",
    boothId: "booth-sahara",
    companyId: "comp-sahara",
    preferredDate: "2026-06-17",
    preferredTime: "15:00 - 16:00",
    purpose: "Bulk Dates Purchase",
    expectedVolume: "2 Tons",
    preferredLanguage: "English",
    notes: "Discuss packaging options for Sahara Dates.",
    status: "Accepted",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
]
const MOCK_NOTES: ExhibitionVisitorNote[] = []

export function getMockFavorites(): ExhibitionFavorite[] {
  if (typeof globalThis !== "undefined") {
    const g = globalThis as any
    if (!g.__mockFavorites) g.__mockFavorites = MOCK_FAVORITES
    return g.__mockFavorites
  }
  return MOCK_FAVORITES
}

export function getMockRecentlyViewed(): ExhibitionRecentlyViewed[] {
  if (typeof globalThis !== "undefined") {
    const g = globalThis as any
    if (!g.__mockRecentlyViewed) g.__mockRecentlyViewed = MOCK_RECENTLY_VIEWED
    return g.__mockRecentlyViewed
  }
  return MOCK_RECENTLY_VIEWED
}

export function getMockMeetings(): ExhibitionMeeting[] {
  if (typeof globalThis !== "undefined") {
    const g = globalThis as any
    if (!g.__mockMeetings) g.__mockMeetings = MOCK_MEETINGS
    return g.__mockMeetings
  }
  return MOCK_MEETINGS
}

export function getMockNotes(): ExhibitionVisitorNote[] {
  if (typeof globalThis !== "undefined") {
    const g = globalThis as any
    if (!g.__mockNotes) g.__mockNotes = MOCK_NOTES
    return g.__mockNotes
  }
  return MOCK_NOTES
}

// 1. Favorites Management
export async function getFavorites(visitorId: string): Promise<ExhibitionFavorite[]> {
  const mockFavs = getFavoritesWithRelations(getMockFavorites().filter((f) => f.visitorId === visitorId))
  return mockFavs
}

function getFavoritesWithRelations(favorites: ExhibitionFavorite[]): ExhibitionFavorite[] {
  const boothsMap = getMockBooths()
  const allBooths: ExhibitionBooth[] = []
  for (const slug in boothsMap) {
    allBooths.push(...boothsMap[slug])
  }

  return favorites.map(fav => {
    if (fav.targetType === "booth") {
      const booth = allBooths.find(b => b.id === fav.targetId) || null
      return { ...fav, booth }
    } else {
      let foundExhibit: ExhibitionExhibit | null = null
      const exhibitsMap = getMockExhibits()
      for (const bId in exhibitsMap) {
        const found = exhibitsMap[bId].find(e => e.id === fav.targetId)
        if (found) {
          foundExhibit = found
          break
        }
      }
      return { ...fav, exhibit: foundExhibit }
    }
  })
}

export async function addFavorite(visitorId: string, targetType: "booth" | "exhibit", targetId: string): Promise<ExhibitionFavorite> {
  const list = getMockFavorites()
  const existing = list.find(f => f.visitorId === visitorId && f.targetType === targetType && f.targetId === targetId)
  if (existing) return existing

  const newFav: ExhibitionFavorite = {
    id: `fav-${Math.random().toString(36).slice(2, 11)}`,
    visitorId,
    targetType,
    targetId,
    createdAt: new Date().toISOString()
  }
  list.push(newFav)
  return getFavoritesWithRelations([newFav])[0]
}

export async function removeFavorite(visitorId: string, targetType: "booth" | "exhibit", targetId: string): Promise<boolean> {
  const list = getMockFavorites()
  const idx = list.findIndex(f => f.visitorId === visitorId && f.targetType === targetType && f.targetId === targetId)
  if (idx !== -1) {
    list.splice(idx, 1)
    return true
  }
  return false
}

// 2. Recently Viewed Tracking
export async function getRecentlyViewed(visitorId: string): Promise<ExhibitionRecentlyViewed[]> {
  const list = getMockRecentlyViewed().filter(r => r.visitorId === visitorId)
  // Sort descending by viewedAt
  list.sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())

  const boothsMap = getMockBooths()
  const allBooths: ExhibitionBooth[] = []
  for (const slug in boothsMap) {
    allBooths.push(...boothsMap[slug])
  }

  return list.map(item => {
    if (item.targetType === "booth") {
      const booth = allBooths.find(b => b.id === item.targetId) || null
      return { ...item, booth }
    } else {
      let foundExhibit: ExhibitionExhibit | null = null
      const exhibitsMap = getMockExhibits()
      for (const bId in exhibitsMap) {
        const found = exhibitsMap[bId].find(e => e.id === item.targetId)
        if (found) {
          foundExhibit = found
          break
        }
      }
      return { ...item, exhibit: foundExhibit }
    }
  })
}

export async function trackRecentlyViewed(visitorId: string, targetType: "booth" | "exhibit", targetId: string): Promise<ExhibitionRecentlyViewed> {
  const list = getMockRecentlyViewed()
  // If already viewed, update timestamp. Keep unique to avoid clutter.
  const idx = list.findIndex(r => r.visitorId === visitorId && r.targetType === targetType && r.targetId === targetId)
  if (idx !== -1) {
    list[idx].viewedAt = new Date().toISOString()
    return list[idx]
  }

  const newItem: ExhibitionRecentlyViewed = {
    id: `viewed-${Math.random().toString(36).slice(2, 11)}`,
    visitorId,
    targetType,
    targetId,
    viewedAt: new Date().toISOString()
  }
  list.push(newItem)
  return newItem
}

// 3. Meetings Management
export async function getMeetings(visitorId: string): Promise<ExhibitionMeeting[]> {
  const list = getMockMeetings().filter(m => m.visitorId === visitorId)
  // Sort by date/time
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const boothsMap = getMockBooths()
  const allBooths: ExhibitionBooth[] = []
  for (const slug in boothsMap) {
    allBooths.push(...boothsMap[slug])
  }

  return list.map(m => {
    const booth = allBooths.find(b => b.id === m.boothId) || null
    return { ...m, booth }
  })
}

export async function createMeeting(
  visitorId: string,
  input: Omit<ExhibitionMeeting, "id" | "visitorId" | "status" | "createdAt" | "updatedAt">
): Promise<ExhibitionMeeting> {
  const list = getMockMeetings()
  const newMeeting: ExhibitionMeeting = {
    ...input,
    id: `meet-${Math.random().toString(36).slice(2, 11)}`,
    visitorId,
    status: "Pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  list.push(newMeeting)

  const boothsMap = getMockBooths()
  const allBooths: ExhibitionBooth[] = []
  for (const slug in boothsMap) {
    allBooths.push(...boothsMap[slug])
  }
  newMeeting.booth = allBooths.find(b => b.id === newMeeting.boothId) || null

  return newMeeting
}

export async function updateMeetingStatus(meetingId: string, status: ExhibitionMeetingStatus): Promise<ExhibitionMeeting> {
  const list = getMockMeetings()
  const idx = list.findIndex(m => m.id === meetingId)
  if (idx === -1) throw new Error(`Meeting not found: ${meetingId}`)
  list[idx].status = status
  list[idx].updatedAt = new Date().toISOString()
  return list[idx]
}

export async function rescheduleMeeting(meetingId: string, date: string, time: string, notes?: string): Promise<ExhibitionMeeting> {
  const list = getMockMeetings()
  const idx = list.findIndex(m => m.id === meetingId)
  if (idx === -1) throw new Error(`Meeting not found: ${meetingId}`)
  list[idx].preferredDate = date
  list[idx].preferredTime = time
  if (notes !== undefined) list[idx].notes = notes
  list[idx].updatedAt = new Date().toISOString()
  return list[idx]
}

// 4. Visitor Private Notes Management
export async function getVisitorNotes(visitorId: string, boothId?: string): Promise<ExhibitionVisitorNote[]> {
  const list = getMockNotes().filter(n => n.visitorId === visitorId)
  if (boothId) {
    return list.filter(n => n.boothId === boothId)
  }
  return list
}

export async function saveVisitorNote(visitorId: string, boothId: string, noteText: string, tags: string[]): Promise<ExhibitionVisitorNote> {
  const list = getMockNotes()
  const idx = list.findIndex(n => n.visitorId === visitorId && n.boothId === boothId)
  if (idx !== -1) {
    list[idx].noteText = noteText
    list[idx].tags = tags
    list[idx].updatedAt = new Date().toISOString()
    return list[idx]
  }

  const newNote: ExhibitionVisitorNote = {
    id: `note-${Math.random().toString(36).slice(2, 11)}`,
    visitorId,
    boothId,
    noteText,
    tags,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  list.push(newNote)
  return newNote
}

export async function deleteVisitorNote(visitorId: string, boothId: string): Promise<boolean> {
  const list = getMockNotes()
  const idx = list.findIndex(n => n.visitorId === visitorId && n.boothId === boothId)
  if (idx !== -1) {
    list.splice(idx, 1)
    return true
  }
  return false
}
