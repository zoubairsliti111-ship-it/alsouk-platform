"use client"

import { LanguageProvider } from "@/components/language-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { RfqAdmin } from "@/components/admin/rfq-admin"

export default function AdminRfqsPage() {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1">
          <RfqAdmin />
        </main>
        <SiteFooter />
      </div>
    </LanguageProvider>
  )
}
