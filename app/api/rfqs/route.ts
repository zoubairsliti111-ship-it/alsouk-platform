import { NextResponse } from "next/server"
import { KEY_VARS, URL_VARS, firstDefined } from "@/lib/supabase/env"
import { SUPPLIERS_TABLE } from "@/lib/supabase/suppliers-service"
import { normalizeRfq, validateRfq, type RfqInput } from "@/lib/supabase/rfq-service"

export const dynamic = "force-dynamic"

const RFQS_TABLE = "rfqs"

type RfqPayload = Partial<RfqInput> & { supplierId?: unknown }

function asString(value: unknown): string {
  return typeof value === "string" ? value : ""
}

/**
 * Creates an RFQ for a supplier.
 *
 * Re-validates the payload server-side (never trusting the client), snapshots
 * the supplier's name, and inserts via PostgREST using the browser-safe key —
 * writes are permitted by the table's public INSERT policy (see
 * supabase/migrations/0001_create_rfqs.sql). Returns 400 on validation errors
 * and 404 when the supplier id doesn't exist.
 */
export async function POST(request: Request) {
  const url = firstDefined(URL_VARS).value
  const key = firstDefined(KEY_VARS).value
  if (!url || !key || !/^https?:\/\//.test(url)) {
    console.error("[api/rfqs] Supabase is not configured.")
    return NextResponse.json({ error: true, reason: "unconfigured" }, { status: 500 })
  }

  let body: RfqPayload
  try {
    body = (await request.json()) as RfqPayload
  } catch {
    return NextResponse.json({ error: true, reason: "invalid_json" }, { status: 400 })
  }

  const supplierId = asString(body.supplierId)
  if (!supplierId) {
    return NextResponse.json({ error: true, reason: "validation" }, { status: 400 })
  }

  const input: RfqInput = normalizeRfq({
    companyName: asString(body.companyName),
    contactPerson: asString(body.contactPerson),
    email: asString(body.email),
    phone: asString(body.phone),
    country: asString(body.country),
    productRequested: asString(body.productRequested),
    quantity: asString(body.quantity),
    targetPrice: asString(body.targetPrice),
    deliveryDestination: asString(body.deliveryDestination),
    message: asString(body.message),
  })

  if (Object.keys(validateRfq(input)).length > 0) {
    return NextResponse.json({ error: true, reason: "validation" }, { status: 400 })
  }

  const headers = { apikey: key, Authorization: `Bearer ${key}` }

  // Confirm the supplier exists and snapshot its name for the admin view.
  let supplierName: string | null = null
  try {
    const lookup = await fetch(
      `${url}/rest/v1/${SUPPLIERS_TABLE}?select=company_name&id=eq.${encodeURIComponent(supplierId)}&limit=1`,
      { headers, cache: "no-store" },
    )
    if (lookup.status === 400) {
      return NextResponse.json({ error: true, reason: "notFound" }, { status: 404 })
    }
    if (!lookup.ok) {
      console.error("[api/rfqs] Supplier lookup failed:", lookup.status)
      return NextResponse.json({ error: true, reason: "error" }, { status: 502 })
    }
    const rows = (await lookup.json()) as { company_name: string }[]
    if (!rows[0]) {
      return NextResponse.json({ error: true, reason: "notFound" }, { status: 404 })
    }
    supplierName = rows[0].company_name
  } catch (err) {
    console.error("[api/rfqs] Supplier lookup error:", err)
    return NextResponse.json({ error: true, reason: "error" }, { status: 500 })
  }

  const record = {
    supplier_id: supplierId,
    supplier_name: supplierName,
    company_name: input.companyName,
    contact_person: input.contactPerson,
    email: input.email,
    phone: input.phone,
    country: input.country,
    product_requested: input.productRequested,
    quantity: input.quantity,
    target_price: input.targetPrice || null,
    delivery_destination: input.deliveryDestination,
    message: input.message,
  }

  try {
    const res = await fetch(`${url}/rest/v1/${RFQS_TABLE}`, {
      method: "POST",
      headers: { ...headers, "content-type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(record),
      cache: "no-store",
    })
    if (!res.ok) {
      const text = await res.text()
      console.error("[api/rfqs] Insert failed:", res.status, text)
      return NextResponse.json({ error: true, reason: "error" }, { status: 502 })
    }
    return NextResponse.json({ error: false }, { status: 201 })
  } catch (err) {
    console.error("[api/rfqs] Unexpected error:", err)
    return NextResponse.json({ error: true, reason: "error" }, { status: 500 })
  }
}
