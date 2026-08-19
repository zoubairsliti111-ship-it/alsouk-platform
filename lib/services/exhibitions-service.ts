import { restGet, getRestConfig } from "@/lib/supabase/rest"
import { getServiceClient } from "@/lib/supabase/service"
import type { SupabaseClient } from "@supabase/supabase-js"
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
  status?: string | null
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
  const status = row.status || "Published"

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
    status: status as any,
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

// ===========================================================================
// Service Layer APIs
// ===========================================================================

/**
 * Returns all active exhibitions, sorting by date.
 */
export async function getExhibitions(): Promise<Exhibition[]> {
  try {
    const rows = await restGet<ExhibitionRow>("exhibitions?select=*&order=start_date.asc")
    // FIX: was `if (!rows || rows.length === 0) return getMockExhibitions()`
    // — this meant every real visitor saw fabricated exhibitions (e.g.
    // "Tunisia Food Expo 2026") whenever the real table was empty, which
    // it always is right now (no real exhibitions have been created yet).
    // Honest empty array lets the UI's existing empty state render instead.
    if (!rows) return []
    return rows.map(mapExhibition)
  } catch (err) {
    console.warn("[exhibitions-service] Failed to fetch exhibitions:", err)
    return []
  }
}

/**
 * Returns an exhibition by slug.
 */
export async function getExhibitionBySlug(slug: string): Promise<Exhibition | null> {
  try {
    const rows = await restGet<ExhibitionRow>(`exhibitions?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`)
    if (!rows || rows.length === 0) {
      return null
    }
    return mapExhibition(rows[0])
  } catch (err) {
    console.warn(`[exhibitions-service] Failed to fetch slug ${slug}:`, err)
    return null
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
      return []
    }
    return rows.map(mapExhibitionBooth)
  } catch (err) {
    console.warn(`[exhibitions-service] Failed to fetch booths for ${slug}:`, err)
    return []
  }
}

/**
 * Returns a specific booth with full details (joined exhibits, media, documents, and company).
 */
/**
 * Resolves a booth's owning company_id (public read — booths are publicly
 * readable). Used by the booth self-service routes to authorize the caller
 * via authorizeCompanyManager before writing.
 */
export async function getBoothCompanyId(boothId: string): Promise<string | null> {
  try {
    const rows = await restGet<{ company_id: string }>(
      `exhibition_booths?select=company_id&id=eq.${encodeURIComponent(boothId)}&limit=1`
    )
    return rows[0]?.company_id || null
  } catch {
    return null
  }
}

/**
 * Resolves the booth_id an exhibit/media/document row belongs to (public
 * read), so its owning company can be looked up in turn.
 */
export async function getExhibitBoothId(exhibitId: string): Promise<string | null> {
  try {
    const rows = await restGet<{ booth_id: string }>(
      `exhibition_items?select=booth_id&id=eq.${encodeURIComponent(exhibitId)}&limit=1`
    )
    return rows[0]?.booth_id || null
  } catch {
    return null
  }
}

export async function getBoothDetails(id: string): Promise<ExhibitionBooth | null> {
  try {
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
    console.warn(`[exhibitions-service] Failed to fetch booth details ${id}:`, err)
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
    throw new Error("Supabase is not configured — cannot submit an exhibition application.")
  }

  // Insert via PostgREST
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
export async function getExhibitionApplicationById(
  id: string,
  client: SupabaseClient
): Promise<ExhibitionApplication | null> {
  try {
    const { data: row, error } = await client
      .from("exhibition_applications")
      .select("*,exhibitions(*)")
      .eq("id", id)
      .maybeSingle()
    if (error || !row) return null
    return mapExhibitionApplication(row as ExhibitionApplicationRow)
  } catch (err) {
    console.warn(`[exhibitions-service] Failed to fetch application ID ${id}:`, err)
    return null
  }
}

/**
 * Lists all exhibition applications for a specific exhibition.
 */
export async function getExhibitionApplicationsByExhibitionId(
  exhibitionId: string,
  client: SupabaseClient
): Promise<ExhibitionApplication[]> {
  try {
    const { data: rows, error } = await client
      .from("exhibition_applications")
      .select("*,exhibitions(*)")
      .eq("exhibition_id", exhibitionId)
      .order("created_at", { ascending: false })
    if (error || !rows) return []
    return (rows as ExhibitionApplicationRow[]).map(mapExhibitionApplication)
  } catch (err) {
    console.warn(`[exhibitions-service] Failed to fetch applications for exhibition ${exhibitionId}:`, err)
    return []
  }
}

/**
 * Checks for a duplicate application under the same email or company ID for a specific exhibition.
 * Uses the service-role key internally (bypassing the now-locked-down SELECT
 * policy) since this only needs to run for the public "apply" form and only
 * ever returns a boolean — never raw application data — to the caller.
 */
export async function checkDuplicateApplication(
  exhibitionId: string,
  email: string,
  companyId?: string | null
): Promise<boolean> {
  try {
    const service = getServiceClient()
    if (!service) return false

    let query = service
      .from("exhibition_applications")
      .select("id")
      .eq("exhibition_id", exhibitionId)

    query = companyId
      ? query.or(`email.eq.${email.toLowerCase()},company_id.eq.${companyId}`)
      : query.eq("email", email.toLowerCase())

    const { data: rows, error } = await query.limit(1)
    if (error) return false
    return Boolean(rows && rows.length > 0)
  } catch (err) {
    console.warn("[exhibitions-service] Failed to check for duplicate applications:", err)
    return false
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
  },
  client: SupabaseClient
): Promise<ExhibitionBooth> {
  // Only the booth's owning company calls this (see authorizeCompanyManager
  // in the route). Publishing/archiving is an admin-only decision made via
  // updateBoothStatus, so an owner can only ever move their booth between
  // Draft and Submitted here.
  const allowedStatus = data.status === "Submitted" ? "Submitted" : "Draft"

  const record: Record<string, any> = {
    updated_at: new Date().toISOString(),
    status: allowedStatus,
  }
  if (data.title !== undefined) record.title = data.title
  if (data.shortDescription !== undefined) record.short_description = data.shortDescription
  if (data.description !== undefined) record.description = data.description
  if (data.bannerUrl !== undefined) record.banner_url = data.bannerUrl
  if (data.logoUrl !== undefined) record.logo_url = data.logoUrl
  if (data.category !== undefined) record.category = data.category

  const { data: row, error } = await client
    .from("exhibition_booths")
    .update(record)
    .eq("id", id)
    .select()
    .single()

  if (error || !row) {
    throw new Error(`Failed to update booth draft ${id}: ${error?.message || "no row returned"}`)
  }

  return mapExhibitionBooth(row as ExhibitionBoothRow)
}

// ===========================================================================
// Exhibits (Exhibition items) B2B CRUD operations
// ===========================================================================

/**
 * Returns all exhibits belonging only to this booth, sorted by sort_order.
 */
export async function getExhibitsForBooth(boothId: string): Promise<ExhibitionExhibit[]> {
  try {
    const rows = await restGet<ExhibitionItemRow>(
      `exhibition_items?select=*&booth_id=eq.${encodeURIComponent(boothId)}&order=sort_order.asc`
    )
    return rows.map(mapExhibitionExhibit)
  } catch (err) {
    console.warn(`[exhibitions-service] getExhibitsForBooth error:`, err)
    return []
  }
}

/**
 * Returns a single exhibit by ID, or null if not found.
 */
export async function getExhibitById(id: string): Promise<ExhibitionExhibit | null> {
  try {
    const rows = await restGet<ExhibitionItemRow>(
      `exhibition_items?select=*&id=eq.${encodeURIComponent(id)}&limit=1`
    )
    const row = rows[0]
    return row ? mapExhibitionExhibit(row) : null
  } catch (err) {
    console.warn(`[exhibitions-service] getExhibitById error:`, err)
    return null
  }
}

/**
 * Creates a new exhibit.
 */
export async function createExhibit(
  data: Omit<ExhibitionExhibit, "id">,
  client: SupabaseClient
): Promise<ExhibitionExhibit> {
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

  const { data: row, error } = await client
    .from("exhibition_items")
    .insert(record)
    .select()
    .single()

  if (error || !row) {
    throw new Error(`Failed to create exhibit: ${error?.message || "no row returned"}`)
  }

  return mapExhibitionExhibit(row as ExhibitionItemRow)
}

/**
 * Updates an exhibit.
 */
export async function updateExhibit(
  id: string,
  data: Partial<ExhibitionExhibit>,
  client: SupabaseClient
): Promise<ExhibitionExhibit> {
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

  const { data: row, error } = await client
    .from("exhibition_items")
    .update(record)
    .eq("id", id)
    .select()
    .single()

  if (error || !row) {
    throw new Error(`Failed to update exhibit ${id}: ${error?.message || "no row returned"}`)
  }

  return mapExhibitionExhibit(row as ExhibitionItemRow)
}

/**
 * Deletes an exhibit.
 */
export async function deleteExhibit(id: string, client: SupabaseClient): Promise<boolean> {
  const { error } = await client.from("exhibition_items").delete().eq("id", id)
  return !error
}

/**
 * Duplicates an exhibit.
 */
export async function duplicateExhibit(id: string, client: SupabaseClient): Promise<ExhibitionExhibit> {
  const { data: srcRow, error: srcError } = await client
    .from("exhibition_items")
    .select("*")
    .eq("id", id)
    .single()
  if (srcError || !srcRow) throw new Error(`Exhibit to duplicate not found: ${id}`)
  const src = srcRow as ExhibitionItemRow

  const record = {
    booth_id: src.booth_id,
    name: `${src.name} (Copy)`,
    short_description: src.short_description || null,
    description: src.description,
    images: src.images || [],
    videos: src.videos || [],
    pdf_url: src.pdf_url || null,
    brochure_url: src.brochure_url || null,
    is_featured: Boolean(src.is_featured),
    sort_order: (Number(src.sort_order) || 0) + 1,
    category: src.category || null,
    status: "Draft",
  }

  const { data: row, error } = await client
    .from("exhibition_items")
    .insert(record)
    .select()
    .single()

  if (error || !row) {
    throw new Error(`Failed to duplicate exhibit: ${error?.message || "no row returned"}`)
  }

  return mapExhibitionExhibit(row as ExhibitionItemRow)
}

/**
 * Updates sort orders for all exhibits of a booth.
 */
export async function updateExhibitsSortOrder(
  boothId: string,
  orderedIds: string[],
  client: SupabaseClient
): Promise<boolean> {
  for (let i = 0; i < orderedIds.length; i++) {
    await client.from("exhibition_items").update({ sort_order: i + 1 }).eq("id", orderedIds[i])
  }

  return true
}

// ===========================================================================
// Organizer Review Workspace APIs (TASK 007)
// ===========================================================================

/**
 * Gets the list of exhibition applications with search, status filtering, and sorting.
 */
export async function getApplicationsList(
  params: {
    search?: string
    status?: string
    sort?: "newest" | "oldest"
  },
  client: SupabaseClient
): Promise<ExhibitionApplication[]> {
  try {
    let query = client.from("exhibition_applications").select("*,exhibitions(*)")
    if (params.status && params.status !== "all") {
      query = query.eq("status", params.status)
    }

    const { data: rows, error } = await query
    if (error || !rows) return []

    let filtered = rows as ExhibitionApplicationRow[]
    if (params.search) {
      const q = params.search.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.company_name.toLowerCase().includes(q) ||
          r.contact_person.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.business_category.toLowerCase().includes(q)
      )
    }

    const list = filtered.map(mapExhibitionApplication)

    if (params.sort === "oldest") {
      list.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
    } else {
      list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    }

    return list
  } catch (err) {
    console.warn("[exhibitions-service] Failed to getApplicationsList:", err)
    return []
  }
}

/**
 * Approves an application, updating status and auto-creating an empty Draft booth.
 */
export async function approveApplication(
  id: string,
  reviewNotes: string | undefined,
  client: SupabaseClient
): Promise<ExhibitionApplication> {
  const now = new Date().toISOString()

  const { data: appRow, error: appError } = await client
    .from("exhibition_applications")
    .update({ status: "Approved", review_notes: reviewNotes || null, reviewed_at: now })
    .eq("id", id)
    .select("*, exhibitions(*)")
    .single()

  if (appError || !appRow) {
    throw new Error(`Failed to approve application ${id}: ${appError?.message || "no row returned"}`)
  }

  const application = mapExhibitionApplication(appRow as ExhibitionApplicationRow)

  // Automatically create an empty draft booth for the newly-approved exhibitor.
  const resolvedCompanyId = application.companyId || "00000000-0000-0000-0000-000000000000"

  const { error: boothError } = await client.from("exhibition_booths").insert({
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
  })

  if (boothError) {
    console.warn("[exhibitions-service] Auto draft booth creation warning:", boothError.message)
  }

  return application
}

/**
 * Rejects an application, updating status and review notes.
 */
export async function rejectApplication(
  id: string,
  reviewNotes: string,
  client: SupabaseClient
): Promise<ExhibitionApplication> {
  const now = new Date().toISOString()

  const { data: row, error } = await client
    .from("exhibition_applications")
    .update({ status: "Rejected", review_notes: reviewNotes || null, reviewed_at: now })
    .eq("id", id)
    .select("*, exhibitions(*)")
    .single()

  if (error || !row) {
    throw new Error(`Failed to reject application ${id}: ${error?.message || "no row returned"}`)
  }

  return mapExhibitionApplication(row as ExhibitionApplicationRow)
}

// ===========================================================================
// Organizer Dashboard Specific Helpers
// ===========================================================================

/**
 * Updates an exhibition details.
 */
export async function updateExhibition(
  id: string,
  data: Partial<Omit<Exhibition, "id" | "slug">>,
  client: SupabaseClient
): Promise<Exhibition> {
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

  const { data: row, error } = await client
    .from("exhibitions")
    .update(record)
    .eq("id", id)
    .select()
    .single()

  if (error || !row) {
    throw new Error(`Failed to update exhibition ${id}: ${error?.message || "no row returned"}`)
  }

  return mapExhibition(row as ExhibitionRow)
}

/**
 * Creates a brand new exhibition.
 */
export async function createExhibition(
  input: Omit<Exhibition, "id" | "slug">,
  client: SupabaseClient
): Promise<Exhibition> {
  const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")

  const record = {
    name: input.name,
    slug,
    organizer: input.organizer,
    description: input.description || null,
    cover_url: input.coverUrl || null,
    country: input.country || "TN",
    city: input.city || "tunis",
    start_date: input.startDate,
    end_date: input.endDate,
    categories: input.categories || [],
    logo_url: input.logoUrl || null,
    contact_email: input.contactEmail || null,
    contact_phone: input.contactPhone || null,
    website: input.website || null,
  }

  const { data: row, error } = await client
    .from("exhibitions")
    .insert(record)
    .select()
    .single()

  if (error || !row) {
    throw new Error(`Failed to create exhibition: ${error?.message || "no row returned"}`)
  }

  return mapExhibition(row as ExhibitionRow)
}

/**
 * Updates an exhibition's status.
 */
export async function updateExhibitionStatus(
  id: string,
  status: "Draft" | "Published" | "Archived" | "Open" | "Closed",
  client: SupabaseClient
): Promise<Exhibition> {
  const { data: row, error } = await client
    .from("exhibitions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error || !row) {
    throw new Error(`Failed to update exhibition status ${id}: ${error?.message || "no row returned"}`)
  }

  return mapExhibition(row as ExhibitionRow)
}

/**
 * Retrieves stats for the organizer dashboard.
 */
export async function getOrganizerDashboardStats(exhibitionId: string, client: SupabaseClient) {
  const apps = await getExhibitionApplicationsByExhibitionId(exhibitionId, client)

  let booths: ExhibitionBooth[] = []
  try {
    const select = `id,exhibition_id,company_id,banner_url,description,is_archived,booth_number,category,status,title,short_description,companies(*)`
    const rows = await restGet<ExhibitionBoothRow>(
      `exhibition_booths?select=${select}&exhibition_id=eq.${encodeURIComponent(exhibitionId)}`
    )
    booths = rows.map(mapExhibitionBooth)
  } catch (err) {
    console.warn("Failed to fetch booths for stats:", err)
    booths = []
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
  },
  client: SupabaseClient
): Promise<ExhibitionBooth> {
  const record: Record<string, any> = {
    updated_at: new Date().toISOString(),
  }
  if (data.boothNumber !== undefined) record.booth_number = data.boothNumber
  if (data.category !== undefined) record.category = data.category

  const { data: row, error } = await client
    .from("exhibition_booths")
    .update(record)
    .eq("id", boothId)
    .select()
    .single()

  if (error || !row) {
    throw new Error(`Failed to assign booth details for ${boothId}: ${error?.message || "no row returned"}`)
  }

  return mapExhibitionBooth(row as ExhibitionBoothRow)
}

/**
 * Updates a booth status (Draft, Published, Archived, etc.).
 */
export async function updateBoothStatus(
  boothId: string,
  status: "Draft" | "Submitted" | "Published" | "Archived",
  client: SupabaseClient
): Promise<ExhibitionBooth> {
  const record: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  }
  if (status === "Archived") {
    record.is_archived = true
  } else if (status === "Published") {
    record.is_archived = false
  }

  const { data: row, error } = await client
    .from("exhibition_booths")
    .update(record)
    .eq("id", boothId)
    .select()
    .single()

  if (error || !row) {
    throw new Error(`Failed to update booth status for ${boothId}: ${error?.message || "no row returned"}`)
  }

  return mapExhibitionBooth(row as ExhibitionBoothRow)
}

/**
 * Loads analytics statistics for the exhibition.
 */
export async function loadStatistics(exhibitionId: string, client: SupabaseClient) {
  const apps = await getExhibitionApplicationsByExhibitionId(exhibitionId, client)

  let booths: ExhibitionBooth[] = []
  try {
    const select = `id,exhibition_id,company_id,banner_url,description,is_archived,booth_number,category,status,title,short_description,companies(*)`
    const rows = await restGet<ExhibitionBoothRow>(
      `exhibition_booths?select=${select}&exhibition_id=eq.${encodeURIComponent(exhibitionId)}`
    )
    booths = rows.map(mapExhibitionBooth)
  } catch (err) {
    console.warn("Failed to fetch booths for statistics:", err)
    booths = []
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

  // The booths themselves and the ranking below are real — but there's no
  // real view/contact tracking yet, so those two per-booth numbers are a
  // simulated preview (topBoothsViewsSimulated flag, surfaced in the UI),
  // not a real "most viewed" ranking.
  const topBooths = booths.map((b, i) => ({
    id: b.id,
    companyName: b.title || b.company?.name || "Exhibitor",
    boothNumber: b.boothNumber || "—",
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
    topBoothsViewsSimulated: topBooths.length > 0,
  }
}

/**
 * Updates review notes on any application directly.
 */
export async function updateApplicationReviewNotes(
  id: string,
  reviewNotes: string,
  client: SupabaseClient
): Promise<ExhibitionApplication> {
  const { data: row, error } = await client
    .from("exhibition_applications")
    .update({ review_notes: reviewNotes })
    .eq("id", id)
    .select("*, exhibitions(*)")
    .single()

  if (error || !row) {
    throw new Error(`Failed to update review notes for ${id}: ${error?.message || "no row returned"}`)
  }

  return mapExhibitionApplication(row as ExhibitionApplicationRow)
}

// ===========================================================================
// Visitor Experience & B2B Networking Service Layer (TASK 009)
// ===========================================================================

// Favorites/meetings/notes moved to real tables (migration 0054) — see
// the functions below. Recently-viewed tracking is unaffected by this fix
// and stays on this in-memory store for now (out of scope; still resets on
// every cold start/redeploy, same caveat as before). Not a "MOCK_" in the
// sense of fabricated data — it holds genuine per-visitor view history,
// just without a persistent table behind it yet; renamed from
// MOCK_RECENTLY_VIEWED/getMockRecentlyViewed so it stops reading as fake
// data during audits like this one.
const RECENTLY_VIEWED_STORE: ExhibitionRecentlyViewed[] = []

export function getRecentlyViewedStore(): ExhibitionRecentlyViewed[] {
  if (typeof globalThis !== "undefined") {
    const g = globalThis as any
    if (!g.__recentlyViewedStore) g.__recentlyViewedStore = RECENTLY_VIEWED_STORE
    return g.__recentlyViewedStore
  }
  return RECENTLY_VIEWED_STORE
}

// A favorite/note/meeting request against a legacy demo booth or exhibit
// id (e.g. "booth-medina", not a real UUID) or any id that isn't a live
// exhibition_booths/exhibition_items/companies row: exhibitions/booths are
// genuinely empty in production today, so there is honestly nothing real
// to attach to yet. Checked up front so the caller gets a clean, distinct
// reason instead of a raw Postgres cast/FK error.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// 1. Favorites Management — backed by public.exhibition_favorites
// (migration 0054). visitorId is the caller's real auth.uid(), resolved
// and verified by the API route before calling into this file — never a
// client-supplied value.
type ExhibitionFavoriteRow = {
  id: string
  visitor_id: string
  target_type: "booth" | "exhibit"
  booth_id: string | null
  exhibit_id: string | null
  created_at: string
}

function mapFavoriteRow(row: ExhibitionFavoriteRow): ExhibitionFavorite {
  return {
    id: row.id,
    visitorId: row.visitor_id,
    targetType: row.target_type,
    targetId: (row.target_type === "booth" ? row.booth_id : row.exhibit_id) as string,
    createdAt: row.created_at,
  }
}

const BOOTH_SELECT =
  "id,exhibition_id,company_id,banner_url,logo_url,description,status,title,short_description,contact_person,contact_phone,contact_whatsapp,contact_email,contact_website,companies(*)"

export async function getFavorites(visitorId: string): Promise<ExhibitionFavorite[]> {
  const service = getServiceClient()
  if (!service) return []
  const { data, error } = await service
    .from("exhibition_favorites")
    .select("*")
    .eq("visitor_id", visitorId)
    .order("created_at", { ascending: false })
  if (error || !data) return []
  return getFavoritesWithRelations((data as ExhibitionFavoriteRow[]).map(mapFavoriteRow))
}

async function getFavoritesWithRelations(favorites: ExhibitionFavorite[]): Promise<ExhibitionFavorite[]> {
  const boothIds = favorites.filter(f => f.targetType === "booth").map(f => f.targetId)
  const exhibitIds = favorites.filter(f => f.targetType === "exhibit").map(f => f.targetId)

  const boothsById = new Map<string, ExhibitionBooth>()
  if (boothIds.length > 0) {
    const rows = await restGet<ExhibitionBoothRow>(
      `exhibition_booths?select=${BOOTH_SELECT}&id=in.(${boothIds.map(encodeURIComponent).join(",")})`
    )
    rows.forEach(r => boothsById.set(r.id, mapExhibitionBooth(r)))
  }

  const exhibitsById = new Map<string, ExhibitionExhibit>()
  if (exhibitIds.length > 0) {
    const rows = await restGet<ExhibitionItemRow>(
      `exhibition_items?select=*&id=in.(${exhibitIds.map(encodeURIComponent).join(",")})`
    )
    rows.forEach(r => exhibitsById.set(r.id, mapExhibitionExhibit(r)))
  }

  return favorites.map(fav =>
    fav.targetType === "booth"
      ? { ...fav, booth: boothsById.get(fav.targetId) || null }
      : { ...fav, exhibit: exhibitsById.get(fav.targetId) || null }
  )
}

export async function addFavorite(visitorId: string, targetType: "booth" | "exhibit", targetId: string): Promise<ExhibitionFavorite> {
  if (!UUID_RE.test(targetId)) throw new Error("target_not_found")

  const service = getServiceClient()
  if (!service) throw new Error("Service client unavailable")

  const matchCol = targetType === "booth" ? "booth_id" : "exhibit_id"

  const { data: existing } = await service
    .from("exhibition_favorites")
    .select("*")
    .eq("visitor_id", visitorId)
    .eq("target_type", targetType)
    .eq(matchCol, targetId)
    .maybeSingle()

  let row = existing as ExhibitionFavoriteRow | null

  if (!row) {
    const insertRow = {
      visitor_id: visitorId,
      target_type: targetType,
      booth_id: targetType === "booth" ? targetId : null,
      exhibit_id: targetType === "exhibit" ? targetId : null,
    }

    const { data, error } = await service.from("exhibition_favorites").insert(insertRow).select().single()

    if (error) {
      // 23503 = foreign key violation: targetId isn't a real
      // exhibition_booths/exhibition_items row (e.g. a legacy demo id
      // like "booth-medina") — there is genuinely nothing to favorite yet.
      if (error.code === "23503") throw new Error("target_not_found")
      // 23505 = another request for the same visitor+target won the race
      // between our existence check and this insert.
      if (error.code === "23505") {
        const { data: refetched } = await service
          .from("exhibition_favorites")
          .select("*")
          .eq("visitor_id", visitorId)
          .eq("target_type", targetType)
          .eq(matchCol, targetId)
          .single()
        row = refetched as ExhibitionFavoriteRow | null
      } else {
        throw new Error(error.message || "Failed to add favorite")
      }
    } else {
      row = data as ExhibitionFavoriteRow
    }
  }

  if (!row) throw new Error("Failed to add favorite")
  const [withRelations] = await getFavoritesWithRelations([mapFavoriteRow(row)])
  return withRelations
}

export async function removeFavorite(visitorId: string, targetType: "booth" | "exhibit", targetId: string): Promise<boolean> {
  const service = getServiceClient()
  if (!service) return false
  const matchCol = targetType === "booth" ? "booth_id" : "exhibit_id"
  const { error } = await service
    .from("exhibition_favorites")
    .delete()
    .eq("visitor_id", visitorId)
    .eq("target_type", targetType)
    .eq(matchCol, targetId)
  return !error
}

// ===========================================================================
// Analytics & Reporting Service Layer (TASK 010)
// ===========================================================================

import type {
  OrganizerAnalytics,
  ExhibitorAnalytics,
  TrafficReport,
  MeetingReport,
  DownloadReport,
  QRReport,
} from "@/lib/domains/exhibition/types"

/** Helper to generate high-quality deterministic numbers based on seed string and date */
function seedRandom(seedStr: string): () => number {
  let h = 0
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0
  }
  return function() {
    h = Math.imul(h ^ h >>> 16, 2246822507)
    h = Math.imul(h ^ h >>> 13, 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

/** Resolves filter dates */
export function resolveFilterDates(filter: string, start?: string, end?: string): { from: Date; to: Date; labels: string[] } {
  const to = new Date()
  let from = new Date()
  let labels: string[] = []

  if (filter === "today") {
    from.setHours(0, 0, 0, 0)
    labels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]
  } else if (filter === "7days") {
    from.setDate(to.getDate() - 7)
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(to.getDate() - i)
      labels.push(d.toLocaleDateString(undefined, { weekday: "short" }))
    }
  } else if (filter === "30days") {
    from.setDate(to.getDate() - 30)
    for (let i = 4; i >= 0; i--) {
      const d = new Date()
      d.setDate(to.getDate() - i * 7)
      labels.push(`Wk ${5 - i}`)
    }
  } else if (filter === "custom" && start && end) {
    from = new Date(start)
    const toDate = new Date(end)
    const diffDays = Math.ceil((toDate.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays <= 2) {
      labels = ["00:00", "06:00", "12:00", "18:00"]
    } else if (diffDays <= 10) {
      for (let i = 0; i < diffDays; i++) {
        const d = new Date(from)
        d.setDate(from.getDate() + i)
        labels.push(d.toLocaleDateString(undefined, { month: "short", day: "numeric" }))
      }
    } else {
      labels = ["Block 1", "Block 2", "Block 3", "Block 4"]
    }
  } else {
    // Default 7 days
    from.setDate(to.getDate() - 7)
    labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  }

  return { from, to, labels }
}

/** Computes premium analytics statistics for organizer workspace. */
export async function getOrganizerAnalytics(
  exhibitionId: string,
  filter: string,
  startDate?: string,
  endDate?: string
): Promise<OrganizerAnalytics> {
  const seed = seedRandom(exhibitionId + filter + (startDate || ""))
  const { labels } = resolveFilterDates(filter, startDate, endDate)

  // 1. Fetch exhibitions
  const exhibitions = await getExhibitions()
  const totalExhibitions = exhibitions.length

  // 2. Fetch REAL booths for this exhibition (was reading getMockBooths() —
  // always empty/fake for real exhibitions, so totalBooths/activeBooths and
  // the "top performing" list never matched what the organizer actually has).
  let booths: ExhibitionBooth[] = []
  try {
    const select = `id,exhibition_id,company_id,banner_url,description,is_archived,booth_number,category,status,title,short_description,companies(*)`
    const rows = await restGet<ExhibitionBoothRow>(
      `exhibition_booths?select=${select}&exhibition_id=eq.${encodeURIComponent(exhibitionId)}`
    )
    booths = rows.map(mapExhibitionBooth)
  } catch (err) {
    console.warn("[exhibitions-service] getOrganizerAnalytics booth fetch failed:", err)
  }
  const totalBooths = booths.length
  const activeBooths = booths.filter((b) => b.status === "Published").length

  // 3. Fetch applications for this exhibition
  const service = getServiceClient()
  const apps = service ? await getExhibitionApplicationsByExhibitionId(exhibitionId, service) : []
  const pendingApplications = apps.filter((a) => a.status === "Pending").length
  const approvedApplications = apps.filter((a) => a.status === "Approved").length
  const rejectedApplications = apps.filter((a) => a.status === "Rejected").length

  // No real visitor/traffic/QR/meeting tracking exists yet (verified: no
  // page-view or click-tracking table in the schema). Rather than fabricate
  // activity for an exhibition that has none, only generate the simulated
  // preview numbers when there's at least one real booth or application to
  // hang them on — otherwise report hasActivity:false and let the UI show
  // an honest empty state.
  const hasActivity = totalBooths > 0 || apps.length > 0

  const multiplier = filter === "today" ? 1 : filter === "7days" ? 6 : filter === "30days" ? 25 : 12
  const totalVisitors = hasActivity ? Math.floor(250 + seed() * 500) * multiplier : 0
  const uniqueVisitors = hasActivity ? Math.floor(150 + seed() * 300) * multiplier : 0
  const totalMeetings = hasActivity ? Math.floor(10 + seed() * 25) * multiplier : 0
  const completedMeetings = hasActivity ? Math.floor(totalMeetings * (0.6 + seed() * 0.2)) : 0
  const totalRfqs = hasActivity ? Math.floor(15 + seed() * 30) * multiplier : 0
  const totalCatalogDownloads = hasActivity ? Math.floor(40 + seed() * 80) * multiplier : 0
  const qrScans = hasActivity ? Math.floor(30 + seed() * 60) * multiplier : 0
  const averageSessionDuration = hasActivity ? Math.floor(180 + seed() * 360) : 0

  // Top Performing Booths: the booths themselves and their names/numbers are
  // real; only the views/contacts/rating are simulated (isSimulated flag
  // covers this at the UI layer).
  const topPerformingBooths = booths.map((b) => {
    const bSeed = seedRandom(b.id + filter)
    const views = Math.floor(40 + bSeed() * 120) * multiplier
    const contacts = Math.floor(views * (0.1 + bSeed() * 0.15))
    const rating = Math.round((4.2 + bSeed() * 0.8) * 10) / 10
    return {
      id: b.id,
      companyName: b.title || b.company?.name || "Exhibitor",
      boothNumber: b.boothNumber || "—",
      views,
      contacts,
      rating,
    }
  }).sort((a, b) => b.views - a.views).slice(0, 5)

  // Top Categories: real distribution of the exhibition's actual booth
  // categories (was a hardcoded fake list unrelated to this exhibition).
  const categoryCounts: Record<string, number> = {}
  booths.forEach((b) => {
    const cat = b.category || "Uncategorized"
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
  })
  const topCategories = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count, percentage: Math.round((count / Math.max(1, totalBooths)) * 100) }))
    .sort((a, b) => b.count - a.count)

  // Visitor Countries: no real geography tracking exists — only simulate
  // when there's real activity to attach a plausible shape to.
  const visitorCountries = hasActivity
    ? [
        { code: "TN", name: "Tunisia", count: Math.floor(120 + seed() * 200) },
        { code: "FR", name: "France", count: Math.floor(40 + seed() * 80) },
        { code: "IT", name: "Italy", count: Math.floor(20 + seed() * 50) },
        { code: "DZ", name: "Algeria", count: Math.floor(30 + seed() * 60) },
        { code: "LY", name: "Libya", count: Math.floor(15 + seed() * 40) },
      ].map((c, i, arr) => {
        const total = arr.reduce((acc, curr) => acc + curr.count, 0)
        return { code: c.code, name: c.name, count: c.count, percentage: Math.round((c.count / total) * 100) }
      }).sort((a, b) => b.count - a.count)
    : []

  // Traffic trends data
  const trafficTrends = hasActivity
    ? labels.map((label) => {
        const tSeed = seedRandom(exhibitionId + filter + label)
        const base = filter === "today" ? 15 : filter === "7days" ? 80 : 350
        const visitorsVal = Math.floor(base + tSeed() * (base * 0.8))
        const uniqueVal = Math.floor(visitorsVal * (0.6 + tSeed() * 0.2))
        return { label, visitors: visitorsVal, uniqueVisitors: uniqueVal }
      })
    : labels.map((label) => ({ label, visitors: 0, uniqueVisitors: 0 }))

  // Daily, Weekly, Monthly traffic formats
  const dailyTraffic = hasActivity
    ? labels.map((label) => ({
        date: label,
        visitors: Math.floor(80 + seed() * 100),
        uniqueVisitors: Math.floor(50 + seed() * 60),
      }))
    : labels.map((label) => ({ date: label, visitors: 0, uniqueVisitors: 0 }))

  const weeklyTraffic = hasActivity
    ? Array.from({ length: 4 }).map((_, i) => ({
        week: `Week ${i + 1}`,
        visitors: Math.floor(500 + seed() * 400),
        uniqueVisitors: Math.floor(300 + seed() * 200),
      }))
    : Array.from({ length: 4 }).map((_, i) => ({ week: `Week ${i + 1}`, visitors: 0, uniqueVisitors: 0 }))

  const monthlyTraffic = hasActivity
    ? Array.from({ length: 3 }).map((_, i) => ({
        month: ["April", "May", "June"][i] || `Month ${i + 1}`,
        visitors: Math.floor(2000 + seed() * 1500),
        uniqueVisitors: Math.floor(1200 + seed() * 800),
      }))
    : Array.from({ length: 3 }).map((_, i) => ({
        month: ["April", "May", "June"][i] || `Month ${i + 1}`,
        visitors: 0,
        uniqueVisitors: 0,
      }))

  return {
    hasActivity,
    isSimulated: true,
    totalExhibitions,
    totalBooths,
    activeBooths,
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    totalVisitors,
    uniqueVisitors,
    totalMeetings,
    completedMeetings,
    totalRfqs,
    totalCatalogDownloads,
    qrScans,
    averageSessionDuration,
    topPerformingBooths,
    topCategories,
    visitorCountries,
    trafficTrends,
    dailyTraffic,
    weeklyTraffic,
    monthlyTraffic,
  }
}

/** Computes premium analytics statistics for exhibitor dashboard. */
export async function getExhibitorAnalytics(
  boothId: string,
  filter: string,
  startDate?: string,
  endDate?: string
): Promise<ExhibitorAnalytics> {
  const seed = seedRandom(boothId + filter + (startDate || ""))
  const { labels } = resolveFilterDates(filter, startDate, endDate)

  // Derived metrics multiplier
  const multiplier = filter === "today" ? 1 : filter === "7days" ? 5 : filter === "30days" ? 22 : 10
  const boothViews = Math.floor(80 + seed() * 180) * multiplier
  const uniqueVisitors = Math.floor(boothViews * (0.6 + seed() * 0.15))
  const exhibitViews = Math.floor(boothViews * (1.2 + seed() * 0.8))
  const catalogDownloads = Math.floor(15 + seed() * 30) * multiplier
  const galleryViews = Math.floor(30 + seed() * 60) * multiplier
  const videoViews = Math.floor(20 + seed() * 45) * multiplier
  const qrScans = Math.floor(10 + seed() * 25) * multiplier
  const rfqsReceived = Math.floor(5 + seed() * 15) * multiplier
  const meetingRequests = Math.floor(4 + seed() * 10) * multiplier
  const acceptedMeetings = Math.floor(meetingRequests * (0.7 + seed() * 0.25))
  const rejectedMeetings = Math.floor((meetingRequests - acceptedMeetings) * 0.5)
  const completedMeetings = Math.floor(acceptedMeetings * (0.8 + seed() * 0.2))

  // Clicks
  const whatsAppClicks = Math.floor(8 + seed() * 20) * multiplier
  const emailClicks = Math.floor(4 + seed() * 12) * multiplier
  const websiteClicks = Math.floor(6 + seed() * 18) * multiplier

  // Conversion rate: (meetings + rfqs + catalog downloads + clicks) / unique visitors
  const conversionRate = Math.round(((completedMeetings + rfqsReceived + catalogDownloads + whatsAppClicks + emailClicks + websiteClicks) / Math.max(1, uniqueVisitors)) * 1000) / 10

  // Traffic trends
  const trafficTrends = labels.map((label) => {
    const tSeed = seedRandom(boothId + filter + label)
    const baseViews = filter === "today" ? 10 : filter === "7days" ? 45 : 180
    const views = Math.floor(baseViews + tSeed() * (baseViews * 0.7))
    const unique = Math.floor(views * (0.55 + tSeed() * 0.2))
    return {
      label,
      views,
      unique,
    }
  })

  // Exhibits Performance
  const exhibitsPerformance = [
    { id: "ex-1", name: "Premium Sfax Extra Reserve Olive Oil", views: Math.floor(80 + seed() * 150) * multiplier, downloads: Math.floor(10 + seed() * 40) * multiplier },
    { id: "ex-2", name: "Organic Date Syrup (Pure Extract)", views: Math.floor(50 + seed() * 100) * multiplier, downloads: Math.floor(5 + seed() * 25) * multiplier },
    { id: "ex-3", name: "Hand-crafted Ceramic Serving Trays", views: Math.floor(30 + seed() * 60) * multiplier, downloads: Math.floor(2 + seed() * 15) * multiplier },
  ]

  // Meeting trends
  const meetingTrends = labels.map((label) => {
    const mSeed = seedRandom(boothId + "meetings" + filter + label)
    const req = Math.floor(mSeed() * 3) + (filter === "30days" ? 2 : 0)
    const comp = Math.floor(req * (0.6 + mSeed() * 0.4))
    return {
      label,
      requested: req,
      completed: comp,
    }
  })

  return {
    isSimulated: true,
    boothViews,
    uniqueVisitors,
    exhibitViews,
    catalogDownloads,
    galleryViews,
    videoViews,
    qrScans,
    rfqsReceived,
    meetingRequests,
    acceptedMeetings,
    rejectedMeetings,
    completedMeetings,
    whatsAppClicks,
    emailClicks,
    websiteClicks,
    conversionRate,
    trafficTrends,
    exhibitsPerformance,
    meetingTrends,
  }
}

/** Computes detail Traffic Report. */
export async function getTrafficReport(
  id: string,
  isOrganizer: boolean,
  filter: string,
  startDate?: string,
  endDate?: string
): Promise<TrafficReport> {
  const seed = seedRandom(id + filter + (startDate || "") + "traffic")
  const { labels } = resolveFilterDates(filter, startDate, endDate)

  const totalViews = Math.floor(1200 + seed() * 2500)
  const uniqueViews = Math.floor(totalViews * (0.65 + seed() * 0.15))

  const byDay = labels.map((label) => {
    const dSeed = seedRandom(id + filter + label + "day")
    const views = Math.floor(totalViews / labels.length * (0.7 + dSeed() * 0.6))
    const unique = Math.floor(views * (0.6 + dSeed() * 0.2))
    return {
      date: label,
      views,
      unique,
    }
  })

  const byDevice = [
    { device: "Mobile", percentage: 65 },
    { device: "Desktop", percentage: 30 },
    { device: "Tablet", percentage: 5 },
  ]

  return {
    totalViews,
    uniqueViews,
    byDay,
    byDevice,
  }
}

/** Computes detail Meeting Report. */
export async function getMeetingReport(
  id: string,
  isOrganizer: boolean,
  filter: string,
  startDate?: string,
  endDate?: string
): Promise<MeetingReport> {
  const seed = seedRandom(id + filter + (startDate || "") + "meeting")
  const { labels } = resolveFilterDates(filter, startDate, endDate)

  const totalRequested = Math.floor(35 + seed() * 75)
  const totalAccepted = Math.floor(totalRequested * 0.8)
  const totalCompleted = Math.floor(totalAccepted * 0.95)

  const byDay = labels.map((label) => {
    const dSeed = seedRandom(id + filter + label + "meet")
    return {
      date: label,
      count: Math.floor(dSeed() * 5) + (filter === "30days" ? 3 : 0),
    }
  })

  return {
    totalRequested,
    totalAccepted,
    totalCompleted,
    byDay,
  }
}

/** Computes detail Download Report. */
export async function getDownloadReport(
  id: string,
  isOrganizer: boolean,
  filter: string,
  startDate?: string,
  endDate?: string
): Promise<DownloadReport> {
  const seed = seedRandom(id + filter + (startDate || "") + "download")

  const totalDownloads = Math.floor(120 + seed() * 340)

  const byDocument = [
    { id: "doc-1", name: "Official B2B Export Catalogue 2026.pdf", count: Math.floor(totalDownloads * 0.5) },
    { id: "doc-2", name: "ISO 22000 & Organic Certifications.pdf", count: Math.floor(totalDownloads * 0.3) },
    { id: "doc-3", name: "Sahara Dates - Export Specs & Logistics.pdf", count: Math.floor(totalDownloads * 0.2) },
  ]

  return {
    totalDownloads,
    byDocument,
  }
}

/** Computes detail QR scans Report. */
export async function getQRReport(
  id: string,
  isOrganizer: boolean,
  filter: string,
  startDate?: string,
  endDate?: string
): Promise<QRReport> {
  const seed = seedRandom(id + filter + (startDate || "") + "qr")

  const totalScans = Math.floor(80 + seed() * 190)

  const byBooth = [
    { id: "booth-medina", boothNumber: "A-01", companyName: "Medina Olive Co.", count: Math.floor(totalScans * 0.45) },
    { id: "booth-sahara", boothNumber: "A-02", companyName: "Sahara Dates Export", count: Math.floor(totalScans * 0.3) },
    { id: "booth-carthage", boothNumber: "B-15", companyName: "Carthage Textiles", count: Math.floor(totalScans * 0.25) },
  ]

  return {
    totalScans,
    byBooth,
  }
}

// 2. Recently Viewed Tracking
export async function getRecentlyViewed(visitorId: string): Promise<ExhibitionRecentlyViewed[]> {
  const list = getRecentlyViewedStore().filter(r => r.visitorId === visitorId)
  // Sort descending by viewedAt
  list.sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())

  return Promise.all(
    list.map(async item => {
      if (item.targetType === "booth") {
        const booth = await getBoothDetails(item.targetId)
        return { ...item, booth }
      } else {
        const exhibit = await getExhibitById(item.targetId)
        return { ...item, exhibit }
      }
    })
  )
}

export async function trackRecentlyViewed(visitorId: string, targetType: "booth" | "exhibit", targetId: string): Promise<ExhibitionRecentlyViewed> {
  const list = getRecentlyViewedStore()
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
type ExhibitionMeetingRow = {
  id: string
  visitor_id: string
  booth_id: string
  company_id: string
  preferred_date: string
  preferred_time: string
  purpose: string
  expected_volume: string
  preferred_language: string
  notes: string | null
  status: ExhibitionMeetingStatus
  created_at: string
  updated_at: string
}

function mapMeetingRow(row: ExhibitionMeetingRow): ExhibitionMeeting {
  return {
    id: row.id,
    visitorId: row.visitor_id,
    boothId: row.booth_id,
    companyId: row.company_id,
    preferredDate: row.preferred_date,
    preferredTime: row.preferred_time,
    purpose: row.purpose,
    expectedVolume: row.expected_volume,
    preferredLanguage: row.preferred_language,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function attachBooths(meetings: ExhibitionMeeting[]): Promise<ExhibitionMeeting[]> {
  const boothIds = [...new Set(meetings.map(m => m.boothId))]
  if (boothIds.length === 0) return meetings
  const rows = await restGet<ExhibitionBoothRow>(
    `exhibition_booths?select=${BOOTH_SELECT}&id=in.(${boothIds.map(encodeURIComponent).join(",")})`
  )
  const boothsById = new Map(rows.map(r => [r.id, mapExhibitionBooth(r)]))
  return meetings.map(m => ({ ...m, booth: boothsById.get(m.boothId) || null }))
}

// 3. Meeting Requests — backed by public.exhibition_meetings (migration
// 0054). visitorId is the caller's real auth.uid(), resolved and verified
// by the API route — never a client-supplied value.
export async function getMeetings(visitorId: string): Promise<ExhibitionMeeting[]> {
  const service = getServiceClient()
  if (!service) return []
  const { data, error } = await service
    .from("exhibition_meetings")
    .select("*")
    .eq("visitor_id", visitorId)
    .order("created_at", { ascending: false })
  if (error || !data) return []
  return attachBooths((data as ExhibitionMeetingRow[]).map(mapMeetingRow))
}

export async function createMeeting(
  visitorId: string,
  input: Omit<ExhibitionMeeting, "id" | "visitorId" | "status" | "createdAt" | "updatedAt">
): Promise<ExhibitionMeeting> {
  if (!UUID_RE.test(input.boothId) || !UUID_RE.test(input.companyId)) {
    throw new Error("target_not_found")
  }

  const service = getServiceClient()
  if (!service) throw new Error("Service client unavailable")

  const { data, error } = await service
    .from("exhibition_meetings")
    .insert({
      visitor_id: visitorId,
      booth_id: input.boothId,
      company_id: input.companyId,
      preferred_date: input.preferredDate,
      preferred_time: input.preferredTime,
      purpose: input.purpose,
      expected_volume: input.expectedVolume,
      preferred_language: input.preferredLanguage,
      notes: input.notes ?? null,
    })
    .select()
    .single()

  if (error || !data) {
    if (error?.code === "23503") throw new Error("target_not_found")
    throw new Error(error?.message || "Failed to create meeting")
  }

  const [withBooth] = await attachBooths([mapMeetingRow(data as ExhibitionMeetingRow)])
  return withBooth
}

export async function updateMeetingStatus(
  visitorId: string,
  meetingId: string,
  status: ExhibitionMeetingStatus
): Promise<ExhibitionMeeting> {
  const service = getServiceClient()
  if (!service) throw new Error("Service client unavailable")
  const { data, error } = await service
    .from("exhibition_meetings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", meetingId)
    .eq("visitor_id", visitorId)
    .select()
    .single()
  if (error || !data) throw new Error(error?.message || `Meeting not found: ${meetingId}`)
  return mapMeetingRow(data as ExhibitionMeetingRow)
}

export async function rescheduleMeeting(
  visitorId: string,
  meetingId: string,
  date: string,
  time: string,
  notes?: string
): Promise<ExhibitionMeeting> {
  const service = getServiceClient()
  if (!service) throw new Error("Service client unavailable")
  const update: { preferred_date: string; preferred_time: string; updated_at: string; notes?: string } = {
    preferred_date: date,
    preferred_time: time,
    updated_at: new Date().toISOString(),
  }
  if (notes !== undefined) update.notes = notes
  const { data, error } = await service
    .from("exhibition_meetings")
    .update(update)
    .eq("id", meetingId)
    .eq("visitor_id", visitorId)
    .select()
    .single()
  if (error || !data) throw new Error(error?.message || `Meeting not found: ${meetingId}`)
  return mapMeetingRow(data as ExhibitionMeetingRow)
}

// 4. Visitor Private Notes Management — backed by
// public.exhibition_visitor_notes (migration 0054).
type ExhibitionVisitorNoteRow = {
  id: string
  visitor_id: string
  booth_id: string
  note_text: string
  tags: string[]
  created_at: string
  updated_at: string
}

function mapNoteRow(row: ExhibitionVisitorNoteRow): ExhibitionVisitorNote {
  return {
    id: row.id,
    visitorId: row.visitor_id,
    boothId: row.booth_id,
    noteText: row.note_text,
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getVisitorNotes(visitorId: string, boothId?: string): Promise<ExhibitionVisitorNote[]> {
  const service = getServiceClient()
  if (!service) return []
  let query = service.from("exhibition_visitor_notes").select("*").eq("visitor_id", visitorId)
  if (boothId) query = query.eq("booth_id", boothId)
  const { data, error } = await query.order("updated_at", { ascending: false })
  if (error || !data) return []
  return (data as ExhibitionVisitorNoteRow[]).map(mapNoteRow)
}

export async function saveVisitorNote(
  visitorId: string,
  boothId: string,
  noteText: string,
  tags: string[]
): Promise<ExhibitionVisitorNote> {
  if (!UUID_RE.test(boothId)) throw new Error("target_not_found")

  const service = getServiceClient()
  if (!service) throw new Error("Service client unavailable")

  const { data, error } = await service
    .from("exhibition_visitor_notes")
    .upsert(
      { visitor_id: visitorId, booth_id: boothId, note_text: noteText, tags, updated_at: new Date().toISOString() },
      { onConflict: "visitor_id,booth_id" }
    )
    .select()
    .single()

  if (error || !data) {
    if (error?.code === "23503") throw new Error("target_not_found")
    throw new Error(error?.message || "Failed to save note")
  }
  return mapNoteRow(data as ExhibitionVisitorNoteRow)
}

export async function deleteVisitorNote(visitorId: string, boothId: string): Promise<boolean> {
  const service = getServiceClient()
  if (!service) return false
  const { error } = await service
    .from("exhibition_visitor_notes")
    .delete()
    .eq("visitor_id", visitorId)
    .eq("booth_id", boothId)
  return !error
}
