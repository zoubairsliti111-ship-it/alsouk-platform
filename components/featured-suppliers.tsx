"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { ArrowRight, BadgeCheck, MapPin, Star } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
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
      setItems(res.suppliers ?? [])
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  if (!loading && items.length === 0) return null

  return (
    <section id="suppliers" className="py-6 bg-background">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Heading */}
        <div className="flex items-end justify-between gap-4 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {t.suppliers.title}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">{t.suppliers.subtitle}</p>
          </div>
          <Link
            href="/suppliers"
            className="group inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            {t.home.viewAll}
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
          </Link>
        </div>

        {/* Horizontal scroll rail on mobile, grid on desktop */}
        <div className="no-scrollbar -mx-6 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 sm:grid sm:grid-cols-2 md:grid-cols-4 sm:overflow-visible sm:px-0 sm:mx-0">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-64 w-[280px] shrink-0 animate-pulse rounded-[20px] border border-border bg-card sm:w-auto" />
              ))
            : items.map((s) => (
                <div
                  key={s.id}
                  className="group flex w-[280px] shrink-0 snap-start flex-col rounded-[20px] border border-border bg-card p-4 transition-all duration-300 hover:border-primary/25 sm:w-auto"
                >
                  {/* Supplier Logo/Thumbnail with factory background */}
                  <div className="relative h-28 overflow-hidden rounded-[16px] mb-3 bg-secondary">
                    <Image
                      src={s.coverPhotoUrl || "/images/supplier-factory.png"}
                      alt={`${s.name} facility`}
                      fill
                      sizes="(max-width: 640px) 280px, 20vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-102"
                    />
                    {/* Centered monogram overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                      <span className="flex size-11 items-center justify-center rounded-full bg-[#2563EB] text-xs font-black text-white shadow-md">
                        {s.monogram}
                      </span>
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate text-sm font-bold text-foreground leading-tight">{s.name}</h3>
                      {s.verified && <BadgeCheck className="size-4 shrink-0 text-[#2563EB]" />}
                    </div>

                    <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0 text-muted-foreground/60" />
                      <span className="truncate">
                        {dt.cities[s.cityKey] || s.cityKey}, {dt.countries[s.country] || s.country}
                      </span>
                    </p>

                    {/* Stats & Rating */}
                    <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-xs">
                      <div className="flex items-center gap-0.5 font-bold text-foreground">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        <span>{s.rating}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {s.reviews} reviews
                      </span>
                    </div>

                    {/* Visit Store Button */}
                    <Link
                      href={`/suppliers/${s.id}`}
                      className={buttonVariants({
                        size: "sm",
                        className: "mt-4 w-full rounded-xl bg-primary hover:opacity-90 text-[11px] font-black text-white flex items-center justify-center",
                      })}
                    >
                      Visit Store
                      <ArrowRight className="size-3.5 ms-1 rtl:rotate-180" />
                    </Link>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  )
}
