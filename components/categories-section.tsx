"use client"

import {
  Wheat,
  Shirt,
  Cog,
  Building2,
  Palette,
  Sparkles,
  Footprints,
  FlaskConical,
} from "lucide-react"
import { SectionHeading } from "@/components/section-heading"
import { useLanguage } from "@/components/language-provider"
import { cycle } from "@/lib/ui"

const ICONS = [Wheat, Shirt, Cog, Building2, Palette, Sparkles, Footprints, FlaskConical]

export function CategoriesSection() {
  const { t } = useLanguage()

  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-16">
      <SectionHeading
        title={t.categories.title}
        subtitle={t.categories.subtitle}
        action={{ label: t.categories.viewAll }}
      />

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {t.categories.items.map((cat, i) => {
          const Icon = cycle(ICONS, i)
          return (
            <a
              key={cat.name}
              href="#products"
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-6" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{cat.name}</p>
                <p className="text-sm text-muted-foreground">
                  {cat.count} {t.categories.suppliersLabel}
                </p>
              </div>
            </a>
          )
        })}
      </div>
    </section>
  )
}
