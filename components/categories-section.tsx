"use client"

import {
  ArrowRight,
  Wheat,
  Shirt,
  Cog,
  Building2,
  Palette,
  Sparkles,
  Footprints,
  FlaskConical,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumBadge } from "@/components/ui/premium-badge"

const ICONS = [Wheat, Shirt, Cog, Building2, Palette, Sparkles, Footprints, FlaskConical]

export function CategoriesSection() {
  const { t, lang } = useLanguage()

  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-20">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <PremiumBadge variant="primary" className="mb-2">
            {lang === "ar" ? "الفئات الرئيسية" : lang === "fr" ? "Catégories Principales" : "Key Sectors"}
          </PremiumBadge>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t.categories.title}
          </h2>
          <p className="mt-2 max-w-xl text-muted-foreground">{t.categories.subtitle}</p>
        </div>
        <a
          href="#"
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          {t.categories.viewAll}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
        </a>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {t.categories.items.map((cat, i) => {
          const Icon = ICONS[i % ICONS.length]
          return (
            <PremiumCard
              key={cat.name}
              hoverEffect="lift"
              className="overflow-hidden border border-border/80"
            >
              <a
                href="#products"
                className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 h-full"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-6" />
                </span>
                <div className="min-w-0 mt-2 sm:mt-0">
                  <p className="truncate font-bold text-foreground text-base group-hover:text-primary transition-colors">{cat.name}</p>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">
                    {cat.count} {t.categories.suppliersLabel}
                  </p>
                </div>
              </a>
            </PremiumCard>
          )
        })}
      </div>
    </section>
  )
}
