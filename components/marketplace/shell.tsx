"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { LanguageProvider, useLanguage } from "@/components/language-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AssistantWidget } from "@/components/ai/assistant-widget"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

/** Page wrapper: language context + shared header/footer chrome. */
export function MarketplaceShell({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 pb-16 lg:pb-0">{children}</main>
        <SiteFooter />
        <AssistantWidget />
        <MobileBottomNav />
      </div>
    </LanguageProvider>
  )
}

export type Crumb = { label: string; href?: string }

/** Breadcrumb trail; RTL-aware separators. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="border-b border-border bg-secondary/30">
      <ol className="mx-auto flex max-w-6xl flex-wrap items-center gap-1.5 px-4 py-3 text-sm text-muted-foreground">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="size-3.5 shrink-0 rtl:rotate-180" aria-hidden="true" />}
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** Simple centered message state (empty / error). */
export function MessageState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
        {icon}
      </div>
      <h2 className="mt-5 text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
      {description && <p className="mt-2 text-muted-foreground">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

/** Grid of pulsing skeleton cards while a list loads. */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-56 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  )
}

/** Section heading used across listing pages. */
export function ListingHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const { dir } = useLanguage()
  return (
    <div className="mb-8" dir={dir}>
      <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>
    </div>
  )
}
