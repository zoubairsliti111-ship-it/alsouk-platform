"use client"

import { useMemo, useState } from "react"
import { ChevronRight, Search, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { directoryT } from "@/lib/directory-i18n"
import { DirectoryFilters, emptyFilters, type FilterState } from "@/components/directory/directory-filters"
import { SupplierCard } from "@/components/directory/supplier-card"
import { matchesMoq, matchesYears, suppliers } from "@/lib/directory-data"

type SortKey = "relevance" | "rating" | "products" | "years"

export function SuppliersDirectory() {
  const { lang, dir } = useLanguage()
  const t = directoryT[lang]

  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<FilterState>(emptyFilters)
  const [sort, setSort] = useState<SortKey>("relevance")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const result = suppliers.filter((s) => {
      if (filters.verifiedOnly && !s.verified) return false
      if (filters.countries.length && !filters.countries.includes(s.country)) return false
      if (filters.region !== "any" && s.region !== filters.region) return false
      if (
        filters.categories.length &&
        !filters.categories.some((c) => s.categories.includes(c))
      )
        return false
      if (
        filters.businessTypes.length &&
        !filters.businessTypes.some((b) => s.businessTypes.includes(b))
      )
        return false
      if (!matchesMoq(filters.moq, s.minMoq)) return false
      if (!matchesYears(filters.years, s.years)) return false

      if (q) {
        const haystack = [
          s.name.toLowerCase(),
          t.cities[s.cityKey]?.toLowerCase() ?? "",
          t.countries[s.country]?.toLowerCase() ?? "",
          ...s.categories.map((c) => t.categories[c].toLowerCase()),
          ...s.businessTypes.map((b) => t.businessTypes[b].toLowerCase()),
        ].join(" ")
        if (!haystack.includes(q)) return false
      }
      return true
    })

    const sorted = [...result]
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating)
    else if (sort === "products") sorted.sort((a, b) => b.products - a.products)
    else if (sort === "years") sorted.sort((a, b) => b.years - a.years)
    else sorted.sort((a, b) => Number(b.verified) - Number(a.verified) || b.rating - a.rating)

    return sorted
  }, [query, filters, sort, t])

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-secondary/60 to-background">
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
          <nav className="mb-5 flex items-center gap-1 text-xs text-muted-foreground">
            <a href="/" className="transition-colors hover:text-primary">
              {t.breadcrumbHome}
            </a>
            <ChevronRight className="size-3.5 rtl:rotate-180" />
            <span className="font-medium text-foreground">{t.hero.badge}</span>
          </nav>

          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {t.hero.badge}
            </span>
            <h1 className="mt-4 text-pretty text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              {t.hero.title}
            </h1>
            <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
              {t.hero.subtitle}
            </p>
          </div>

          {/* Large search bar */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-6 flex max-w-3xl flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm sm:flex-row sm:items-center sm:rounded-full"
          >
            <div className="flex flex-1 items-center gap-2 px-3">
              <Search className="size-5 shrink-0 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.search.placeholder}
                aria-label={t.search.placeholder}
                className="w-full bg-transparent py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Button
              type="submit"
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 sm:rounded-full sm:px-6"
            >
              <Search className="size-4 sm:hidden" />
              {t.search.button}
            </Button>
          </form>

          {/* Hero stats */}
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            {[
              [t.hero.stat1, t.hero.stat1label],
              [t.hero.stat2, t.hero.stat2label],
              [t.hero.stat3, t.hero.stat3label],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="text-2xl font-bold text-foreground">{value}</dt>
                <dd className="text-xs text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Desktop sidebar */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-5">
              <DirectoryFilters filters={filters} setFilters={setFilters} />
            </div>
          </aside>

          {/* Results */}
          <div className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-foreground">
                  {t.results.count(filtered.length)}
                </p>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary lg:hidden"
                >
                  <SlidersHorizontal className="size-4" />
                  {t.filters.title}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-xs text-muted-foreground">
                  {t.sort.label}
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="relevance">{t.sort.relevance}</option>
                  <option value="rating">{t.sort.rating}</option>
                  <option value="products">{t.sort.products}</option>
                  <option value="years">{t.sort.years}</option>
                </select>
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((s) => (
                  <SupplierCard key={s.id} supplier={s} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
                  <Search className="size-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">{t.empty.title}</h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">{t.empty.subtitle}</p>
                <Button
                  variant="outline"
                  className="mt-5"
                  onClick={() => {
                    setFilters(() => emptyFilters)
                    setQuery("")
                  }}
                >
                  {t.empty.reset}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div
            className={`absolute inset-y-0 flex w-[85%] max-w-sm flex-col bg-background shadow-xl ${
              dir === "rtl" ? "start-0" : "start-0"
            }`}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-base font-bold text-foreground">{t.filters.title}</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg p-2 text-foreground hover:bg-secondary"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4">
              <DirectoryFilters filters={filters} setFilters={setFilters} />
            </div>
            <div className="border-t border-border p-4">
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setMobileFiltersOpen(false)}
              >
                {t.filters.apply} ({filtered.length})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
