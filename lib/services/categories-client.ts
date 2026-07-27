import type { Category } from "@/lib/domains/category/types"
import { fetchItem, fetchList, type ItemResult } from "@/lib/services/marketplace-api"

/** Loads all categories via `/api/categories`. */
export function fetchCategories(): Promise<Category[]> {
  return fetchList<Category>("/api/categories")
}

/** Loads a single category via `/api/categories/[slug]`. */
export function fetchCategoryBySlug(slug: string): Promise<ItemResult<Category>> {
  return fetchItem<Category>(`/api/categories/${encodeURIComponent(slug)}`)
}
