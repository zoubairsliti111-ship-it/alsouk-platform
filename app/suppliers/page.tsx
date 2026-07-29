"use client"

import { LanguageProvider } from "@/components/language-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SuppliersDirectory } from "@/components/directory/suppliers-directory"
import { AssistantWidget } from "@/components/ai/assistant-widget"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

export default function SuppliersPage() {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 pb-16 lg:pb-0">
          <SuppliersDirectory />
        </main>
        <SiteFooter />
        <AssistantWidget />
        <MobileBottomNav />
      </div>
    </LanguageProvider>
  )
}
