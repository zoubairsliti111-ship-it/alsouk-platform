// Server-side rate limiting for public API routes (no session required to
// call them). Backed by the `check_rate_limit` Postgres function (migration
// 0056), so the counter is shared across serverless instances instead of
// living in per-process memory.

import { getServiceClient } from "@/lib/supabase/service"

/** Best-effort caller identity: first hop of X-Forwarded-For, as set by Vercel. */
function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim()
  return ip || "unknown"
}

/**
 * Checks and records a rate-limit hit for this request against `endpoint`,
 * keyed by client IP. Returns true when the request is allowed.
 *
 * Fails open (allows the request) when the server isn't configured or the
 * DB call errors — a rate limiter must never be the reason a real user's
 * request breaks.
 */
export async function checkRateLimit(
  request: Request,
  endpoint: string,
  maxRequests: number,
  windowSeconds: number,
): Promise<boolean> {
  const service = getServiceClient()
  if (!service) return true

  const { data, error } = await service.rpc("check_rate_limit", {
    p_key: clientKey(request),
    p_endpoint: endpoint,
    p_max_requests: maxRequests,
    p_window_seconds: windowSeconds,
  })

  if (error) {
    console.error(`[rate-limit] check failed for ${endpoint}:`, error)
    return true
  }
  return data === true
}
