"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Store, ShieldCheck, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

const IMAGES = [
  "/images/product-oliveoil.png",
  "/images/product-textiles.png",
  "/images/product-ceramics.png",
  "/images/product-dates.png",
  "/images/product-leather.png",
  "/images/product-machinery.png",
]

export function FeaturedProducts() {
  const { t } = useLanguage()

  return (
    <section id="products" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      {/* Premium Header */}
      <div className="flex flex-col items-start justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
            <ShoppingBag className="size-3.5 fill-current" />
            Trending Marketplace
          </span>
          <h2 className="mt-2 text-pretty text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t.products.title}
          </h2>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">{t.products.subtitle}</p>
        </div>
        <Link
          href="/products"
          className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-primary hover:text-primary hover:shadow-sm"
        >
          {t.products.viewAll}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
        </Link>
      </div>

      {/* Modern Trending Products Grid */}
      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {t.products.items.map((p, i) => (
          <div
            key={p.name}
            className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-xl"
          >
            {/* Product Image preview with ratio */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
              <Image
                src={IMAGES[i % IMAGES.length] || "/placeholder.svg"}
                alt={p.name}
                fill
                priority={i < 3}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Premium Quality Overlay Chip */}
              <span className="absolute start-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-[10px] font-bold text-foreground shadow-lg backdrop-blur-md uppercase">
                <ShieldCheck className="size-3 text-accent" />
                Premium Grade
              </span>
            </div>

            {/* Product meta Content info */}
            <div className="flex flex-1 flex-col p-5">

              {/* Name */}
              <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {p.name}
              </h3>

              {/* Supplier Info */}
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Store className="size-4 text-primary" />
                <span className="font-semibold text-foreground/80">{p.supplier}</span>
              </p>

              {/* Price Tier & Metric info */}
              <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
                <div>
                  <p className="text-lg font-extrabold text-primary">
                    {p.price}
                    <span className="text-xs font-normal text-muted-foreground"> {t.products.perUnit}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.products.moq}: <span className="font-bold text-foreground">{p.moq}</span>
                  </p>
                </div>
              </div>

              {/* Call To Action */}
              <Button className="mt-6 w-full rounded-xl bg-primary py-5 font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary/95 active:scale-95">
                {t.products.inquire}
              </Button>

            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
