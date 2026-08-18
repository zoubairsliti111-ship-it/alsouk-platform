import { NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rate-limit/api"
import { getServiceClient } from "@/lib/supabase/service"

export const dynamic = "force-dynamic"

const RATE_LIMIT_MAX = 8
const RATE_LIMIT_WINDOW_SECONDS = 3600

/**
 * Pre-flight check called before the client hits supabase.auth.signUp().
 *
 * Mitigation, not a fix, for the phone-signup account-squatting gap (no
 * OTP verifies the caller actually owns the phone number): rate-limits
 * signup attempts per IP so mass/automated squatting is slowed down, and
 * gives an honest "this account already exists" message instead of the
 * generic error signUp() would otherwise surface after a full form fill.
 */
export async function POST(request: Request) {
  const allowed = await checkRateLimit(request, "signup", RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_SECONDS)
  if (!allowed) {
    return NextResponse.json(
      { ok: false, reason: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(RATE_LIMIT_WINDOW_SECONDS) } },
    )
  }

  let body: { email?: unknown }
  try {
    body = (await request.json()) as { email?: unknown }
  } catch {
    return NextResponse.json({ ok: false, reason: "validation" }, { status: 400 })
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  if (!email) {
    return NextResponse.json({ ok: false, reason: "validation" }, { status: 400 })
  }

  const service = getServiceClient()
  if (!service) {
    // Server not configured — fail open, same policy as checkRateLimit:
    // this guard must never be the reason a real signup breaks.
    return NextResponse.json({ ok: true })
  }

  const { data, error } = await service.rpc("email_registered", { p_email: email })
  if (error) {
    console.error("[signup-guard] email_registered check failed:", error)
    return NextResponse.json({ ok: true })
  }

  if (data === true) {
    return NextResponse.json({ ok: false, reason: "already_registered" }, { status: 409 })
  }

  return NextResponse.json({ ok: true })
}
