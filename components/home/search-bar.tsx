"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function HomeSearch() {
  const { t } = useLanguage()
  const router = useRouter()
  const [query, setQuery] = useState("")

  function goSearch(term?: string) {
    const q = (term ?? query).trim()
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search")
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-8 sm:py-12">
      {/* Soft premium ambient background glows */}
      <div aria-hidden className="pointer-events-none absolute -start-32 -top-32 size-[320px] rounded-full bg-primary/5 blur-[80px]" />
      <div aria-hidden className="pointer-events-none absolute -end-24 top-12 size-[280px] rounded-full bg-accent/5 blur-[70px]" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-xl text-center">
          {/* Main search form with rounded premium layout */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              goSearch()
            }}
            role="search"
            className="w-full rounded-[24px] border border-border/80 bg-card p-1.5 shadow-lg shadow-primary/5 backdrop-blur transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/8 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10"
          >
            <div className="flex items-center gap-2 px-3">
              <Search className="size-5 shrink-0 text-muted-foreground/80" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.home.searchPlaceholder}
                aria-label={t.hero.searchButton}
                className="w-full bg-transparent py-3 text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground/50 placeholder:font-medium"
              />
              <button
                type="submit"
                className="hidden sm:inline-flex h-11 items-center justify-center rounded-[18px] bg-gradient-to-r from-primary to-blue-600 px-6 text-xs font-bold text-primary-foreground shadow-md transition-all duration-300 hover:opacity-95 hover:shadow-lg active:scale-95"
              >
                <span>{t.hero.searchButton}</span>
              </button>
            </div>
            {/* Mobile submission button */}
            <div className="mt-1.5 p-1 sm:hidden">
              <button
                type="submit"
                className="flex w-full h-11 items-center justify-center rounded-[18px] bg-gradient-to-r from-primary to-blue-600 text-xs font-bold text-primary-foreground shadow-md transition-all duration-300 hover:opacity-95 active:scale-95"
              >
                <Search className="size-4 me-1.5 shrink-0" />
                <span>{t.hero.searchButton}</span>
              </button>
            </div>
          </form>

          {/* Popular tags section */}
          <div className="mt-4 flex flex-wrap justify-center items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground/80">{t.hero.popular}</span>
            <div className="flex flex-wrap justify-center gap-1.5">
              {t.hero.popularTerms.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => goSearch(term)}
                  className="rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-semibold text-foreground/80 transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-95"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
