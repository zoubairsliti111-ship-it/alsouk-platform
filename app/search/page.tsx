"use client"

import { Suspense } from "react"
import { MarketplaceShell } from "@/components/marketplace/shell"
import { SearchView } from "@/components/marketplace/search-view"

export default function SearchPage() {
  return (
    <MarketplaceShell>
      <Suspense fallback={null}>
        <SearchView />
      </Suspense>
    </MarketplaceShell>
  )
}
