"use client"

import { use } from "react"
import { MarketplaceShell } from "@/components/marketplace/shell"
import { StorePage } from "@/components/marketplace/store-page"

export default function StoreRoutePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return (
    <MarketplaceShell>
      <StorePage slug={slug} />
    </MarketplaceShell>
  )
}
