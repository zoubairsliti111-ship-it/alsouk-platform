export type CountryKey = "tn" | "ma" | "dz" | "eg" | "ly"
export type RegionKey = "capital" | "north" | "central" | "south" | "coastal"
export type CategoryKey =
  | "food"
  | "textiles"
  | "machinery"
  | "construction"
  | "handicrafts"
  | "cosmetics"
  | "leather"
  | "chemicals"
export type BusinessTypeKey = "manufacturer" | "supplier" | "exporter" | "wholesaler"

export type Supplier = {
  id: string
  name: string
  monogram: string
  logoColor: "blue" | "green"
  country: CountryKey
  cityKey: string
  region: RegionKey
  verified: boolean
  rating: number
  reviews: number
  products: number
  years: number
  responseRate: number
  /** smallest minimum order quantity offered, used for MOQ filtering */
  minMoq: number
  businessTypes: BusinessTypeKey[]
  categories: CategoryKey[]
}

/**
 * Supplier data is sourced from Supabase via fetchSuppliers() in
 * lib/supabase/suppliers-service.ts. See supabase/schema.sql and
 * supabase/seed.sql for the table definition and seed rows.
 */

export const COUNTRY_KEYS: CountryKey[] = ["tn", "ma", "dz", "eg", "ly"]
export const REGION_KEYS: RegionKey[] = ["capital", "north", "central", "south", "coastal"]
export const CATEGORY_KEYS: CategoryKey[] = [
  "food",
  "textiles",
  "machinery",
  "construction",
  "handicrafts",
  "cosmetics",
  "leather",
  "chemicals",
]
export const BUSINESS_TYPE_KEYS: BusinessTypeKey[] = [
  "manufacturer",
  "supplier",
  "exporter",
  "wholesaler",
]

export type MoqTier = "any" | "lt100" | "100to500" | "500to1000" | "gt1000"
export const MOQ_TIERS: MoqTier[] = ["any", "lt100", "100to500", "500to1000", "gt1000"]

export function matchesMoq(tier: MoqTier, minMoq: number): boolean {
  switch (tier) {
    case "lt100":
      return minMoq < 100
    case "100to500":
      return minMoq >= 100 && minMoq <= 500
    case "500to1000":
      return minMoq > 500 && minMoq <= 1000
    case "gt1000":
      return minMoq > 1000
    default:
      return true
  }
}

export type YearsTier = "any" | "1to3" | "3to5" | "5to10" | "gt10"
export const YEARS_TIERS: YearsTier[] = ["any", "1to3", "3to5", "5to10", "gt10"]

export function matchesYears(tier: YearsTier, years: number): boolean {
  switch (tier) {
    case "1to3":
      return years >= 1 && years <= 3
    case "3to5":
      return years > 3 && years <= 5
    case "5to10":
      return years > 5 && years <= 10
    case "gt10":
      return years > 10
    default:
      return true
  }
}
