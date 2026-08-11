"use client"

import { LanguageProvider } from "@/components/language-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CompaniesAdmin } from "@/components/admin/companies-admin"

export default function AdminCompaniesPage() {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1">
          <CompaniesAdmin />
        </main>
        <SiteFooter />
      </div>
    </LanguageProvider>
  )
}
