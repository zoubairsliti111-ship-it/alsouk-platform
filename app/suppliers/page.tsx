"use client"

import { LanguageProvider } from "@/components/language-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SuppliersDirectory } from "@/components/directory/suppliers-directory"

export default function SuppliersPage() {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1">
          <SuppliersDirectory />
        </main>
        <SiteFooter />
      </div>
    </LanguageProvider>
  )
}
