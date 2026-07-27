"use client"

import { useState } from "react"
import { ImageIcon } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import type { ProductImage } from "@/lib/domains/product/types"

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const { t } = useLanguage()
  const usable = images.filter((img) => img.url)
  const [active, setActive] = useState(0)

  if (usable.length === 0) {
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-secondary/40 text-muted-foreground">
        <ImageIcon className="size-8" aria-hidden="true" />
        <p className="text-sm">{t.marketplace.products.noImage}</p>
      </div>
    )
  }

  const current = usable[Math.min(active, usable.length - 1)]

  return (
    <div>
      <div className="aspect-square w-full overflow-hidden rounded-2xl border border-border bg-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current.url ?? ""} alt={current.alt ?? name} className="size-full object-cover" />
      </div>

      {usable.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {usable.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={img.alt ?? `${name} ${i + 1}`}
              aria-current={i === active}
              className={`aspect-square overflow-hidden rounded-lg border transition-colors ${
                i === active ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url ?? ""} alt={img.alt ?? name} className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
