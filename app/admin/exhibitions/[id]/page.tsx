"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building,
  CheckCircle,
  Archive,
  Lock,
  Unlock,
  Edit3,
  Loader2,
  Globe,
  Mail,
  Phone,
  LayoutGrid
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import type { Exhibition } from "@/lib/domains/exhibition/types"

export default function AdminExhibitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { lang, dir } = useLanguage()
  const isAr = lang === "ar"
  const router = useRouter()

  const [exhibition, setExhibition] = useState<Exhibition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [reloadCounter, setReloadCounter] = useState(0)

  useEffect(() => {
    let active = true
    const loadExhibition = async () => {
      try {
        const res = await fetch("/api/exhibitions")
        const json = await res.json()
        if (!active) return
        if (json.success && json.data) {
          const found = json.data.find((e: Exhibition) => e.id === id)
          if (found) {
            setExhibition(found)
          } else {
            setError(isAr ? "لم يتم العثور على المعرض" : "Exhibition not found")
          }
        } else {
          setError(json.error || "Failed to load exhibition details")
        }
        setLoading(false)
      } catch (err) {
        console.error("Exhibition details load error:", err)
        if (!active) return
        setError("Failed to fetch exhibition details.")
        setLoading(false)
      }
    }
    loadExhibition()
    return () => {
      active = false
    }
  }, [id, reloadCounter, isAr])

  const handleStatusChange = async (status: "Draft" | "Published" | "Archived" | "Open" | "Closed") => {
    try {
      setActionLoading(true)
      const res = await fetch(`/api/admin/exhibitions/${id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ status })
      })
      const json = await res.json()
      if (json.success) {
        setReloadCounter(prev => prev + 1)
      } else {
        alert(json.error || "Failed to update exhibition status")
      }
      setActionLoading(false)
    } catch (err) {
      console.error("Status update error:", err)
      alert("Error occurred while updating status.")
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="size-9 text-teal-400 animate-spin" />
        <span className="text-xs font-bold text-slate-400">{isAr ? "جاري تحميل تفاصيل المعرض..." : "Loading exhibition profile..."}</span>
      </div>
    )
  }

  if (error || !exhibition) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-5">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-xs font-bold text-red-400">
          {error}
        </div>
        <button
          onClick={() => router.push("/admin/exhibitions")}
          className="rounded-xl bg-slate-900 border border-slate-800 text-slate-200 px-5 py-2.5 text-xs font-black"
        >
          {isAr ? "العودة لقائمة المعارض" : "Back to Exhibition List"}
        </button>
      </div>
    )
  }

  const startStr = new Date(exhibition.startDate).toLocaleDateString(
    lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : "ar-TN",
    { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
  )
  const endStr = new Date(exhibition.endDate).toLocaleDateString(
    lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : "ar-TN",
    { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
  )

  const isDraft = exhibition.status === "Draft" || !exhibition.status
  const isPublished = exhibition.status === "Published"
  const isOpen = exhibition.status === "Open"
  const isClosed = exhibition.status === "Closed"
  const isArchived = exhibition.status === "Archived"

  return (
    <div className="max-w-4xl mx-auto space-y-8" dir={dir}>
      {/* HEADER BAR */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
        <button
          onClick={() => router.push("/admin/exhibitions")}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
        >
          <ArrowLeft className={`size-4.5 ${dir === "rtl" ? "rotate-180" : ""}`} />
        </button>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight">
            {isAr ? "تفاصيل المعرض التجاري" : "Exhibition Specifications"}
          </h2>
          <p className="text-slate-400 text-xs font-semibold">
            {isAr ? "ملف الماصة الرئيسي وتدابير التسجيل الفاعلة." : "Core system definitions, branding layouts and action configurations."}
          </p>
        </div>
      </div>

      {/* DETAILED SPEC CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Cover view */}
        <div className="relative h-48 md:h-64 bg-slate-950">
          {exhibition.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={exhibition.coverUrl} alt={exhibition.name} className="size-full object-cover opacity-60" />
          ) : (
            <div className="size-full bg-gradient-to-br from-teal-950 to-slate-950 opacity-40" />
          )}

          {/* Logo badge overlay */}
          <div className="absolute -bottom-6 start-6 md:start-10 size-16 md:size-24 bg-slate-900 border border-slate-800 rounded-2xl p-2 flex items-center justify-center">
            {exhibition.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={exhibition.logoUrl} alt={exhibition.name} className="size-full object-contain rounded-xl" />
            ) : (
              <Building className="size-8 text-teal-400" />
            )}
          </div>
        </div>

        <div className="pt-10 pb-6 px-6 md:px-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-black text-slate-100">{exhibition.name}</h3>
              <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <span>{isAr ? "الجهة المنظمة:" : "Organizer:"}</span>
                <span className="text-teal-400">{exhibition.organizer}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                isPublished ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                isOpen ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                isClosed ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                isArchived ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                "bg-slate-800 text-slate-400 border border-slate-700"
              }`}>
                {exhibition.status || "Published"}
              </span>

              <Link
                href={`/admin/exhibitions/${exhibition.id}/edit`}
                className="flex items-center justify-center p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                <Edit3 className="size-4" />
              </Link>
            </div>
          </div>

          {/* Description overview */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest">{isAr ? "وصف المعرض والجدول الإداري" : "Exhibition Overview"}</h4>
            <p className="text-xs md:text-sm font-semibold text-slate-400 leading-relaxed">
              {exhibition.description || (isAr ? "لا يوجد وصف مدخل لهذا المعرض." : "No description provided for this trade show.")}
            </p>
          </div>

          {/* Category badges */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest">{isAr ? "فئات التخصص" : "Target Industries"}</h4>
            <div className="flex flex-wrap gap-2">
              {exhibition.categories.map((cat) => (
                <span key={cat} className="rounded-lg bg-slate-950 border border-slate-800/80 px-2.5 py-1 text-[10px] font-black text-slate-400 uppercase">
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Core Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pt-6 border-t border-slate-800/60 text-xs font-semibold text-slate-400">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black text-slate-500">{isAr ? "تاريخ المعرض" : "Timeline Dates"}</span>
              <p className="text-slate-200 font-bold">{startStr}</p>
              <p className="text-slate-400 text-[10px]">{isAr ? "إلى" : "to"} {endStr}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black text-slate-500">{isAr ? "الموقع الجغرافي" : "Physical Venue"}</span>
              <p className="text-slate-200 font-bold capitalize">{exhibition.city}</p>
              <p className="text-slate-400 text-[10px]">{exhibition.country}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black text-slate-500">{isAr ? "تفاصيل الدعم والتواصل" : "Support Contacts"}</span>
              <p className="text-slate-200 font-bold">{exhibition.contactEmail || "support@alsouk.tn"}</p>
              <p className="text-slate-400 text-[10px]">{exhibition.contactPhone || "+216 71 123 456"}</p>
            </div>
          </div>

          {/* CONTROL SWITCHES ACTION BAR */}
          <div className="pt-6 border-t border-slate-800/60 flex flex-wrap gap-3">
            {actionLoading ? (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Loader2 className="size-4.5 text-teal-400 animate-spin" />
                <span>{isAr ? "جاري تنفيذ الإجراء التعديلي..." : "Executing administrative update..."}</span>
              </div>
            ) : (
              <>
                {/* Close/Open registration toggle */}
                {!isOpen && !isArchived && (
                  <button
                    onClick={() => handleStatusChange("Open")}
                    className="flex items-center gap-1.5 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400 px-4.5 py-3 text-xs font-black transition-all"
                  >
                    <Unlock className="size-4" />
                    <span>{isAr ? "فتح باب التسجيل" : "Open Registration"}</span>
                  </button>
                )}

                {isOpen && (
                  <button
                    onClick={() => handleStatusChange("Closed")}
                    className="flex items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 px-4.5 py-3 text-xs font-black transition-all"
                  >
                    <Lock className="size-4" />
                    <span>{isAr ? "إغلاق باب التسجيل" : "Close Registration"}</span>
                  </button>
                )}

                {/* Publish */}
                {!isPublished && (
                  <button
                    onClick={() => handleStatusChange("Published")}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 px-4.5 py-3 text-xs font-black transition-all"
                  >
                    <CheckCircle className="size-4" />
                    <span>{isAr ? "نشر المعرض للعامة" : "Publish Exhibition"}</span>
                  </button>
                )}

                {/* Archive */}
                {!isArchived && (
                  <button
                    onClick={() => handleStatusChange("Archived")}
                    className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 px-4.5 py-3 text-xs font-black transition-all"
                  >
                    <Archive className="size-4" />
                    <span>{isAr ? "أرشفة المعرض" : "Archive Exhibition"}</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
