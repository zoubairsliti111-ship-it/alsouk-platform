import { timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import { ADMIN_TOKEN_VAR, SERVICE_KEY_VARS, URL_VARS, firstDefined } from "@/lib/supabase/env"

export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" } as const

/** Constant-time string comparison to avoid leaking the token via timing. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

function checkAuth(request: Request): { ok: true; url: string; serviceKey: string } | { ok: false; res: NextResponse } {
  const url = firstDefined(URL_VARS).value
  const serviceKey = firstDefined(SERVICE_KEY_VARS).value
  const adminToken = process.env[ADMIN_TOKEN_VAR]?.trim()

  if (!url || !serviceKey || !adminToken || !/^https?:\/\//.test(url)) {
    console.error("[api/admin/companies] Not configured (need service key + token).")
    return { ok: false, res: NextResponse.json({ companies: [], reason: "unconfigured" }, { status: 503, headers: NO_STORE }) }
  }

  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim()
  if (!provided || !safeEqual(provided, adminToken)) {
    return { ok: false, res: NextResponse.json({ companies: [], reason: "unauthorized" }, { status: 401, headers: NO_STORE }) }
  }

  return { ok: true, url, serviceKey }
}

const COMPANY_ADMIN_COLUMNS = "id,name,slug,country,city,verified,verification_tier,created_at"

/** Lists all companies for the admin verification view. Same admin-token pattern as /api/admin/rfqs. */
export async function GET(request: Request) {
  const auth = checkAuth(request)
  if (!auth.ok) return auth.res
  const { url, serviceKey } = auth

  try {
    const res = await fetch(
      `${url}/rest/v1/companies?select=${COMPANY_ADMIN_COLUMNS}&order=created_at.desc`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }, cache: "no-store" },
    )
    if (!res.ok) {
      const text = await res.text()
      console.error("[api/admin/companies] Query failed:", res.status, text)
      return NextResponse.json({ companies: [], reason: "error" }, { status: 502, headers: NO_STORE })
    }
    const companies = await res.json()
    return NextResponse.json({ companies }, { headers: NO_STORE })
  } catch (err) {
    console.error("[api/admin/companies] Unexpected error:", err)
    return NextResponse.json({ companies: [], reason: "error" }, { status: 500, headers: NO_STORE })
  }
}

/** Toggles a company's verified flag. Body: { companyId, verified } */
export async function PATCH(request: Request) {
  const auth = checkAuth(request)
  if (!auth.ok) return auth.res
  const { url, serviceKey } = auth

  let body: { companyId?: unknown; verified?: unknown }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400, headers: NO_STORE })
  }

  if (typeof body.companyId !== "string" || typeof body.verified !== "boolean") {
    return NextResponse.json({ error: "validation" }, { status: 400, headers: NO_STORE })
  }

  try {
    const res = await fetch(`${url}/rest/v1/companies?id=eq.${encodeURIComponent(body.companyId)}`, {
      method: "PATCH",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "content-type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        verified: body.verified,
        verification_tier: body.verified ? "verified" : "basic",
        verified_at: body.verified ? new Date().toISOString() : null,
      }),
    })
    if (!res.ok) {
      const text = await res.text()
      console.error("[api/admin/companies] Update failed:", res.status, text)
      return NextResponse.json({ error: "error" }, { status: 502, headers: NO_STORE })
    }
    return NextResponse.json({ success: true }, { headers: NO_STORE })
  } catch (err) {
    console.error("[api/admin/companies] Unexpected error:", err)
    return NextResponse.json({ error: "error" }, { status: 500, headers: NO_STORE })
  }
}
