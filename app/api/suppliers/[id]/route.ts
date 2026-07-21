import { NextResponse } from "next/server"
import {
  SUPPLIER_COLUMNS,
  SUPPLIERS_TABLE,
  mapRow,
  type SupplierRow,
} from "@/lib/supabase/suppliers-service"
import { KEY_VARS, URL_VARS, firstDefined } from "@/lib/supabase/env"

// Read fresh on every request so the response reflects the current database.
export const dynamic = "force-dynamic"

/**
 * Returns a single supplier by id.
 *
 * Credentials are read server-side at request time (see lib/supabase/env),
 * keeping the key off the browser. Responds 404 when no row matches so the
 * profile page can render a not-found state distinct from a real error.
 */
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  const url = firstDefined(URL_VARS).value
  const key = firstDefined(KEY_VARS).value
  if (!url || !key || !/^https?:\/\//.test(url)) {
    console.error("[api/suppliers/[id]] Supabase is not configured.")
    return NextResponse.json({ supplier: null, error: true, notFound: false }, { status: 500 })
  }

  const endpoint =
    `${url}/rest/v1/${SUPPLIERS_TABLE}` +
    `?select=${SUPPLIER_COLUMNS}&id=eq.${encodeURIComponent(id)}&limit=1`

  try {
    const res = await fetch(endpoint, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    })
    if (!res.ok) {
      const text = await res.text()
      // A 400 means the id isn't a valid uuid — treat it as "not found" so the
      // profile page shows a clean not-found state instead of a server error.
      if (res.status === 400) {
        return NextResponse.json({ supplier: null, error: false, notFound: true }, { status: 404 })
      }
      console.error("[api/suppliers/[id]] Supabase query failed:", res.status, text)
      return NextResponse.json({ supplier: null, error: true, notFound: false }, { status: 502 })
    }
    const rows = (await res.json()) as SupplierRow[]
    const supplier = rows[0] ? mapRow(rows[0]) : null
    if (!supplier) {
      return NextResponse.json({ supplier: null, error: false, notFound: true }, { status: 404 })
    }
    return NextResponse.json({ supplier, error: false, notFound: false })
  } catch (err) {
    console.error("[api/suppliers/[id]] Unexpected error:", err)
    return NextResponse.json({ supplier: null, error: true, notFound: false }, { status: 500 })
  }
}
