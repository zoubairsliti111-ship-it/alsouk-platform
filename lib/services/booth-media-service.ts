import { restGet } from "@/lib/supabase/rest"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { ExhibitionMedia, ExhibitionDocument } from "@/lib/domains/exhibition/types"
import {
  mapExhibitionMedia,
  mapExhibitionDocument,
  ExhibitionMediaRow,
  ExhibitionDocumentRow,
} from "@/lib/services/exhibitions-service"

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
