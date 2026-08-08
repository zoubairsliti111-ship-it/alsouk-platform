"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, PackageSearch } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { createClient } from "@/lib/supabase/client"

type RealProduct = {
  id: string
  name: string
  price: number | null
  currency: string | null
  minOrderQuantity: number | null
  unit: string | null
  imageUrl: string | null
  isNew: boolean
}

export function Opportunities() {
  const { t } = useLanguage()
  const [items, setItems] = useState<RealProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const supabase = createClient()
    supabase
      .from("products")
      .select("id,name,price,currency,min_order_quantity,unit,created_at,product_images(url,is_primary,position)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(4)
      .then(({ data }: { data: any[] | null }) => {
        if (!active) return
        const now = Date.now()
        const mapped = (data ?? []).map((r: any) => {
          const images = (r.product_images ?? []).slice().sort((a: any, b: any) => Number(b.is_primary) - Number(a.is_primary) || (a.position ?? 0) - (b.position ?? 0))
          const ageMs = now - new Date(r.created_at).getTime()
          return {
            id: r.id,
            name: r.name,
            price: r.price === null ? null : Number(r.price),
            currency: r.currency,
            minOrderQuantity: r.min_order_quantity,
            unit: r.unit,
            imageUrl: images[0]?.url || null,
            isNew: ageMs < 7 * 24 * 60 * 60 * 1000,
          }
        })
        setItems(mapped)
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (!loading && items.length === 0) return null

  return (
    <section id="opportunities" className="py-6 bg-background">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between gap-4 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {t.home.opportunitiesTitle}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">{t.home.opportunitiesSubtitle}</p>
          </div>
          <Link
            href="/rfq"
            className="group inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            {t.home.viewAll}
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
          </Link>
        </div>

        <div className="no-scrollbar -mx-6 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 sm:grid sm:grid-cols-2 md:grid-cols-4 sm:overflow-visible sm:px-0 sm:mx-0">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-72 w-[280px] shrink-0 animate-pulse rounded-[20px] border border-border bg-card sm:w-auto" />
              ))
            : items.map((o) => (
                <div
                  key={o.id}
                  className="group flex w-[280px] shrink-0 snap-start flex-col rounded-[20px] border border-border bg-card p-4 transition-all duration-300 hover:border-primary/20 hover:shadow-md sm:w-auto"
                >
                  <div className="relative aspect-[4/3.5] w-full overflow-hidden rounded-[16px] bg-secondary mb-3">
                    {o.imageUrl ? (
                      <Image src={o.imageUrl} alt={o.name} fill sizes="(max-width: 640px) 280px, 20vw" className="object-cover transition-transform duration-500 group-hover:scale-102" />
                    ) : (
                      <div className="flex size-full items-center justify-center text-xs text-muted-foreground">No image</div>
                    )}
                    {o.isNew && (
                      <span className="absolute start-3 top-3 inline-flex items-center rounded-full bg-[#16A34A] px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <h3 className="line-clamp-1 text-sm font-bold text-foreground leading-snug transition-colors group-hover:text-primary">{o.name}</h3>
                    {o.minOrderQuantity && (
                      <p className="mt-1 text-[11px] text-muted-foreground font-semibold">
                        {t.products.moq}: {o.minOrderQuantity}{o.unit ? ` ${o.unit}` : ""}
                      </p>
                    )}
                    {o.price !== null && (
                      <p className="mt-2 text-sm font-extrabold text-[#2563EB]">{o.price.toLocaleString()} {o.currency}</p>
                    )}
                    <div className="mt-4 pt-3 border-t border-border/40">
                      <Link
                        href="/rfq"
                        className={buttonVariants({
                          size: "sm",
                          className: "w-full rounded-xl bg-[#2563EB] hover:bg-blue-700 text-[11px] font-semibold text-white shadow-sm flex items-center justify-center gap-1",
                        })}
                      >
                        <PackageSearch className="size-3.5" />
                        <span>Request Quote</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  )
}
