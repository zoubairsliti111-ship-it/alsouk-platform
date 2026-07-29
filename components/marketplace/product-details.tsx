"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Boxes, Heart, Layers, MessageSquare, Package, Store, Tag } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { fetchProductById, fetchProducts } from "@/lib/services/products-client"
import { formatNumber, formatPrice } from "@/lib/format"
import type { ProductDetails, ProductSummary } from "@/lib/domains/product/types"
import { Breadcrumbs, MessageState } from "@/components/marketplace/shell"
import { ProductGallery } from "@/components/marketplace/product-gallery"
import { ProductCard } from "@/components/marketplace/product-card"

type Status = "loading" | "loaded" | "notFound" | "error"

export function ProductDetailsView({ id }: { id: string }) {
  const { t, lang } = useLanguage()
  const m = t.marketplace.products
  const [state, setState] = useState<{ id: string; status: Status; product: ProductDetails | null }>({
    id,
    status: "loading",
    product: null,
  })
  const [related, setRelated] = useState<ProductSummary[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true
    fetchProductById(id).then((res) => {
      if (!active) return
      setRelated([])
      if (res.error) setState({ id, status: "error", product: null })
      else if (res.notFound || !res.data) setState({ id, status: "notFound", product: null })
      else {
        const data = res.data
        setState({ id, status: "loaded", product: data })
        if (data.companyId) {
          fetchProducts({ companyId: data.companyId, limit: 8 }).then((list) => {
            if (active) setRelated(list.filter((r) => r.id !== data.id).slice(0, 6))
          })
        }
      }
    })
    return () => {
      active = false
    }
  }, [id])

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

  const priceBlock =
    p.price !== null ? (
      <span className="text-3xl font-bold text-primary">
        {formatPrice(p.price, p.currency, lang)}
        {p.unit && <span className="text-base font-normal text-muted-foreground"> / {p.unit}</span>}
      </span>
    ) : (
      <span className="text-xl font-semibold text-muted-foreground">{m.priceOnRequest}</span>
    )

  const saveButton = (
    <button
      type="button"
      onClick={() => setSaved((v) => !v)}
      aria-pressed={saved}
      aria-label={saved ? m.saved : m.save}
      className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors active:scale-95 ${
        saved ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:bg-secondary"
      }`}
    >
      <Heart className={`size-4 ${saved ? "fill-primary" : ""}`} />
      <span className="hidden sm:inline">{saved ? m.saved : m.save}</span>
    </button>
  )

  const requestQuoteCta = (
    <Link
      href="/rfq"
      className={buttonVariants({ size: "lg", className: "w-full gap-2 text-base font-semibold" })}
    >
      <MessageSquare className="size-4" />
      {m.requestQuote}
    </Link>
  )

  return (
    <>
      <Breadcrumbs
        items={[
          { label: t.marketplace.breadcrumbHome, href: "/" },
          { label: m.title, href: "/products" },
          { label: p.name },
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 lg:pb-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="lg:sticky lg:top-6 lg:self-start">
            <ProductGallery images={p.images} name={p.name} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{p.name}</h1>

            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              {priceBlock}
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                  inStock ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
                }`}
              >
                {inStock ? m.inStock : m.outOfStock}
              </span>
            </div>

            {/* Specifications */}
            <h2 className="mt-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground">
              <Boxes className="size-4 text-primary" />
              {m.specifications}
            </h2>
            <dl className="mt-2 divide-y divide-border rounded-2xl border border-border bg-card text-sm">
              <Row icon={<Boxes className="size-4" />} label={m.moq} value={`${formatNumber(p.minOrderQuantity, lang)}${p.unit ? ` ${p.unit}` : ""}`} />
              <Row icon={<Package className="size-4" />} label={m.stock} value={inStock ? m.inStock : m.outOfStock} />
              {p.sku && <Row icon={<Tag className="size-4" />} label={m.sku} value={p.sku} />}
            </dl>

            {/* Supplier card */}
            {p.company && (
              <div className="mt-6 rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Store className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{m.soldBy}</p>
                    <p className="truncate font-semibold text-foreground">{p.company.name}</p>
                  </div>
                  <Link
                    href={`/companies/${p.company.slug}`}
                    className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5" })}
                  >
                    {m.visitStore}
                    <ArrowRight className="size-3.5 rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            )}

            {p.description && (
              <div className="mt-6">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground">{m.description}</h2>
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

            {/* Desktop CTA */}
            <div className="mt-8 hidden items-center gap-3 lg:flex">
              <div className="flex-1">{requestQuoteCta}</div>
              {saveButton}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold tracking-tight text-foreground">{m.relatedProducts}</h2>
            <div className="no-scrollbar -mx-4 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
              {related.map((r) => (
                <div key={r.id} className="w-[65%] shrink-0 snap-start sm:w-[45%] lg:w-auto">
                  <ProductCard product={r} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky mobile CTA — sits above the bottom nav */}
      <div className="fixed inset-x-0 bottom-14 z-30 flex items-center gap-3 border-t border-border bg-card/95 p-3 backdrop-blur lg:hidden">
        {saveButton}
        <div className="flex-1">{requestQuoteCta}</div>
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
