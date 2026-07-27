import type { SearchResults } from "@/lib/services/search-service"

const EMPTY: SearchResults = { suppliers: [], companies: [], products: [] }

/** Browser-side search fetcher hitting the internal `/api/search` route. */
export async function fetchSearch(query: string): Promise<SearchResults> {
  const q = query.trim()
  if (!q) return EMPTY
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { cache: "no-store" })
    if (!res.ok) {
      console.error("[search] /api/search responded", res.status)
      return EMPTY
    }
    const json = (await res.json()) as { success?: boolean; data?: SearchResults }
    return json.data ?? EMPTY
  } catch (err) {
    console.error("[search] Failed to search:", err)
    return EMPTY
  }
}
