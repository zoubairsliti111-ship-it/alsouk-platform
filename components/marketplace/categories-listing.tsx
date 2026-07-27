"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Layers, Tag } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { fetchCategories } from "@/lib/services/categories-client"
import type { Category } from "@/lib/domains/category/types"
import { Breadcrumbs, CardGridSkeleton, ListingHeader, MessageState } from "@/components/marketplace/shell"

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

  // Top-level categories only; children surface on the detail page.
  const topLevel = categories.filter((c) => !c.parentId)
  const childCount = (id: string) => categories.filter((c) => c.parentId === id).length

  return (
    <>
      <Breadcrumbs items={[{ label: t.marketplace.breadcrumbHome, href: "/" }, { label: m.title }]} />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ListingHeader title={m.title} subtitle={m.subtitle} />
        {status === "loading" ? (
          <CardGridSkeleton />
        ) : topLevel.length === 0 ? (
          <MessageState icon={<Layers className="size-7" />} title={m.empty} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topLevel.map((cat) => {
              const kids = childCount(cat.id)
              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Tag className="size-6" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-foreground">{cat.name}</span>
                    {cat.description && (
                      <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">
                        {cat.description}
                      </span>
                    )}
                    {kids > 0 && (
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {kids} {m.subcategories}
                      </span>
                    )}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
