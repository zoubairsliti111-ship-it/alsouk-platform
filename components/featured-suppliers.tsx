"use client"

import { BadgeCheck, Crown, MapPin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/section-heading"
import { useLanguage } from "@/components/language-provider"

export function FeaturedSuppliers() {
  const { t } = useLanguage()

  return (
    <section id="suppliers" className="bg-secondary/40 py-16">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading align="center" title={t.suppliers.title} subtitle={t.suppliers.subtitle} />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.suppliers.items.map((s, i) => (
            <div
              key={s.name}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-32 overflow-hidden">
                <img
                  src="/images/supplier-factory.png"
                  alt={`${s.name} facility`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground shadow">
                  <Crown className="size-3" />
                  {t.suppliers.goldSupplier}
                </span>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate font-semibold text-foreground">{s.name}</h3>
                  <BadgeCheck className="size-4 shrink-0 text-primary" />
                </div>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {s.location}
                </p>
                <p className="mt-2 inline-block rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  {s.category}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-3 text-center">
                  <div>
                    <p className="text-sm font-bold text-foreground">{s.response}</p>
                    <p className="text-[11px] text-muted-foreground">{t.suppliers.responseRate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{s.years}</p>
                    <p className="text-[11px] text-muted-foreground">{t.suppliers.yearsLabel}</p>
                  </div>
                </div>

                <Button variant="outline" className="mt-4 w-full">
                  {t.suppliers.viewProfile}
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
