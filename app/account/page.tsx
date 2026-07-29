"use client"

import { User } from "lucide-react"
import { MarketplaceShell } from "@/components/marketplace/shell"
import { SoonScreen } from "@/components/soon-screen"
import { useLanguage } from "@/components/language-provider"

function AccountScreen() {
  const { t } = useLanguage()
  return <SoonScreen icon={User} title={t.soon.accountTitle} body={t.soon.accountBody} />
}

export default function AccountPage() {
  return (
    <MarketplaceShell>
      <AccountScreen />
    </MarketplaceShell>
  )
}
