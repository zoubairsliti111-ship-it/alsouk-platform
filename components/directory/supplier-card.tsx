"use client"

import Link from "next/link"
import { BadgeCheck, MapPin, MessageSquare, Package, Star, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { directoryT } from "@/lib/directory-i18n"
import type { Supplier } from "@/lib/directory-data"

export function SupplierCard({ supplier }: { supplier: Supplier }) {
  const { lang } = useLanguage()
  const t = directoryT[lang]

  const logoClasses =
    supplier.logoColor === "green"
      ? "bg-brand-green text-brand-green-foreground"
      : "bg-brand-blue text-brand-blue-foreground"

  const profileHref = `/suppliers/${supplier.id}`

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
      {/* Stretched overlay link: clicking anywhere on the card (except the
          action buttons below) opens the supplier's profile page. */}
      <Link
        href={profileHref}
        aria-label={supplier.name}
        className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      />
      {/* Header */}
      <div className="flex items-start gap-4 p-5">
        <div
          className={`flex size-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${logoClasses}`}
          aria-hidden="true"
        >
          {supplier.monogram}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-bold text-card-foreground">{supplier.name}</h3>
            {supplier.verified && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                <BadgeCheck className="size-3.5" />
                {t.card.verified}
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0 text-primary" />
            <span className="truncate">
              {t.cities[supplier.cityKey]}, {t.countries[supplier.country]}
            </span>
          </div>

          <div className="mt-1.5 flex items-center gap-1.5">
            <div className="flex items-center gap-0.5 text-amber-500" aria-hidden="true">
              <Star className="size-4 fill-current" />
            </div>
            <span className="text-sm font-semibold text-card-foreground">
              {supplier.rating.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({supplier.reviews} {t.card.reviews})
            </span>
          </div>
        </div>
      </div>

      {/* Business type tags */}
      <div className="flex flex-wrap gap-1.5 px-5">
        {supplier.businessTypes.map((bt) => (
          <span
            key={bt}
            className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
          >
            {t.businessTypes[bt]}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 divide-x divide-border border-y border-border bg-secondary/40 text-center rtl:divide-x-reverse">
        <div className="flex flex-col items-center gap-0.5 px-2 py-3">
          <Package className="size-4 text-primary" aria-hidden="true" />
          <span className="text-sm font-bold text-card-foreground">{supplier.products}</span>
          <span className="text-[11px] text-muted-foreground">{t.card.products}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 px-2 py-3">
          <span className="text-sm font-bold text-card-foreground">{supplier.years}</span>
          <span className="text-[11px] text-muted-foreground">{t.card.yearsInBusiness}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 px-2 py-3">
          <TrendingUp className="size-4 text-accent" aria-hidden="true" />
          <span className="text-sm font-bold text-card-foreground">{supplier.responseRate}%</span>
          <span className="text-[11px] text-muted-foreground">{t.card.responseRate}</span>
        </div>
      </div>

      {/* Main categories */}
      <div className="flex-1 px-5 py-4">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {t.card.mainCategories}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {supplier.categories.map((cat) => (
            <span
              key={cat}
              className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-card-foreground"
            >
              {t.categories[cat]}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {t.card.moqFrom} <span className="font-semibold text-card-foreground">{supplier.minMoq}</span>
        </p>
      </div>

      {/* Actions */}
      <div className="relative z-10 flex gap-2 border-t border-border p-4">
        <Button variant="outline" className="flex-1 gap-1.5" render={<Link href={profileHref} />}>
          <MessageSquare className="size-4" />
          {t.card.contact}
        </Button>
        <Button
          className="flex-1 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          render={<Link href={profileHref} />}
        >
          {t.card.quote}
        </Button>
      </div>
    </article>
  )
}
