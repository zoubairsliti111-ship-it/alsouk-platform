"use client"

import { use } from "react"
import { MarketplaceShell } from "@/components/marketplace/shell"
import { ProductDetailsView } from "@/components/marketplace/product-details"

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <MarketplaceShell>
      <ProductDetailsView id={id} />
    </MarketplaceShell>
  )
}
