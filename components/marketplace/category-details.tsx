"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Layers, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { fetchCategories, fetchCategoryBySlug } from "@/lib/services/categories-client"
import { fetchProducts } from "@/lib/services/products-client"
import type { Category } from "@/lib/domains/category/types"
import type { ProductSummary } from "@/lib/domains/product/types"
import { Breadcrumbs, MessageState } from "@/components/marketplace/shell"
import { ProductCard } from "@/components/marketplace/product-card"

type Status = "loading" | "loaded" | "notFound" | "error"

export function CategoryDetailsView({ slug }: { slug: string }) {
  const { t } = useLanguage()
  const m = t.marketplace.categories
  const [state, setState] = useState<{
    slug: string
    status: Status
    category: Category | null
    children: Category[]
    products: ProductSummary[]
  }>({ slug, status: "loading", category: null, children: [], products: [] })

  useEffect(() => {
    let active = true
    fetchCategoryBySlug(slug).then((res) => {
      if (!active) return
      if (res.error) return setState({ slug, status: "error", category: null, children: [], products: [] })
      if (res.notFound || !res.data)
        return setState({ slug, status: "notFound", category: null, children: [], products: [] })
      const cat = res.data
      setState({ slug, status: "loaded", category: cat, children: [], products: [] })
      fetchCategories().then((all) => {
        if (!active) return
        const kids = all.filter((c) => c.parentId === cat.id)
        setState((prev) => (prev.slug === slug ? { ...prev, children: kids } : prev))
      })
      fetchProducts({ categoryId: cat.id, limit: 24 }).then((items) => {
        if (!active) return
        setState((prev) => (prev.slug === slug ? { ...prev, products: items } : prev))
      })
    })
    return () => {
      active = false
    }
  }, [slug])

  const status: Status = state.slug === slug ? state.status : "loading"
  const category = state.slug === slug ? state.category : null
  const children = state.slug === slug ? state.children : []
  const products = state.slug === slug ? state.products : []

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="h-8 w-56 animate-pulse rounded bg-muted" />
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (status !== "loaded" || !category) {
    const isError = status === "error"
    return (
      <MessageState
        icon={<Layers className="size-7" />}
        title={isError ? t.marketplace.error : m.notFound}
        description={isError ? t.marketplace.errorDesc : m.notFoundDesc}
        action={<Button render={<Link href="/categories" />}>{m.back}</Button>}
      />
    )
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: t.marketplace.breadcrumbHome, href: "/" },
          { label: m.title, href: "/categories" },
          { label: category.name },
        ]}
      />

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-2 max-w-2xl text-muted-foreground">{category.description}</p>
          )}
        </div>

        {children.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground">
              <Layers className="size-4 text-primary" />
              {m.subcategories}
            </h2>
            <div className="flex flex-wrap gap-2">
              {children.map((child) => (
                <Link
                  key={child.id}
                  href={`/categories/${child.slug}`}
                  className="rounded-full border border-border px-3 py-1 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground">
            <Package className="size-4 text-primary" />
            {m.productsIn}
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
