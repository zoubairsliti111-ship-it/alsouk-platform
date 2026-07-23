"use client"
import Link from "next/link"

import { useEffect, useState } from "react"
import { BadgeCheck, Crown, MapPin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { directoryT } from "@/lib/directory-i18n"
import { fetchSuppliers } from "@/lib/supabase/suppliers-service"
import type { Supplier } from "@/lib/directory-data"

const FEATURED_LIMIT = 4

export function FeaturedSuppliers() {
  const { t, lang } = useLanguage()
  const dt = directoryT[lang]

  const [items, setItems] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchSuppliers({ sort: "rating", limit: FEATURED_LIMIT }).then((res) => {
      if (!active) return
      setItems(res.suppliers)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  // Keep the home page clean if the directory is unreachable or empty.
  if (!loading && items.length === 0) return null

  return (
    <section id="suppliers" className="bg-secondary/40 py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t.suppliers.title}
          </h2>
          <p className="mt-2 text-muted-foreground">{t.suppliers.subtitle}</p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: FEATURED_LIMIT }).map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-2xl border border-border bg-card" />
              ))
            : items.map((s) => (
                <div
                  key={s.id}
                  className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src="/images/supplier-factory.png"
                      alt={`${s.name} facility`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {s.verified && (
                      <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground shadow">
                        <Crown className="size-3" />
                        {t.suppliers.goldSupplier}
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate font-semibold text-foreground">{s.name}</h3>
                      {s.verified && <BadgeCheck className="size-4 shrink-0 text-primary" />}
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" />
                      {dt.cities[s.cityKey]}, {dt.countries[s.country]}
                    </p>
                    <p className="mt-2 inline-block rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                      {dt.categories[s.categories[0]]}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-3 text-center">
                      <div>
                        <p className="text-sm font-bold text-foreground">{s.responseRate}%</p>
                        <p className="text-[11px] text-muted-foreground">{t.suppliers.responseRate}</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{s.years}</p>
                        <p className="text-[11px] text-muted-foreground">{t.suppliers.yearsLabel}</p>
                      </div>
                    </div>

<Link href={`/suppliers/${s.id}`}>
  <Button variant="outline" className="mt-4 w-full">
    {t.suppliers.viewProfile}
    <ArrowRight className="size-4 rtl:rotate-180" />
  </Button>
</Link>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  )
}
