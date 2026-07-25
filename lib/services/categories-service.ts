import type { Category } from "@/lib/domains/category/types"

export async function getCategories(): Promise<Category[]> {
  return []
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  void slug
  return null
}
