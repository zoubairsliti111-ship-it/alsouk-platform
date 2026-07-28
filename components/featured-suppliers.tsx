"use client"
import Link from "next/link"
import Image from "next/image"

import { useEffect, useState } from "react"
import { BadgeCheck, Crown, MapPin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { directoryT } from "@/lib/directory-i18n"
import { fetchSuppliers } from "@/lib/supabase/suppliers-service"
import type { Supplier } from "@/lib/directory-data"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumBadge } from "@/components/ui/premium-badge"

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
    <section id="suppliers" className="bg-gradient-to-b from-secondary/40 to-secondary/10 py-20 border-y border-border/30">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <PremiumBadge variant="gold" className="mb-2">
            <Crown className="size-3.5 text-amber-500" />
            {lang === "ar" ? "الموردون المعتمدون" : lang === "fr" ? "Fournisseurs Vérifiés" : "Verified Exporters"}
          </PremiumBadge>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl mt-3">
            {t.suppliers.title}
          </h2>
          <p className="mt-2 text-muted-foreground">{t.suppliers.subtitle}</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: FEATURED_LIMIT }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-[32px] border border-border bg-card" />
              ))
            : items.map((s) => (
                <PremiumCard
                  key={s.id}
                  hoverEffect="lift"
                  className="group overflow-hidden border border-border/80 bg-background"
                >
                  <div className="relative h-36 overflow-hidden">
                    <Image
                      src="/images/supplier-factory.png"
                      alt={`${s.name} facility`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {s.verified && (
                      <span className="absolute start-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-full bg-background/95 backdrop-blur-md px-3 py-1 text-xs font-bold text-amber-600 shadow-md border border-amber-500/10">
                        <Crown className="size-3 text-amber-500 fill-amber-500" />
                        {t.suppliers.goldSupplier}
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="truncate font-bold text-foreground text-base group-hover:text-primary transition-colors">{s.name}</h3>
                        {s.verified && <BadgeCheck className="size-4 shrink-0 text-primary" />}
                      </div>
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground font-medium">
                        <MapPin className="size-3.5 text-primary" />
                        {dt.cities[s.cityKey]}, {dt.countries[s.country]}
                      </p>
                      <span className="mt-3 inline-block rounded-full bg-secondary px-3 py-0.5 text-[10px] font-bold text-secondary-foreground tracking-wide uppercase">
                        {dt.categories[s.categories[0]]}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border/60 pt-4 text-center">
                      <div>
                        <p className="text-base font-extrabold text-foreground">{s.responseRate}%</p>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">{t.suppliers.responseRate}</p>
                      </div>
                      <div>
                        <p className="text-base font-extrabold text-foreground">{s.years}</p>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">{t.suppliers.yearsLabel}</p>
                      </div>
                    </div>

                    <Link href={`/suppliers/${s.id}`} className="mt-5 block">
                      <Button variant="outline" className="w-full rounded-xl border-border/80 font-bold hover:bg-secondary/40 text-xs">
                        {t.suppliers.viewProfile}
                        <ArrowRight className="size-3.5 rtl:rotate-180" />
                      </Button>
                    </Link>
                  </div>
                </PremiumCard>
              ))}
        </div>
      </div>
    </section>
  )
}
