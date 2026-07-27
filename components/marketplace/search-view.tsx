"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, SearchX } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { fetchSearch } from "@/lib/services/search-client"
import type { SearchResults } from "@/lib/services/search-service"
import {
  Breadcrumbs,
  CardGridSkeleton,
  ListingHeader,
  MessageState,
} from "@/components/marketplace/shell"
import { SupplierCard } from "@/components/directory/supplier-card"
import { CompanyCard } from "@/components/marketplace/company-card"
import { ProductCard } from "@/components/marketplace/product-card"

type Status = "idle" | "loading" | "loaded"

const EMPTY: SearchResults = { suppliers: [], companies: [], products: [] }

export function SearchView() {
  const { t, dir } = useLanguage()
  const s = t.search
  const router = useRouter()
  const params = useSearchParams()
  const initial = params.get("q") ?? ""

  const [query, setQuery] = useState(initial)
  // Keyed by the query the results belong to, so `loading` can be derived
  // rather than set synchronously inside the effect.
  const [state, setState] = useState<{ q: string; results: SearchResults }>({
    q: "",
    results: EMPTY,
  })

  // Debounced search whenever the query changes; keeps the URL shareable.
  useEffect(() => {
    const q = query.trim()
    let active = true
    const handle = setTimeout(
      () => {
        if (!q) {
          if (active) setState({ q: "", results: EMPTY })
          return
        }
        fetchSearch(q).then((data) => {
          if (active) setState({ q, results: data })
        })
      },
      q ? 300 : 0,
    )
    return () => {
      active = false
      clearTimeout(handle)
    }
  }, [query])

  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const q = query.trim()
    const url = q ? `/search?q=${encodeURIComponent(q)}` : "/search"
    router.replace(url, { scroll: false })
  }, [query, router])

  const trimmed = query.trim()
  const results = state.q === trimmed ? state.results : EMPTY
  const status: Status = trimmed === "" ? "idle" : state.q === trimmed ? "loaded" : "loading"
  const total = results.suppliers.length + results.companies.length + results.products.length

  return (
    <>
      <Breadcrumbs items={[{ label: t.marketplace.breadcrumbHome, href: "/" }, { label: s.title }]} />
      <div className="mx-auto max-w-6xl px-4 py-8" dir={dir}>
        <ListingHeader
          title={s.title}
          subtitle={query.trim() ? `${s.resultsFor} "${query.trim()}"` : s.prompt}
        />

        <form
          onSubmit={(e) => e.preventDefault()}
          className="relative mb-10 max-w-2xl"
          role="search"
        >
          <Search className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={s.placeholder}
            aria-label={s.title}
            autoFocus
            className="w-full rounded-full border border-border bg-card py-3.5 ps-12 pe-4 text-base text-foreground shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </form>

        {status === "idle" ? null : status === "loading" ? (
          <CardGridSkeleton />
        ) : total === 0 ? (
          <MessageState
            icon={<SearchX className="size-7" />}
            title={s.noResults}
            description={s.noResultsDesc}
          />
        ) : (
          <div className="space-y-12">
            {results.suppliers.length > 0 && (
              <Section title={s.suppliers} count={results.suppliers.length}>
                {results.suppliers.map((supplier) => (
                  <SupplierCard key={supplier.id} supplier={supplier} />
                ))}
              </Section>
            )}
            {results.companies.length > 0 && (
              <Section title={s.companies} count={results.companies.length}>
                {results.companies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </Section>
            )}
            {results.products.length > 0 && (
              <Section title={s.products} count={results.products.length}>
                {results.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </Section>
            )}
          </div>
        )}
      </div>
    </>
  )
}

function Section({
  title,
  count,
  children,
}: {
  title: string
  count: number
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-foreground">
        {title}
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-sm font-medium text-muted-foreground">
          {count}
        </span>
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  )
}
