"use client"

import { use } from "react"
import { MarketplaceShell } from "@/components/marketplace/shell"
import { CompanyDetailsView } from "@/components/marketplace/company-details"

export default function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return (
    <MarketplaceShell>
      <CompanyDetailsView slug={slug} />
    </MarketplaceShell>
  )
}
