"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Activity } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { createClient } from "@/lib/supabase/client"

type ActivityCompany = { name: string; slug: string }

type ActivityRow = {
  id: string
  title: string
  status: "upcoming" | "live" | "ended"
  company: ActivityCompany | ActivityCompany[] | null
}

type ActivityItem = {
  id: string
  text: string
  href: string
}

export function LiveActivity() {
  const { t } = useLanguage()
  const [items, setItems] = useState<ActivityItem[] | null>(null)

  useEffect(() => {
    let active = true
    const supabase = createClient()
    supabase
      .from("live_sessions")
      .select("id,title,status,company:companies!inner(name,slug)")
      .in("status", ["live", "upcoming"])
      .order("started_at", { ascending: false, nullsFirst: false })
      .limit(12)
      .then(({ data, error }: { data: ActivityRow[] | null; error: unknown }) => {
        if (!active) return
        if (error || !data) {
          setItems([])
          return
        }
        setItems(
          data
            .map((row): ActivityItem | null => {
              const company = Array.isArray(row.company) ? row.company[0] : row.company
              if (!company || row.status === "ended") return null
              const verb = row.status === "live" ? t.home.isLiveNow : t.home.hasScheduled
              return {
                id: row.id,
                text: `${company.name} ${verb}: ${row.title}`,
                href: row.status === "live" ? `/live/${row.id}` : `/companies/${company.slug}`,
              }
            })
            .filter((i): i is ActivityItem => i !== null),
        )
      })
    return () => {
      active = false
    }
  }, [t])

  // No live or upcoming sessions right now — the section below (LiveMarketplace)
  // already renders the honest "no live sessions" empty state, so this ticker
  // simply stays hidden rather than showing a second, contradictory message.
  if (items !== null && items.length === 0) {
    return null
  }

  // Duplicate for a seamless marquee loop.
  const loop = items ? [...items, ...items] : []

  return (
    <section aria-label={t.home.activityTitle} className="border-y border-border/60 bg-secondary/30">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3.5">
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent/8 px-3 py-1.5 text-xs font-bold text-accent shadow-sm border border-accent/10">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-accent" />
          </span>
          {t.home.liveTag}
        </span>

        <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          {items === null ? (
            <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
          ) : (
            <ul className="flex w-max items-center gap-10 whitespace-nowrap will-change-transform animate-[alsouk-marquee_40s_linear_infinite] motion-reduce:animate-none">
              {loop.map((it, i) => (
                <li key={`${it.id}-${i}`}>
                  <Link
                    href={it.href}
                    className="flex items-center gap-2.5 text-sm font-semibold text-foreground/80 transition-colors hover:text-primary"
                  >
                    <Activity className="size-4 shrink-0 text-primary/80" />
                    {it.text}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
