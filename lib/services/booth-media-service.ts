import { restGet, getRestConfig } from "@/lib/supabase/rest"
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
    const list = getMockMedia()[boothId] || []
    return list.sort((a, b) => a.sortOrder - b.sortOrder)
  }
}

/**
 * Creates a new media item (image or video).
 */
export async function createMediaItem(
  data: Omit<ExhibitionMedia, "id">
): Promise<ExhibitionMedia> {
  const cfg = getRestConfig()
  const boothId = data.boothId

  if (!cfg || boothId.startsWith("booth-")) {
    const list = getMockMedia()
    if (!list[boothId]) {
      list[boothId] = []
    }
    const newMedia: ExhibitionMedia = {
      ...data,
      id: `media-${Math.random().toString(36).slice(2, 11)}`,
      createdAt: new Date().toISOString(),
    }
    list[boothId].push(newMedia)
    return newMedia
  }

  const record = {
    booth_id: data.boothId,
    media_type: data.mediaType,
    url: data.url,
    caption: data.caption || null,
    sort_order: Number(data.sortOrder) || 0,
    thumbnail_url: data.thumbnailUrl || null,
    is_cover: Boolean(data.isCover),
  }

  const res = await fetch(`${cfg.url}/rest/v1/exhibition_media`, {
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
    throw new Error(`Failed to create media item: ${res.status} ${text}`)
  }

  const rows = await res.json()
  const row = rows[0]
  if (!row) {
    throw new Error("No media row returned from database insert.")
  }

  return {
    ...mapExhibitionMedia(row),
    isCover: row.is_cover !== undefined ? Boolean(row.is_cover) : false
  }
}

/**
 * Updates a media item.
 */
export async function updateMediaItem(
  id: string,
  data: Partial<ExhibitionMedia>
): Promise<ExhibitionMedia> {
  const cfg = getRestConfig()

  if (!cfg || id.startsWith("media-")) {
    const list = getMockMedia()
    let found: ExhibitionMedia | null = null
    for (const bId in list) {
      const idx = list[bId].findIndex((m) => m.id === id)
      if (idx !== -1) {
        const existing = list[bId][idx]
        const updated: ExhibitionMedia = {
          ...existing,
          ...data,
        }
        list[bId][idx] = updated
        found = updated
        break
      }
    }
    if (!found) {
      throw new Error(`Mock media item not found: ${id}`)
    }
    return found
  }

  const record: Record<string, any> = {}
  if (data.caption !== undefined) record.caption = data.caption
  if (data.url !== undefined) record.url = data.url
  if (data.thumbnailUrl !== undefined) record.thumbnail_url = data.thumbnailUrl
  if (data.sortOrder !== undefined) record.sort_order = Number(data.sortOrder)
  if (data.isCover !== undefined) record.is_cover = Boolean(data.isCover)

  const res = await fetch(`${cfg.url}/rest/v1/exhibition_media?id=eq.${encodeURIComponent(id)}`, {
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
    throw new Error(`Failed to update media item: ${res.status} ${text}`)
  }

  const rows = await res.json()
  const row = rows[0]
  if (!row) {
    throw new Error(`No media row returned after update for ID ${id}`)
  }

  return {
    ...mapExhibitionMedia(row),
    isCover: row.is_cover !== undefined ? Boolean(row.is_cover) : false
  }
}

/**
 * Deletes a media item.
 */
export async function deleteMediaItem(id: string): Promise<boolean> {
  const cfg = getRestConfig()

  if (!cfg || id.startsWith("media-")) {
    const list = getMockMedia()
    for (const bId in list) {
      const idx = list[bId].findIndex((m) => m.id === id)
      if (idx !== -1) {
        list[bId].splice(idx, 1)
        return true
      }
    }
    return false
  }

  const res = await fetch(`${cfg.url}/rest/v1/exhibition_media?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
    },
  })

  return res.ok
}

/**
 * Updates sort order for all media items.
 */
export async function updateMediaSortOrder(
  boothId: string,
  orderedIds: string[]
): Promise<boolean> {
  const cfg = getRestConfig()

  if (!cfg || boothId.startsWith("booth-")) {
    const list = getMockMedia()
    const boothMedia = list[boothId] || []
    orderedIds.forEach((id, idx) => {
      const foundIdx = boothMedia.findIndex((m) => m.id === id)
      if (foundIdx !== -1) {
        boothMedia[foundIdx].sortOrder = idx + 1
      }
    })
    return true
  }

  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i]
    await fetch(`${cfg.url}/rest/v1/exhibition_media?id=eq.${encodeURIComponent(id)}`, {
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

/**
 * Sets a specific image as the booth cover image.
 * This clears previous covers in the database for the booth, marks the selected item as cover,
 * and updates the booth's banner_url as well.
 */
export async function setBoothCoverImage(
  boothId: string,
  mediaId: string
): Promise<boolean> {
  const cfg = getRestConfig()

  if (!cfg || boothId.startsWith("booth-")) {
    const list = getMockMedia()
    const boothMedia = list[boothId] || []
    let targetUrl = ""
    boothMedia.forEach((m) => {
      m.isCover = m.id === mediaId
      if (m.isCover) targetUrl = m.url
    })

    if (targetUrl) {
      const mockBooths = getMockBooths()
      for (const slug in mockBooths) {
        const idx = mockBooths[slug].findIndex((b) => b.id === boothId)
        if (idx !== -1) {
          mockBooths[slug][idx].bannerUrl = targetUrl
          break
        }
      }
    }
    return true
  }

  // Real Database updates:
  // 1. Clear previous covers
  await fetch(`${cfg.url}/rest/v1/exhibition_media?booth_id=eq.${encodeURIComponent(boothId)}`, {
    method: "PATCH",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ is_cover: false }),
    cache: "no-store",
  })

  // 2. Mark target media as cover and fetch its URL
  const resMedia = await fetch(`${cfg.url}/rest/v1/exhibition_media?id=eq.${encodeURIComponent(mediaId)}`, {
    method: "PATCH",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "content-type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ is_cover: true }),
    cache: "no-store",
  })

  if (!resMedia.ok) {
    const text = await resMedia.text()
    throw new Error(`Failed to set media cover flag: ${resMedia.status} ${text}`)
  }

  const mediaRows = await resMedia.json()
  const mediaRow = mediaRows[0]
  if (mediaRow && mediaRow.url) {
    // 3. Update booth's banner_url to match the cover URL
    await fetch(`${cfg.url}/rest/v1/exhibition_booths?id=eq.${encodeURIComponent(boothId)}`, {
      method: "PATCH",
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ banner_url: mediaRow.url }),
      cache: "no-store",
    })
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
    const list = getMockDocs()[boothId] || []
    return list.sort((a, b) => a.sortOrder - b.sortOrder)
  }
}

/**
 * Creates/uploads a new document.
 */
export async function createDocumentItem(
  data: Omit<ExhibitionDocument, "id">
): Promise<ExhibitionDocument> {
  const cfg = getRestConfig()
  const boothId = data.boothId

  if (!cfg || boothId.startsWith("booth-")) {
    const list = getMockDocs()
    if (!list[boothId]) {
      list[boothId] = []
    }
    const newDoc: ExhibitionDocument = {
      ...data,
      id: `doc-${Math.random().toString(36).slice(2, 11)}`,
      createdAt: new Date().toISOString(),
    }
    list[boothId].push(newDoc)
    return newDoc
  }

  const record = {
    booth_id: data.boothId,
    name: data.name,
    url: data.url,
    file_size: data.fileSize || "1.0 MB",
    sort_order: Number(data.sortOrder) || 0,
    language: data.language || null,
    description: data.description || null,
  }

  const res = await fetch(`${cfg.url}/rest/v1/exhibition_documents`, {
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
    throw new Error(`Failed to create document item: ${res.status} ${text}`)
  }

  const rows = await res.json()
  const row = rows[0]
  if (!row) {
    throw new Error("No document row returned from database insert.")
  }

  return mapExhibitionDocument(row)
}

/**
 * Deletes a document.
 */
export async function deleteDocumentItem(id: string): Promise<boolean> {
  const cfg = getRestConfig()

  if (!cfg || id.startsWith("doc-")) {
    const list = getMockDocs()
    for (const bId in list) {
      const idx = list[bId].findIndex((d) => d.id === id)
      if (idx !== -1) {
        list[bId].splice(idx, 1)
        return true
      }
    }
    return false
  }

  const res = await fetch(`${cfg.url}/rest/v1/exhibition_documents?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
    },
  })

  return res.ok
}
