"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Eye, Play, Video } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

const THUMBS = [
  "/images/product-oliveoil.png",
  "/images/product-textiles.png",
  "/images/product-dates.png",
  "/images/product-ceramics.png",
]

export function BusinessVideos() {
  const { t } = useLanguage()

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            <Video className="size-3.5" />
            {t.home.videosTag}
          </span>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
            {t.home.videosTitle}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.home.videosSubtitle}</p>
        </div>
        <Link
          href="/discover"
          className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          {t.home.viewAll}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
        </Link>
      </div>

      <div className="no-scrollbar -mx-4 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
        {t.home.videoItems.map((v, i) => (
          <Link
            key={i}
            href="/discover"
            className="group relative aspect-[9/16] w-[55%] shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-secondary sm:w-[38%] lg:w-auto"
          >
            <Image
              src={THUMBS[i % THUMBS.length] || "/placeholder.svg"}
              alt={v.title}
              fill
              sizes="(max-width: 1024px) 55vw, 22vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/20" />

            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm transition-transform group-hover:scale-110">
                <Play className="size-5 fill-white text-white" />
              </span>
            </span>

            <span className="absolute end-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">
              <Eye className="size-3" />
              {v.views}
            </span>

            <div className="absolute inset-x-0 bottom-0 p-3 text-white">
              <p className="line-clamp-2 text-sm font-semibold leading-tight">{v.title}</p>
              <p className="mt-0.5 truncate text-xs text-white/80">{v.supplier}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
