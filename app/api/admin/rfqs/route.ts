import { NextResponse } from "next/server"
import { ADMIN_TOKEN_VAR, SERVICE_KEY_VARS, URL_VARS, firstDefined } from "@/lib/supabase/env"
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
 * server-only service-role key, which bypasses RLS. Access is gated by a shared
 * `RFQ_ADMIN_TOKEN` passed as a bearer credential. Responds 503 when the server
 * isn't configured (missing service key or admin token) and 401 on a bad token.
 */
export async function GET(request: Request) {
  const url = firstDefined(URL_VARS).value
  const serviceKey = firstDefined(SERVICE_KEY_VARS).value
  const adminToken = process.env[ADMIN_TOKEN_VAR]?.trim()

  if (!url || !serviceKey || !adminToken || !/^https?:\/\//.test(url)) {
    console.error("[api/admin/rfqs] Admin RFQ view is not configured (need service key + token).")
    return NextResponse.json({ rfqs: [], reason: "unconfigured" }, { status: 503 })
  }

  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim()
  if (!provided || provided !== adminToken) {
    return NextResponse.json({ rfqs: [], reason: "unauthorized" }, { status: 401 })
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
      return NextResponse.json({ rfqs: [], reason: "error" }, { status: 502 })
    }
    const rfqs = (await res.json()) as RfqRow[]
    return NextResponse.json({ rfqs })
  } catch (err) {
    console.error("[api/admin/rfqs] Unexpected error:", err)
    return NextResponse.json({ rfqs: [], reason: "error" }, { status: 500 })
  }
}
