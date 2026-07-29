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

const FALLBACK_SUPPLIERS: Supplier[] = [
  {
    id: "atlas-ceramics",
    name: "Atlas Ceramics",
    monogram: "AC",
    logoColor: "green",
    country: "tn",
    cityKey: "nabeul",
    region: "capital",
    verified: true,
    rating: 4.7,
    reviews: 154,
    products: 96,
    years: 6,
    responseRate: 94,
    minMoq: 200,
    businessTypes: ["manufacturer"],
    categories: ["construction"],
    description: "Ceramic products manufacturer",
    logoUrl: null,
  },
  {
    id: "carthage-textiles",
    name: "Carthage Textiles",
    monogram: "CT",
    logoColor: "blue",
    country: "tn",
    cityKey: "monastir",
    region: "coastal",
    verified: true,
    rating: 4.8,
    reviews: 268,
    products: 512,
    years: 12,
    responseRate: 96,
    minMoq: 1000,
    businessTypes: ["manufacturer"],
    categories: ["textiles"],
    description: "Textile manufacturer and exporter",
    logoUrl: null,
  },
  {
    id: "kairouan-leather",
    name: "Kairouan Leather",
    monogram: "KL",
    logoColor: "blue",
    country: "tn",
    cityKey: "kairouan",
    region: "central",
    verified: true,
    rating: 4.6,
    reviews: 189,
    products: 233,
    years: 15,
    responseRate: 92,
    minMoq: 100,
    businessTypes: ["manufacturer"],
    categories: ["leather"],
    description: "Leather products",
    logoUrl: null,
  },
  {
    id: "medina-olive",
    name: "Medina Olive Co.",
    monogram: "MO",
    logoColor: "green",
    country: "tn",
    cityKey: "sfax",
    region: "coastal",
    verified: true,
    rating: 4.9,
    reviews: 312,
    products: 148,
    years: 8,
    responseRate: 98,
    minMoq: 500,
    businessTypes: ["manufacturer"],
    categories: ["food"],
    description: "Premium olive oil manufacturer",
    logoUrl: null,
  },
  {
    id: "sahara-dates",
    name: "Sahara Dates Export",
    monogram: "SD",
    logoColor: "green",
    country: "tn",
    cityKey: "tozeur",
    region: "south",
    verified: true,
    rating: 5.0,
    reviews: 421,
    products: 64,
    years: 10,
    responseRate: 99,
    minMoq: 1000,
    businessTypes: ["exporter"],
    categories: ["food"],
    description: "Dates exporter",
    logoUrl: null,
  },
  {
    id: "tunis-metalworks",
    name: "Tunis Metalworks",
    monogram: "TM",
    logoColor: "blue",
    country: "tn",
    cityKey: "tunis",
    region: "capital",
    verified: false,
    rating: 4.4,
    reviews: 87,
    products: 178,
    years: 4,
    responseRate: 88,
    minMoq: 50,
    businessTypes: ["manufacturer"],
    categories: ["machinery"],
    description: "Industrial metal products",
    logoUrl: null,
  }
]

export function FeaturedSuppliers() {
  const { t, lang } = useLanguage()
  const dt = directoryT[lang]

  const [items, setItems] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchSuppliers({ sort: "rating", limit: FEATURED_LIMIT }).then((res) => {
      if (!active) return
      if (res.suppliers && res.suppliers.length > 0) {
        setItems(res.suppliers)
      } else {
        setItems(FALLBACK_SUPPLIERS.slice(0, FEATURED_LIMIT))
      }
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  if (!loading && items.length === 0) return null

  return (
    <section id="suppliers" className="bg-secondary/30 py-10 lg:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-2.5 py-1 text-xs font-bold text-primary">
              <ShieldCheck className="size-3.5" />
              {t.suppliers.verified}
            </span>
            <h2 className="mt-2.5 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {t.suppliers.title}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{t.suppliers.subtitle}</p>
          </div>
          <Link
            href="/suppliers"
            className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            {t.home.viewAll}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
          </Link>
        </div>

        <div className="no-scrollbar -mx-6 mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-72 w-[82%] shrink-0 animate-pulse rounded-[20px] border border-border bg-card sm:w-[48%] lg:w-auto" />
              ))
            : items.map((s) => (
                <div
                  key={s.id}
                  className="group flex w-[82%] shrink-0 snap-start flex-col overflow-hidden rounded-[20px] border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5 sm:w-[48%] lg:w-auto"
                >
                  <div className="relative h-32 overflow-hidden">
                    <Image
                      src="/images/supplier-factory.png"
                      alt={`${s.name} facility`}
                      fill
                      sizes="(max-width: 1024px) 82vw, 30vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    {s.verified && (
                      <span className="absolute start-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground shadow-sm backdrop-blur-sm bg-accent/95">
                        <Crown className="size-3.5" />
                        {t.suppliers.goldSupplier}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-base font-extrabold text-foreground">{s.name}</h3>
                      {s.verified && <BadgeCheck className="size-4.5 shrink-0 text-primary" />}
                    </div>
                    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="truncate">
                        {dt.cities[s.cityKey] || s.cityKey}, {dt.countries[s.country] || s.country}
                      </span>
                    </p>
                    <p className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-secondary-foreground">
                      {dt.categories[s.categories[0]] || s.categories[0]}
                    </p>

                    <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border/80 pt-4 text-center">
                      <div>
                        <p className="flex items-center justify-center gap-0.5 text-sm font-extrabold text-foreground">
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          {s.rating}
                        </p>
                        <p className="text-[10px] font-semibold text-muted-foreground">{s.reviews}</p>
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-foreground">{s.responseRate}%</p>
                        <p className="text-[10px] font-semibold text-muted-foreground">{t.suppliers.responseRate}</p>
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-foreground">{s.years}</p>
                        <p className="text-[10px] font-semibold text-muted-foreground">{t.suppliers.yearsLabel}</p>
                      </div>
                    </div>

                    <Link
                      href={`/suppliers/${s.id}`}
                      className={buttonVariants({ variant: "outline", className: "mt-5 w-full rounded-xl py-5 text-sm font-semibold hover:bg-muted" })}
                    >
                      {t.suppliers.viewProfile}
                      <ArrowRight className="size-4 ms-1 rtl:rotate-180" />
                    </Link>
                  </div>
                </div>
              ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/suppliers" className={buttonVariants({ variant: "outline", size: "lg", className: "rounded-xl px-6 font-semibold" })}>
            {t.home.browseSuppliers}
            <ArrowRight className="size-4 ms-1 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  )
}
