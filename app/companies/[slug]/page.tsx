"use client"

import { use, useEffect, useState } from "react"
import { LanguageProvider } from "@/components/language-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SupplierProfile } from "@/components/directory/supplier-profile"
import { AssistantWidget } from "@/components/ai/assistant-widget"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { createClient } from "@/lib/supabase/client"

export default function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [companyId, setCompanyId] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    let active = true
    const supabase = createClient()
    supabase
      .from("companies")
      .select("id")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }: { data: { id: string } | null }) => {
        if (!active) return
        setCompanyId(data?.id ?? null)
      })
    return () => {
      active = false
    }
  }, [slug])

  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 pb-16 lg:pb-0">
          {companyId === undefined ? (
            <div className="flex h-64 items-center justify-center">
              <div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
            </div>
          ) : companyId === null ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-center px-4">
              <p className="text-sm font-bold text-foreground">Company not found</p>
            </div>
          ) : (
            <SupplierProfile id={companyId} />
          )}
        </main>
        <SiteFooter />
        <AssistantWidget />
        <MobileBottomNav />
      </div>
    </LanguageProvider>
  )
}
