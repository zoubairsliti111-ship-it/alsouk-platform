"use client"

import Link from "next/link"
import { ArrowRight, BadgeCheck, MapPin, Plus, Sparkles, Store } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function RecommendedCompanies() {
  const { t } = useLanguage()

  return (
    <section className="bg-secondary/30 py-10 lg:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-2.5 py-1 text-xs font-bold text-primary">
              <Sparkles className="size-3.5" />
              {t.home.companiesTag}
            </span>
            <h2 className="mt-2.5 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {t.home.companiesTitle}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{t.home.companiesSubtitle}</p>
          </div>
          <Link
            href="/companies"
            className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            {t.home.viewAll}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.companyItems.map((c, i) => (
            <div
              key={i}
              className="group flex flex-col rounded-[20px] border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="flex items-center gap-3.5">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-primary to-accent text-sm font-black text-primary-foreground shadow-sm group-hover:shadow-md transition-shadow">
                  {initials(c.name)}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-base font-extrabold text-foreground">
                    <span className="truncate">{c.name}</span>
                    <BadgeCheck className="size-4.5 shrink-0 text-primary" />
                  </p>
                  <p className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                    <MapPin className="size-3.5" />
                    {c.location}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-1">
                <p className="inline-flex w-fit rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-secondary-foreground">
                  {c.category}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Store className="size-4" />
                  {c.products}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2.5">
                <Link
                  href="/companies"
                  className={buttonVariants({ variant: "outline", className: "flex-1 rounded-xl h-10 text-xs font-bold transition-all hover:bg-muted" })}
                >
                  {t.home.visitStore}
                </Link>
                <button
                  type="button"
                  aria-label={t.home.followLabel}
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-foreground/70 transition-all duration-300 hover:border-primary hover:text-primary active:scale-95"
                >
                  <Plus className="size-4.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
