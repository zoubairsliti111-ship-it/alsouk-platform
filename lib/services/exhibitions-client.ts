import type { Exhibition, ExhibitionBooth } from "@/lib/domains/exhibition/types"
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
