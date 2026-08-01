import type { Exhibition, ExhibitionBooth, ExhibitionApplication } from "@/lib/domains/exhibition/types"
import { fetchItem, fetchList, type ItemResult } from "@/lib/services/marketplace-api"

/** Loads all exhibitions via `/api/exhibitions`. */
export function fetchExhibitions(): Promise<Exhibition[]> {
  return fetchList<Exhibition>("/api/exhibitions")
}

/** Loads a single exhibition via `/api/exhibitions/[slug]`. */
export function fetchExhibitionBySlug(slug: string): Promise<ItemResult<Exhibition>> {
  return fetchItem<Exhibition>(`/api/exhibitions/${encodeURIComponent(slug)}`)
}

/** Loads booths for an exhibition via `/api/exhibitions/[slug]/booths`. */
export function fetchBoothsByExhibition(slug: string): Promise<ExhibitionBooth[]> {
  return fetchList<ExhibitionBooth>(`/api/exhibitions/${encodeURIComponent(slug)}/booths`)
}

/** Loads a specific exhibition booth with full exhibits + media details. */
export function fetchBoothDetails(slug: string, boothId: string): Promise<ItemResult<ExhibitionBooth>> {
  return fetchItem<ExhibitionBooth>(`/api/exhibitions/${encodeURIComponent(slug)}/booths/${encodeURIComponent(boothId)}`)
}

/**
 * Submits a new exhibition application to `/api/exhibitions/applications`.
 */
export async function submitExhibitionApplication(
  input: Omit<ExhibitionApplication, "id" | "status" | "submittedAt" | "reviewNotes" | "reviewedAt" | "reviewedBy">
): Promise<ItemResult<ExhibitionApplication>> {
  try {
    const res = await fetch("/api/exhibitions/applications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    })

    if (res.status === 409) {
      // Duplicate submission
      return { data: null, notFound: false, error: true }
    }

    if (!res.ok) {
      console.error("[exhibitions-client] submitExhibitionApplication responded", res.status)
      return { data: null, notFound: false, error: true }
    }

    const json = (await res.json()) as { success?: boolean; data?: ExhibitionApplication | null }
    const data = json.data ?? null
    return { data, notFound: data === null, error: false }
  } catch (err) {
    console.error("[exhibitions-client] Failed to submit application", err)
    return { data: null, notFound: false, error: true }
  }
}

/**
 * Loads a single exhibition application by ID via `/api/exhibitions/applications/[id]`.
 */
export function fetchExhibitionApplication(id: string): Promise<ItemResult<ExhibitionApplication>> {
  return fetchItem<ExhibitionApplication>(`/api/exhibitions/applications/${encodeURIComponent(id)}`)
}

// ===========================================================================
// Exhibit Client Endpoints
// ===========================================================================

import type { ExhibitionExhibit } from "@/lib/domains/exhibition/types"

/**
 * Loads all exhibits for a specific booth.
 */
export function fetchExhibitsForBooth(boothId: string): Promise<ExhibitionExhibit[]> {
  return fetchList<ExhibitionExhibit>(`/api/exhibitions/booth/exhibits?boothId=${encodeURIComponent(boothId)}`)
}

/**
 * Loads details for a specific exhibit.
 */
export function fetchExhibitDetails(id: string): Promise<ItemResult<ExhibitionExhibit>> {
  return fetchItem<ExhibitionExhibit>(`/api/exhibitions/booth/exhibits/${encodeURIComponent(id)}`)
}

/**
 * Creates a new exhibit.
 */
export async function createExhibit(data: Omit<ExhibitionExhibit, "id">): Promise<ItemResult<ExhibitionExhibit>> {
  try {
    const res = await fetch("/api/exhibitions/booth/exhibits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) return { data: null, notFound: false, error: true }
    const json = await res.json()
    return { data: json.data, notFound: !json.data, error: false }
  } catch (err) {
    console.error("[exhibitions-client] createExhibit error:", err)
    return { data: null, notFound: false, error: true }
  }
}

/**
 * Updates an exhibit.
 */
export async function updateExhibit(id: string, data: Partial<ExhibitionExhibit>): Promise<ItemResult<ExhibitionExhibit>> {
  try {
    const res = await fetch(`/api/exhibitions/booth/exhibits/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "update", data }),
    })
    if (!res.ok) return { data: null, notFound: false, error: true }
    const json = await res.json()
    return { data: json.data, notFound: !json.data, error: false }
  } catch (err) {
    console.error("[exhibitions-client] updateExhibit error:", err)
    return { data: null, notFound: false, error: true }
  }
}

/**
 * Deletes an exhibit.
 */
export async function deleteExhibit(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/exhibitions/booth/exhibits/${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
    if (!res.ok) return false
    const json = await res.json()
    return Boolean(json.success)
  } catch (err) {
    console.error("[exhibitions-client] deleteExhibit error:", err)
    return false
  }
}

/**
 * Duplicates an exhibit.
 */
export async function duplicateExhibit(id: string): Promise<ItemResult<ExhibitionExhibit>> {
  try {
    const res = await fetch(`/api/exhibitions/booth/exhibits/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "duplicate" }),
    })
    if (!res.ok) return { data: null, notFound: false, error: true }
    const json = await res.json()
    return { data: json.data, notFound: !json.data, error: false }
  } catch (err) {
    console.error("[exhibitions-client] duplicateExhibit error:", err)
    return { data: null, notFound: false, error: true }
  }
}

/**
 * Updates the sort order of exhibits in a booth.
 */
export async function updateExhibitsSortOrder(boothId: string, orderedIds: string[]): Promise<boolean> {
  try {
    const res = await fetch("/api/exhibitions/booth/exhibits", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ boothId, orderedIds }),
    })
    if (!res.ok) return false
    const json = await res.json()
    return Boolean(json.success)
  } catch (err) {
    console.error("[exhibitions-client] updateExhibitsSortOrder error:", err)
    return false
  }
}

// ===========================================================================
// Media and Documents Client Endpoints
// ===========================================================================

import type { ExhibitionMedia, ExhibitionDocument } from "@/lib/domains/exhibition/types"

/** Loads all media attached to a booth. */
export function fetchMediaForBooth(boothId: string): Promise<ExhibitionMedia[]> {
  return fetchList<ExhibitionMedia>(`/api/exhibitions/booth/media?boothId=${encodeURIComponent(boothId)}`)
}

/** Creates/uploads a new media item (image/video). */
export async function createMediaItem(data: Omit<ExhibitionMedia, "id">): Promise<ItemResult<ExhibitionMedia>> {
  try {
    const res = await fetch("/api/exhibitions/booth/media", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) return { data: null, notFound: false, error: true }
    const json = await res.json()
    return { data: json.data, notFound: !json.data, error: false }
  } catch (err) {
    console.error("[exhibitions-client] createMediaItem error:", err)
    return { data: null, notFound: false, error: true }
  }
}

/** Updates a media item. */
export async function updateMediaItem(id: string, data: Partial<ExhibitionMedia>): Promise<ItemResult<ExhibitionMedia>> {
  try {
    const res = await fetch("/api/exhibitions/booth/media", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "update", id, data }),
    })
    if (!res.ok) return { data: null, notFound: false, error: true }
    const json = await res.json()
    return { data: json.data, notFound: !json.data, error: false }
  } catch (err) {
    console.error("[exhibitions-client] updateMediaItem error:", err)
    return { data: null, notFound: false, error: true }
  }
}

/** Deletes a media item. */
export async function deleteMediaItem(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/exhibitions/booth/media?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
    if (!res.ok) return false
    const json = await res.json()
    return Boolean(json.success)
  } catch (err) {
    console.error("[exhibitions-client] deleteMediaItem error:", err)
    return false
  }
}

/** Updates sort order of media items. */
export async function updateMediaSortOrder(boothId: string, orderedIds: string[]): Promise<boolean> {
  try {
    const res = await fetch("/api/exhibitions/booth/media", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "reorder", boothId, orderedIds }),
    })
    if (!res.ok) return false
    const json = await res.json()
    return Boolean(json.success)
  } catch (err) {
    console.error("[exhibitions-client] updateMediaSortOrder error:", err)
    return false
  }
}

/** Designates an image as the booth's cover image. */
export async function setBoothCoverImage(boothId: string, mediaId: string): Promise<boolean> {
  try {
    const res = await fetch("/api/exhibitions/booth/media", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "setCover", boothId, id: mediaId }),
    })
    if (!res.ok) return false
    const json = await res.json()
    return Boolean(json.success)
  } catch (err) {
    console.error("[exhibitions-client] setBoothCoverImage error:", err)
    return false
  }
}

/** Loads all documents attached to a booth. */
export function fetchDocumentsForBooth(boothId: string): Promise<ExhibitionDocument[]> {
  return fetchList<ExhibitionDocument>(`/api/exhibitions/booth/documents?boothId=${encodeURIComponent(boothId)}`)
}

/** Uploads/Creates a new document. */
export async function createDocumentItem(data: Omit<ExhibitionDocument, "id">): Promise<ItemResult<ExhibitionDocument>> {
  try {
    const res = await fetch("/api/exhibitions/booth/documents", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) return { data: null, notFound: false, error: true }
    const json = await res.json()
    return { data: json.data, notFound: !json.data, error: false }
  } catch (err) {
    console.error("[exhibitions-client] createDocumentItem error:", err)
    return { data: null, notFound: false, error: true }
  }
}

/** Deletes a document. */
export async function deleteDocumentItem(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/exhibitions/booth/documents?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
    if (!res.ok) return false
    const json = await res.json()
    return Boolean(json.success)
  } catch (err) {
    console.error("[exhibitions-client] deleteDocumentItem error:", err)
    return false
  }
}

// ===========================================================================
// Visitor Experience & B2B Networking Client Endpoints (TASK 009)
// ===========================================================================

import type {
  ExhibitionFavorite,
  ExhibitionRecentlyViewed,
  ExhibitionMeeting,
  ExhibitionVisitorNote,
} from "@/lib/domains/exhibition/types"

/** Loads visitor favorites. */
export async function fetchFavorites(visitorId: string): Promise<ExhibitionFavorite[]> {
  return fetchList<ExhibitionFavorite>(`/api/exhibitions/visitor/favorites?visitorId=${encodeURIComponent(visitorId)}`)
}

/** Save booth/exhibit as a favorite. */
export async function saveFavorite(visitorId: string, targetType: "booth" | "exhibit", targetId: string): Promise<ItemResult<ExhibitionFavorite>> {
  try {
    const res = await fetch("/api/exhibitions/visitor/favorites", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visitorId, targetType, targetId }),
    })
    if (!res.ok) return { data: null, notFound: false, error: true }
    const json = await res.json()
    return { data: json.data, notFound: !json.data, error: false }
  } catch (err) {
    console.error("[exhibitions-client] saveFavorite error:", err)
    return { data: null, notFound: false, error: true }
  }
}

/** Remove booth/exhibit from favorites. */
export async function removeFavoriteItem(visitorId: string, targetType: "booth" | "exhibit", targetId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/exhibitions/visitor/favorites?visitorId=${encodeURIComponent(visitorId)}&targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}`, {
      method: "DELETE",
    })
    if (!res.ok) return false
    const json = await res.json()
    return Boolean(json.success)
  } catch (err) {
    console.error("[exhibitions-client] removeFavoriteItem error:", err)
    return false
  }
}

/** Loads visitor's recently viewed list. */
export async function fetchRecentlyViewed(visitorId: string): Promise<ExhibitionRecentlyViewed[]> {
  return fetchList<ExhibitionRecentlyViewed>(`/api/exhibitions/visitor/recently-viewed?visitorId=${encodeURIComponent(visitorId)}`)
}

/** Track a visitor viewing a booth or exhibit. */
export async function trackRecentlyViewedItem(visitorId: string, targetType: "booth" | "exhibit", targetId: string): Promise<boolean> {
  try {
    const res = await fetch("/api/exhibitions/visitor/recently-viewed", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visitorId, targetType, targetId }),
    })
    return res.ok
  } catch (err) {
    console.error("[exhibitions-client] trackRecentlyViewedItem error:", err)
    return false
  }
}

/** Loads visitor's scheduled B2B meetings. */
export async function fetchMeetings(visitorId: string): Promise<ExhibitionMeeting[]> {
  return fetchList<ExhibitionMeeting>(`/api/exhibitions/visitor/meetings?visitorId=${encodeURIComponent(visitorId)}`)
}

/** Submit a new B2B meeting request. */
export async function submitMeeting(
  visitorId: string,
  input: Omit<ExhibitionMeeting, "id" | "visitorId" | "status" | "createdAt" | "updatedAt">
): Promise<ItemResult<ExhibitionMeeting>> {
  try {
    const res = await fetch("/api/exhibitions/visitor/meetings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visitorId, ...input }),
    })
    if (!res.ok) return { data: null, notFound: false, error: true }
    const json = await res.json()
    return { data: json.data, notFound: !json.data, error: false }
  } catch (err) {
    console.error("[exhibitions-client] submitMeeting error:", err)
    return { data: null, notFound: false, error: true }
  }
}

/** Reschedule a B2B meeting. */
export async function patchRescheduleMeeting(
  meetingId: string,
  date: string,
  time: string,
  notes?: string
): Promise<ItemResult<ExhibitionMeeting>> {
  try {
    const res = await fetch("/api/exhibitions/visitor/meetings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "reschedule", meetingId, preferredDate: date, preferredTime: time, notes }),
    })
    if (!res.ok) return { data: null, notFound: false, error: true }
    const json = await res.json()
    return { data: json.data, notFound: !json.data, error: false }
  } catch (err) {
    console.error("[exhibitions-client] patchRescheduleMeeting error:", err)
    return { data: null, notFound: false, error: true }
  }
}

/** Cancel a B2B meeting request. */
export async function patchCancelMeeting(meetingId: string): Promise<boolean> {
  try {
    const res = await fetch("/api/exhibitions/visitor/meetings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "cancel", meetingId }),
    })
    if (!res.ok) return false
    const json = await res.json()
    return Boolean(json.success)
  } catch (err) {
    console.error("[exhibitions-client] patchCancelMeeting error:", err)
    return false
  }
}

/** Fetch visitor private notes. */
export async function fetchVisitorNotes(visitorId: string, boothId?: string): Promise<ExhibitionVisitorNote[]> {
  let url = `/api/exhibitions/visitor/notes?visitorId=${encodeURIComponent(visitorId)}`
  if (boothId) url += `&boothId=${encodeURIComponent(boothId)}`
  return fetchList<ExhibitionVisitorNote>(url)
}

/** Create or update a visitor private note. */
export async function savePrivateNote(visitorId: string, boothId: string, noteText: string, tags: string[]): Promise<ItemResult<ExhibitionVisitorNote>> {
  try {
    const res = await fetch("/api/exhibitions/visitor/notes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visitorId, boothId, noteText, tags }),
    })
    if (!res.ok) return { data: null, notFound: false, error: true }
    const json = await res.json()
    return { data: json.data, notFound: !json.data, error: false }
  } catch (err) {
    console.error("[exhibitions-client] savePrivateNote error:", err)
    return { data: null, notFound: false, error: true }
  }
}

/** Delete a visitor private note. */
export async function deletePrivateNote(visitorId: string, boothId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/exhibitions/visitor/notes?visitorId=${encodeURIComponent(visitorId)}&boothId=${encodeURIComponent(boothId)}`, {
      method: "DELETE",
    })
    if (!res.ok) return false
    const json = await res.json()
    return Boolean(json.success)
  } catch (err) {
    console.error("[exhibitions-client] deletePrivateNote error:", err)
    return false
  }
}
