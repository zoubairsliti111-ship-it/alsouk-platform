"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Clock, Eye, Heart, MessageCircle, Package, Play, Send, Store } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

type DiscoveryItem = {
  title: string
  supplier: string
  duration: string
  views: string
  category: string
  type: "all" | "factory" | "product" | "process"
}

const THUMBS = [
  "/images/product-oliveoil.png",
  "/images/product-textiles.png",
  "/images/product-ceramics.png",
  "/images/product-dates.png",
  "/images/product-leather.png",
  "/images/product-machinery.png",
]

const PER_PAGE = 4

function openAssistant() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("alsouk:open-assistant"))
  }
}

export function DiscoverFeed() {
  const { t, dir } = useLanguage()
  const d = t.discover
  const disc = t.discovery
  const base = disc.items as DiscoveryItem[]

  const [tab, setTab] = useState<"all" | "factory" | "product" | "process">("all")
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [visible, setVisible] = useState(PER_PAGE)

  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const pool = useMemo(() => {
    const filtered = tab === "all" ? base : base.filter((it) => it.type === tab)
    return filtered.length ? filtered : base
  }, [base, tab])

  const feed = useMemo(
    () => Array.from({ length: visible }, (_, i) => ({ item: pool[i % pool.length]!, key: i })),
    [pool, visible],
  )

  const selectTab = useCallback((id: "all" | "factory" | "product" | "process") => {
    setTab(id)
    setVisible(PER_PAGE)
    scrollRef.current?.scrollTo({ top: 0 })
  }, [])

  const loadMore = useCallback(() => setVisible((v) => v + PER_PAGE), [])

  useEffect(() => {
    const sentinel = sentinelRef.current
    const root = scrollRef.current
    if (!sentinel || !root) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMore()
      },
      { root, rootMargin: "600px 0px" },
    )
    io.observe(sentinel)
    return () => io.disconnect()
  }, [loadMore, pool])

  const tabs: { id: "all" | "factory" | "product" | "process"; label: string }[] = [
    { id: "all", label: disc.tabs.all },
    { id: "factory", label: disc.tabs.factory },
    { id: "product", label: disc.tabs.product },
    { id: "process", label: disc.tabs.process },
  ]

  return (
    <div dir={dir} className="bg-background">
      <div className="mx-auto max-w-md px-0 sm:px-4 sm:py-4">
        <div className="relative">
          {/* Sticky category tabs */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex gap-2 overflow-x-auto p-3 no-scrollbar sm:rounded-t-3xl">
            {tabs.map((tb) => {
              const active = tab === tb.id
              return (
                <button
                  key={tb.id}
                  type="button"
                  onClick={() => selectTab(tb.id)}
                  aria-pressed={active}
                  className={`pointer-events-auto shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold backdrop-blur transition-colors ${
                    active
                      ? "bg-white text-neutral-900"
                      : "bg-black/40 text-white hover:bg-black/55"
                  }`}
                >
                  {tb.label}
                </button>
              )
            })}
          </div>

          <div
            ref={scrollRef}
            className="no-scrollbar h-[calc(100dvh-3.5rem-3.5rem)] snap-y snap-mandatory overflow-y-auto sm:h-[calc(100dvh-8rem)] sm:rounded-3xl"
          >
            {feed.map(({ item, key }) => {
              const idx = base.indexOf(item)
              const thumb = THUMBS[(idx < 0 ? key : idx) % THUMBS.length] || "/placeholder.svg"
              const isSaved = !!saved[key]
              return (
                <section
                  key={key}
                  className="relative flex h-full w-full snap-start items-end overflow-hidden sm:rounded-3xl"
                >
                  <Image
                    src={thumb}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 28rem"
                    className="object-cover"
                    priority={key === 0}
                  />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40" />

                  <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
                    <span className="flex size-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <Play className="size-7 fill-white text-white" />
                    </span>
                  </span>

                  {/* Meta chips */}
                  <div className="absolute end-3 top-14 z-10 flex flex-col items-end gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                      <Eye className="size-3" />
                      {item.views}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                      <Clock className="size-3" />
                      {item.duration}
                    </span>
                  </div>

                  {/* Right action rail */}
                  <div className="absolute bottom-28 end-3 z-10 flex flex-col items-center gap-4">
                    <RailButton
                      onClick={() => setSaved((s) => ({ ...s, [key]: !s[key] }))}
                      label={isSaved ? d.saved : d.save}
                      active={isSaved}
                    >
                      <Heart className={`size-6 ${isSaved ? "fill-red-500 text-red-500" : "text-white"}`} />
                    </RailButton>
                    <RailButton onClick={openAssistant} label={d.contact}>
                      <MessageCircle className="size-6 text-white" />
                    </RailButton>
                    <RailLink href="/rfq" label={d.sendRfq}>
                      <Send className="size-6 text-white" />
                    </RailLink>
                  </div>

                  {/* Bottom info + primary actions */}
                  <div className="relative z-10 w-full p-4 pb-6 text-white">
                    <span className="inline-flex rounded-full bg-primary/90 px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                      {item.category}
                    </span>
                    <p className="mt-2 pe-16 text-lg font-bold leading-tight">{item.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-white/85">
                      <Store className="size-4" />
                      {item.supplier}
                    </p>
                    <div className="mt-4 flex gap-2 pe-16">
                      <Link
                        href="/products"
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 transition-transform active:scale-95"
                      >
                        <Package className="size-4" />
                        {d.viewProduct}
                      </Link>
                      <Link
                        href="/suppliers"
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition-transform active:scale-95"
                      >
                        <Store className="size-4" />
                        {d.visitSupplier}
                      </Link>
                    </div>
                  </div>
                </section>
              )
            })}
            <div ref={sentinelRef} aria-hidden className="h-px w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

function RailButton({
  onClick,
  label,
  active,
  children,
}: {
  onClick: () => void
  label: string
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="flex flex-col items-center gap-1 active:scale-90"
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-black/35 backdrop-blur">
        {children}
      </span>
      <span className="text-[10px] font-medium text-white drop-shadow">{label}</span>
    </button>
  )
}

function RailLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 active:scale-90">
      <span className="flex size-11 items-center justify-center rounded-full bg-black/35 backdrop-blur">
        {children}
      </span>
      <span className="text-[10px] font-medium text-white drop-shadow">{label}</span>
    </Link>
  )
}
