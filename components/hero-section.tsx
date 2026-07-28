"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Sparkles, ShieldCheck, BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

export function HeroSection() {
  const { t, dir } = useLanguage()
  const router = useRouter()
  const [query, setQuery] = useState("")

  function goSearch(term?: string) {
    const q = (term ?? query).trim()
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search")
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/40 via-background to-background py-10 sm:py-16">
      {/* Abstract light grid background */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,oklch(0.92_0.01_259/0.3)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.92_0.01_259/0.3)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">

          {/* Mobile-first Premium Pill Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold tracking-wide text-primary transition-all duration-300 hover:bg-primary/10">
            <Sparkles className="size-3.5 animate-pulse text-accent" />
            <span>{t.hero.badge}</span>
          </div>

          {/* Clean Main Headline */}
          <h1 className="mt-4 max-w-3xl text-pretty text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
            {t.hero.title1}{" "}
            <span className="relative inline-block text-primary">
              {t.hero.titleHighlight}
              <span className="absolute -bottom-0.5 left-0 h-[2px] w-full rounded-full bg-accent/60" />
            </span>{" "}
            {t.hero.title2}
          </h1>

          {/* Subtitle */}
          <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t.hero.subtitle}
          </p>

          {/* Prime Search Bar - Absolute focus of the mobile concept */}
          <div className="mt-6 w-full max-w-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                goSearch()
              }}
              role="search"
              className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-md transition-all duration-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 sm:flex-row sm:items-center sm:rounded-full"
            >
              <div className="flex flex-1 items-center gap-2.5 px-3">
                <Search className="size-5 shrink-0 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.hero.searchPlaceholder}
                  aria-label={t.hero.searchButton}
                  className="w-full bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Button
                type="submit"
                className="h-11 shrink-0 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow transition-transform hover:bg-primary/95 active:scale-95 sm:rounded-full"
              >
                <Search className="size-4 mr-1.5 rtl:ml-1.5" />
                {t.hero.searchButton}
              </Button>
            </form>

            {/* Popular Tags / Quick Chips */}
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="font-medium text-muted-foreground">{t.hero.popular}</span>
              {t.hero.popularTerms.map((term) => (
                <button
                  key={term}
                  onClick={() => goSearch(term)}
                  className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:text-primary"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Trust badges - highly simplified and clean */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <BadgeCheck className="size-4 text-accent" />
              <span>12,000+ Verified Businesses</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-primary" />
              <span>Direct Factory Connection</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
