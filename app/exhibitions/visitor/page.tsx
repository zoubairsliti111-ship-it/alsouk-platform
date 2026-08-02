"use client"

import React, { useEffect, useState, useMemo, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Bookmark,
  Calendar,
  History,
  QrCode,
  Loader2,
  X,
  Send,
  Check,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { VisitorDashboardLayout } from "@/components/exhibition/visitor-layout"
import { MarketplaceShell } from "@/components/marketplace/shell"
import {
  fetchFavorites,
  fetchRecentlyViewed,
  fetchMeetings,
  fetchVisitorNotes,
  trackRecentlyViewedItem
} from "@/lib/services/exhibitions-client"
import type {
  ExhibitionFavorite,
  ExhibitionRecentlyViewed,
  ExhibitionMeeting,
  ExhibitionVisitorNote,
} from "@/lib/domains/exhibition/types"
import Link from "next/link"

export default function VisitorDashboardOverviewPage() {
  return (
    <MarketplaceShell>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="size-8 text-primary animate-spin" />
        </div>
      }>
        <VisitorDashboardOverviewContent />
      </Suspense>
    </MarketplaceShell>
  )
}

function VisitorDashboardOverviewContent() {
  const { t, lang } = useLanguage()
  const exT = t.exhibitions
  const searchParams = useSearchParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<ExhibitionFavorite[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<ExhibitionRecentlyViewed[]>([])
  const [meetings, setMeetings] = useState<ExhibitionMeeting[]>([])
  const [notes, setNotes] = useState<ExhibitionVisitorNote[]>([])

  // Scan simulation states
  const [showScanModal, setShowScanModal] = useState(false)
  const [scanText, setScanText] = useState("")
  const [scanError, setScanTextError] = useState("")

  const visitorId = "visitor-local"

  useEffect(() => {
    // If URL triggers simulation
    if (searchParams.get("triggerScan") === "true") {
      // Defer state change to avoid synchronous react-hooks/set-state-in-effect
      const tm = setTimeout(() => {
        setShowScanModal(true)
      }, 0)
      return () => clearTimeout(tm)
    }

    // Handle scanned item redirect
    const scanId = searchParams.get("scanId")
    if (scanId) {
      // Simulate registering view
      trackRecentlyViewedItem(visitorId, "booth", scanId).then(() => {
        router.push(`/exhibitions/tunisia-food-expo-2026/booths/${scanId}`)
      })
    }
  }, [searchParams, router])

  useEffect(() => {
    let active = true

    async function loadDashboardData() {
      try {
        const [favsData, recData, meetData, notesData] = await Promise.all([
          fetchFavorites(visitorId),
          fetchRecentlyViewed(visitorId),
          fetchMeetings(visitorId),
          fetchVisitorNotes(visitorId)
        ])
        if (!active) return
        setFavorites(favsData || [])
        setRecentlyViewed(recData || [])
        setMeetings(meetData || [])
        setNotes(notesData || [])
        setLoading(false)
      } catch (err) {
        console.error("Dashboard overview load error:", err)
        if (active) setLoading(false)
      }
    }

    loadDashboardData()
    return () => {
      active = false
    }
  }, [])

  const handleSimulateScanSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!scanText.trim()) return

    // Allow codes: booth-medina, booth-sahara, booth-carthage
    const validCodes = ["booth-medina", "booth-sahara", "booth-carthage"]
    const code = scanText.trim().toLowerCase()

    if (validCodes.includes(code)) {
      setShowScanModal(false)
      setScanText("")
      setScanTextError("")
      // Redirect
      router.push(`/exhibitions/tunisia-food-expo-2026/booths/${code}`)
    } else {
      setScanTextError(
        lang === "ar"
          ? "رمز QR غير صالح. جرّب: booth-medina أو booth-sahara"
          : lang === "fr"
          ? "Code QR non valide. Essayez: booth-medina ou booth-sahara"
          : "Invalid booth ID code. Try: booth-medina or booth-sahara"
      )
    }
  }

  // Dashboard Stats calculations
  const totalFavs = favorites.length
  const totalRecs = recentlyViewed.length
  const pendingMeets = meetings.filter(m => m.status === "Pending").length
  const acceptedMeets = meetings.filter(m => m.status === "Accepted").length

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

        {/* Welcome message */}
        <section className="bg-card border border-border rounded-[20px] p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
          <div className="space-y-1.5 relative z-10">
            <h2 className="text-lg font-black text-foreground">
              {lang === "ar" ? "مرحباً بك مجدداً، زائر السوء" : lang === "fr" ? "Bienvenue, Visiteur Souk" : "Welcome, Trade Visitor!"}
            </h2>
            <p className="text-xs text-muted-foreground max-w-lg leading-normal">
              {lang === "ar"
                ? "إليك ملخصاً لأنشطة المعرض ومواعيدك والصفحات المحفوظة التي قمت بتتبعها في الأيام القليلة الماضية."
                : lang === "fr"
                ? "Voici un aperçu de vos activités d'exposition, réunions et stands favoris enregistrés."
                : "Manage your trade show itinerary, B2B meetings, and private exhibitor files in one workspace."}
            </p>
          </div>
          <div className="shrink-0 relative z-10 flex gap-2">
            <button
              onClick={() => setShowScanModal(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-border hover:bg-secondary/40 px-4 py-2.5 text-xs font-black text-foreground cursor-pointer min-h-11 transition-all"
            >
              <QrCode className="size-4 text-primary" />
              <span>{lang === "ar" ? "مسح رمز الاستجابة" : lang === "fr" ? "Scanner QR" : "Scan QR Code"}</span>
            </button>
          </div>
          {/* subtle decorative blur */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 size-40 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        </section>

        {/* Highlight Metrics */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              title: lang === "ar" ? "المفضلة" : lang === "fr" ? "Favoris" : "Favorites",
              value: totalFavs,
              icon: Bookmark,
              color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
            },
            {
              title: lang === "ar" ? "سجل الزيارات" : lang === "fr" ? "Récemment consultés" : "Visited",
              value: totalRecs,
              icon: History,
              color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
            },
            {
              title: lang === "ar" ? "المواعيد المعلقة" : lang === "fr" ? "Réunions en attente" : "Pending B2B",
              value: pendingMeets,
              icon: Clock,
              color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
            },
            {
              title: lang === "ar" ? "الاجتماعات المؤكدة" : lang === "fr" ? "Réunions acceptées" : "Confirmed Meetings",
              value: acceptedMeets,
              icon: CheckCircle2,
              color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
            }
          ].map((item, idx) => {
            const Icon = item.icon
            return (
              <div key={idx} className="bg-card border border-border p-5 rounded-[20px] shadow-3xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">{item.title}</span>
                  <div className={`size-8 rounded-lg flex items-center justify-center ${item.color} border`}>
                    <Icon className="size-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-foreground">{item.value}</p>
              </div>
            )
          })}
        </section>

        {/* Two Columns (Meetings teaser + Recent visitor bookmarks) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* B2B Meetings teaser */}
          <div className="bg-card border border-border rounded-[20px] p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border/50">
                <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                  <Calendar className="size-4.5 text-primary" />
                  <span>{lang === "ar" ? "جدول اللقاءات B2B" : lang === "fr" ? "Réunions B2B" : "Scheduled B2B Meetings"}</span>
                </h3>
                <Link
                  href="/exhibitions/visitor/meetings"
                  className="text-[10px] font-black text-primary hover:underline uppercase tracking-wide flex items-center gap-1"
                >
                  <span>{lang === "ar" ? "عرض الكل" : lang === "fr" ? "Voir tout" : "View All"}</span>
                  <ChevronRight className="size-3.5" />
                </Link>
              </div>

              {meetings.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-6 text-center">{lang === "ar" ? "لا توجد مواعيد مجدولة" : lang === "fr" ? "Aucune réunion planifiée" : "No scheduled B2B meetings yet."}</p>
              ) : (
                <div className="space-y-3">
                  {meetings.slice(0, 2).map((meet) => (
                    <div key={meet.id} className="p-3 bg-secondary/15 border border-border rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div className="space-y-1 min-w-0">
                        <p className="font-black text-foreground truncate">{meet.booth?.title || meet.booth?.company?.name || "Premium Exhibitor"}</p>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-semibold flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3 text-primary" />
                            <span>{meet.preferredDate}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3 text-primary" />
                            <span>{meet.preferredTime}</span>
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        meet.status === "Accepted"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : meet.status === "Rejected"
                          ? "bg-red-500/10 text-red-600 border border-red-500/20"
                          : meet.status === "Cancelled"
                          ? "bg-slate-500/10 text-slate-600 border border-slate-500/20"
                          : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                      }`}>
                        {meet.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Favorites teaser */}
          <div className="bg-card border border-border rounded-[20px] p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border/50">
                <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                  <Bookmark className="size-4.5 text-amber-500" />
                  <span>{lang === "ar" ? "أجنحة ومعروضات محفوظة" : lang === "fr" ? "Enregistrés" : "Bookmarks & Favorites"}</span>
                </h3>
                <Link
                  href="/exhibitions/visitor/favorites"
                  className="text-[10px] font-black text-primary hover:underline uppercase tracking-wide flex items-center gap-1"
                >
                  <span>{lang === "ar" ? "عرض الكل" : lang === "fr" ? "Voir tout" : "View All"}</span>
                  <ChevronRight className="size-3.5" />
                </Link>
              </div>

              {favorites.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-6 text-center">{lang === "ar" ? "لا توجد عناصر محفوظة" : lang === "fr" ? "Aucun favori enregistré" : "No saved items in your bookmarks."}</p>
              ) : (
                <div className="space-y-3">
                  {favorites.slice(0, 3).map((fav) => {
                    const title = fav.targetType === "booth" ? fav.booth?.title || fav.booth?.company?.name : fav.exhibit?.name
                    const sub = fav.targetType === "booth" ? fav.booth?.category : fav.exhibit?.shortDescription
                    return (
                      <div key={fav.id} className="p-3 bg-secondary/15 border border-border/70 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0">
                          <p className="font-black text-foreground truncate">{title}</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">{fav.targetType}</p>
                        </div>
                        {fav.targetType === "booth" && fav.booth && (
                          <Link
                            href={`/exhibitions/tunisia-food-expo-2026/booths/${fav.booth.id}`}
                            className="size-8 rounded-lg border border-border hover:bg-secondary/40 flex items-center justify-center shrink-0 transition-all cursor-pointer"
                          >
                            <ExternalLink className="size-3.5 text-primary" />
                          </Link>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* QR scanner trigger simulator modal popup */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <QrCode className="size-5 text-primary" />
                <span>{lang === "ar" ? "محاكي قارئ الرموز QR" : lang === "fr" ? "Simulateur de Scan" : "QR Scan Simulator"}</span>
              </h3>
              <button
                onClick={() => {
                  setShowScanModal(false)
                  setScanText("")
                  setScanTextError("")
                }}
                className="size-8 rounded-xl border border-border hover:bg-secondary/40 flex items-center justify-center text-muted-foreground cursor-pointer min-h-11"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSimulateScanSubmit} className="space-y-4">
              <p className="text-xs text-muted-foreground leading-normal">
                {lang === "ar"
                  ? "أدخل معرّف الجناح لمحاكاة مسح الرمز QR من الكاميرا."
                  : lang === "fr"
                  ? "Entrez l'identifiant pour simuler la capture de la caméra."
                  : "Type an exhibition booth ID code to simulate scanning a physical badge."}
              </p>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">
                  {lang === "ar" ? "معرّف الجناح" : lang === "fr" ? "Identifiant du Stand" : "Booth ID Code"} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. booth-medina"
                  value={scanText}
                  onChange={(e) => setScanText(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/15 px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-11"
                />
                {scanError && (
                  <p className="text-[10px] font-bold text-red-500 mt-1">{scanError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-primary to-blue-600 py-3.5 text-xs font-black text-white hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2 min-h-11"
              >
                <Send className="size-4" />
                <span>{lang === "ar" ? "محاكاة المسح والتوجه للجناح" : lang === "fr" ? "Simuler et Ouvrir" : "Simulate and Open"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </VisitorDashboardLayout>
  )
}
