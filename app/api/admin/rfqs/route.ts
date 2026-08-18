import { NextResponse } from "next/server"
import { SERVICE_KEY_VARS, URL_VARS, firstDefined } from "@/lib/supabase/env"
import { authorizeAdmin, NO_STORE } from "@/lib/admin/server"
import type { RfqRow } from "@/lib/supabase/rfq-service"

export const dynamic = "force-dynamic"

const RFQS_TABLE = "rfqs"
const RFQ_COLUMNS =
  "id,supplier_id,supplier_name,company_name,contact_person,email,phone,country," +
  "product_requested,quantity,target_price,delivery_destination,message,status,created_at"

/**
 * Lists submitted RFQs for the admin view.
 *
 * RFQs are RLS-protected (they contain buyer PII), so they are read with the
 * server-only service-role key, which bypasses RLS. Access is gated by
 * `authorizeAdmin()` — the caller must be signed in and present in
 * `admin_users`, same as every other admin-only route. Responds 503 when the
 * server isn't configured (missing service key).
 */
export async function GET() {
  const authz = await authorizeAdmin()
  if (!authz.ok) return authz.response

  const url = firstDefined(URL_VARS).value
  const serviceKey = firstDefined(SERVICE_KEY_VARS).value

  if (!url || !serviceKey || !/^https?:\/\//.test(url)) {
    console.error("[api/admin/rfqs] Admin RFQ view is not configured (need service key).")
    return NextResponse.json({ rfqs: [], reason: "unconfigured" }, { status: 503, headers: NO_STORE })
  }

  const endpoint = `${url}/rest/v1/${RFQS_TABLE}?select=${RFQ_COLUMNS}&order=created_at.desc`

  try {
    const res = await fetch(endpoint, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      cache: "no-store",
    })
    if (!res.ok) {
      const text = await res.text()
      console.error("[api/admin/rfqs] Query failed:", res.status, text)
      return NextResponse.json({ rfqs: [], reason: "error" }, { status: 502, headers: NO_STORE })
    }
    const rfqs = (await res.json()) as RfqRow[]
    return NextResponse.json({ rfqs }, { headers: NO_STORE })
  } catch (err) {
    console.error("[api/admin/rfqs] Unexpected error:", err)
    return NextResponse.json({ rfqs: [], reason: "error" }, { status: 500, headers: NO_STORE })
  }
}
