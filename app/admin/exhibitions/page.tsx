"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Presentation,
  Plus,
  Search,
  Calendar,
  MapPin,
  Building,
  CheckCircle,
  Archive,
  Lock,
  Unlock,
  Eye,
  Edit3,
  Loader2,
  AlertCircle
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import type { Exhibition } from "@/lib/domains/exhibition/types"

export default function AdminExhibitionsPage() {
  const { lang, dir } = useLanguage()
  const isAr = lang === "ar"

  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [reloadCounter, setReloadCounter] = useState(0)

  useEffect(() => {
    let active = true
    const loadExhibitions = async () => {
      try {
        const res = await fetch("/api/exhibitions")
        const json = await res.json()
        if (!active) return
        if (json.success) {
          setExhibitions(json.data)
        } else {
          setError(json.error || "Failed to load exhibitions")
        }
        setLoading(false)
      } catch (err) {
        console.error("Exhibition load error:", err)
        if (!active) return
        setError("Failed to fetch exhibitions.")
        setLoading(false)
      }
    }
    loadExhibitions()
    return () => {
      active = false
    }
  }, [reloadCounter])

  const handleStatusChange = async (id: string, status: "Draft" | "Published" | "Archived" | "Open" | "Closed") => {
    try {
      setActionLoadingId(id)
      const res = await fetch(`/api/admin/exhibitions/${id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ status })
      })
      const json = await res.json()
      if (json.success) {
        // Reload list to apply status overrides
        setReloadCounter(prev => prev + 1)
      } else {
        alert(json.error || "Failed to update exhibition status")
      }
      setActionLoadingId(null)
    } catch (err) {
      console.error("Status update error:", err)
      alert("Error executing status update.")
      setActionLoadingId(null)
    }
  }

  const filteredExhibitions = exhibitions.filter((ex) =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: Exhibition["status"]) => {
    const s = status || "Published"
    switch (s) {
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
      case "Open":
        return {
          label: isAr ? "التسجيل مفتوح" : "Registration Open",
          color: "bg-blue-500/10 text-blue-400 border border-blue-500/20"
        }
      case "Closed":
        return {
          label: isAr ? "التسجيل مغلق" : "Registration Closed",
          color: "bg-amber-500/10 text-amber-400 border border-amber-500/20"
        }
      default:
        return {
          label: s,
          color: "bg-slate-800 text-slate-400 border border-slate-700"
        }
    }
  }

  return (
    <div className="space-y-8" dir={dir}>
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
            {isAr ? "إدارة المعارض التجارية" : "Trade Show Portfolio"}
          </h2>
          <p className="text-slate-400 text-xs md:text-sm font-semibold mt-1">
            {isAr
              ? "نشر وتعديل وأرشفة المعارض، والتحكم في فترات فتح وإغلاق باب التسجيل المباشر للشركات."
              : "Register, modify, archive, and toggle live company registration windows across all tradeshows."}
          </p>
        </div>

        <Link
          href="/admin/exhibitions/new"
          className="flex items-center gap-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 px-4.5 py-3 text-xs font-black transition-all shadow-lg shadow-teal-500/10 min-h-11 shrink-0 self-start md:self-auto"
        >
          <Plus className="size-4" />
          <span>{isAr ? "إضافة معرض جديد" : "Create Exhibition"}</span>
        </Link>
      </div>

      {/* FILTER SEARCH BAR */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder={isAr ? "البحث باسم المعرض، المنظم أو المدينة..." : "Search by name, organizer or city..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-900 ps-11 pe-4 py-3 text-xs font-bold text-slate-100 focus:border-teal-500 focus:outline-none min-h-[44px]"
        />
        <Search className="absolute start-4 top-3 size-4.5 text-slate-500" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="size-8 text-teal-400 animate-spin" />
          <span className="text-xs font-bold text-slate-400">{isAr ? "جاري تحميل المعارض..." : "Loading trade shows..."}</span>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center text-xs font-bold text-red-400">
          {error}
        </div>
      ) : filteredExhibitions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center space-y-3">
          <Presentation className="size-10 text-slate-600 mx-auto" />
          <p className="text-xs font-bold text-slate-400">{isAr ? "لم يتم العثور على أي معارض." : "No exhibitions found."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredExhibitions.map((ex) => {
            const badge = getStatusBadge(ex.status)
            const isActionLoading = actionLoadingId === ex.id

            return (
              <div
                key={ex.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 md:flex-row md:items-center gap-5 transition-all hover:border-slate-700/80"
              >
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 shrink-0">
                    <Presentation className="size-6 text-teal-400" />
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base font-black text-slate-100 truncate group-hover:text-teal-300 transition-all">
                        {ex.name}
                      </h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-400">
                      <p className="flex items-center gap-1.5">
                        <Building className="size-3.5 text-teal-500/60" />
                        <span>{ex.organizer}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-teal-500/60" />
                        <span className="capitalize">{ex.city}, {ex.country}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-teal-500/60" />
                        <span>
                          {new Date(ex.startDate).toLocaleDateString()} - {new Date(ex.endDate).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* CONTROLS AREA */}
                <div className="flex flex-wrap items-center gap-2 md:justify-end shrink-0 pt-3 md:pt-0 border-t border-slate-800/60 md:border-0">
                  {isActionLoading ? (
                    <div className="px-4 py-2 text-xs font-bold text-slate-400 flex items-center gap-2">
                      <Loader2 className="size-4 text-teal-400 animate-spin" />
                      <span>{isAr ? "معالجة..." : "Processing..."}</span>
                    </div>
                  ) : (
                    <>
                      {/* Publish / Archive */}
                      {ex.status !== "Published" && (
                        <button
                          onClick={() => handleStatusChange(ex.id, "Published")}
                          className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 px-3 py-1.5 text-[10px] font-black border border-slate-700/50"
                        >
                          <CheckCircle className="size-3.5" />
                          <span>{isAr ? "نشر" : "Publish"}</span>
                        </button>
                      )}

                      {ex.status !== "Open" && ex.status !== "Archived" && (
                        <button
                          onClick={() => handleStatusChange(ex.id, "Open")}
                          className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 px-3 py-1.5 text-[10px] font-black border border-slate-700/50"
                        >
                          <Unlock className="size-3.5" />
                          <span>{isAr ? "فتح التسجيل" : "Open Reg"}</span>
                        </button>
                      )}

                      {ex.status === "Open" && (
                        <button
                          onClick={() => handleStatusChange(ex.id, "Closed")}
                          className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-1.5 text-[10px] font-black border border-slate-700/50"
                        >
                          <Lock className="size-3.5" />
                          <span>{isAr ? "إغلاق التسجيل" : "Close Reg"}</span>
                        </button>
                      )}

                      {ex.status !== "Archived" && (
                        <button
                          onClick={() => handleStatusChange(ex.id, "Archived")}
                          className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400 px-3 py-1.5 text-[10px] font-black border border-slate-700/50"
                        >
                          <Archive className="size-3.5" />
                          <span>{isAr ? "أرشفة" : "Archive"}</span>
                        </button>
                      )}

                      {/* View details */}
                      <Link
                        href={`/admin/exhibitions/${ex.id}`}
                        className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 text-[10px] font-black border border-slate-700/50"
                      >
                        <Eye className="size-3.5" />
                        <span>{isAr ? "عرض" : "View"}</span>
                      </Link>

                      {/* Edit details */}
                      <Link
                        href={`/admin/exhibitions/${ex.id}/edit`}
                        className="flex items-center gap-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 px-3 py-1.5 text-[10px] font-black transition-all"
                      >
                        <Edit3 className="size-3.5" />
                        <span>{isAr ? "تعديل" : "Edit"}</span>
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
