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
    <section id="opportunities" className="mx-auto max-w-7xl px-6 py-10 lg:py-16">
      <div className="flex items-end justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/8 px-2.5 py-1 text-xs font-bold text-accent">
            <PackageSearch className="size-3.5" />
            {t.home.opportunitiesTag}
          </span>
          <h2 className="mt-2.5 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {t.home.opportunitiesTitle}
          </h2>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">{t.home.opportunitiesSubtitle}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {opportunities.map((o, i) => (
          <div
            key={i}
            className="group flex items-center gap-5 rounded-[20px] border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
          >
            <span className="flex size-14 shrink-0 items-center justify-center rounded-[16px] bg-accent/8 text-accent transition-all duration-300 group-hover:bg-accent group-hover:text-accent-foreground group-hover:shadow-md group-hover:shadow-accent/10">
              <PackageSearch className="size-7" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {t.home.buyerIn} {o.location}
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/8 px-2 py-0.5 text-[10px] font-bold text-accent">
                  <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                  {t.home.openLabel}
                </span>
              </div>
              <p className="mt-1.5 truncate text-base font-extrabold text-foreground transition-colors group-hover:text-accent">
                {t.home.sourcing} {o.name}
              </p>
              <p className="text-xs font-semibold text-muted-foreground">
                {t.products.moq}: {o.moq}
              </p>
            </div>
            <Link
              href="/rfq"
              className={buttonVariants({ size: "sm", className: "shrink-0 rounded-xl bg-accent px-4 py-4 text-xs font-bold text-accent-foreground shadow-sm transition-all duration-300 hover:bg-accent/90 active:scale-95" })}
            >
              {t.home.quoteNow}
              <ArrowRight className="size-3.5 ml-1 rtl:mr-1 rtl:rotate-180" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
