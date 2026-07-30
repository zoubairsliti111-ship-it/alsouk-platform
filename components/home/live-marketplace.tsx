"use client"

import Link from "next/link"
import Image from "next/image"
import { Eye, Play } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

const LIVE_STORES = [
  {
    storeName: "Medina Olive Co.",
    city: "Sfax",
    viewerCount: "1.2K",
    thumbnail: "/images/product-oliveoil.png",
  },
  {
    storeName: "Carthage Textiles",
    city: "Monastir",
    viewerCount: "850",
    thumbnail: "/images/product-textiles.png",
  },
  {
    storeName: "Atlas Ceramics",
    city: "Nabeul",
    viewerCount: "1.5K",
    thumbnail: "/images/product-ceramics.png",
  },
  {
    storeName: "Sahara Dates Export",
    city: "Tozeur",
    viewerCount: "920",
    thumbnail: "/images/product-dates.png",
  },
]

export function LiveMarketplace() {
  const { lang } = useLanguage()

  const liveBadgeText: Record<string, string> = {
    en: "LIVE",
    fr: "EN DIRECT",
    ar: "مباشر"
  }

  const liveTitleText: Record<string, string> = {
    en: "Live Marketplace",
    fr: "Marché en Direct",
    ar: "السوق المباشر"
  }

  const liveSubtitleText: Record<string, string> = {
    en: "Watch real-time product demonstrations and connect with verified factories.",
    fr: "Regardez les démonstrations de produits en temps réel et connectez-vous avec des usines vérifiées.",
    ar: "شاهد عروض المنتجات في الوقت الفعلي وتواصل مع المصانع المعتمدة."
  }

  const openLiveText: Record<string, string> = {
    en: "Open Live",
    fr: "Ouvrir le Direct",
    ar: "افتح البث المباشر"
  }

  const badgeStr = liveBadgeText[lang] || liveBadgeText["en"]
  const titleStr = liveTitleText[lang] || liveTitleText["en"]
  const subtitleStr = liveSubtitleText[lang] || liveSubtitleText["en"]
  const buttonStr = openLiveText[lang] || openLiveText["en"]

  return (
    <section id="live-marketplace" className="py-6 bg-background">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Heading */}
        <div className="flex items-end justify-between gap-4 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="relative flex size-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#EF4444]"></span>
              </span>
              <span>{titleStr}</span>
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">{subtitleStr}</p>
          </div>
          <Link
            href="/discover"
            className="group inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Watch All
          </Link>
        </div>

        {/* Horizontal scroll rail inspired by TikTok Live / Temu */}
        <div className="no-scrollbar -mx-6 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 sm:grid sm:grid-cols-2 md:grid-cols-4 sm:overflow-visible sm:px-0 sm:mx-0">
          {LIVE_STORES.map((live, idx) => (
            <div
              key={idx}
              className="group relative aspect-[9/18] w-[220px] shrink-0 snap-start overflow-hidden rounded-[20px] border border-border bg-secondary shadow-sm transition-all duration-300 hover:border-primary/20 sm:w-auto"
            >
              {/* Thumbnail Background Image */}
              <Image
                src={live.thumbnail}
                alt={`${live.storeName} Live Streaming`}
                fill
                sizes="(max-width: 640px) 220px, 20vw"
                className="object-cover transition-transform duration-700 group-hover:scale-102"
              />
              {/* Ambient Dark Gradient Overlay */}
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/25" />

              {/* LIVE Badge & Viewer Count Header */}
              <div className="absolute inset-x-3 top-3 flex items-center justify-between">
                <span className="inline-flex items-center rounded bg-[#EF4444] px-2 py-0.5 text-[9px] font-black tracking-wider text-white">
                  {badgeStr}
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-black/50 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
                  <Eye className="size-3 text-white" />
                  <span>{live.viewerCount}</span>
                </span>
              </div>

              {/* Play Button Overlay in center */}
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:bg-white/30">
                  <Play className="size-5 fill-white text-white" />
                </span>
              </span>

              {/* Bottom Card Content: Store name, City, & CTA Button */}
              <div className="absolute inset-x-3 bottom-3 flex flex-col gap-2">
                <div>
                  <p className="truncate text-xs font-black text-white">{live.storeName}</p>
                  <p className="text-[10px] font-medium text-white/80">{live.city}</p>
                </div>

                <Link
                  href="/discover"
                  className="flex h-8 items-center justify-center rounded-xl bg-[#2563EB] hover:bg-blue-700 text-[10px] font-semibold text-white transition-all shadow-md active:scale-95 text-center"
                >
                  {buttonStr}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
