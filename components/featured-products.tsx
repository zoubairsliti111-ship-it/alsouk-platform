"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
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
  supplierName: string
  imageUrl: string | null
}

export function FeaturedProducts() {
  const { t } = useLanguage()
  const [products, setProducts] = useState<RealProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const supabase = createClient()
    supabase
      .from("products")
      .select("id,name,price,currency,min_order_quantity,unit,companies(name),product_images(url,is_primary,position)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }: { data: any[] | null }) => {
        if (!active) return
        const mapped = (data ?? []).map((r: any) => {
          const images = (r.product_images ?? []).slice().sort((a: any, b: any) => Number(b.is_primary) - Number(a.is_primary) || (a.position ?? 0) - (b.position ?? 0))
          return {
            id: r.id,
            name: r.name,
            price: r.price === null ? null : Number(r.price),
            currency: r.currency,
            minOrderQuantity: r.min_order_quantity,
            unit: r.unit,
            supplierName: r.companies?.name || "",
            imageUrl: images[0]?.url || null,
          }
        })
        setProducts(mapped)
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (!loading && products.length === 0) {
    return (
      <section id="products" className="py-6 bg-background">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-[24px] border border-dashed border-primary/30 bg-primary/5 px-6 py-10 text-center">
            <p className="text-base font-black text-foreground">🚀 Be the first to showcase your products here</p>
            <p className="mt-1.5 text-xs text-muted-foreground">Real suppliers, real products — this space is reserved for you.</p>
            <Link href="/studio" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-xs font-black text-white hover:opacity-90">
              Add Your Product
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="products" className="py-6 bg-background">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between gap-4 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {t.products.title}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">{t.products.subtitle}</p>
          </div>
          <Link
            href="/products"
            className="group inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            {t.home.viewAll}
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
          </Link>
        </div>

        <div className="no-scrollbar -mx-6 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 sm:grid sm:grid-cols-2 md:grid-cols-3 sm:overflow-visible sm:px-0 sm:mx-0">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-72 w-[280px] shrink-0 animate-pulse rounded-[20px] border border-border bg-card sm:w-auto" />
              ))
            : products.map((p) => (
                <div
                  key={p.id}
                  className="group flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-[20px] border border-border bg-card p-4 transition-all duration-300 hover:border-primary/25 sm:w-auto animate-fade-in"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[16px] bg-secondary mb-3">
                    {p.imageUrl ? (
                      <Image src={p.imageUrl} alt={p.name} fill sizes="(max-width: 640px) 280px, 20vw" className="object-cover transition-transform duration-500 group-hover:scale-102" />
                    ) : (
                      <div className="flex size-full items-center justify-center text-xs text-muted-foreground">No image</div>
                    )}
                    {p.minOrderQuantity && (
                      <span className="absolute end-3 top-3 rounded-full bg-background/90 px-2 py-0.5 text-[9px] font-bold text-foreground shadow-sm backdrop-blur">
                        {t.products.moq}: {p.minOrderQuantity}{p.unit ? ` ${p.unit}` : ""}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <h3 className="line-clamp-1 text-sm font-bold text-foreground leading-snug">{p.name}</h3>
                    {p.supplierName && (
                      <p className="mt-1.5 text-[11px] font-semibold text-muted-foreground truncate">{p.supplierName}</p>
                    )}
                    {p.price !== null && (
                      <p className="mt-3 text-base font-extrabold text-[#2563EB]">
                        {p.price.toLocaleString()} {p.currency}
                        <span className="text-[10px] font-medium text-muted-foreground"> {t.products.perUnit}</span>
                      </p>
                    )}
                    <Link
                      href="/rfq"
                      className={buttonVariants({
                        size: "sm",
                        className: "mt-4 w-full rounded-xl bg-[#2563EB] hover:bg-blue-700 text-[11px] font-semibold text-white transition-all duration-300",
                      })}
                    >
                      Request Quote
                    </Link>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  )
}
