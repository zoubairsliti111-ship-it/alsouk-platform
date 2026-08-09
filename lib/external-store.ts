/**
 * Validation for the merchant-supplied "external store" address.
 *
 * Shared by the account form (before saving) and by any consumer that needs
 * to decide whether a stored value is safe to render as a link. Only
 * absolute http(s) URLs are accepted, so a stored value can never turn into
 * a `javascript:` or `data:` link on the public profile.
 */

export type ExternalStoreUrlResult =
  | { ok: true; url: string }
  | { ok: false; reason: "empty" | "invalid" }

/**
 * Normalises merchant input into a canonical absolute URL.
 * A bare host such as `mystore.com` is accepted and upgraded to `https://`.
 */
export function normalizeExternalStoreUrl(input: string): ExternalStoreUrlResult {
  const trimmed = input.trim()
  if (!trimmed) return { ok: false, reason: "empty" }

  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  let parsed: URL
  try {
    parsed = new URL(candidate)
  } catch {
    return { ok: false, reason: "invalid" }
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, reason: "invalid" }
  }
  // A hostname with no dot (e.g. "localhost", "mystore") is a typo, not a store.
  if (!parsed.hostname.includes(".") || parsed.hostname.endsWith(".")) {
    return { ok: false, reason: "invalid" }
  }

  return { ok: true, url: parsed.toString() }
}

/** Returns the URL when it is a safe, absolute http(s) link, otherwise null. */
export function safeExternalStoreUrl(value: string | null | undefined): string | null {
  if (!value) return null
  const result = normalizeExternalStoreUrl(value)
  return result.ok ? result.url : null
}

/** `mystore.com` — the host shown next to the link so buyers see where it goes. */
export function externalStoreLabel(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, "")
  } catch {
    return value
  }
}
