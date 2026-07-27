"use client"

import { use } from "react"
import { MarketplaceShell } from "@/components/marketplace/shell"
import { CategoryDetailsView } from "@/components/marketplace/category-details"

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return (
    <MarketplaceShell>
      <CategoryDetailsView slug={slug} />
    </MarketplaceShell>
  )
}
