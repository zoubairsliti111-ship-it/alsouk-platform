"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Building,
  Search,
  CheckCircle,
  Archive,
  Eye,
  Loader2,
  XCircle,
  AlertCircle,
  Compass,
  ArrowUpRight
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import type { Exhibition, ExhibitionBooth } from "@/lib/domains/exhibition/types"

export default function AdminBoothsPage() {
  const { lang, dir } = useLanguage()
  const isAr = lang === "ar"

  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [selectedExhId, setSelectedExhId] = useState("")
  const [booths, setBooths] = useState<ExhibitionBooth[]>([])
  const [loading, setLoading] = useState(true)
  const [boothActionLoadingId, setBoothActionLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [reloadCounter, setReloadCounter] = useState(0)

  // Load exhibitions
  useEffect(() => {
    let active = true
    const loadInit = async () => {
      try {
        const res = await fetch("/api/exhibitions")
        const json = await res.json()
        if (json.success && json.data) {
          if (!active) return
          setExhibitions(json.data)
          if (json.data.length > 0) {
            setSelectedExhId(json.data[0].id)
          }
        }
      } catch (err) {
        console.error("Failed to load exhibitions:", err)
      }
    }
    loadInit()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedExhId) return
    let active = true
    const loadBooths = async () => {
      try {
        const res = await fetch(`/api/exhibitions/organizer/booths?exhibitionId=${selectedExhId}`)
        const json = await res.json()
        if (!active) return
        if (json.success) {
          setBooths(json.data)
        } else {
          setError(json.error || "Failed to load booths")
        }
        setLoading(false)
      } catch (err) {
        console.error("Load booths failure:", err)
        if (!active) return
        setError("Failed to fetch booths.")
        setLoading(false)
      }
    }
    loadBooths()
    return () => {
      active = false
    }
  }, [selectedExhId, reloadCounter])

  const handleBoothStatusChange = async (boothId: string, status: "Draft" | "Published" | "Archived") => {
    try {
      setBoothActionLoadingId(boothId)
      const res = await fetch("/api/exhibitions/organizer/booths", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          action: "update-status",
          boothId,
          status
        })
      })

      const json = await res.json()
      if (json.success) {
        setReloadCounter(prev => prev + 1)
      } else {
        alert(json.error || "Failed to change booth status")
      }
      setBoothActionLoadingId(null)
    } catch (err) {
      console.error("Booth status change failure:", err)
      alert("Error executing status change.")
      setBoothActionLoadingId(null)
    }
  }

  const selectedExh = exhibitions.find((e) => e.id === selectedExhId)
  const exhSlug = selectedExh?.slug || "tunisia-food-expo-2026"

  const filteredBooths = booths.filter((b) => {
    const query = searchTerm.toLowerCase()
    return (
      (b.title || b.company?.name || "").toLowerCase().includes(query) ||
      (b.boothNumber || "").toLowerCase().includes(query) ||
      (b.category || "").toLowerCase().includes(query)
    )
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Published":
        return {
          label: isAr ? "منشور" : "Published",
          color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        }
      case "Draft":
        return {
          label: isAr ? "مسودة" : "Draft Stages",
          color: "bg-slate-800 text-slate-400 border border-slate-700"
        }
      case "Archived":
        return {
          label: isAr ? "مؤرشف" : "Archived",
          color: "bg-red-500/10 text-red-400 border border-red-500/20"
        }
      case "Submitted":
        return {
          label: isAr ? "مقدم للمراجعة" : "Submitted Review",
          color: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
        }
      default:
        return {
          label: status,
          color: "bg-slate-800 text-slate-400 border border-slate-700"
        }
    }
  }

  return (
    <div className="space-y-8" dir={dir}>
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
            {isAr ? "مساحات الأجنحة الفاعلة" : "Booth Spaces Desk"}
          </h2>
          <p className="text-slate-400 text-xs md:text-sm font-semibold mt-1">
            {isAr
              ? "نشر الأجنحة، إلغاء النشر أو الأرشفة، والتنقل الفوري لاستعراض الجناح بصيغة الزوار."
              : "Command center for trade show booths. Instantly publish, unpublish, archive, or inspect layouts."}
          </p>
        </div>

        {/* Exhibition Dropdown selector */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200">
          <span className="text-slate-500">{isAr ? "المعرض التجاري:" : "Trade Show:"}</span>
          <select
            value={selectedExhId}
            onChange={(e) => setSelectedExhId(e.target.value)}
            className="bg-transparent font-black focus:outline-none cursor-pointer text-teal-400"
          >
            {exhibitions.map((e) => (
              <option key={e.id} value={e.id} className="bg-slate-900 text-slate-200">
                {e.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SEARCH AND SEARCH SUMMARY */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder={isAr ? "البحث برقم الجناح، اسم الشركة أو الفئة المستهدفة..." : "Search by booth number, company or category..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-900 ps-11 pe-4 py-2.5 text-xs font-bold text-slate-100 focus:border-teal-500 focus:outline-none min-h-[44px]"
        />
        <Search className="absolute start-4 top-3 size-4.5 text-slate-500" />
      </div>

      {/* BOOTHS LIST */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="size-8 text-teal-400 animate-spin" />
          <span className="text-xs font-bold text-slate-400">{isAr ? "جاري تحميل الأجنحة..." : "Loading booths list..."}</span>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center text-xs font-bold text-red-400">
          {error}
        </div>
      ) : filteredBooths.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center space-y-3">
          <Compass className="size-10 text-slate-600 mx-auto" />
          <p className="text-xs font-bold text-slate-400">{isAr ? "لا توجد أجنحة مشاركة مطابقة." : "No booths matched."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredBooths.map((booth) => {
            const badge = getStatusBadge(booth.status || "Draft")
            const isActionLoading = boothActionLoadingId === booth.id

            return (
              <div
                key={booth.id}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 p-5 md:flex-row md:items-center gap-4 transition-all hover:border-slate-700/80"
              >
                <div className="flex items-start gap-4">
                  {/* Booth Number representation */}
                  <div className="size-12 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-black text-slate-500 uppercase">{isAr ? "رقم" : "No."}</span>
                    <span className="text-xs font-black text-teal-400">{booth.boothNumber || "A-01"}</span>
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base font-black text-slate-100 truncate">
                        {booth.title || booth.company?.name || "Premium Exhibitor"}
                      </h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-400">
                      <p className="flex items-center gap-1">
                        <span>{isAr ? "القطاع:" : "Pavilion:"}</span>
                        <span className="text-slate-300 font-extrabold">{booth.category || "General"}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* INLINE ACTION DECISION ACTIONS */}
                <div className="flex flex-wrap items-center gap-2 md:justify-end shrink-0 pt-3 md:pt-0 border-t border-slate-800/60 md:border-0">
                  {isActionLoading ? (
                    <div className="px-4 py-2 text-xs font-bold text-slate-400 flex items-center gap-2">
                      <Loader2 className="size-4 text-teal-400 animate-spin" />
                      <span>{isAr ? "معالجة..." : "Updating..."}</span>
                    </div>
                  ) : (
                    <>
                      {/* Publish / Unpublish */}
                      {booth.status !== "Published" && (
                        <button
                          onClick={() => handleBoothStatusChange(booth.id, "Published")}
                          className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 px-3 py-1.5 text-[10px] font-black border border-slate-700/50"
                        >
                          <CheckCircle className="size-3.5" />
                          <span>{isAr ? "نشر الجناح" : "Publish"}</span>
                        </button>
                      )}

                      {booth.status === "Published" && (
                        <button
                          onClick={() => handleBoothStatusChange(booth.id, "Draft")}
                          className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-1.5 text-[10px] font-black border border-slate-700/50"
                        >
                          <XCircle className="size-3.5" />
                          <span>{isAr ? "إلغاء النشر" : "Unpublish"}</span>
                        </button>
                      )}

                      {/* Archive */}
                      {booth.status !== "Archived" && (
                        <button
                          onClick={() => handleBoothStatusChange(booth.id, "Archived")}
                          className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400 px-3 py-1.5 text-[10px] font-black border border-slate-700/50"
                        >
                          <Archive className="size-3.5" />
                          <span>{isAr ? "أرشفة" : "Archive"}</span>
                        </button>
                      )}

                      {/* Inspect/View booth */}
                      <Link
                        href={`/exhibitions/${exhSlug}/booths/${booth.id}`}
                        target="_blank"
                        className="flex items-center gap-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 px-3.5 py-1.5 text-[10px] font-black transition-all"
                      >
                        <span>{isAr ? "معاينة الجناح" : "View Booth"}</span>
                        <ArrowUpRight className="size-3 shrink-0" />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
