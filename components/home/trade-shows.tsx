"use client"

import Link from "next/link"
import { ArrowRight, CalendarDays, MapPin } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

export function TradeShows() {
  const { t } = useLanguage()

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
      <div className="mb-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
          <CalendarDays className="size-3.5" />
          {t.home.tradeShowsTag}
        </span>
        <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
          {t.home.tradeShowsTitle}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.home.tradeShowsSubtitle}</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {t.home.tradeShowItems.map((s, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-accent/5 p-5 transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div aria-hidden className="pointer-events-none absolute -end-8 -top-8 size-24 rounded-full bg-primary/10 blur-2xl" />
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-background px-2.5 py-1 text-xs font-semibold text-primary shadow-sm">
              <CalendarDays className="size-3.5" />
              {s.date}
            </span>
            <h3 className="mt-3 text-lg font-bold text-foreground">{s.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              {s.city}
            </p>
            <Link
              href="/rfq"
              className={buttonVariants({ variant: "outline", size: "sm", className: "mt-4 w-full" })}
            >
              {t.home.register}
              <ArrowRight className="size-3.5 rtl:rotate-180" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
