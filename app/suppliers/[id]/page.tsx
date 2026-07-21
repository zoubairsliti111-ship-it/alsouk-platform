"use client"

import { use } from "react"
import { LanguageProvider } from "@/components/language-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SupplierProfile } from "@/components/directory/supplier-profile"

export default function SupplierProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1">
          <SupplierProfile id={id} />
        </main>
        <SiteFooter />
      </div>
    </LanguageProvider>
  )
}
