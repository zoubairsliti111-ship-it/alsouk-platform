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
