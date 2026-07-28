"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, BadgeCheck, Search, ShieldCheck, Sparkles } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

export function HeroSection() {
  const { t } = useLanguage()
  const router = useRouter()
  const [query, setQuery] = useState("")

  function goSearch(term?: string) {
    const q = (term ?? query).trim()
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search")
  }

  // A small "living marketplace" activity strip, built from existing localized data.
  const activity = [
    `${t.products.items[0].supplier} · ${t.suppliers.goldSupplier}`,
    `${t.home.buyerIn} ${t.home.locations[1]} ${t.home.sourcing} ${t.products.items[3].name}`,
    `${t.products.items[1].supplier} ${t.home.listed}`,
    `${t.home.buyerIn} ${t.home.locations[3]} ${t.home.sourcing} ${t.products.items[2].name}`,
  ]

  return (
    <section className="relative overflow-hidden">
      {/* Ambient premium background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-secondary/30" />
      <div
        aria-hidden
        className="pointer-events-none absolute -start-24 -top-24 -z-10 size-96 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -end-24 top-24 -z-10 size-96 rounded-full bg-accent/15 blur-3xl"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        {/* Left */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            {t.hero.badge}
          </span>

          <h1 className="mt-5 text-pretty text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t.hero.title1}{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t.hero.titleHighlight}
            </span>{" "}
            {t.hero.title2}
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t.hero.subtitle}
          </p>

          {/* Search */}
          <div className="mt-7 max-w-xl">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                goSearch()
              }}
              role="search"
              className="flex flex-col gap-2 rounded-2xl border border-border bg-background p-2 shadow-lg shadow-primary/5 ring-1 ring-black/[0.02] sm:flex-row sm:items-center sm:rounded-full"
            >
              <div className="flex flex-1 items-center gap-2 px-3">
                <Search className="size-5 shrink-0 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.hero.searchPlaceholder}
                  aria-label={t.hero.searchButton}
                  className="w-full bg-transparent py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Button
                type="submit"
                className="h-11 shrink-0 rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary/90 sm:rounded-full"
              >
                <Search className="size-4" />
                {t.hero.searchButton}
              </Button>
            </form>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t.hero.popular}</span>
              {t.hero.popularTerms.map((term) => (
                <button
                  key={term}
                  onClick={() => goSearch(term)}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-primary hover:text-primary"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className={buttonVariants({
                size: "lg",
                className: "bg-accent text-accent-foreground hover:bg-accent/90",
              })}
            >
              {t.hero.ctaPrimary}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
            <Link href="/rfq" className={buttonVariants({ size: "lg", variant: "outline" })}>
              {t.hero.ctaSecondary}
            </Link>
          </div>

          {/* Live activity strip */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-background/70 p-3 backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-accent" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                {t.home.liveTag}
              </span>
              <span className="truncate text-xs text-muted-foreground">{t.home.activitySubtitle}</span>
            </div>
            <ul className="mt-2 flex flex-col gap-1.5">
              {activity.slice(0, 3).map((line) => (
                <li key={line} className="flex items-center gap-2 text-sm text-foreground/80">
                  <span className="size-1.5 shrink-0 rounded-full bg-primary/60" />
                  <span className="truncate">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right image */}
        <div className="relative">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border shadow-2xl">
            <Image
              src="/images/hero-trade.png"
              alt="Mediterranean trade and logistics port in Tunisia"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
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
