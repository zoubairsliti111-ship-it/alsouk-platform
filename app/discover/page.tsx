"use client"

import { MarketplaceShell } from "@/components/marketplace/shell"
import { DiscoverFeed } from "@/components/discover-feed"

export default function DiscoverPage() {
  return (
    <MarketplaceShell>
      <DiscoverFeed />
    </MarketplaceShell>
  )
}
