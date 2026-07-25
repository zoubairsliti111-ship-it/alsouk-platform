export interface Company {
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  cover?: string
  country: string
  city: string
  verified: boolean
  rating: number
  createdAt?: string
}

export interface CompanySummary {
  id: string
  name: string
  slug: string
  logo?: string
}
