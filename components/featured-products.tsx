"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Flame } from "lucide-react"
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
    <section id="products" className="py-6 bg-background">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Heading */}
        <div className="flex items-end justify-between gap-4 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {t.products.title}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">{t.products.subtitle}</p>
          </div>
          <Link
            href="/products"
            className="group inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            {t.home.viewAll}
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
          </Link>
        </div>

        {/* Horizontal rail on mobile, grid on desktop */}
        <div className="no-scrollbar -mx-6 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 sm:grid sm:grid-cols-2 md:grid-cols-3 sm:overflow-visible sm:px-0 sm:mx-0">
          {t.products.items.map((p, i) => (
            <div
              key={p.name}
              className="group flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-[20px] border border-border bg-card p-4 transition-all duration-300 hover:border-primary/25 sm:w-auto animate-fade-in"
            >
              {/* Product Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[16px] bg-secondary mb-3">
                <Image
                  src={IMAGES[i % IMAGES.length] || "/placeholder.svg"}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 280px, 20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-102"
                />
                {i < 3 && (
                  <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#EF4444] px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
                    <Flame className="size-3 text-white" />
                    <span>HOT</span>
                  </span>
                )}
                <span className="absolute end-3 top-3 rounded-full bg-background/90 px-2 py-0.5 text-[9px] font-bold text-foreground shadow-sm backdrop-blur">
                  {t.products.moq}: {p.moq}
                </span>
              </div>

              {/* Product Details */}
              <div className="flex flex-1 flex-col">
                <h3 className="line-clamp-1 text-sm font-bold text-foreground leading-snug">
                  {p.name}
                </h3>
                <p className="mt-1.5 text-[11px] font-semibold text-muted-foreground truncate">
                  {p.supplier}
                </p>
                <p className="mt-3 text-base font-extrabold text-[#2563EB]">
                  {p.price}
                  <span className="text-[10px] font-medium text-muted-foreground"> {t.products.perUnit}</span>
                </p>

                {/* Request Quote Button */}
                <Link
                  href="/rfq"
                  className={buttonVariants({
                    size: "sm",
                    className: "mt-4 w-full rounded-xl bg-[#2563EB] hover:bg-blue-700 text-[11px] font-semibold text-white transition-all duration-300",
                  })}
                >
                  Request Quote
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
