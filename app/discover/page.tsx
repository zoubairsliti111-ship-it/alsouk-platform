"use client"

import { Compass } from "lucide-react"
import { MarketplaceShell } from "@/components/marketplace/shell"
import { SoonScreen } from "@/components/soon-screen"
import { useLanguage } from "@/components/language-provider"

function DiscoverScreen() {
  const { t } = useLanguage()
  return <SoonScreen icon={Compass} title={t.home.videosTitle} body={t.home.videosSubtitle} />
}

export default function DiscoverPage() {
  return (
    <MarketplaceShell>
      <DiscoverScreen />
    </MarketplaceShell>
  )
}
