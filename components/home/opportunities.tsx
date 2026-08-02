"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, PackageSearch } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

const BADGES = [
  "LIVE",
  "35% OFF",
  "READY TO SHIP",
  "TOP DEAL",
  "LIMITED STOCK",
  "EXPORT READY",
  "NEW",
]

const OP_IMAGES = [
  "/images/product-oliveoil.png",
  "/images/product-textiles.png",
  "/images/product-ceramics.png",
  "/images/product-dates.png",
]

export function Opportunities() {
  const { t } = useLanguage()

  const opportunities = t.products.items.slice(0, 4).map((p, i) => ({
    name: p.name,
    moq: p.moq,
    price: p.price,
    badge: BADGES[i % BADGES.length],
    image: OP_IMAGES[i % OP_IMAGES.length],
  }))

  return (
    <section id="opportunities" className="py-6 bg-background">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Heading */}
        <div className="flex items-end justify-between gap-4 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {t.home.opportunitiesTitle}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">{t.home.opportunitiesSubtitle}</p>
          </div>
          <Link
            href="/rfq"
            className="group inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            {t.home.viewAll}
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
          </Link>
        </div>

        {/* Horizontal rail on mobile viewports */}
        <div className="no-scrollbar -mx-6 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 sm:grid sm:grid-cols-2 md:grid-cols-4 sm:overflow-visible sm:px-0 sm:mx-0">
          {opportunities.map((o, i) => (
            <div
              key={i}
              className="group flex w-[280px] shrink-0 snap-start flex-col rounded-[20px] border border-border bg-card p-4 transition-all duration-300 hover:border-primary/20 hover:shadow-md sm:w-auto"
            >
              {/* Product Image & Badge */}
              <div className="relative aspect-[4/3.5] w-full overflow-hidden rounded-[16px] bg-secondary mb-3">
                <Image
                  src={o.image}
                  alt={o.name}
                  fill
                  sizes="(max-width: 640px) 280px, 20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-102"
                />
                <span className="absolute start-3 top-3 inline-flex items-center rounded-full bg-[#16A34A] px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
                  {o.badge}
                </span>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col">
                <h3 className="line-clamp-1 text-sm font-bold text-foreground leading-snug transition-colors group-hover:text-primary">
                  {o.name}
                </h3>
                <p className="mt-1 text-[11px] text-muted-foreground font-semibold">
                  {t.products.moq}: {o.moq}
                </p>
                <p className="mt-2 text-sm font-extrabold text-[#2563EB]">
                  {o.price}
                </p>

                <div className="mt-4 pt-3 border-t border-border/40">
                  <Link
                    href="/rfq"
                    className={buttonVariants({
                      size: "sm",
                      className: "w-full rounded-xl bg-[#2563EB] hover:bg-blue-700 text-[11px] font-semibold text-white shadow-sm flex items-center justify-center gap-1",
                    })}
                  >
                    <PackageSearch className="size-3.5" />
                    <span>Request Quote</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
