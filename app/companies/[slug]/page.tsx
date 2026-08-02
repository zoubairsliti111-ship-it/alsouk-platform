"use client"

import { use } from "react"
import { MarketplaceShell } from "@/components/marketplace/shell"
import { CompanyProfile } from "@/components/marketplace/company-profile"

export default function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return (
    <MarketplaceShell>
      <CompanyProfile slug={slug} />
    </MarketplaceShell>
  )
}
