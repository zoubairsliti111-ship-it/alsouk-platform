"use client"

import { MarketplaceShell } from "@/components/marketplace/shell"
import { RfqRequestPage } from "@/components/rfq/rfq-request-page"

export default function RfqPage() {
  return (
    <MarketplaceShell>
      <RfqRequestPage />
    </MarketplaceShell>
  )
}
