import { restGet } from "@/lib/supabase/rest"
import type { Category } from "@/lib/domains/category/types"

/** Shape of a row in the Supabase `categories` table (snake_case). */
export type CategoryRow = {
  id: string
  slug: string
  name: string
  description: string | null
  parent_id: string | null
  position: number | null
}

/** Columns selected from the table (no spaces, safe for a PostgREST URL). */
export const CATEGORY_COLUMNS = "id,slug,name,description,parent_id,position"

/** Maps a raw category row to the domain model, or `null` when invalid. */
export function mapCategory(row: CategoryRow): Category | null {
  if (!row?.id || !row.slug || !row.name) return null
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description?.trim() || null,
    parentId: row.parent_id ?? null,
    position: Number(row.position) || 0,
  }
}

/** Loads all categories, ordered by curated position then name. */
export async function getCategories(): Promise<Category[]> {
  const rows = await restGet<CategoryRow>(
    `categories?select=${CATEGORY_COLUMNS}&order=position.asc,name.asc`,
  )
  return rows.map(mapCategory).filter((c): c is Category => c !== null)
}

/** Loads a single category by slug, or `null` when none matches. */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const rows = await restGet<CategoryRow>(
    `categories?select=${CATEGORY_COLUMNS}&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  )
  const row = rows[0]
  return row ? mapCategory(row) : null
}
