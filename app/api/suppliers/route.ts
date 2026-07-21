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

/**
 * Resolves the Supabase URL + browser-safe key from the environment.
 *
 * Runs on the server at request time, so it works regardless of whether the
 * `NEXT_PUBLIC_*` values were inlined into the client bundle at build time.
 */
function getSupabaseEnv(): { url?: string; key?: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.SUPABASE_KEY
  return { url, key }
}

export async function GET(request: Request) {
  const { url, key } = getSupabaseEnv()
  if (!url || !key) {
    console.error(
      "[api/suppliers] Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).",
    )
    return NextResponse.json({ suppliers: [], error: true })
  }

  const { searchParams } = new URL(request.url)
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
      console.error("[api/suppliers] Supabase query failed:", res.status, await res.text())
      return NextResponse.json({ suppliers: [], error: true })
    }
    const rows = (await res.json()) as SupplierRow[]
    const suppliers = rows.map(mapRow).filter((s): s is Supplier => s !== null)
    return NextResponse.json({ suppliers, error: false })
  } catch (err) {
    console.error("[api/suppliers] Unexpected error loading suppliers:", err)
    return NextResponse.json({ suppliers: [], error: true })
  }
}
