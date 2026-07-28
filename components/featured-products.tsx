"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Store, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumBadge } from "@/components/ui/premium-badge"

const IMAGES = [
  "/images/product-oliveoil.png",
  "/images/product-textiles.png",
  "/images/product-ceramics.png",
  "/images/product-dates.png",
  "/images/product-leather.png",
  "/images/product-machinery.png",
]

export function FeaturedProducts() {
  const { t, lang } = useLanguage()

  return (
    <section id="products" className="mx-auto max-w-7xl px-4 py-20">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <PremiumBadge variant="primary" className="mb-2">
            {lang === "ar" ? "منتجات التصدير" : lang === "fr" ? "Produits d'Exportation" : "Sourcing Catalog"}
          </PremiumBadge>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl mt-1">
            {t.products.title}
          </h2>
          <p className="mt-2 max-w-xl text-muted-foreground">{t.products.subtitle}</p>
        </div>
        <Link
          href="/products"
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          {t.products.viewAll}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {t.products.items.map((p, i) => (
          <PremiumCard
            key={p.name}
            hoverEffect="lift"
            className="group flex flex-col overflow-hidden border border-border/80 bg-background"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
              <Image
                src={IMAGES[i % IMAGES.length] || "/placeholder.svg"}
                alt={p.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute end-4 top-4 rounded-full bg-black/55 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
                {lang === "ar" ? "عالي الجودة" : lang === "fr" ? "Premium" : "Premium Tier"}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors leading-snug">{p.name}</h3>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Store className="size-4 text-primary" />
                {p.supplier}
              </p>

              <div className="mt-5 pt-4 border-t border-border/50 flex items-baseline justify-between">
                <p className="text-xl font-extrabold text-primary">
                  {p.price}
                  <span className="text-xs font-normal text-muted-foreground"> {t.products.perUnit}</span>
                </p>
                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Layers className="size-3.5" />
                  {t.products.moq}: <span className="font-bold text-foreground">{p.moq}</span>
                </p>
              </div>

              <Button className="mt-5 w-full bg-primary text-white hover:bg-primary/90 font-bold rounded-2xl h-11">
                {t.products.inquire}
              </Button>
            </div>
          </PremiumCard>
        ))}
      </div>
    </section>
  )
}
