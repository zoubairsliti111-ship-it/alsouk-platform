"use client"

import Link from "next/link"
import {
  Utensils,
  Shirt,
  Building2,
  Cog,
  Package,
  Leaf,
  Sofa,
  Cpu,
  FlaskConical,
  Grid,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"

// Decorative category shortcuts on the home page. These link to the general
// /categories browse page rather than per-category slugs, and intentionally
// carry no supplier-count number — the real company_categories/product_categories
// link tables are empty today, so any live count would show 0 for all of them;
// a fabricated count ("3,200+" etc.) would be worse than showing none.
const CATEGORIES_DATA = [
  { id: "food", icon: Utensils, names: { en: "Food", fr: "Alimentation", ar: "أغذية" } },
  { id: "textile", icon: Shirt, names: { en: "Textile", fr: "Textile", ar: "نسيج" } },
  { id: "construction", icon: Building2, names: { en: "Construction", fr: "Construction", ar: "بناء" } },
  { id: "machinery", icon: Cog, names: { en: "Machinery", fr: "Machines", ar: "آلات" } },
  { id: "packaging", icon: Package, names: { en: "Packaging", fr: "Emballage", ar: "تعبئة وتغليف" } },
  { id: "agriculture", icon: Leaf, names: { en: "Agriculture", fr: "Agriculture", ar: "زراعة" } },
  { id: "furniture", icon: Sofa, names: { en: "Furniture", fr: "Mobilier", ar: "أثاث" } },
  { id: "electronics", icon: Cpu, names: { en: "Electronics", fr: "Électronique", ar: "إلكترونيات" } },
  { id: "chemicals", icon: FlaskConical, names: { en: "Chemicals", fr: "Produits chimiques", ar: "كيماويات" } },
  { id: "more", icon: Grid, names: { en: "More", fr: "Plus", ar: "المزيد" } },
]

export function CategoriesSection() {
  const { t, lang } = useLanguage()

  return (
    <section id="categories" className="py-6 bg-background">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between gap-4 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {t.categories.title}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">{t.categories.subtitle}</p>
          </div>
        </div>

        {/* Horizontal scrolling on mobile/tablet viewports */}
        <div className="no-scrollbar -mx-6 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 sm:grid sm:grid-cols-5 md:grid-cols-10 sm:overflow-visible sm:px-0 sm:mx-0">
          {CATEGORIES_DATA.map((cat) => {
            const Icon = cat.icon
            const catName = cat.names[lang] || cat.names["en"]
            return (
              <Link
                key={cat.id}
                href="/categories"
                className="group flex w-[100px] shrink-0 snap-start flex-col items-center gap-3 rounded-[20px] border border-border bg-card p-3 text-center transition-all duration-300 hover:border-primary/25 hover:shadow-sm active:scale-[0.98] sm:w-auto"
              >
                <span className="flex size-12 items-center justify-center rounded-[20px] bg-secondary text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5.5" />
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="line-clamp-2 text-xs font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
                    {catName}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
