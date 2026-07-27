// Canonical site origin, used for metadata, canonical URLs, robots and the
// sitemap. Prefers an explicit env override, then Vercel's deployment URL,
// then the known production domain.
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, "")
  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL?.trim() || process.env.VERCEL_URL?.trim()
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`
  return "https://alsouk-platform.vercel.app"
}

export const SITE_URL = resolveSiteUrl()
export const SITE_NAME = "ALSOUK"
