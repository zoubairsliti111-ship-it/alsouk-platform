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
    <section id="products" className="mx-auto max-w-7xl px-6 py-10 lg:py-16">
      <div className="flex items-end justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/8 px-2.5 py-1 text-xs font-bold text-destructive">
            <Flame className="size-3.5" />
            {t.home.trendingTag}
          </span>
          <h2 className="mt-2.5 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {t.home.trendingTitle}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{t.home.trendingSubtitle}</p>
        </div>
        <Link
          href="/products"
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
        >
          {t.home.viewAll}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
        </Link>
      </div>

      {/* Horizontal rail on mobile, grid on desktop */}
      <div className="no-scrollbar -mx-6 mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
        {t.products.items.map((p, i) => (
          <div
            key={p.name}
            className="group flex w-[78%] shrink-0 snap-start flex-col overflow-hidden rounded-[20px] border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5 sm:w-[48%] lg:w-auto"
          >
            <Link href="/products" className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
              <Image
                src={IMAGES[i % IMAGES.length] || "/placeholder.svg"}
                alt={p.name}
                fill
                sizes="(max-width: 1024px) 78vw, 30vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              {i < 3 && (
                <span className="absolute start-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-destructive px-3 py-1 text-[11px] font-bold text-white shadow-sm">
                  <Flame className="size-3.5" />
                  {t.home.hotBadge}
                </span>
              )}
              <span className="absolute end-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[11px] font-bold text-foreground shadow-sm backdrop-blur">
                {t.products.moq}: {p.moq}
              </span>
            </Link>
            <div className="flex flex-1 flex-col p-5">
              <Link href="/products" className="line-clamp-1 text-base font-extrabold text-foreground transition-colors hover:text-primary">
                {p.name}
              </Link>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Store className="size-4" />
                <span className="truncate">{p.supplier}</span>
              </p>
              <p className="mt-4 text-xl font-extrabold text-primary">
                {p.price}
                <span className="text-xs font-medium text-muted-foreground"> {t.products.perUnit}</span>
              </p>
              <Link
                href="/rfq"
                className={buttonVariants({ className: "mt-5 w-full rounded-xl bg-primary py-5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary/95 active:scale-98" })}
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
