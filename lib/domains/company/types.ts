import type { StoreSummary } from "@/lib/domains/store/types"
import type { Category } from "@/lib/domains/category/types"

export interface Company {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  website: string | null
  country: string | null
  city: string | null
  verified: boolean
  createdAt?: string
}

export interface CompanySummary {
  id: string
  name: string
  slug: string
  logoUrl: string | null
}

/** A company with its storefronts and operating categories. */
export interface CompanyDetails extends Company {
  stores: StoreSummary[]
  categories: Category[]
}
