import type { Lang } from "@/lib/i18n"

const LOCALES: Record<Lang, string> = { en: "en-US", fr: "fr-FR", ar: "ar-TN" }

/** Formats a numeric price with its currency, localised to the active language. */
export function formatPrice(price: number, currency: string, lang: Lang): string {
  try {
    return new Intl.NumberFormat(LOCALES[lang], {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(price)
  } catch {
    return `${price.toLocaleString(LOCALES[lang])} ${currency}`
  }
}

/** Formats an integer (e.g. MOQ, stock) localised to the active language. */
export function formatNumber(value: number, lang: Lang): string {
  return value.toLocaleString(LOCALES[lang])
}
