"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, Heart, MessageCircle, Package, Play, Send, Store } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

const THUMBS = [
  "/images/product-oliveoil.png",
  "/images/product-textiles.png",
  "/images/product-dates.png",
  "/images/product-ceramics.png",
  "/images/product-leather.png",
  "/images/product-machinery.png",
]

function openAssistant() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("alsouk:open-assistant"))
  }
}

export function DiscoverFeed() {
  const { t, dir } = useLanguage()
  const d = t.discover
  const items = t.home.videoItems
  const [saved, setSaved] = useState<Record<number, boolean>>({})

  return (
    <div dir={dir} className="bg-background">
      <div className="mx-auto max-w-md px-0 sm:px-4 sm:py-4">
        <div className="no-scrollbar h-[calc(100dvh-3.5rem-3.5rem)] snap-y snap-mandatory overflow-y-auto sm:h-[calc(100dvh-8rem)] sm:rounded-3xl">
          {items.map((v, i) => {
            const isSaved = !!saved[i]
            return (
              <section
                key={i}
                className="relative flex h-full w-full snap-start items-end overflow-hidden sm:rounded-3xl"
              >
                <Image
                  src={THUMBS[i % THUMBS.length] || "/placeholder.svg"}
                  alt={v.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 28rem"
                  className="object-cover"
                  priority={i === 0}
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40" />

                {/* Play affordance */}
                <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
                  <span className="flex size-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <Play className="size-7 fill-white text-white" />
                  </span>
                </span>

                {/* Header chip */}
                <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                  <Eye className="size-3" />
                  {v.views}
                </span>

                {/* Right action rail */}
                <div className="absolute bottom-28 end-3 z-10 flex flex-col items-center gap-4">
                  <RailButton
                    onClick={() => setSaved((s) => ({ ...s, [i]: !s[i] }))}
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
                  <p className="pe-16 text-lg font-bold leading-tight">{v.title}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-white/85">
                    <Store className="size-4" />
                    {v.supplier}
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
