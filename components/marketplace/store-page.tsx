"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Building2, Layers, Package, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { fetchStoreBySlug } from "@/lib/services/stores-client"
import type { StoreDetails } from "@/lib/domains/store/types"
import { Breadcrumbs, MessageState } from "@/components/marketplace/shell"
import { ProductCard } from "@/components/marketplace/product-card"

type Status = "loading" | "loaded" | "notFound" | "error"

export function StorePage({ slug }: { slug: string }) {
  const { t } = useLanguage()
  const m = t.marketplace.stores
  const [state, setState] = useState<{ slug: string; status: Status; store: StoreDetails | null }>({
    slug,
    status: "loading",
    store: null,
  })

  useEffect(() => {
    let active = true
    fetchStoreBySlug(slug).then((res) => {
      if (!active) return
      if (res.error) setState({ slug, status: "error", store: null })
      else if (res.notFound || !res.data) setState({ slug, status: "notFound", store: null })
      else setState({ slug, status: "loaded", store: res.data })
    })
    return () => {
      active = false
    }
  }, [slug])

  const status: Status = state.slug === slug ? state.status : "loading"
  const store = state.slug === slug ? state.store : null

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

  if (status !== "loaded" || !store) {
    const isError = status === "error"
    return (
      <MessageState
        icon={<Store className="size-7" />}
        title={isError ? t.marketplace.error : m.notFound}
        description={isError ? t.marketplace.errorDesc : m.notFoundDesc}
        action={<Button render={<Link href="/companies" />}>{t.marketplace.companies.back}</Button>}
      />
    )
  }

  const s = store

  return (
    <>
      <Breadcrumbs
        items={[
          { label: t.marketplace.breadcrumbHome, href: "/" },
          { label: t.marketplace.companies.title, href: "/companies" },
          ...(s.company ? [{ label: s.company.name, href: `/companies/${s.company.slug}` }] : []),
          { label: s.name },
        ]}
      />

      {/* Banner + identity */}
      <section className="border-b border-border bg-card">
        {s.bannerUrl && (
          <div className="h-40 w-full overflow-hidden bg-secondary sm:h-56">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.bannerUrl} alt={s.name} className="size-full object-cover" />
          </div>
        )}
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-blue text-2xl font-bold text-brand-blue-foreground shadow-sm">
              {s.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.logoUrl} alt={s.name} className="size-full object-cover" />
              ) : (
                <Store className="size-8" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{s.name}</h1>
              {s.tagline && <p className="mt-1 text-muted-foreground">{s.tagline}</p>}
              {s.company && (
                <Link
                  href={`/companies/${s.company.slug}`}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <Building2 className="size-4" />
                  {m.viewCompany}: {s.company.name}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        {s.description && (
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground">{m.about}</h2>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{s.description}</p>
          </section>
        )}

        {s.categories.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground">
              <Layers className="size-4 text-primary" />
              {m.categories}
            </h2>
            <div className="flex flex-wrap gap-2">
              {s.categories.map((cat) => (
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

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground">
            <Package className="size-4 text-primary" />
            {m.products}
          </h2>
          {s.products.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-secondary/30 px-4 py-8 text-center text-sm text-muted-foreground">
              {m.empty}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {s.products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
