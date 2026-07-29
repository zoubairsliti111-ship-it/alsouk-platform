"use client"

import Link from "next/link"
import { ArrowRight, CalendarDays, MapPin } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

export function TradeShows() {
  const { t } = useLanguage()

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:py-16">
      <div className="mb-8 border-b border-border/60 pb-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/8 px-2.5 py-1 text-xs font-bold text-accent">
          <CalendarDays className="size-3.5" />
          {t.home.tradeShowsTag}
        </span>
        <h2 className="mt-2.5 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {t.home.tradeShowsTitle}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{t.home.tradeShowsSubtitle}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {t.home.tradeShowItems.map((s, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-[20px] border border-border bg-gradient-to-br from-primary/5 to-accent/5 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg"
          >
            <div aria-hidden className="pointer-events-none absolute -end-8 -top-8 size-24 rounded-full bg-primary/10 blur-2xl" />
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-background px-3 py-1.5 text-xs font-bold text-primary shadow-sm">
              <CalendarDays className="size-4 text-primary" />
              {s.date}
            </span>
            <h3 className="mt-4 text-lg font-black text-foreground tracking-tight transition-colors group-hover:text-primary">{s.name}</h3>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
              <MapPin className="size-4" />
              {s.city}
            </p>
            <Link
              href="/rfq"
              className={buttonVariants({ variant: "outline", className: "mt-6 w-full rounded-xl py-5 text-sm font-semibold hover:bg-muted" })}
            >
              {t.home.register}
              <ArrowRight className="size-4 ml-1.5 rtl:mr-1.5 rtl:rotate-180" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
