"use client"

import { useEffect, useState } from "react"
import { Building2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { fetchCompanies } from "@/lib/services/companies-client"
import type { Company } from "@/lib/domains/company/types"
import { Breadcrumbs, CardGridSkeleton, ListingHeader, MessageState } from "@/components/marketplace/shell"
import { CompanyCard } from "@/components/marketplace/company-card"

export function CompaniesListing() {
  const { t } = useLanguage()
  const m = t.marketplace.companies
  const [status, setStatus] = useState<"loading" | "loaded">("loading")
  const [companies, setCompanies] = useState<Company[]>([])

  useEffect(() => {
    let active = true
    fetchCompanies().then((data) => {
      if (!active) return
      setCompanies(data)
      setStatus("loaded")
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <Breadcrumbs items={[{ label: t.marketplace.breadcrumbHome, href: "/" }, { label: m.title }]} />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ListingHeader title={m.title} subtitle={m.subtitle} />
        {status === "loading" ? (
          <CardGridSkeleton />
        ) : companies.length === 0 ? (
          <MessageState icon={<Building2 className="size-7" />} title={m.empty} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((c) => (
              <CompanyCard key={c.id} company={c} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
