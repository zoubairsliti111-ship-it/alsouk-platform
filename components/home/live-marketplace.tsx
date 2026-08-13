"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, Play, Radio } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { createClient } from "@/lib/supabase/client"

type LiveCompany = {
  name: string
  slug: string
  city: string | null
  logo_url: string | null
  banner_url: string | null
}

type LiveSessionRow = {
  id: string
  title: string
  status: "upcoming" | "live" | "ended"
  scheduled_at: string | null
  viewer_count: number
  company: LiveCompany | LiveCompany[] | null
}

type LiveCard = {
  id: string
  title: string
  status: "upcoming" | "live"
  scheduledAt: string | null
  viewerCount: number
  company: LiveCompany
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function LiveMarketplace() {
  const { t, lang } = useLanguage()
  const [sessions, setSessions] = useState<LiveCard[] | null>(null)

  useEffect(() => {
    let active = true
    const supabase = createClient()
    supabase
      .from("live_sessions")
      .select("id,title,status,scheduled_at,viewer_count,company:companies!inner(name,slug,city,logo_url,banner_url)")
      .in("status", ["live", "upcoming"])
      .order("started_at", { ascending: false, nullsFirst: false })
      .limit(8)
      .then(({ data, error }: { data: LiveSessionRow[] | null; error: unknown }) => {
        if (!active) return
        if (error || !data) {
          setSessions([])
          return
        }
        const cards = data
          .map((row): LiveCard | null => {
            const company = Array.isArray(row.company) ? row.company[0] : row.company
            if (!company || row.status === "ended") return null
            return {
              id: row.id,
              title: row.title,
              status: row.status,
              scheduledAt: row.scheduled_at,
              viewerCount: row.viewer_count,
              company,
            }
          })
          .filter((c): c is LiveCard => c !== null)
          .sort((a, b) => (a.status === b.status ? 0 : a.status === "live" ? -1 : 1))
        setSessions(cards)
      })
    return () => {
      active = false
    }
  }, [])

  const formatSchedule = (iso: string | null) => {
    if (!iso) return null
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleString(lang === "ar" ? "ar-TN" : lang === "fr" ? "fr-TN" : "en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <section id="live-marketplace" className="py-6 bg-background">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Heading */}
        <div className="border-b border-border/60 pb-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#EF4444]"></span>
            </span>
            <span>{t.home.liveTitle}</span>
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">{t.home.liveSubtitle}</p>
        </div>

        {sessions === null ? (
          <div className="no-scrollbar -mx-6 mt-6 flex gap-4 overflow-hidden px-6 pb-4 sm:grid sm:grid-cols-2 md:grid-cols-4 sm:px-0 sm:mx-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[9/18] w-[220px] shrink-0 animate-pulse rounded-[20px] bg-muted sm:w-auto"
              />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-[20px] border border-dashed border-border bg-secondary/30 px-6 py-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
              <Radio className="size-6" />
            </span>
            <p className="mt-4 text-sm font-bold text-foreground">{t.home.liveEmptyTitle}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.home.liveEmptyBody}</p>
          </div>
        ) : (
          <div className="no-scrollbar -mx-6 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 sm:grid sm:grid-cols-2 md:grid-cols-4 sm:overflow-visible sm:px-0 sm:mx-0">
            {sessions.map((live) => {
              const thumbnail = live.company.banner_url || live.company.logo_url
              const schedule = live.status === "upcoming" ? formatSchedule(live.scheduledAt) : null
              return (
                <div
                  key={live.id}
                  className="group relative aspect-[9/18] w-[220px] shrink-0 snap-start overflow-hidden rounded-[20px] border border-border bg-secondary shadow-sm transition-all duration-300 hover:border-primary/20 sm:w-auto"
                >
                  {thumbnail ? (
                    <Image
                      src={thumbnail}
                      alt={live.company.name}
                      fill
                      sizes="(max-width: 640px) 220px, 20vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-102"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary to-accent text-2xl font-black text-primary-foreground">
                      {initials(live.company.name)}
                    </span>
                  )}
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/25" />

                  {/* Status badge + real viewer count (live sessions only) */}
                  <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-[9px] font-black tracking-wider text-white ${
                        live.status === "live" ? "bg-[#EF4444]" : "bg-black/60 backdrop-blur-sm"
                      }`}
                    >
                      {live.status === "live" ? t.home.liveBadge : t.home.liveUpcomingBadge}
                    </span>
                    {live.status === "live" && live.viewerCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded bg-black/50 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
                        <Eye className="size-3 text-white" />
                        <span>{live.viewerCount}</span>
                      </span>
                    )}
                  </div>

                  {live.status === "live" && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex size-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:bg-white/30">
                        <Play className="size-5 fill-white text-white" />
                      </span>
                    </span>
                  )}

                  <div className="absolute inset-x-3 bottom-3 flex flex-col gap-2">
                    <div>
                      <p className="truncate text-xs font-black text-white">{live.title}</p>
                      <p className="truncate text-[10px] font-medium text-white/80">
                        {live.company.city ? `${live.company.name} · ${live.company.city}` : live.company.name}
                      </p>
                      {schedule && <p className="text-[10px] font-medium text-white/70">{schedule}</p>}
                    </div>

                    <Link
                      href={live.status === "live" ? `/live/${live.id}` : `/companies/${live.company.slug}`}
                      className="flex h-8 items-center justify-center rounded-xl bg-[#2563EB] hover:bg-blue-700 text-[10px] font-semibold text-white transition-all shadow-md active:scale-95 text-center"
                    >
                      {live.status === "live" ? t.home.liveOpen : t.home.liveViewCompany}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
