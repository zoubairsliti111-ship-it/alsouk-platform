import { restGet, getRestConfig } from "@/lib/supabase/rest"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { ExhibitionMedia, ExhibitionDocument } from "@/lib/domains/exhibition/types"
import {
  mapExhibitionMedia,
  mapExhibitionDocument,
  getMockBooths,
  ExhibitionMediaRow,
  ExhibitionDocumentRow,
} from "@/lib/services/exhibitions-service"

// We can extract/mirror standard mock maps from service for completeness
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

// Setup globalThis mocks for media and documents
export function getMockMedia(): Record<string, ExhibitionMedia[]> {
  if (typeof globalThis !== "undefined") {
    const g = globalThis as any
    if (!g.__mockMedia) {
      g.__mockMedia = JSON.parse(JSON.stringify(MOCK_MEDIA))
    }
    return g.__mockMedia
  }
  return MOCK_MEDIA
}

export function getMockDocs(): Record<string, ExhibitionDocument[]> {
  if (typeof globalThis !== "undefined") {
    const g = globalThis as any
    if (!g.__mockDocs) {
      g.__mockDocs = JSON.parse(JSON.stringify(MOCK_DOCS))
    }
    return g.__mockDocs
  }
  return MOCK_DOCS
}

/**
 * Loads all media items (images/videos) attached to a booth.
 */
/** Resolves a media row's booth_id (public read) so its owner can be looked up. */
export async function getMediaBoothId(mediaId: string): Promise<string | null> {
  try {
    const rows = await restGet<{ booth_id: string }>(
      `exhibition_media?select=booth_id&id=eq.${encodeURIComponent(mediaId)}&limit=1`
    )
    return rows[0]?.booth_id || null
  } catch {
    return null
  }
}

/** Resolves a document row's booth_id (public read) so its owner can be looked up. */
export async function getDocumentBoothId(documentId: string): Promise<string | null> {
  try {
    const rows = await restGet<{ booth_id: string }>(
      `exhibition_documents?select=booth_id&id=eq.${encodeURIComponent(documentId)}&limit=1`
    )
    return rows[0]?.booth_id || null
  } catch {
    return null
  }
}

export async function getMediaForBooth(boothId: string): Promise<ExhibitionMedia[]> {
  try {
    const cfg = getRestConfig()
    if (!cfg || boothId.startsWith("booth-")) {
      const list = getMockMedia()[boothId] || []
      return list.sort((a, b) => a.sortOrder - b.sortOrder)
    }

    const rows = await restGet<ExhibitionMediaRow>(
      `exhibition_media?select=*&booth_id=eq.${encodeURIComponent(boothId)}&order=sort_order.asc`
    )
    return rows.map((r) => ({
      ...mapExhibitionMedia(r),
      isCover: r.is_cover !== undefined ? Boolean(r.is_cover) : false
    }))
  } catch (err) {
    console.warn(`[exhibitions-service] getMediaForBooth error:`, err)
    return []
  }
}

/**
 * Creates a new media item (image or video).
 */
export async function createMediaItem(
  data: Omit<ExhibitionMedia, "id">,
  client: SupabaseClient
): Promise<ExhibitionMedia> {
  const record = {
    booth_id: data.boothId,
    media_type: data.mediaType,
    url: data.url,
    caption: data.caption || null,
    sort_order: Number(data.sortOrder) || 0,
    thumbnail_url: data.thumbnailUrl || null,
    is_cover: Boolean(data.isCover),
  }

  const { data: row, error } = await client.from("exhibition_media").insert(record).select().single()

  if (error || !row) {
    throw new Error(`Failed to create media item: ${error?.message || "no row returned"}`)
  }

  return {
    ...mapExhibitionMedia(row as ExhibitionMediaRow),
    isCover: row.is_cover !== undefined ? Boolean(row.is_cover) : false
  }
}

/**
 * Updates a media item.
 */
export async function updateMediaItem(
  id: string,
  data: Partial<ExhibitionMedia>,
  client: SupabaseClient
): Promise<ExhibitionMedia> {
  const record: Record<string, any> = {}
  if (data.caption !== undefined) record.caption = data.caption
  if (data.url !== undefined) record.url = data.url
  if (data.thumbnailUrl !== undefined) record.thumbnail_url = data.thumbnailUrl
  if (data.sortOrder !== undefined) record.sort_order = Number(data.sortOrder)
  if (data.isCover !== undefined) record.is_cover = Boolean(data.isCover)

  const { data: row, error } = await client
    .from("exhibition_media")
    .update(record)
    .eq("id", id)
    .select()
    .single()

  if (error || !row) {
    throw new Error(`Failed to update media item ${id}: ${error?.message || "no row returned"}`)
  }

  return {
    ...mapExhibitionMedia(row as ExhibitionMediaRow),
    isCover: row.is_cover !== undefined ? Boolean(row.is_cover) : false
  }
}

/**
 * Deletes a media item.
 */
export async function deleteMediaItem(id: string, client: SupabaseClient): Promise<boolean> {
  const { error } = await client.from("exhibition_media").delete().eq("id", id)
  return !error
}

/**
 * Updates sort order for all media items.
 */
export async function updateMediaSortOrder(
  boothId: string,
  orderedIds: string[],
  client: SupabaseClient
): Promise<boolean> {
  for (let i = 0; i < orderedIds.length; i++) {
    await client.from("exhibition_media").update({ sort_order: i + 1 }).eq("id", orderedIds[i])
  }

  return true
}

/**
 * Sets a specific image as the booth cover image.
 * This clears previous covers in the database for the booth, marks the selected item as cover,
 * and updates the booth's banner_url as well.
 */
export async function setBoothCoverImage(
  boothId: string,
  mediaId: string,
  client: SupabaseClient
): Promise<boolean> {
  // 1. Clear previous covers
  await client.from("exhibition_media").update({ is_cover: false }).eq("booth_id", boothId)

  // 2. Mark target media as cover and fetch its URL
  const { data: mediaRow, error } = await client
    .from("exhibition_media")
    .update({ is_cover: true })
    .eq("id", mediaId)
    .select()
    .single()

  if (error || !mediaRow) {
    throw new Error(`Failed to set media cover flag: ${error?.message || "no row returned"}`)
  }

  if (mediaRow.url) {
    // 3. Update booth's banner_url to match the cover URL
    await client.from("exhibition_booths").update({ banner_url: mediaRow.url }).eq("id", boothId)
  }

  return true
}

// ===========================================================================
// Documents B2B CRUD operations
// ===========================================================================

/**
 * Loads all documents for a specific booth.
 */
export async function getDocumentsForBooth(boothId: string): Promise<ExhibitionDocument[]> {
  try {
    const cfg = getRestConfig()
    if (!cfg || boothId.startsWith("booth-")) {
      const list = getMockDocs()[boothId] || []
      return list.sort((a, b) => a.sortOrder - b.sortOrder)
    }

    const rows = await restGet<ExhibitionDocumentRow>(
      `exhibition_documents?select=*&booth_id=eq.${encodeURIComponent(boothId)}&order=sort_order.asc`
    )
    return rows.map(mapExhibitionDocument)
  } catch (err) {
    console.warn(`[exhibitions-service] getDocumentsForBooth error:`, err)
    return []
  }
}

/**
 * Creates/uploads a new document.
 */
export async function createDocumentItem(
  data: Omit<ExhibitionDocument, "id">,
  client: SupabaseClient
): Promise<ExhibitionDocument> {
  const record = {
    booth_id: data.boothId,
    name: data.name,
    url: data.url,
    file_size: data.fileSize || "1.0 MB",
    sort_order: Number(data.sortOrder) || 0,
    language: data.language || null,
    description: data.description || null,
  }

  const { data: row, error } = await client.from("exhibition_documents").insert(record).select().single()

  if (error || !row) {
    throw new Error(`Failed to create document item: ${error?.message || "no row returned"}`)
  }

  return mapExhibitionDocument(row as ExhibitionDocumentRow)
}

/**
 * Deletes a document.
 */
export async function deleteDocumentItem(id: string, client: SupabaseClient): Promise<boolean> {
  const { error } = await client.from("exhibition_documents").delete().eq("id", id)
  return !error
}
