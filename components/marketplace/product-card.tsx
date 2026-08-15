"use client"

import Link from "next/link"
import { ImageIcon, Package } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { formatNumber, formatPrice } from "@/lib/format"
import type { ProductSummary } from "@/lib/domains/product/types"

export function ProductCard({ product }: { product: ProductSummary }) {
  const { t, lang } = useLanguage()
  const m = t.marketplace.products
  const image = product.primaryImage

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
      <Link
        href={`/products/${product.id}`}
        aria-label={product.name}
        className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      />
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
        {image?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.url}
            alt={image.alt ?? product.name}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImageIcon className="size-8" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-semibold text-card-foreground">{product.name}</h3>

        <div className="mt-3 flex items-end justify-between gap-2">
          <p className="text-lg font-bold text-primary">
            {product.price !== null ? (
              <>
                {formatPrice(product.price, product.currency, lang)}
                {product.unit && (
                  <span className="text-xs font-normal text-muted-foreground"> / {product.unit}</span>
                )}
              </>
            ) : (
              <span className="text-sm font-semibold text-muted-foreground">{m.priceOnRequest}</span>
            )}
          </p>
        </div>

        {product.minOrderQuantity !== null && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Package className="size-3.5" aria-hidden="true" />
            {m.moq}: <span className="font-medium text-foreground">{formatNumber(product.minOrderQuantity, lang)}</span>
          </p>
        )}
      </div>
    </article>
  )
}
