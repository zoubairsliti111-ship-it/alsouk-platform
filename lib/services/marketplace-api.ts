// Thin browser-side helpers for the marketplace read APIs. Components call these
// so the Supabase query stays on the server (see the matching /api routes and
// lib/supabase/rest.ts); the key never reaches the client bundle.

type ListResponse<T> = { success?: boolean; data?: T[] }
type ItemResponse<T> = { success?: boolean; data?: T | null }

/** Result of a single-item lookup, distinguishing "not found" from errors. */
export type ItemResult<T> = {
  data: T | null
  notFound: boolean
  error: boolean
}

/** Fetches a list endpoint, returning `[]` on any failure. */
export async function fetchList<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(path, { cache: "no-store" })
    if (!res.ok) {
      console.error("[marketplace]", path, "responded", res.status)
      return []
    }
    const json = (await res.json()) as ListResponse<T>
    return json.data ?? []
  } catch (err) {
    console.error("[marketplace] Failed to load", path, err)
    return []
  }
}

/** Fetches a single-item endpoint, mapping 404 to `notFound`. */
export async function fetchItem<T>(path: string): Promise<ItemResult<T>> {
  try {
    const res = await fetch(path, { cache: "no-store" })
    if (res.status === 404) return { data: null, notFound: true, error: false }
    if (!res.ok) {
      console.error("[marketplace]", path, "responded", res.status)
      return { data: null, notFound: false, error: true }
    }
    const json = (await res.json()) as ItemResponse<T>
    const data = json.data ?? null
    return { data, notFound: data === null, error: false }
  } catch (err) {
    console.error("[marketplace] Failed to load", path, err)
    return { data: null, notFound: false, error: true }
  }
}
