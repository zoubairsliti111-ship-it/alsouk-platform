import type { Company, CompanyDetails } from "@/lib/domains/company/types"
import { fetchItem, fetchList, type ItemResult } from "@/lib/services/marketplace-api"

/** Loads all companies via `/api/companies`. */
export function fetchCompanies(): Promise<Company[]> {
  return fetchList<Company>("/api/companies")
}

/** Loads a single company (with stores + categories) via `/api/companies/[slug]`. */
export function fetchCompanyBySlug(slug: string): Promise<ItemResult<CompanyDetails>> {
  return fetchItem<CompanyDetails>(`/api/companies/${encodeURIComponent(slug)}`)
}
