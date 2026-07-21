import { NextResponse } from "next/server"
import type { Supplier } from "@/lib/directory-data"
import {
  SORT_COLUMNS,
  SUPPLIER_COLUMNS,
  SUPPLIERS_TABLE,
  SUPPLIER_SORTS,
  mapRow,
  type SupplierRow,
  type SupplierSort,
} from "@/lib/supabase/suppliers-service"

// Read fresh on every request (no static caching) so the response always
// reflects the current database and environment.
export const dynamic = "force-dynamic"

// The Supabase URL + browser-safe key are read from the environment on the
// server at request time, so this works regardless of whether the
// `NEXT_PUBLIC_*` values were inlined into the client bundle at build time.

/** Names of the env vars checked, in resolution order, for diagnostics. */
const URL_VARS = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"] as const
const KEY_VARS = [
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_ANON_KEY",
  "SUPABASE_KEY",
] as const

function firstDefined(names: readonly string[]): { name?: string; value?: string } {
  for (const name of names) {
    const value = process.env[name]
    if (value) return { name, value }
  }
  return {}
}

/**
 * Builds a diagnostic object that is safe to expose: it reports only which env
 * var names are present and the *shape* of their values — never a secret value.
 */
function buildDiag(): Record<string, unknown> {
  const url = firstDefined(URL_VARS)
  const key = firstDefined(KEY_VARS)
  return {
    urlVarPresent: Boolean(url.value),
    urlVarName: url.name ?? null,
    urlLooksLikeHttpUrl: url.value ? /^https?:\/\//.test(url.value) : false,
    keyVarPresent: Boolean(key.value),
    keyVarName: key.name ?? null,
    // Non-sensitive key shape hints (kind + length only, never the value).
    keyKind: key.value
      ? key.value.startsWith("sb_publishable_")
        ? "publishable"
        : key.value.startsWith("sb_secret_")
          ? "secret"
          : key.value.startsWith("eyJ")
            ? "jwt"
            : "unknown"
      : null,
    keyLength: key.value ? key.value.length : 0,
    checkedUrlVars: URL_VARS,
    checkedKeyVars: KEY_VARS,
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const debug = searchParams.get("debug") === "1"
  const withDiag = (body: Record<string, unknown>) =>
    NextResponse.json(debug ? { ...body, diag: buildDiag() } : body)

  const url = firstDefined(URL_VARS).value
  const key = firstDefined(KEY_VARS).value
  if (!url || !key) {
    console.error(
      "[api/suppliers] Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).",
    )
    return withDiag({ suppliers: [], error: true, reason: "unconfigured" })
  }
  if (!/^https?:\/\//.test(url)) {
    console.error("[api/suppliers] Supabase URL is not an http(s) URL.")
    return withDiag({ suppliers: [], error: true, reason: "bad_url" })
  }

  const sortParam = searchParams.get("sort")
  const sort: SupplierSort = SUPPLIER_SORTS.includes(sortParam as SupplierSort)
    ? (sortParam as SupplierSort)
    : "rating"
  const limitParam = Number.parseInt(searchParams.get("limit") ?? "", 10)
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined

  // Query PostgREST directly (no supabase-js) to avoid the realtime client's
  // hard dependency on a native WebSocket in some Node runtimes.
  let endpoint = `${url}/rest/v1/${SUPPLIERS_TABLE}?select=${SUPPLIER_COLUMNS}&order=${SORT_COLUMNS[sort]}.desc`
  if (limit) endpoint += `&limit=${limit}`

  try {
    const res = await fetch(endpoint, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    })
    if (!res.ok) {
      const text = await res.text()
      console.error("[api/suppliers] Supabase query failed:", res.status, text)
      return withDiag({ suppliers: [], error: true, reason: `upstream_${res.status}` })
    }
    const rows = (await res.json()) as SupplierRow[]
    const suppliers = rows.map(mapRow).filter((s): s is Supplier => s !== null)
    return withDiag({ suppliers, error: false })
  } catch (err) {
    console.error("[api/suppliers] Unexpected error loading suppliers:", err)
    return withDiag({ suppliers: [], error: true, reason: "fetch_failed" })
  }
}
