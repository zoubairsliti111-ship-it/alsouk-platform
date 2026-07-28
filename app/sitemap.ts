import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"
import { getCompanies } from "@/lib/services/companies-service"
import { getCategories } from "@/lib/services/categories-service"
import { getProducts } from "@/lib/services/products-service"
import { fetchSuppliers } from "@/lib/supabase/suppliers-service"

export const revalidate = 3600

const STATIC_PATHS = ["", "/companies", "/suppliers", "/categories", "/products", "/rfq", "/search"]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: path === "" ? 1 : 0.7,
  }))

  // Dynamic catalogue entries. Each source degrades to [] on failure so a
  // single backend hiccup never breaks the whole sitemap.
  const [companies, categories, products, suppliers] = await Promise.all([
    getCompanies().catch(() => []),
    getCategories().catch(() => []),
    getProducts().catch(() => []),
    fetchSuppliers({ limit: 1000, cache: "force-cache" })
      .then((r) => r.suppliers)
      .catch(() => []),
  ])

  for (const c of companies) {
    entries.push({ url: `${SITE_URL}/companies/${c.slug}`, lastModified: now, priority: 0.6 })
  }
  for (const c of categories) {
    entries.push({ url: `${SITE_URL}/categories/${c.slug}`, lastModified: now, priority: 0.5 })
  }
  for (const p of products) {
    entries.push({ url: `${SITE_URL}/products/${p.id}`, lastModified: now, priority: 0.6 })
  }
  for (const s of suppliers) {
    entries.push({ url: `${SITE_URL}/suppliers/${s.id}`, lastModified: now, priority: 0.6 })
  }

  return entries
}
