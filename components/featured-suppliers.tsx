"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { ArrowRight, BadgeCheck, Crown, MapPin, ShieldCheck, Star } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { directoryT } from "@/lib/directory-i18n"
import { fetchSuppliers } from "@/lib/supabase/suppliers-service"
import type { Supplier } from "@/lib/directory-data"

const FEATURED_LIMIT = 6

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

  if (!loading && items.length === 0) return null

  return (
    <section id="suppliers" className="bg-secondary/40 py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="size-3.5" />
              {t.suppliers.verified}
            </span>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
              {t.suppliers.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.suppliers.subtitle}</p>
          </div>
          <Link
            href="/suppliers"
            className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            {t.home.viewAll}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
          </Link>
        </div>

        <div className="no-scrollbar -mx-4 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-64 w-[75%] shrink-0 animate-pulse rounded-2xl border border-border bg-card sm:w-[45%] lg:w-auto" />
              ))
            : items.map((s) => (
                <div
                  key={s.id}
                  className="group flex w-[75%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl sm:w-[45%] lg:w-auto"
                >
                  <div className="relative h-28 overflow-hidden">
                    <Image
                      src="/images/supplier-factory.png"
                      alt={`${s.name} facility`}
                      fill
                      sizes="(max-width: 1024px) 75vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {s.verified && (
                      <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground shadow">
                        <Crown className="size-3" />
                        {t.suppliers.goldSupplier}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate font-semibold text-foreground">{s.name}</h3>
                      {s.verified && <BadgeCheck className="size-4 shrink-0 text-primary" />}
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="truncate">
                        {dt.cities[s.cityKey]}, {dt.countries[s.country]}
                      </span>
                    </p>
                    <p className="mt-2 inline-flex w-fit items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                      {dt.categories[s.categories[0]]}
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-1 border-t border-border pt-3 text-center">
                      <div>
                        <p className="flex items-center justify-center gap-0.5 text-sm font-bold text-foreground">
                          <Star className="size-3 fill-amber-400 text-amber-400" />
                          {s.rating}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{s.reviews}</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{s.responseRate}%</p>
                        <p className="text-[10px] text-muted-foreground">{t.suppliers.responseRate}</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{s.years}</p>
                        <p className="text-[10px] text-muted-foreground">{t.suppliers.yearsLabel}</p>
                      </div>
                    </div>

                    <Link
                      href={`/suppliers/${s.id}`}
                      className={buttonVariants({ variant: "outline", className: "mt-4 w-full" })}
                    >
                      {t.suppliers.viewProfile}
                      <ArrowRight className="size-4 rtl:rotate-180" />
                    </Link>
                  </div>
                </div>
              ))}
        </div>

        <div className="mt-6 flex justify-center">
          <Link href="/suppliers" className={buttonVariants({ variant: "outline", size: "lg" })}>
            {t.home.browseSuppliers}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  )
}
