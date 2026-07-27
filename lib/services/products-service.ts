import { restGet } from "@/lib/supabase/rest"
import type {
  Product,
  ProductDetails,
  ProductImage,
  ProductSummary,
} from "@/lib/domains/product/types"
import { CATEGORY_COLUMNS, mapCategory, type CategoryRow } from "@/lib/services/categories-service"

/** Shape of a row in the Supabase `product_images` table (snake_case). */
export type ProductImageRow = {
  id: string
  url: string | null
  storage_bucket: string | null
  storage_path: string
  alt: string | null
  is_primary: boolean
  position: number | null
}

/** Shape of a row in the Supabase `products` table (snake_case). */
export type ProductRow = {
  id: string
  store_id: string
  company_id: string
  name: string
  slug: string
  sku: string | null
  description: string | null
  price: number | string | null
  currency: string | null
  min_order_quantity: number | null
  unit: string | null
  stock_quantity: number | null
  is_active: boolean
  created_at?: string
  product_images?: ProductImageRow[]
}

export const PRODUCT_IMAGE_COLUMNS = "id,url,storage_bucket,storage_path,alt,is_primary,position"

export const PRODUCT_COLUMNS =
  "id,store_id,company_id,name,slug,sku,description,price,currency,min_order_quantity,unit,stock_quantity,is_active,created_at"

/** Columns for a listing card: core fields plus images (primary is derived). */
export const PRODUCT_LIST_SELECT = `${PRODUCT_COLUMNS},product_images(${PRODUCT_IMAGE_COLUMNS})`

function mapImage(row: ProductImageRow): ProductImage | null {
  if (!row?.id || !row.storage_path) return null
  return {
    id: row.id,
    url: row.url?.trim() || null,
    storageBucket: row.storage_bucket?.trim() || "product-images",
    storagePath: row.storage_path,
    alt: row.alt?.trim() || null,
    isPrimary: Boolean(row.is_primary),
    position: Number(row.position) || 0,
  }
}

function mapImages(rows: ProductImageRow[] | undefined): ProductImage[] {
  return (rows ?? [])
    .map(mapImage)
    .filter((i): i is ProductImage => i !== null)
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.position - b.position)
}

function toPrice(value: number | string | null): number | null {
  if (value === null || value === undefined || value === "") return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/** Maps a raw product row to the full domain model, or `null` when invalid. */
export function mapProduct(row: ProductRow): Product | null {
  if (!row?.id || !row.name || !row.slug) return null
  const images = mapImages(row.product_images)
  return {
    id: row.id,
    storeId: row.store_id,
    companyId: row.company_id,
    name: row.name,
    slug: row.slug,
    sku: row.sku?.trim() || null,
    description: row.description?.trim() || null,
    price: toPrice(row.price),
    currency: row.currency?.trim() || "USD",
    minOrderQuantity: Number(row.min_order_quantity) || 1,
    unit: row.unit?.trim() || null,
    stockQuantity: row.stock_quantity === null ? null : Number(row.stock_quantity),
    isActive: Boolean(row.is_active),
    images,
    primaryImage: images[0] ?? null,
    createdAt: row.created_at,
  }
}

/** Maps a raw product row to the lightweight card model. */
export function mapProductSummary(row: ProductRow): ProductSummary | null {
  const product = mapProduct(row)
  if (!product) return null
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    currency: product.currency,
    minOrderQuantity: product.minOrderQuantity,
    unit: product.unit,
    primaryImage: product.primaryImage,
  }
}

export type ProductFilter = {
  companyId?: string
  storeId?: string
  categoryId?: string
  limit?: number
}

/** Loads active products, optionally filtered by company, store or category. */
export async function getProducts(filter: ProductFilter = {}): Promise<ProductSummary[]> {
  const limit = filter.limit && filter.limit > 0 ? filter.limit : undefined

  // Category filtering goes through the product_categories join table.
  if (filter.categoryId) {
    let path =
      `product_categories?select=products(${PRODUCT_LIST_SELECT})` +
      `&category_id=eq.${encodeURIComponent(filter.categoryId)}`
    if (limit) path += `&limit=${limit}`
    const rows = await restGet<{ products: ProductRow | null }>(path)
    return rows
      .map((r) => r.products)
      .filter((p): p is ProductRow => p !== null && p.is_active !== false)
      .map(mapProductSummary)
      .filter((p): p is ProductSummary => p !== null)
  }

  let path = `products?select=${PRODUCT_LIST_SELECT}&is_active=eq.true&order=created_at.desc`
  if (filter.companyId) path += `&company_id=eq.${encodeURIComponent(filter.companyId)}`
  if (filter.storeId) path += `&store_id=eq.${encodeURIComponent(filter.storeId)}`
  if (limit) path += `&limit=${limit}`

  const rows = await restGet<ProductRow>(path)
  return rows.map(mapProductSummary).filter((p): p is ProductSummary => p !== null)
}

type ProductDetailRow = ProductRow & {
  stores?: { id: string; name: string; slug: string; logo_url: string | null } | null
  companies?: { id: string; name: string; slug: string; logo_url: string | null } | null
  product_categories?: { categories: CategoryRow | null }[]
}

/** Loads a single product by id with its store, company and categories. */
export async function getProductById(id: string): Promise<ProductDetails | null> {
  const select =
    `${PRODUCT_COLUMNS},product_images(${PRODUCT_IMAGE_COLUMNS}),` +
    `stores(id,name,slug,logo_url),companies(id,name,slug,logo_url),` +
    `product_categories(categories(${CATEGORY_COLUMNS}))`
  const rows = await restGet<ProductDetailRow>(
    `products?select=${select}&id=eq.${encodeURIComponent(id)}&limit=1`,
  )
  const row = rows[0]
  if (!row) return null
  const product = mapProduct(row)
  if (!product) return null

  const categories = (row.product_categories ?? [])
    .map((pc) => (pc.categories ? mapCategory(pc.categories) : null))
    .filter((c): c is NonNullable<typeof c> => c !== null)

  return {
    ...product,
    store: row.stores
      ? { id: row.stores.id, name: row.stores.name, slug: row.stores.slug, logoUrl: row.stores.logo_url?.trim() || null }
      : null,
    company: row.companies
      ? {
          id: row.companies.id,
          name: row.companies.name,
          slug: row.companies.slug,
          logoUrl: row.companies.logo_url?.trim() || null,
        }
      : null,
    categories,
  }
}
