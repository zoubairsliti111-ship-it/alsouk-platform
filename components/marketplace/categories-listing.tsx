"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { fetchCategories } from "@/lib/services/categories-client"
import type { Category } from "@/lib/domains/category/types"
import { Breadcrumbs, CardGridSkeleton, ListingHeader } from "@/components/marketplace/shell"

const CATEGORY_IMAGES = [
  "/images/product-oliveoil.png",
  "/images/product-textiles.png",
  "/images/product-machinery.png",
  "/images/supplier-factory.png",
  "/images/product-ceramics.png",
  "/images/product-leather.png",
  "/images/product-dates.png",
  "/images/hero-trade.png",
]

function PremiumCard({
  href,
  image,
  name,
  meta,
}: {
  href: string
  image: string
  name: string
  meta?: string
}) {
  return (
    <Link
      href={href}
      className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl border border-border bg-secondary shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg sm:aspect-[3/2]"
    >
      <Image
        src={image}
        alt={name}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
      <div className="relative p-4 text-white">
        <h3 className="text-base font-bold leading-tight sm:text-lg">{name}</h3>
        {meta && (
          <p className="mt-1 flex items-center gap-1 text-xs text-white/85">
            {meta}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
          </p>
        )}
      </div>
    </Link>
  )
}

export function CategoriesListing() {
  const { t } = useLanguage()
  const m = t.marketplace.categories
  const [status, setStatus] = useState<"loading" | "loaded">("loading")
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    let active = true
    fetchCategories().then((data) => {
      if (!active) return
      setCategories(data)
      setStatus("loaded")
    })
    return () => {
      active = false
    }
  }, [])

  const topLevel = categories.filter((c) => !c.parentId)
  const childCount = (id: string) => categories.filter((c) => c.parentId === id).length

  return (
    <>
      <Breadcrumbs items={[{ label: t.marketplace.breadcrumbHome, href: "/" }, { label: m.title }]} />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ListingHeader title={m.title} subtitle={m.subtitle} />
        {status === "loading" ? (
          <CardGridSkeleton />
        ) : topLevel.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {topLevel.map((cat, i) => {
              const kids = childCount(cat.id)
              return (
                <PremiumCard
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  image={CATEGORY_IMAGES[i % CATEGORY_IMAGES.length] ?? CATEGORY_IMAGES[0]}
                  name={cat.name}
                  meta={kids > 0 ? `${kids} ${m.subcategories}` : undefined}
                />
              )
            })}
          </div>
        ) : (
          // Presentation fallback so browsing feels alive before live categories are seeded.
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {t.categories.items.map((cat, i) => (
              <PremiumCard
                key={cat.name}
                href="/products"
                image={CATEGORY_IMAGES[i % CATEGORY_IMAGES.length] ?? CATEGORY_IMAGES[0]}
                name={cat.name}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
