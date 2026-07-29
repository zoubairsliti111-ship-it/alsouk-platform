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
    <section className="mx-auto max-w-7xl px-6 py-10 lg:py-16">
      <div className="flex items-end justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-2.5 py-1 text-xs font-bold text-primary">
            <Video className="size-3.5" />
            {t.home.videosTag}
          </span>
          <h2 className="mt-2.5 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {t.home.videosTitle}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{t.home.videosSubtitle}</p>
        </div>
        <Link
          href="/discover"
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
        >
          {t.home.viewAll}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
        </Link>
      </div>

      <div className="no-scrollbar -mx-6 mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
        {t.home.videoItems.map((v, i) => (
          <Link
            key={i}
            href="/discover"
            className="group relative aspect-[9/16] w-[62%] shrink-0 snap-start overflow-hidden rounded-[20px] border border-border bg-secondary shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 sm:w-[42%] lg:w-auto"
          >
            <Image
              src={THUMBS[i % THUMBS.length] || "/placeholder.svg"}
              alt={v.title}
              fill
              sizes="(max-width: 1024px) 62vw, 22vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/25" />

            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/35 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:bg-white/30 group-hover:border-white/50">
                <Play className="size-6 fill-white text-white" />
              </span>
            </span>

            <span className="absolute end-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
              <Eye className="size-3.5 text-white" />
              {v.views}
            </span>

            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <p className="line-clamp-2 text-sm font-extrabold leading-tight tracking-wide">{v.title}</p>
              <p className="mt-1 truncate text-xs font-semibold text-white/80">{v.supplier}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
