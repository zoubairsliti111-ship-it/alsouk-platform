"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Flame, Store } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
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
    <section id="products" className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
            <Flame className="size-3.5" />
            {t.home.trendingTag}
          </span>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
            {t.home.trendingTitle}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.home.trendingSubtitle}</p>
        </div>
        <Link
          href="/products"
          className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          {t.home.viewAll}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
        </Link>
      </div>

      {/* Horizontal rail on mobile, grid on desktop */}
      <div className="no-scrollbar -mx-4 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
        {t.products.items.map((p, i) => (
          <div
            key={p.name}
            className="group flex w-[70%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl sm:w-[45%] lg:w-auto"
          >
            <Link href="/products" className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
              <Image
                src={IMAGES[i % IMAGES.length] || "/placeholder.svg"}
                alt={p.name}
                fill
                sizes="(max-width: 1024px) 70vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {i < 3 && (
                <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-destructive px-2 py-0.5 text-[11px] font-semibold text-white shadow">
                  <Flame className="size-3" />
                  {t.home.hotBadge}
                </span>
              )}
              <span className="absolute end-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm backdrop-blur">
                {t.products.moq}: {p.moq}
              </span>
            </Link>
            <div className="flex flex-1 flex-col p-4">
              <Link href="/products" className="line-clamp-1 font-semibold text-foreground hover:text-primary">
                {p.name}
              </Link>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Store className="size-3.5" />
                <span className="truncate">{p.supplier}</span>
              </p>
              <p className="mt-3 text-lg font-bold text-primary">
                {p.price}
                <span className="text-xs font-normal text-muted-foreground"> {t.products.perUnit}</span>
              </p>
              <Link
                href="/rfq"
                className={buttonVariants({ className: "mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90" })}
              >
                {t.products.inquire}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
