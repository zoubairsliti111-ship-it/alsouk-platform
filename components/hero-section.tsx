"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
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
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/40 via-background to-background py-8 sm:py-12 border-b border-border">
      {/* Abstract premium background grid */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,oklch(0.92_0.01_259/0.3)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.92_0.01_259/0.3)_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="flex flex-col items-center text-center">

          {/* Main Headline */}
          <h1 className="text-balance text-2xl font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl md:text-4xl">
            {t.hero.title1}{" "}
            <span className="text-primary">
              {t.hero.titleHighlight}
            </span>{" "}
            {t.hero.title2}
          </h1>

          {/* Large Prominent Mobile-First Search Input */}
          <div className="mt-6 w-full">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                goSearch()
              }}
              role="search"
              className="group flex flex-col gap-2 rounded-2xl border border-border bg-background p-2 shadow-md transition-all duration-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 sm:flex-row sm:items-center sm:rounded-full"
            >
              <div className="flex flex-1 items-center gap-2 px-3">
                <Search className="size-5 shrink-0 text-muted-foreground group-focus-within:text-primary transition-colors" />
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
                className="h-11 shrink-0 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow transition-transform hover:bg-primary/95 active:scale-95 sm:rounded-full"
              >
                <Search className="size-4 mr-1.5 rtl:ml-1.5" />
                {t.hero.searchButton}
              </Button>
            </form>

            {/* Popular Tags */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
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

        </div>
      </div>
    </section>
  )
}
