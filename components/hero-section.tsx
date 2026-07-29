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
    <section className="relative overflow-hidden bg-radial from-secondary/50 via-background to-background py-12 lg:py-20">
      {/* Premium background styling and glowing backdrops */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden className="pointer-events-none absolute -start-40 -top-40 -z-10 size-96 rounded-full bg-primary/10 blur-[100px] transition-opacity duration-1000" />
      <div aria-hidden className="pointer-events-none absolute -end-20 top-20 -z-10 size-80 rounded-full bg-accent/8 blur-[90px] transition-opacity duration-1000" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-12 lg:gap-16">
        {/* Left column */}
        <div className="text-center lg:col-span-7 lg:text-start">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm transition-all hover:border-primary/25 hover:bg-primary/10">
            <Sparkles className="size-3.5 animate-pulse" />
            {t.hero.badge}
          </div>

          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t.hero.title1}{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-primary via-blue-600 to-accent bg-clip-text text-transparent">
                {t.hero.titleHighlight}
              </span>
              <span className="absolute bottom-1 left-0 right-0 -z-10 h-3 w-full rounded-full bg-primary/5" />
            </span>{" "}
            {t.hero.title2}
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
            {t.hero.subtitle}
          </p>

          {/* Prominent, modern search box with refined interactions */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              goSearch()
            }}
            role="search"
            className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-[20px] border border-border bg-card/80 p-2 shadow-lg shadow-primary/5 backdrop-blur transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/8 lg:mx-0"
          >
            <div className="flex flex-1 items-center gap-2.5 ps-3">
              <Search className="size-5 shrink-0 text-muted-foreground/80 transition-colors group-focus-within:text-primary" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.home.searchPlaceholder}
                aria-label={t.hero.searchButton}
                className="w-full bg-transparent py-2 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/75"
              />
            </div>
            <button
              type="submit"
              className={buttonVariants({ size: "lg", className: "h-12 shrink-0 rounded-xl bg-primary px-6 font-semibold shadow-md transition-all duration-300 hover:bg-primary/95 hover:shadow-lg active:scale-98" })}
            >
              <Search className="size-4 mr-1 rtl:ml-1" />
              <span className="hidden sm:inline">{t.hero.searchButton}</span>
            </button>
          </form>

          {/* Popular Search Terms Quick Chips */}
          <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
            <span className="py-1 text-xs font-semibold text-muted-foreground/80">{t.hero.popular}</span>
            {t.hero.popularTerms.map((term) => (
              <button
                key={term}
                onClick={() => goSearch(term)}
                className="rounded-full border border-border bg-background/50 px-3.5 py-1 text-xs font-medium text-foreground/80 transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-95"
              >
                {term}
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
            <Link
              href="/products"
              className={buttonVariants({ size: "lg", className: "w-full bg-accent px-6 font-semibold text-accent-foreground shadow-md transition-all duration-300 hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/10 sm:w-auto" })}
            >
              {t.hero.ctaPrimary}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
            </Link>
            <Link
              href="/rfq"
              className={buttonVariants({ size: "lg", variant: "outline", className: "w-full border-border bg-background/50 px-6 font-semibold text-foreground hover:bg-muted/80 sm:w-auto" })}
            >
              {t.hero.ctaSecondary}
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs font-semibold text-muted-foreground lg:justify-start">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4 text-accent" />
              {t.suppliers.verified}
            </span>
            <span className="inline-flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              {t.hero.trusted}
            </span>
          </div>
        </div>

        {/* Hero visual wrapper */}
        <div className="relative hidden lg:col-span-5 lg:block">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] border border-border bg-card shadow-2xl transition-all duration-500 hover:shadow-primary/5 hover:scale-[1.01]">
            <Image
              src="/images/hero-trade.png"
              alt="Mediterranean trade and logistics port in Tunisia"
              fill
              priority
              sizes="40vw"
              className="object-cover transition-transform duration-1000 hover:scale-[1.03]"
            />
            {/* Soft sophisticated gradient mask */}
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
            <div className="absolute bottom-6 left-6 right-6 rounded-xl bg-background/80 p-4 shadow-lg backdrop-blur border border-white/20">
              <p className="text-sm font-bold text-foreground">Mediterranean trade & logistics hub</p>
              <p className="text-xs text-muted-foreground mt-0.5">Connecting Tunisia and global buyers with absolute reliability.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
