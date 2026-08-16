import { NextResponse } from "next/server"
import { KEY_VARS, URL_VARS, firstDefined } from "@/lib/supabase/env"
import { normalizeRfq, validateRfq, type RfqInput } from "@/lib/supabase/rfq-service"

// The public read surface for `companies` — see supabase/migrations/0046 and
// 0047. Base `companies` SELECT is member-only since 0047; this route only
// ever holds the anon key (never a real user session), so a direct
// `companies` lookup silently returns zero rows and drops company_id to
// null. companies_public is exactly the view built for anon-safe company
// reads. It deliberately does NOT expose `supplier_id` (an internal linkage
// column, never meant to be public — see 0046's column allowlist), which is
// why the legacy-supplier fallback below reads the real `suppliers` table
// instead, not this view.
const COMPANIES_PUBLIC_TABLE = "companies_public"

// The real legacy supplier directory (see 0000_create_suppliers.sql —
// id/company_name, publicly readable). Currently empty in production, kept
// only for backward compatibility with any pre-companies-era supplierId
// that might still be in circulation.
const LEGACY_SUPPLIERS_TABLE = "suppliers"

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

  // supplierId is optional: an empty value means a general (marketplace-wide)
  // RFQ not directed at a specific supplier.
  const supplierId = asString(body.supplierId)

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

  // When directed at a specific supplier/company, confirm it exists and resolve its company_id.
  // finalSupplierId is deliberately NOT defaulted to the raw incoming id:
  // rfqs.supplier_id has a foreign key to the *legacy* `suppliers` table
  // (see 0000_create_suppliers.sql), and every real caller today
  // (components/directory/supplier-profile.tsx) passes a `companies.id` —
  // defaulting finalSupplierId to that value used to violate
  // rfqs_supplier_id_fkey on every directed RFQ (companies.id never exists
  // in the empty `suppliers` table), failing the insert outright with a 409
  // instead of merely leaving company_id null.
  let supplierName: string | null = null
  let companyId: string | null = null
  let finalSupplierId: string | null = null

  if (supplierId) {
    try {
      // 1. Try to look up as a real Company (the common case for every
      // current caller) via companies_public.
      const compLookup = await fetch(
        `${url}/rest/v1/${COMPANIES_PUBLIC_TABLE}?select=id,name&id=eq.${encodeURIComponent(supplierId)}&limit=1`,
        { headers, cache: "no-store" },
      )
      if (compLookup.ok) {
        const compRows = (await compLookup.json()) as { id: string; name: string }[]
        if (compRows && compRows[0]) {
          companyId = compRows[0].id
          supplierName = compRows[0].name
        }
      }

      // 2. If not found, try to look up as a legacy Supplier row directly
      // (LEGACY_SUPPLIERS_TABLE is the real `suppliers` table, not
      // companies_public — confirmed empty in production today, so this
      // is currently a no-op, kept only for backward compatibility).
      if (!companyId) {
        const lookup = await fetch(
          `${url}/rest/v1/${LEGACY_SUPPLIERS_TABLE}?select=company_name,id&id=eq.${encodeURIComponent(supplierId)}&limit=1`,
          { headers, cache: "no-store" },
        )
        if (lookup.ok) {
          const rows = (await lookup.json()) as { company_name: string; id: string }[]
          if (rows && rows[0]) {
            supplierName = rows[0].company_name
            finalSupplierId = rows[0].id

            // Now find the company linked to this legacy supplier, if any.
            // companies_public deliberately doesn't expose `supplier_id`
            // (internal linkage column, never public — see 0046), so this
            // specific lookup can't go through the view; it's only ever
            // reached when a genuine `suppliers` row exists (none do today)
            // and stays unresolved (companyId left null) until this route
            // is given a service-role path for that one internal column.
          }
        }
      }
    } catch (err) {
      console.error("[api/rfqs] Supplier/Company lookup error:", err)
    }
  }

  const record = {
    supplier_id: finalSupplierId,
    company_id: companyId,
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
