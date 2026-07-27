import type { CompanySummary } from "@/lib/domains/company/types"
import type { ProductSummary } from "@/lib/domains/product/types"
import type { Category } from "@/lib/domains/category/types"

export interface Store {
  id: string
  companyId: string
  name: string
  slug: string
  tagline: string | null
  description: string | null
  logoUrl: string | null
  bannerUrl: string | null
  isActive: boolean
  createdAt?: string
}

export interface StoreSummary {
  id: string
  name: string
  slug: string
  logoUrl: string | null
}

/** A storefront with its owning company, catalogue and categories. */
export interface StoreDetails extends Store {
  company: CompanySummary | null
  products: ProductSummary[]
  categories: Category[]
}
