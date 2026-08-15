import type { CompanySummary } from "@/lib/domains/company/types"
import type { StoreSummary } from "@/lib/domains/store/types"
import type { Category } from "@/lib/domains/category/types"

export interface ProductImage {
  id: string
  url: string | null
  storageBucket: string
  storagePath: string
  alt: string | null
  isPrimary: boolean
  position: number
}

export interface Product {
  id: string
  storeId: string
  companyId: string
  name: string
  slug: string
  sku: string | null
  description: string | null
  price: number | null
  currency: string
  minOrderQuantity: number | null
  unit: string | null
  stockQuantity: number | null
  isActive: boolean
  images: ProductImage[]
  primaryImage: ProductImage | null
  createdAt?: string
}

/** Lightweight product shape for cards and listings. */
export interface ProductSummary {
  id: string
  name: string
  slug: string
  price: number | null
  currency: string
  minOrderQuantity: number | null
  unit: string | null
  primaryImage: ProductImage | null
}

/** A product with its store, company and categories for the detail page. */
export interface ProductDetails extends Product {
  store: StoreSummary | null
  company: CompanySummary | null
  categories: Category[]
}
