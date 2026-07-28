"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowRight, BadgeCheck, Search, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumCard } from "@/components/ui/premium-card"

export function HeroSection() {
  const { t, dir } = useLanguage()
  const router = useRouter()
  const [query, setQuery] = useState("")

  function goSearch(term?: string) {
    const q = (term ?? query).trim()
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search")
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 via-background to-background py-16 lg:py-24">
      {/* Decorative background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left */}
        <div className="flex flex-col items-start text-start">
          <PremiumBadge variant="accent" className="mb-6" glow>
            <Sparkles className="size-3.5" />
            {t.hero.badge}
          </PremiumBadge>

          <h1 className="text-pretty text-4xl font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t.hero.title1}{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t.hero.titleHighlight}
            </span>{" "}
            {t.hero.title2}
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t.hero.subtitle}
          </p>

          {/* Search container */}
          <div className="mt-8 w-full max-w-xl">
            <PremiumCard hoverEffect="none" className="p-1.5 shadow-xl border-border/80">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  goSearch()
                }}
                role="search"
                className="flex flex-col gap-2 sm:flex-row sm:items-center"
              >
                <div className="flex flex-1 items-center gap-2.5 px-3 py-1">
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
                  size="lg"
                  className="shrink-0 rounded-2xl bg-primary px-7 text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  <Search className="size-4" />
                  {t.hero.searchButton}
                </Button>
              </form>
            </PremiumCard>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <span className="text-muted-foreground font-medium">{t.hero.popular}</span>
              {t.hero.popularTerms.map((term) => (
                <button
                  key={term}
                  onClick={() => goSearch(term)}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground/80 transition-all hover:border-primary/50 hover:text-primary hover:bg-primary/5"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl font-bold shadow-lg shadow-accent/20 px-8 h-12">
              {t.hero.ctaPrimary}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-2xl font-bold border-border/80 px-8 h-12 hover:bg-secondary/50">
              {t.hero.ctaSecondary}
            </Button>
          </div>
        </div>

        {/* Right image */}
        <div className="relative">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[32px] border border-border bg-secondary shadow-2xl">
            <Image
              src="/images/hero-trade.png"
              alt="Mediterranean trade and logistics port in Tunisia"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            {/* Soft modern gradient mask overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Floating glassmorphic cards */}
          <div className="absolute -bottom-6 start-4 flex items-center gap-3.5 rounded-3xl border border-white/25 bg-background/80 p-4 shadow-xl backdrop-blur-md sm:start-8 transition-transform hover:-translate-y-1">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-accent/15 text-accent border border-accent/20">
              <BadgeCheck className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">{t.suppliers.verified}</p>
              <p className="text-[11px] font-medium text-muted-foreground">12,000+ {t.categories.suppliersLabel}</p>
            </div>
          </div>

          <div className="absolute -top-5 end-4 flex items-center gap-3.5 rounded-3xl border border-white/25 bg-background/80 p-4 shadow-xl backdrop-blur-md sm:end-8 transition-transform hover:-translate-y-1">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/15 text-primary border border-primary/20">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">Trade Assurance</p>
              <p className="text-[11px] font-medium text-muted-foreground">24h {t.stats.items[3].label}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
