"use client"

import { ArrowRight, Store } from "lucide-react"
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
    <section id="products" className="mx-auto max-w-7xl px-4 py-16">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t.products.title}
          </h2>
          <p className="mt-2 max-w-xl text-muted-foreground">{t.products.subtitle}</p>
        </div>
        <a
          href="#"
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          {t.products.viewAll}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
        </a>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {t.products.items.map((p, i) => (
          <div
            key={p.name}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative overflow-hidden bg-secondary">
              <img
                src={IMAGES[i % IMAGES.length] || "/placeholder.svg"}
                alt={p.name}
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="font-semibold text-foreground">{p.name}</h3>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Store className="size-3.5" />
                {p.supplier}
              </p>

              <div className="mt-3 flex items-end justify-between">
                <p className="text-lg font-bold text-primary">
                  {p.price}
                  <span className="text-xs font-normal text-muted-foreground"> {t.products.perUnit}</span>
                </p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t.products.moq}: <span className="font-medium text-foreground">{p.moq}</span>
              </p>

              <Button className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {t.products.inquire}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
