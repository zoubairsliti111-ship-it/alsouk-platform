import type { Company } from "@/lib/domains/company/types"

export async function getCompanies(): Promise<Company[]> {
  return []
}

export async function getCompanyBySlug(
  slug: string,
): Promise<Company | null> {
  void slug
  return null
}
