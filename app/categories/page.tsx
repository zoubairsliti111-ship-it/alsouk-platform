"use client"

import { MarketplaceShell } from "@/components/marketplace/shell"
import { CategoriesListing } from "@/components/marketplace/categories-listing"

export default function CategoriesPage() {
  return (
    <MarketplaceShell>
      <CategoriesListing />
    </MarketplaceShell>
  )
}
