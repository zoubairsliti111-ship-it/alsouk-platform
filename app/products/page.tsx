"use client"

import { MarketplaceShell } from "@/components/marketplace/shell"
import { ProductsListing } from "@/components/marketplace/products-listing"

export default function ProductsPage() {
  return (
    <MarketplaceShell>
      <ProductsListing />
    </MarketplaceShell>
  )
}
