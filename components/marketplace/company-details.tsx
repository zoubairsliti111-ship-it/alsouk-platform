"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  BadgeCheck,
  Building2,
  ExternalLink,
  Layers,
  MapPin,
  Package,
  Store,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { fetchCompanyBySlug } from "@/lib/services/companies-client"
import { fetchProducts } from "@/lib/services/products-client"
import type { CompanyDetails } from "@/lib/domains/company/types"
import type { ProductSummary } from "@/lib/domains/product/types"
import { Breadcrumbs, MessageState } from "@/components/marketplace/shell"
import { ProductCard } from "@/components/marketplace/product-card"

type Status = "loading" | "loaded" | "notFound" | "error"

function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((w) => w.charAt(0)).join("").toUpperCase()
}

export function CompanyDetailsView({ slug }: { slug: string }) {
  const { t } = useLanguage()
  const m = t.marketplace.companies
  const [state, setState] = useState<{
    slug: string
    status: Status
    company: CompanyDetails | null
    products: ProductSummary[]
  }>({ slug, status: "loading", company: null, products: [] })

  useEffect(() => {
    let active = true
    fetchCompanyBySlug(slug).then((res) => {
      if (!active) return
      if (res.error) return setState({ slug, status: "error", company: null, products: [] })
      if (res.notFound || !res.data) return setState({ slug, status: "notFound", company: null, products: [] })
      const company = res.data
      setState({ slug, status: "loaded", company, products: [] })
      fetchProducts({ companyId: company.id, limit: 12 }).then((items) => {
        if (!active) return
        setState((prev) => (prev.slug === slug ? { ...prev, products: items } : prev))
      })
    })
    return () => {
      active = false
    }
  }, [slug])

  const status: Status = state.slug === slug ? state.status : "loading"
  const company = state.slug === slug ? state.company : null
  const products = state.slug === slug ? state.products : []

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="h-40 animate-pulse rounded-3xl bg-muted" />
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (status !== "loaded" || !company) {
    const isError = status === "error"
    return (
      <MessageState
        icon={<Building2 className="size-7" />}
        title={isError ? t.marketplace.error : m.notFound}
        description={isError ? t.marketplace.errorDesc : m.notFoundDesc}
        action={<Button render={<Link href="/companies" />}>{m.back}</Button>}
      />
    )
  }

  const location = [company.city, company.country].filter(Boolean).join(", ")

  return (
    <>
      <Breadcrumbs
        items={[
          { label: t.marketplace.breadcrumbHome, href: "/" },
          { label: m.title, href: "/companies" },
          { label: company.name },
        ]}
      />

      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-blue text-2xl font-bold text-brand-blue-foreground shadow-sm">
              {company.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.logoUrl} alt={company.name} className="size-full object-cover" />
              ) : (
                initials(company.name) || <Building2 className="size-8" aria-hidden="true" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {company.name}
                </h1>
                {company.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                    <BadgeCheck className="size-3.5" />
                    {m.verified}
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                {location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4 text-primary" />
                    {location}
                  </span>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <ExternalLink className="size-4" />
                    {m.website}
                  </a>
                )}
              </div>

              {company.description && (
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {company.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        {/* Categories */}
        {company.categories.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground">
              <Layers className="size-4 text-primary" />
              {m.categories}
            </h2>
            <div className="flex flex-wrap gap-2">
              {company.categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="rounded-full border border-border px-3 py-1 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Storefronts */}
        {company.stores.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground">
              <Store className="size-4 text-primary" />
              {m.storefronts}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {company.stores.map((store) => (
                <Link
                  key={store.id}
                  href={`/stores/${store.slug}`}
                  className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary text-primary">
                    {store.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={store.logoUrl} alt={store.name} className="size-full object-cover" />
                    ) : (
                      <Store className="size-5" aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-foreground">{store.name}</span>
                    <span className="text-sm text-primary">{m.viewStore}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Products */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground">
            <Package className="size-4 text-primary" />
            {t.marketplace.products.title}
          </h2>
          {products.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-secondary/30 px-4 py-8 text-center text-sm text-muted-foreground">
              {t.marketplace.products.empty}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
