"use client"

import Link from "next/link"
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
    <section id="categories" className="mx-auto max-w-7xl px-6 py-10 lg:py-16">
      <div className="flex items-end justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {t.categories.title}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{t.categories.subtitle}</p>
        </div>
        <Link
          href="/categories"
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
        >
          {t.categories.viewAll}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
        </Link>
      </div>

      {/* Horizontal scrolling on mobile/tablet, grid on desktop */}
      <div className="no-scrollbar -mx-6 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 md:mx-0 md:grid md:grid-cols-4 lg:grid-cols-8 md:overflow-visible md:px-0">
        {t.categories.items.map((cat, i) => {
          const Icon = ICONS[i % ICONS.length]
          return (
            <Link
              key={cat.name}
              href="/categories"
              className="group flex w-[35%] shrink-0 snap-start min-w-[120px] flex-col items-center gap-3.5 rounded-[20px] border border-border bg-card p-4 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98] sm:w-[22%] md:w-auto"
            >
              <span className="flex size-14 items-center justify-center rounded-[20px] bg-secondary text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md group-hover:shadow-primary/10">
                <Icon className="size-6.5" />
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="line-clamp-2 text-xs font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
                  {cat.name}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {cat.count}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
