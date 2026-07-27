"use client"

import { useEffect, useState } from "react"
import { Package } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { fetchProducts } from "@/lib/services/products-client"
import type { ProductSummary } from "@/lib/domains/product/types"
import { Breadcrumbs, CardGridSkeleton, ListingHeader, MessageState } from "@/components/marketplace/shell"
import { ProductCard } from "@/components/marketplace/product-card"

export function ProductsListing() {
  const { t } = useLanguage()
  const m = t.marketplace.products
  const [status, setStatus] = useState<"loading" | "loaded">("loading")
  const [products, setProducts] = useState<ProductSummary[]>([])

  useEffect(() => {
    let active = true
    fetchProducts({ limit: 48 }).then((data) => {
      if (!active) return
      setProducts(data)
      setStatus("loaded")
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <Breadcrumbs items={[{ label: t.marketplace.breadcrumbHome, href: "/" }, { label: m.title }]} />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ListingHeader title={m.title} subtitle={m.subtitle} />
        {status === "loading" ? (
          <CardGridSkeleton />
        ) : products.length === 0 ? (
          <MessageState icon={<Package className="size-7" />} title={m.empty} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
