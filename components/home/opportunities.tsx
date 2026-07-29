"use client"

import Link from "next/link"
import { ArrowRight, MapPin, PackageSearch } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

export function Opportunities() {
  const { t } = useLanguage()

  const opportunities = t.products.items.slice(0, 4).map((p, i) => ({
    name: p.name,
    moq: p.moq,
    location: t.home.locations[i % t.home.locations.length],
  }))

  return (
    <section id="opportunities" className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
            <PackageSearch className="size-3.5" />
            {t.home.opportunitiesTag}
          </span>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
            {t.home.opportunitiesTitle}
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{t.home.opportunitiesSubtitle}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {opportunities.map((o, i) => (
          <div
            key={i}
            className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <PackageSearch className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5" />
                {t.home.buyerIn} {o.location}
                <span className="ms-1 inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                  <span className="size-1.5 rounded-full bg-accent" />
                  {t.home.openLabel}
                </span>
              </p>
              <p className="mt-0.5 truncate font-semibold text-foreground">
                {t.home.sourcing} {o.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.products.moq}: {o.moq}
              </p>
            </div>
            <Link
              href="/rfq"
              className={buttonVariants({ size: "sm", className: "shrink-0 bg-accent text-accent-foreground hover:bg-accent/90" })}
            >
              {t.home.quoteNow}
              <ArrowRight className="size-3.5 rtl:rotate-180" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
