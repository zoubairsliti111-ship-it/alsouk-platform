"use client"

import type { ReactNode } from "react"
import { LanguageProvider } from "@/components/language-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </LanguageProvider>
  )
}
