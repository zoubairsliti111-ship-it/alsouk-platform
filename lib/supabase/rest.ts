// Shared server-side PostgREST access for the marketplace read APIs.
//
// Mirrors the approach already used by the suppliers routes: credentials are
// resolved from the environment at request time (never inlined into the client
// bundle) and queries hit Supabase's PostgREST endpoint directly, avoiding the
// realtime client's native-WebSocket dependency. Reused by the companies,
// categories, stores and products routes so they all resolve credentials and
// handle upstream errors the same way.

import { KEY_VARS, URL_VARS, firstDefined } from "@/lib/supabase/env"

/** Error thrown when a PostgREST request cannot be completed. */
export class RestError extends Error {
  constructor(
    public readonly reason: string,
    public readonly status?: number,
  ) {
    super(reason)
    this.name = "RestError"
  }
}

/** Resolves the Supabase URL + browser-safe key, or `null` when unconfigured. */
export function getRestConfig(): { url: string; key: string } | null {
  const url = firstDefined(URL_VARS).value
  const key = firstDefined(KEY_VARS).value
  if (!url || !key || !/^https?:\/\//.test(url)) return null
  return { url, key }
}

/**
 * Performs a GET against `/rest/v1/{path}` and returns the parsed rows.
 *
 * @param path PostgREST path + query (already URL-encoded), e.g.
 *   `companies?select=*&order=name.asc`.
 * @throws {RestError} `unconfigured` when credentials are missing, or
 *   `upstream_<status>` / `fetch_failed` when the request fails.
 */
export async function restGet<Row>(path: string): Promise<Row[]> {
  const cfg = getRestConfig()
  if (!cfg) throw new RestError("unconfigured")

  let res: Response
  try {
    res = await fetch(`${cfg.url}/rest/v1/${path}`, {
      headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` },
      cache: "no-store",
    })
  } catch {
    throw new RestError("fetch_failed")
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    console.error("[rest] PostgREST query failed:", res.status, text)
    throw new RestError(`upstream_${res.status}`, res.status)
  }

  return (await res.json()) as Row[]
}
