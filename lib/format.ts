import type { Lang } from "@/lib/i18n"

const LOCALES: Record<Lang, string> = { en: "en-US", fr: "fr-FR", ar: "ar-TN" }

/** Formats a numeric price with its currency, localised to the active language. */
export function formatPrice(price: number, currency: string, lang: Lang): string {
  const code = currency.toUpperCase()

  // The storefront only has a real conversion rate for USD->TND. Any other
  // currency (e.g. a Shopify store synced in MAD/DZD/EGP) is shown with its
  // real code instead of being mislabeled as Tunisian Dinar.
  if (code !== "TND" && code !== "USD") {
    try {
      const formatted = new Intl.NumberFormat(LOCALES[lang] || "en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price)
      return `${formatted} ${code}`
    } catch {
      return `${price.toFixed(2)} ${code}`
    }
  }

  // Convert database USD prices to TND using an exchange rate of 3.1
  const priceInTnd = code === "USD" ? price * 3.1 : price

  try {
    // Format with three decimal places (millimes)
    const formattedNumber = new Intl.NumberFormat(LOCALES[lang] || "en-US", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(priceInTnd)

    // Localize currency symbols to 'د.ت' for Arabic and 'DT' for English and French.
    if (lang === "ar") {
      return `${formattedNumber} د.ت`
    } else {
      return `${formattedNumber} DT`
    }
  } catch {
    const fallbackFormatted = priceInTnd.toFixed(3)
    if (lang === "ar") {
      return `${fallbackFormatted} د.ت`
    } else {
      return `${fallbackFormatted} DT`
    }
  }
}

/** Formats an integer (e.g. MOQ, stock) localised to the active language. */
export function formatNumber(value: number, lang: Lang): string {
  return value.toLocaleString(LOCALES[lang])
}
