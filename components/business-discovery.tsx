"use client"

import { useState } from "react"
import { Play, Eye, Clock, ShieldCheck, Video, Factory, Presentation, Compass } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

const CATEGORY_ICONS: Record<string, any> = {
  all: Compass,
  factory: Factory,
  product: Presentation,
  process: Video,
}

export function BusinessDiscovery() {
  const { t, dir } = useLanguage()
  const [activeTab, setActiveTab] = useState<"all" | "factory" | "product" | "process">("all")
  const [playingVideoIndex, setPlayingVideoIndex] = useState<number | null>(null)

  // Curated premium video thumbnail fallbacks / gradient styles
  const videoThumbnails = [
    "bg-gradient-to-tr from-orange-600 to-amber-400",
    "bg-gradient-to-tr from-blue-700 to-cyan-500",
    "bg-gradient-to-tr from-emerald-600 to-teal-400",
    "bg-gradient-to-tr from-purple-700 to-pink-500",
    "bg-gradient-to-tr from-rose-600 to-amber-500",
    "bg-gradient-to-tr from-indigo-700 to-violet-500",
  ]

  const tabs: ("all" | "factory" | "product" | "process")[] = ["all", "factory", "product", "process"]

  const filteredItems = activeTab === "all"
    ? t.discovery.items
    : t.discovery.items.filter((item) => item.type === activeTab)

  return (
    <section id="discovery" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-accent uppercase">
          <Play className="size-3 fill-current" />
          B2B Inside Access
        </span>
        <h2 className="mt-4 text-pretty text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {t.discovery.title}
        </h2>
        <p className="mt-3 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
          {t.discovery.subtitle}
        </p>
      </div>

      {/* Tabs Switcher (Inspired by premium Apple layout) */}
      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {tabs.map((tab) => {
          const TabIcon = CATEGORY_ICONS[tab]
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
                setPlayingVideoIndex(null)
              }}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/85 hover:text-foreground"
              }`}
            >
              <TabIcon className="size-4" />
              <span>{t.discovery.tabs[tab]}</span>
            </button>
          )
        })}
      </div>

      {/* Video Demonstration Grid */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item, index) => {
          const isPlaying = playingVideoIndex === index
          const bgGradient = videoThumbnails[index % videoThumbnails.length]

          return (
            <div
              key={item.title}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-lg"
            >
              {/* Card Media Preview Area */}
              <div className="relative aspect-video w-full overflow-hidden bg-secondary">
                {isPlaying ? (
                  // Virtual Simulated Premium Video Player View
                  <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-950 p-4 text-center text-white">
                    <span className="relative flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                    </span>
                    <p className="mt-2 text-sm font-bold tracking-wide">{t.ui.liveDemoStream}</p>
                    <p className="mt-1 text-xs text-zinc-400">{item.supplier}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setPlayingVideoIndex(null)
                      }}
                      className="mt-4 rounded-full bg-white/20 px-4 py-1 text-xs font-semibold hover:bg-white/30"
                    >
                      Stop Demo
                    </button>
                  </div>
                ) : (
                  // Video Thumbnail State
                  <div
                    onClick={() => setPlayingVideoIndex(index)}
                    className={`absolute inset-0 flex cursor-pointer items-center justify-center ${bgGradient} transition-transform duration-500 group-hover:scale-105`}
                  >
                    {/* Visual pattern representation for factory look */}
                    <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.4)_100%)]" />

                    {/* Elegant Floating Play Button */}
                    <span className="relative flex size-14 items-center justify-center rounded-full bg-white/95 text-primary shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Play className={`size-6 ${dir === "rtl" ? "rotate-180" : ""} fill-current`} />
                    </span>

                    {/* Quick Floating Tags */}
                    <span className="absolute bottom-3 start-3 inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[10px] font-semibold text-white uppercase backdrop-blur-md">
                      {item.category}
                    </span>
                    <span className="absolute bottom-3 end-3 inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
                      <Clock className="size-3" />
                      {item.duration}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Meta Content Area */}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold text-accent uppercase">
                    <ShieldCheck className="size-3" />
                    Verified Facility
                  </span>
                </div>

                <h3 className="mt-3 line-clamp-2 text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-accent" />
                  {item.supplier}
                </p>

                {/* Engagement Metrics footer */}
                <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="size-3.5" />
                    {item.views}
                  </span>
                  <button
                    onClick={() => setPlayingVideoIndex(isPlaying ? null : index)}
                    className="font-bold text-primary hover:underline"
                  >
                    {isPlaying ? "Close player" : "Watch demo"}
                  </button>
                </div>
              </div>

            </div>
          )
        })}
      </div>
    </section>
  )
}
