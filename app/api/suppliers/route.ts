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
import { KEY_VARS, URL_VARS, firstDefined } from "@/lib/supabase/env"

// Read fresh on every request (no static caching) so the response always
// reflects the current database and environment.
export const dynamic = "force-dynamic"

// The Supabase URL + browser-safe key are read from the environment on the
// server at request time, so this works regardless of whether the
// `NEXT_PUBLIC_*` values were inlined into the client bundle at build time.

/**
 * Per-variable presence/length report (names + lengths only, never values).
 * Makes it unambiguous whether a configured var is simply empty at runtime
 * vs. missing entirely — without exposing any secret.
 */
function reportVars(names: readonly string[]) {
  return names.map((name) => {
    const raw = process.env[name]
    return {
      name,
      inEnv: name in process.env,
      rawLength: raw?.length ?? 0,
      trimmedLength: raw?.trim().length ?? 0,
    }
  })
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
    // Vercel-provided, non-secret context: confirms which deployment/env is
    // actually serving this response (helps catch a stale alias or a build
    // created before an env var was added).
    vercelEnv: process.env.VERCEL_ENV ?? null,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    // Names only (never values) of every Supabase-related / NEXT_PUBLIC_ env
    // var visible to the function, to surface a mis-named or mis-scoped key.
    presentEnvNames: Object.keys(process.env)
      .filter((name) => /supabase/i.test(name) || name.startsWith("NEXT_PUBLIC_"))
      .sort(),
    // Definitive per-variable proof: shows each checked key var's presence and
    // value length. A row with inEnv:true but trimmedLength:0 is a configured
    // but *empty* value — not a detection bug.
    keyVarReport: reportVars(KEY_VARS),
    urlVarReport: reportVars(URL_VARS),
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
