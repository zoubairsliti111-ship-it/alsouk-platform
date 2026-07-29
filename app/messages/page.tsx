"use client"

import { MessageCircle } from "lucide-react"
import { MarketplaceShell } from "@/components/marketplace/shell"
import { SoonScreen } from "@/components/soon-screen"
import { useLanguage } from "@/components/language-provider"

function MessagesScreen() {
  const { t } = useLanguage()
  return <SoonScreen icon={MessageCircle} title={t.soon.messagesTitle} body={t.soon.messagesBody} />
}

export default function MessagesPage() {
  return (
    <MarketplaceShell>
      <MessagesScreen />
    </MarketplaceShell>
  )
}
