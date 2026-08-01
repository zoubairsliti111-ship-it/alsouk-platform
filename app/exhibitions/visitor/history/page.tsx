"use client"

import React, { useEffect, useState } from "react"
import {
  History,
  Loader2,
  ExternalLink,
  MapPin,
  Calendar,
  Layers,
  ChevronRight
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { VisitorDashboardLayout } from "@/components/exhibition/visitor-layout"
import { MarketplaceShell } from "@/components/marketplace/shell"
import { fetchRecentlyViewed } from "@/lib/services/exhibitions-client"
import type { ExhibitionRecentlyViewed } from "@/lib/domains/exhibition/types"
import Link from "next/link"

export default function VisitorHistoryPage() {
  return (
    <MarketplaceShell>
      <VisitorHistoryContent />
    </MarketplaceShell>
  )
}

function VisitorHistoryContent() {
  const { t, lang } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<ExhibitionRecentlyViewed[]>([])

  const visitorId = "visitor-local"

  useEffect(() => {
    let active = true

    async function loadHistory() {
      try {
        const data = await fetchRecentlyViewed(visitorId)
        if (!active) return
        setHistory(data || [])
        setLoading(false)
      } catch (err) {
        console.error("Load history failure:", err)
        if (active) setLoading(false)
      }
    }

    loadHistory()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <VisitorDashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="size-8 text-primary animate-spin" />
          <span className="text-xs font-bold text-muted-foreground">{t.marketplace.loading}</span>
        </div>
      </VisitorDashboardLayout>
    )
  }

  return (
    <VisitorDashboardLayout>
      <div className="space-y-8">

        {/* Intro */}
        <section className="bg-card border border-border rounded-[20px] p-6 shadow-xs">
          <h2 className="text-base font-black text-foreground flex items-center gap-2">
            <History className="size-5 text-primary" />
            <span>{lang === "ar" ? "سجل زيارات الأجنحة" : lang === "fr" ? "Historique des Visites" : "My Visitor History"}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1.5 leading-normal">
            {lang === "ar"
              ? "استعرض وتتبع جميع أجنحة العارضين والمعروضات والملفات التي تصفحتها مؤخراً لتسهيل تذكرها."
              : lang === "fr"
              ? "Retrouvez facilement les pavisons d'exposition et les produits consultés récemment."
              : "Review pavilions, target drafts, and supplier profiles that you interacted with during your visit."}
          </p>
        </section>

        {/* History list */}
        <section className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-16 bg-secondary/15 rounded-3xl border border-dashed border-border">
              <History className="size-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
              <p className="text-sm font-bold text-foreground">{lang === "ar" ? "سجل تصفح فارغ" : lang === "fr" ? "Historique vide" : "Visitor history is empty."}</p>
              <p className="text-xs text-muted-foreground mt-1">{lang === "ar" ? "ابدأ في زيارة أجنحة المعرض لتسجيل تاريخك هنا." : "Start browsing trade show booths to automatically populate your log."}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => {
                const isBooth = item.targetType === "booth"
                const b = item.booth
                const ex = item.exhibit

                const title = isBooth ? b?.title || b?.company?.name : ex?.name
                const desc = isBooth ? b?.description : ex?.description
                const category = isBooth ? b?.category : ex?.category || "Exhibit innovation"

                return (
                  <div
                    key={item.id}
                    className="p-4 bg-card border border-border rounded-[20px] shadow-3xs flex items-center justify-between gap-4 transition-all hover:border-primary/25"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wide ${
                          isBooth ? "bg-primary/10 text-primary border border-primary/20" : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        }`}>
                          {item.targetType}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {lang === "ar" ? "شوهد في: " : "Viewed: "}{new Date(item.viewedAt).toLocaleDateString(lang, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-foreground truncate">{title || "Exhibitor Asset"}</h4>

                      <p className="text-[11px] text-muted-foreground line-clamp-1 leading-normal font-medium">
                        {desc}
                      </p>
                    </div>

                    {/* redirect action */}
                    {isBooth && b && (
                      <Link
                        href={`/exhibitions/tunisia-food-expo-2026/booths/${b.id}`}
                        className="size-10 rounded-xl bg-secondary/15 hover:bg-secondary/40 border border-border flex items-center justify-center shrink-0 transition-all cursor-pointer"
                      >
                        <ExternalLink className="size-4 text-foreground" />
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </VisitorDashboardLayout>
  )
}
