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

export const suppliers: Supplier[] = [
  {
    id: "medina-olive",
    name: "Medina Olive Co.",
    monogram: "MO",
    logoColor: "green",
    country: "tn",
    cityKey: "sfax",
    region: "coastal",
    verified: true,
    rating: 4.9,
    reviews: 312,
    products: 148,
    years: 8,
    responseRate: 98,
    minMoq: 500,
    businessTypes: ["manufacturer", "exporter"],
    categories: ["food", "cosmetics"],
  },
  {
    id: "carthage-textiles",
    name: "Carthage Textiles",
    monogram: "CT",
    logoColor: "blue",
    country: "tn",
    cityKey: "monastir",
    region: "coastal",
    verified: true,
    rating: 4.8,
    reviews: 268,
    products: 512,
    years: 12,
    responseRate: 96,
    minMoq: 1000,
    businessTypes: ["manufacturer", "wholesaler"],
    categories: ["textiles", "leather"],
  },
  {
    id: "atlas-ceramics",
    name: "Atlas Ceramics",
    monogram: "AC",
    logoColor: "green",
    country: "tn",
    cityKey: "nabeul",
    region: "capital",
    verified: true,
    rating: 4.7,
    reviews: 154,
    products: 96,
    years: 6,
    responseRate: 94,
    minMoq: 200,
    businessTypes: ["manufacturer", "supplier"],
    categories: ["handicrafts", "construction"],
  },
  {
    id: "sahara-dates",
    name: "Sahara Dates Export",
    monogram: "SD",
    logoColor: "green",
    country: "tn",
    cityKey: "tozeur",
    region: "south",
    verified: true,
    rating: 5.0,
    reviews: 421,
    products: 64,
    years: 10,
    responseRate: 99,
    minMoq: 1000,
    businessTypes: ["exporter", "wholesaler"],
    categories: ["food"],
  },
  {
    id: "kairouan-leather",
    name: "Kairouan Leather",
    monogram: "KL",
    logoColor: "blue",
    country: "tn",
    cityKey: "kairouan",
    region: "central",
    verified: true,
    rating: 4.6,
    reviews: 189,
    products: 233,
    years: 15,
    responseRate: 92,
    minMoq: 100,
    businessTypes: ["manufacturer", "exporter"],
    categories: ["leather"],
  },
  {
    id: "tunis-metalworks",
    name: "Tunis Metalworks",
    monogram: "TM",
    logoColor: "blue",
    country: "tn",
    cityKey: "tunis",
    region: "capital",
    verified: false,
    rating: 4.4,
    reviews: 87,
    products: 178,
    years: 4,
    responseRate: 88,
    minMoq: 50,
    businessTypes: ["manufacturer", "supplier"],
    categories: ["machinery", "chemicals"],
  },
  {
    id: "atlas-argan",
    name: "Atlas Argan Group",
    monogram: "AA",
    logoColor: "green",
    country: "ma",
    cityKey: "casablanca",
    region: "coastal",
    verified: true,
    rating: 4.9,
    reviews: 376,
    products: 122,
    years: 11,
    responseRate: 97,
    minMoq: 300,
    businessTypes: ["manufacturer", "exporter"],
    categories: ["cosmetics", "food"],
  },
  {
    id: "marrakech-crafts",
    name: "Marrakech Crafts House",
    monogram: "MC",
    logoColor: "blue",
    country: "ma",
    cityKey: "marrakech",
    region: "central",
    verified: true,
    rating: 4.7,
    reviews: 204,
    products: 640,
    years: 9,
    responseRate: 93,
    minMoq: 100,
    businessTypes: ["wholesaler", "supplier"],
    categories: ["handicrafts", "textiles"],
  },
  {
    id: "sahel-industries",
    name: "Sahel Industries",
    monogram: "SI",
    logoColor: "blue",
    country: "dz",
    cityKey: "algiers",
    region: "capital",
    verified: true,
    rating: 4.5,
    reviews: 132,
    products: 289,
    years: 18,
    responseRate: 90,
    minMoq: 500,
    businessTypes: ["manufacturer"],
    categories: ["chemicals", "construction"],
  },
  {
    id: "oran-agrifoods",
    name: "Oran AgriFoods",
    monogram: "OA",
    logoColor: "green",
    country: "dz",
    cityKey: "oran",
    region: "coastal",
    verified: false,
    rating: 4.3,
    reviews: 76,
    products: 54,
    years: 3,
    responseRate: 85,
    minMoq: 1000,
    businessTypes: ["supplier", "wholesaler"],
    categories: ["food"],
  },
  {
    id: "nile-cotton",
    name: "Nile Cotton Mills",
    monogram: "NC",
    logoColor: "blue",
    country: "eg",
    cityKey: "cairo",
    region: "capital",
    verified: true,
    rating: 4.8,
    reviews: 512,
    products: 431,
    years: 22,
    responseRate: 95,
    minMoq: 2000,
    businessTypes: ["manufacturer", "exporter", "wholesaler"],
    categories: ["textiles"],
  },
  {
    id: "delta-machinery",
    name: "Delta Machinery Co.",
    monogram: "DM",
    logoColor: "blue",
    country: "eg",
    cityKey: "alexandria",
    region: "coastal",
    verified: true,
    rating: 4.6,
    reviews: 168,
    products: 205,
    years: 14,
    responseRate: 91,
    minMoq: 10,
    businessTypes: ["manufacturer", "supplier"],
    categories: ["machinery"],
  },
  {
    id: "tripoli-build",
    name: "Tripoli BuildTech",
    monogram: "TB",
    logoColor: "green",
    country: "ly",
    cityKey: "tripoli",
    region: "coastal",
    verified: false,
    rating: 4.2,
    reviews: 49,
    products: 88,
    years: 5,
    responseRate: 82,
    minMoq: 200,
    businessTypes: ["supplier", "wholesaler"],
    categories: ["construction"],
  },
  {
    id: "benghazi-chem",
    name: "Benghazi Chemicals",
    monogram: "BC",
    logoColor: "blue",
    country: "ly",
    cityKey: "benghazi",
    region: "coastal",
    verified: true,
    rating: 4.5,
    reviews: 103,
    products: 141,
    years: 7,
    responseRate: 89,
    minMoq: 500,
    businessTypes: ["manufacturer"],
    categories: ["chemicals", "cosmetics"],
  },
]

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
