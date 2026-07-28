"use client"

import { useLanguage } from "@/components/language-provider"
import { ArrowRight, MapPin, Package, Sparkles, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function OpportunitiesSection() {
  const { t, dir } = useLanguage()

  return (
    <section id="opportunities" className="py-12 border-b border-border bg-secondary/25">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-accent">
              <Sparkles className="size-3.5 fill-current" />
              {t.opportunities.badge}
            </span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {t.opportunities.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              {t.opportunities.subtitle}
            </p>
          </div>

          <Link
            href="/products"
            className="group hidden items-center gap-1.5 text-xs font-bold text-primary hover:underline sm:inline-flex"
          >
            <span>{t.opportunities.viewAll}</span>
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180" />
          </Link>
        </div>

        {/* Horizontally Scrollable Opportunities Container */}
        <div
          className="scrollbar-none mt-8 flex w-full gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
          dir={dir}
        >
          {t.opportunities.items.map((item, index) => (
            <div
              key={index}
              className="group relative flex w-[280px] shrink-0 snap-start flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/25 hover:shadow-md sm:w-[320px]"
            >
              <div>
                {/* Badge and Type row */}
                <div className="flex items-center justify-between">
                  <span className="inline-block rounded-md bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground uppercase">
                    {item.type}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                    <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                    {item.badge}
                  </span>
                </div>

                {/* Sourcing Opportunity Title */}
                <h3 className="mt-4 line-clamp-2 text-sm font-bold text-foreground group-hover:text-primary transition-colors sm:text-base">
                  {item.title}
                </h3>

                {/* Supplier detail info */}
                <div className="mt-4 space-y-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Store className="size-3.5 text-primary shrink-0" />
                    <span className="truncate font-semibold text-foreground/80">{item.supplier}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Package className="size-3.5 text-muted-foreground shrink-0" />
                    <span>{t.products.moq}: <strong className="text-foreground">{item.moq}</strong></span>
                  </div>
                </div>
              </div>

              {/* Price Tier and CTA button */}
              <div className="mt-5 border-t border-border/60 pt-3">
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.products.perUnit}</span>
                  <span className="text-sm font-extrabold text-primary sm:text-base">{item.price}</span>
                </div>

                <Link href="/rfq" className="block w-full">
                  <Button
                    size="sm"
                    className="w-full rounded-xl bg-primary text-xs font-semibold py-4 hover:bg-primary/95 transition-all"
                  >
                    {t.products.inquire}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View all fallback link for smaller mobile screens */}
        <div className="mt-4 text-center sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <span>{t.opportunities.viewAll}</span>
            <ArrowRight className="size-3.5 rtl:rotate-180" />
          </Link>
        </div>

      </div>
    </section>
  )
}
