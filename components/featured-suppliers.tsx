"use client"
import Link from "next/link"
import Image from "next/image"

import { useEffect, useState } from "react"
import { BadgeCheck, Crown, MapPin, ArrowRight, ShieldCheck, Timer } from "lucide-react"
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
    <section id="suppliers" className="bg-secondary/35 py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header content with premium spacing */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Crown className="size-3 text-accent fill-current" />
            Verified Partners
          </span>
          <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t.suppliers.title}
          </h2>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            {t.suppliers.subtitle}
          </p>
        </div>

        {/* Beautiful Manufacturer Cards Grid */}
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: FEATURED_LIMIT }).map((_, i) => (
                <div key={i} className="h-96 animate-pulse rounded-3xl border border-border bg-card" />
              ))
            : items.map((s) => (
                <div
                  key={s.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-xl"
                >
                  {/* Manufacturer Facility Image Preview */}
                  <div className="relative h-44 overflow-hidden bg-secondary">
                    <Image
                      src="/images/supplier-factory.png"
                      alt={`${s.name} facility`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Gold Supplier Badge overlay */}
                    {s.verified && (
                      <span className="absolute start-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-[10px] font-bold text-foreground shadow-lg backdrop-blur-md uppercase">
                        <Crown className="size-3 text-amber-500 fill-amber-500" />
                        {t.suppliers.goldSupplier}
                      </span>
                    )}

                    {/* Quality standard indicator overlay */}
                    <span className="absolute end-4 top-4 inline-flex size-7 items-center justify-center rounded-full bg-background/95 text-accent shadow-md backdrop-blur-md">
                      <ShieldCheck className="size-4" />
                    </span>
                  </div>

                  {/* Body Content Area */}
                  <div className="flex flex-1 flex-col p-5">

                    {/* Supplier Title & Verification Badge */}
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {s.name}
                      </h3>
                      {s.verified && (
                        <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <BadgeCheck className="size-3.5 fill-current text-white" />
                        </span>
                      )}
                    </div>

                    {/* Location */}
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="size-3.5 text-primary" />
                      <span className="truncate">
                        {dt.cities[s.cityKey]}, {dt.countries[s.country]}
                      </span>
                    </p>

                    {/* Sector / Category Chip */}
                    <div className="mt-3">
                      <span className="inline-block rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground">
                        {dt.categories[s.categories[0]]}
                      </span>
                    </div>

                    {/* Custom High-trust split metrics */}
                    <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 text-center">
                      <div className="border-r border-border last:border-0 rtl:border-l rtl:border-r-0">
                        <p className="text-base font-extrabold text-foreground">{s.responseRate}%</p>
                        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
                          <Timer className="size-3 text-accent" />
                          {t.suppliers.responseRate}
                        </p>
                      </div>
                      <div>
                        <p className="text-base font-extrabold text-foreground">{s.years}</p>
                        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          {t.suppliers.yearsLabel}
                        </p>
                      </div>
                    </div>

                    {/* Action button */}
                    <Link href={`/suppliers/${s.id}`} className="mt-5 block w-full">
                      <Button variant="outline" className="w-full rounded-xl border-border bg-card py-5 font-semibold text-foreground transition-all duration-300 hover:bg-primary hover:text-primary-foreground group-hover:border-primary">
                        {t.suppliers.viewProfile}
                        <ArrowRight className="size-4 ml-1.5 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
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
