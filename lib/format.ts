import type { Lang } from "@/lib/i18n"

const LOCALES: Record<Lang, string> = { en: "en-US", fr: "fr-FR", ar: "ar-TN" }

/** Formats a numeric price with its currency, localised to the active language. */
export function formatPrice(price: number, currency: string, lang: Lang): string {
  // Use Tunisian Dinar (د.ت) as the displayed currency.
  // If the currency is USD or $, convert using an approximate exchange rate of 3.1.
  const displayPrice = currency === "USD" || currency === "$" ? price * 3.1 : price

  try {
    const formatted = displayPrice.toLocaleString(LOCALES[lang] || "en-US", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    })
    return `${formatted} د.ت`
  } catch {
    return `${displayPrice.toLocaleString(LOCALES[lang] || "en-US")} د.ت`
  }
}

/** Formats an integer (e.g. MOQ, stock) localised to the active language. */
export function formatNumber(value: number, lang: Lang): string {
  return value.toLocaleString(LOCALES[lang] || "en-US")
}
