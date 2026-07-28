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

const ICONS = [Wheat, Shirt, Cog, Building2, Palette, Sparkles, Footprints, FlaskConical]

export function CategoriesSection() {
  const { t } = useLanguage()

  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      {/* Premium Header */}
      <div className="flex flex-col items-start justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Industries Covered</span>
          <h2 className="mt-2 text-pretty text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t.categories.title}
          </h2>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">{t.categories.subtitle}</p>
        </div>
        <a
          href="#"
          className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-primary hover:text-primary hover:shadow-sm"
        >
          {t.categories.viewAll}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
        </a>
      </div>

      {/* Premium Glassmorphism Hover Cards Grid */}
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {t.categories.items.map((cat, i) => {
          const Icon = ICONS[i % ICONS.length]
          return (
            <a
              key={cat.name}
              href="#products"
              className="group flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-md"
            >
              <div>
                {/* Dynamic Icon Wrapper */}
                <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                  <Icon className="size-6" />
                </span>

                <p className="mt-6 text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                  {cat.name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {cat.count} {t.categories.suppliersLabel}
                </p>
              </div>

              {/* Bottom discovery arrow */}
              <div className="mt-6 flex items-center justify-between text-xs font-semibold text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span>Explore Industry</span>
                <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180" />
              </div>
            </a>
          )
        })}
      </div>
    </section>
  )
}
