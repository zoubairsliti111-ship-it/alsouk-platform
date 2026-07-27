"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Boxes, Layers, Package, Store, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { fetchProductById } from "@/lib/services/products-client"
import { formatNumber, formatPrice } from "@/lib/format"
import type { ProductDetails } from "@/lib/domains/product/types"
import { Breadcrumbs, MessageState } from "@/components/marketplace/shell"
import { ProductGallery } from "@/components/marketplace/product-gallery"

type Status = "loading" | "loaded" | "notFound" | "error"

export function ProductDetailsView({ id }: { id: string }) {
  const { t, lang } = useLanguage()
  const m = t.marketplace.products
  const [state, setState] = useState<{ id: string; status: Status; product: ProductDetails | null }>({
    id,
    status: "loading",
    product: null,
  })

  useEffect(() => {
    let active = true
    fetchProductById(id).then((res) => {
      if (!active) return
      if (res.error) setState({ id, status: "error", product: null })
      else if (res.notFound || !res.data) setState({ id, status: "notFound", product: null })
      else setState({ id, status: "loaded", product: res.data })
    })
    return () => {
      active = false
    }
  }, [id])

  // Show loading while a newly-requested id is still resolving.
  const status: Status = state.id === id ? state.status : "loading"
  const product = state.id === id ? state.product : null

  if (status === "loading") {
    return (
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-2xl bg-muted" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-24 animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (status !== "loaded" || !product) {
    const isError = status === "error"
    return (
      <MessageState
        icon={<Package className="size-7" />}
        title={isError ? t.marketplace.error : m.notFound}
        description={isError ? t.marketplace.errorDesc : m.notFoundDesc}
        action={<Button render={<Link href="/products" />}>{m.back}</Button>}
      />
    )
  }

  const p = product
  const inStock = p.stockQuantity === null || p.stockQuantity > 0

  return (
    <>
      <Breadcrumbs
        items={[
          { label: t.marketplace.breadcrumbHome, href: "/" },
          { label: m.title, href: "/products" },
          { label: p.name },
        ]}
      />

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-2">
        <ProductGallery images={p.images} name={p.name} />

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{p.name}</h1>

          {p.company && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Store className="size-4 text-primary" />
              {m.soldBy}{" "}
              <Link href={`/companies/${p.company.slug}`} className="font-medium text-primary hover:underline">
                {p.company.name}
              </Link>
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            {p.price !== null ? (
              <span className="text-3xl font-bold text-primary">
                {formatPrice(p.price, p.currency, lang)}
                {p.unit && <span className="text-base font-normal text-muted-foreground"> / {p.unit}</span>}
              </span>
            ) : (
              <span className="text-xl font-semibold text-muted-foreground">{m.priceOnRequest}</span>
            )}
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                inStock ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
              }`}
            >
              {inStock ? m.inStock : m.outOfStock}
            </span>
          </div>

          {/* Key facts */}
          <dl className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card text-sm">
            <Row icon={<Boxes className="size-4" />} label={m.moq} value={`${formatNumber(p.minOrderQuantity, lang)}${p.unit ? ` ${p.unit}` : ""}`} />
            {p.sku && <Row icon={<Tag className="size-4" />} label={m.sku} value={p.sku} />}
            {p.store && (
              <Row
                icon={<Store className="size-4" />}
                label={t.marketplace.stores.about}
                value={<Link href={`/stores/${p.store.slug}`} className="text-primary hover:underline">{p.store.name}</Link>}
              />
            )}
          </dl>

          {p.description && (
            <div className="mt-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground">
                {m.description}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{p.description}</p>
            </div>
          )}

          {p.categories.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground">
                <Layers className="size-4 text-primary" />
                {m.categories}
              </h2>
              <div className="flex flex-wrap gap-2">
                {p.categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className="rounded-full border border-border px-3 py-1 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <dt className="flex items-center gap-2 text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </dt>
      <dd className="text-end font-medium text-foreground">{value}</dd>
    </div>
  )
}
