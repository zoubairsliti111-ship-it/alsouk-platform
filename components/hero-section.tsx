"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Search, ShieldCheck, Sparkles, TrendingUp } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

export function HeroSection() {
  const { t } = useLanguage()
  const router = useRouter()
  const [query, setQuery] = useState("")

  function goSearch(term?: string) {
    const q = (term ?? query).trim()
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search")
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 lg:py-28">
      {/* Decorative ambient glowing grids and spheres */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden className="pointer-events-none absolute -start-44 -top-44 -z-10 size-[450px] rounded-full bg-primary/8 blur-[120px] transition-opacity duration-1000" />
      <div aria-hidden className="pointer-events-none absolute -end-24 top-24 -z-10 size-[380px] rounded-full bg-accent/8 blur-[100px] transition-opacity duration-1000" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">

          {/* Left Hero content column */}
          <div className="text-center lg:col-span-7 lg:text-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary backdrop-blur-sm transition-all hover:border-primary/25 hover:bg-primary/8">
              <Sparkles className="size-3.5 text-primary animate-pulse" />
              <span>{t.hero.badge}</span>
            </div>

            <h1 className="mt-6 text-balance text-4xl font-black leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {t.hero.title1}{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-primary via-blue-600 to-accent bg-clip-text text-transparent">
                  {t.hero.titleHighlight}
                </span>
                <span className="absolute bottom-2 left-0 right-0 -z-10 h-3 w-full rounded-full bg-primary/10" />
              </span>{" "}
              {t.hero.title2}
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base lg:mx-0 font-medium">
              {t.hero.subtitle}
            </p>

            {/* Premium redone search container with center placeholder, beautiful shadows, rounded edges */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                goSearch()
              }}
              role="search"
              className="mx-auto mt-10 max-w-xl rounded-[24px] border border-border/80 bg-card p-2 shadow-xl shadow-primary/5 backdrop-blur transition-all duration-300 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/8 lg:mx-0"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pl-2 pr-2 rtl:pl-2 rtl:pr-2">
                <div className="flex flex-1 items-center gap-3 py-1 px-2">
                  <Search className="size-5 shrink-0 text-muted-foreground/85" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t.home.searchPlaceholder}
                    aria-label={t.hero.searchButton}
                    className="w-full bg-transparent py-2.5 text-sm font-semibold text-foreground outline-none placeholder:text-center placeholder:text-muted-foreground/60 placeholder:font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center rounded-[18px] bg-gradient-to-r from-primary to-blue-600 px-8 text-xs font-bold text-primary-foreground shadow-md transition-all duration-300 hover:opacity-95 hover:shadow-lg active:scale-95"
                >
                  <Search className="size-4 me-1.5 shrink-0" />
                  <span>{t.hero.searchButton}</span>
                </button>
              </div>
            </form>

            {/* Popular Quick-search tags */}
            <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
              <span className="py-1 text-xs font-bold text-muted-foreground/85">{t.hero.popular}</span>
              {t.hero.popularTerms.map((term) => (
                <button
                  key={term}
                  onClick={() => goSearch(term)}
                  className="rounded-full border border-border/60 bg-background/60 px-4 py-1 text-xs font-semibold text-foreground/80 transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-95"
                >
                  {term}
                </button>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:items-start justify-center lg:justify-start">
              <Link
                href="/products"
                className={buttonVariants({ size: "lg", className: "w-full sm:w-auto rounded-xl bg-gradient-to-r from-primary to-blue-600 px-8 text-xs font-bold text-primary-foreground shadow-md hover:opacity-95 hover:shadow-lg" })}
              >
                <span>{t.hero.ctaPrimary}</span>
                <ArrowRight className="size-4 ms-1.5 rtl:rotate-180 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/rfq"
                className={buttonVariants({ size: "lg", variant: "outline", className: "w-full sm:w-auto rounded-xl border-border bg-background/50 px-8 text-xs font-bold text-foreground hover:bg-muted/80" })}
              >
                {t.hero.ctaSecondary}
              </Link>
            </div>

            {/* Core Badges */}
            <div className="mt-10 flex items-center justify-center gap-6 text-[11px] font-bold text-muted-foreground lg:justify-start uppercase tracking-wider">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-4.5 text-accent animate-pulse" />
                {t.suppliers.verified}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <TrendingUp className="size-4.5 text-primary" />
                {t.hero.trusted}
              </span>
            </div>
          </div>

          {/* Right Column: Hero Showcase Image / Artwork */}
          <div className="relative hidden lg:col-span-5 lg:block">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px] border border-border bg-card shadow-2xl transition-all duration-500 hover:shadow-primary/5 hover:scale-[1.01]">
              <Image
                src="/images/hero-trade.png"
                alt="Mediterranean trade and logistics port in Tunisia"
                fill
                priority
                sizes="40vw"
                className="object-cover transition-transform duration-1000 hover:scale-[1.03]"
              />
              {/* Soft overlay mask */}
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-background/90 p-5 shadow-lg backdrop-blur border border-white/20">
                <p className="text-sm font-black text-foreground tracking-tight">Mediterranean trade & logistics hub</p>
                <p className="text-xs text-muted-foreground mt-1.5 font-medium leading-relaxed">Connecting Tunisia and global buyers with absolute reliability and quality excellence.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
