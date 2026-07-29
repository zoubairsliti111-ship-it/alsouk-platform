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
    <section className="relative overflow-hidden">
      {/* Ambient premium background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-secondary/60 to-background" />
      <div aria-hidden className="pointer-events-none absolute -start-24 -top-24 -z-10 size-80 rounded-full bg-primary/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -end-20 top-10 -z-10 size-72 rounded-full bg-accent/15 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-10 pt-8 lg:grid-cols-2 lg:gap-12 lg:pb-16 lg:pt-14">
        <div className="text-center lg:text-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            {t.hero.badge}
          </span>

          <h1 className="mt-4 text-balance text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t.hero.title1}{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t.hero.titleHighlight}
            </span>{" "}
            {t.hero.title2}
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base lg:mx-0">
            {t.hero.subtitle}
          </p>

          {/* Prominent search */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              goSearch()
            }}
            role="search"
            className="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-2xl border border-border bg-background p-2 shadow-xl shadow-primary/5 lg:mx-0"
          >
            <div className="flex flex-1 items-center gap-2 ps-2">
              <Search className="size-5 shrink-0 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.home.searchPlaceholder}
                aria-label={t.hero.searchButton}
                className="w-full bg-transparent py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="submit"
              className={buttonVariants({ size: "lg", className: "h-12 shrink-0 rounded-xl px-5" })}
            >
              <Search className="size-4" />
              <span className="hidden sm:inline">{t.hero.searchButton}</span>
            </button>
          </form>

          {/* Quick chips */}
          <div className="mt-3 flex flex-wrap justify-center gap-2 lg:justify-start">
            <span className="py-1 text-xs text-muted-foreground">{t.hero.popular}</span>
            {t.hero.popularTerms.map((term) => (
              <button
                key={term}
                onClick={() => goSearch(term)}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-primary hover:text-primary active:scale-95"
              >
                {term}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
            <Link
              href="/products"
              className={buttonVariants({ size: "lg", className: "w-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto" })}
            >
              {t.hero.ctaPrimary}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
            <Link
              href="/rfq"
              className={buttonVariants({ size: "lg", variant: "outline", className: "w-full sm:w-auto" })}
            >
              {t.hero.ctaSecondary}
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-5 text-xs text-muted-foreground lg:justify-start">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-accent" />
              {t.suppliers.verified}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <TrendingUp className="size-4 text-primary" />
              {t.hero.trusted}
            </span>
          </div>
        </div>

        {/* Hero image */}
        <div className="relative hidden lg:block">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border shadow-2xl">
            <Image
              src="/images/hero-trade.png"
              alt="Mediterranean trade and logistics port in Tunisia"
              fill
              priority
              sizes="50vw"
              className="object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  )
}
