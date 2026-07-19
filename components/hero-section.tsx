"use client"

import { ArrowRight, BadgeCheck, Search, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

export function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="relative overflow-hidden bg-secondary/40">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        {/* Left */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            {t.hero.badge}
          </span>

          <h1 className="mt-5 text-pretty text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t.hero.title1}{" "}
            <span className="text-primary">{t.hero.titleHighlight}</span> {t.hero.title2}
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t.hero.subtitle}
          </p>

          {/* Search */}
          <div className="mt-7 max-w-xl">
            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-background p-2 shadow-sm sm:flex-row sm:items-center sm:rounded-full">
              <div className="flex flex-1 items-center gap-2 px-3">
                <Search className="size-5 shrink-0 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t.hero.searchPlaceholder}
                  className="w-full bg-transparent py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Button className="h-11 shrink-0 rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary/90 sm:rounded-full">
                <Search className="size-4" />
                {t.hero.searchButton}
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t.hero.popular}</span>
              {t.hero.popularTerms.map((term) => (
                <button
                  key={term}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-primary hover:text-primary"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              {t.hero.ctaPrimary}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Button>
            <Button size="lg" variant="outline">
              {t.hero.ctaSecondary}
            </Button>
          </div>
        </div>

        {/* Right image */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl border border-border shadow-xl">
            <img
              src="/images/hero-trade.png"
              alt="Mediterranean trade and logistics port in Tunisia"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>

          {/* Floating cards */}
          <div className="absolute -bottom-5 start-4 flex items-center gap-3 rounded-2xl border border-border bg-background/95 p-3 shadow-lg backdrop-blur sm:start-6">
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <BadgeCheck className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{t.suppliers.verified}</p>
              <p className="text-xs text-muted-foreground">12,000+ {t.categories.suppliersLabel}</p>
            </div>
          </div>

          <div className="absolute -top-4 end-4 flex items-center gap-3 rounded-2xl border border-border bg-background/95 p-3 shadow-lg backdrop-blur sm:end-6">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Trade Assurance</p>
              <p className="text-xs text-muted-foreground">24h {t.stats.items[3].label}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
