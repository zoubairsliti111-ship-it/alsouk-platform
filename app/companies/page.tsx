"use client"

import { MarketplaceShell } from "@/components/marketplace/shell"
import { CompaniesListing } from "@/components/marketplace/companies-listing"

export default function CompaniesPage() {
  return (
    <MarketplaceShell>
      <CompaniesListing />
    </MarketplaceShell>
  )
}
