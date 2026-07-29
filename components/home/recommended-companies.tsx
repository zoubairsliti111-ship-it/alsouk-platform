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
    <section className="bg-secondary/40 py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              {t.home.companiesTag}
            </span>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
              {t.home.companiesTitle}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.home.companiesSubtitle}</p>
          </div>
          <Link
            href="/companies"
            className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            {t.home.viewAll}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.companyItems.map((c, i) => (
            <div
              key={i}
              className="group flex flex-col rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground">
                  {initials(c.name)}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 font-semibold text-foreground">
                    <span className="truncate">{c.name}</span>
                    <BadgeCheck className="size-4 shrink-0 text-primary" />
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {c.location}
                  </p>
                </div>
              </div>

              <p className="mt-3 inline-flex w-fit rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                {c.category}
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Store className="size-3.5" />
                {c.products}
              </p>

              <div className="mt-4 flex items-center gap-2">
                <Link
                  href="/companies"
                  className={buttonVariants({ variant: "outline", size: "sm", className: "flex-1" })}
                >
                  {t.home.visitStore}
                </Link>
                <button
                  type="button"
                  aria-label={t.home.followLabel}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-foreground/70 transition-colors hover:border-primary hover:text-primary active:scale-95"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
