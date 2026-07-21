// RFQ (Request for Quote) domain types, shared validation, and client-side
// helpers. Validation is deliberately framework-free so the exact same rules
// run on the client (for inline field errors) and on the server (never trust
// the client) — see app/api/rfqs/route.ts.

/** The editable fields of the quote-request form. */
export type RfqInput = {
  companyName: string
  contactPerson: string
  email: string
  phone: string
  country: string
  productRequested: string
  quantity: string
  /** Optional target price (free text, e.g. "$2.50 / unit"). */
  targetPrice: string
  deliveryDestination: string
  message: string
}

/** The fields that make up an RFQ, keyed for per-field validation errors. */
export type RfqField = keyof RfqInput

/** A stored RFQ as returned to the admin view (snake_case from PostgREST). */
export type RfqRow = {
  id: string
  supplier_id: string | null
  supplier_name: string | null
  company_name: string
  contact_person: string
  email: string
  phone: string
  country: string
  product_requested: string
  quantity: string
  target_price: string | null
  delivery_destination: string
  message: string
  status: string
  created_at: string
}

export const EMPTY_RFQ: RfqInput = {
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  country: "",
  productRequested: "",
  quantity: "",
  targetPrice: "",
  deliveryDestination: "",
  message: "",
}

/** Fields that are required (everything except the optional target price). */
export const REQUIRED_FIELDS: RfqField[] = [
  "companyName",
  "contactPerson",
  "email",
  "phone",
  "country",
  "productRequested",
  "quantity",
  "deliveryDestination",
  "message",
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// At least 6 digits, allowing spaces, +, -, parentheses.
const PHONE_RE = /^[+]?[\d\s().-]{6,}$/

/**
 * Validates an RFQ, returning a map of field -> error key. An empty map means
 * the input is valid. Error values are i18n keys resolved by the caller, so
 * this stays presentation-agnostic.
 */
export function validateRfq(input: RfqInput): Partial<Record<RfqField, "required" | "email" | "phone" | "message">> {
  const errors: Partial<Record<RfqField, "required" | "email" | "phone" | "message">> = {}

  for (const field of REQUIRED_FIELDS) {
    if (!input[field]?.trim()) errors[field] = "required"
  }

  if (input.email.trim() && !EMAIL_RE.test(input.email.trim())) errors.email = "email"
  if (input.phone.trim() && !PHONE_RE.test(input.phone.trim())) errors.phone = "phone"
  if (input.message.trim() && input.message.trim().length < 10) errors.message = "message"

  return errors
}

/** Trims every string field so we don't persist accidental whitespace. */
export function normalizeRfq(input: RfqInput): RfqInput {
  return {
    companyName: input.companyName.trim(),
    contactPerson: input.contactPerson.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    country: input.country.trim(),
    productRequested: input.productRequested.trim(),
    quantity: input.quantity.trim(),
    targetPrice: input.targetPrice.trim(),
    deliveryDestination: input.deliveryDestination.trim(),
    message: input.message.trim(),
  }
}

export type SubmitRfqResult =
  | { ok: true }
  | { ok: false; reason: "validation" | "notFound" | "error" }

/**
 * Submits an RFQ for a supplier via the internal `/api/rfqs` route. The server
 * re-validates and writes to Supabase, so credentials stay off the browser.
 */
export async function submitRfq(supplierId: string, input: RfqInput): Promise<SubmitRfqResult> {
  try {
    const res = await fetch("/api/rfqs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ supplierId, ...normalizeRfq(input) }),
    })
    if (res.ok) return { ok: true }
    if (res.status === 400) return { ok: false, reason: "validation" }
    if (res.status === 404) return { ok: false, reason: "notFound" }
    return { ok: false, reason: "error" }
  } catch (err) {
    console.error("[rfq] Failed to submit RFQ:", err)
    return { ok: false, reason: "error" }
  }
}

export type AdminRfqsResult = {
  rfqs: RfqRow[]
  /** Set when the request could not be completed. */
  reason?: "unauthorized" | "unconfigured" | "error"
}

/**
 * Loads submitted RFQs for the admin view via `/api/admin/rfqs`, passing the
 * admin token as a bearer credential. The server reads the RLS-protected table
 * with the service-role key.
 */
export async function fetchAdminRfqs(token: string): Promise<AdminRfqsResult> {
  try {
    const res = await fetch("/api/admin/rfqs", {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (res.status === 401) return { rfqs: [], reason: "unauthorized" }
    if (res.status === 503) return { rfqs: [], reason: "unconfigured" }
    if (!res.ok) return { rfqs: [], reason: "error" }
    const json = (await res.json()) as { rfqs?: RfqRow[] }
    return { rfqs: json.rfqs ?? [] }
  } catch (err) {
    console.error("[rfq] Failed to load RFQs:", err)
    return { rfqs: [], reason: "error" }
  }
}
