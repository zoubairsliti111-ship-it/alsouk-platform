"use client"

import { useEffect, useState } from "react"
import {
  FileCheck2,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  User,
  Globe,
  Loader2,
  ShieldCheck,
  ClipboardList,
  Save,
  Grid3X3
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import type { ExhibitionApplication } from "@/lib/domains/exhibition/types"

export default function AdminApplicationsPage() {
  const { lang, dir } = useLanguage()
  const isAr = lang === "ar"

  const [applications, setApplications] = useState<ExhibitionApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [reloadCounter, setReloadCounter] = useState(0)

  // Modal / Review state
  const [selectedApp, setSelectedApp] = useState<ExhibitionApplication | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [boothNumber, setBoothNumber] = useState("")
  const [reviewActionLoading, setReviewActionLoading] = useState(false)

  useEffect(() => {
    let active = true
    const loadApplications = async () => {
      try {
        const res = await fetch("/api/exhibitions/organizer/applications")
        const json = await res.json()
        if (!active) return
        if (json.success) {
          setApplications(json.data)
        } else {
          setError(json.error || "Failed to load applications")
        }
        setLoading(false)
      } catch (err) {
        console.error("Load applications failure:", err)
        if (!active) return
        setError("Failed to load applications list.")
        setLoading(false)
      }
    }
    loadApplications()
    return () => {
      active = false
    }
  }, [reloadCounter])

  const handleOpenReview = (app: ExhibitionApplication) => {
    setSelectedApp(app)
    setReviewNotes(app.reviewNotes || "")
    // Generate deterministic booth number template if empty
    setBoothNumber("")
  }

  const handleReviewAction = async (action: "approve" | "reject" | "assign-booth") => {
    if (!selectedApp) return

    if (action === "reject" && !reviewNotes.trim()) {
      alert(isAr ? "الرجاء كتابة ملاحظات الرفض لتوضيح السبب للشركة." : "Please write review notes indicating the reason for rejection.")
      return
    }

    try {
      setReviewActionLoading(true)
      const res = await fetch("/api/exhibitions/organizer/applications", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          action,
          id: selectedApp.id,
          reviewNotes: reviewNotes.trim(),
          boothNumber: boothNumber.trim()
        })
      })

      const json = await res.json()
      if (json.success) {
        setSelectedApp(null)
        setReloadCounter(prev => prev + 1)
      } else {
        alert(json.error || "Action failed")
      }
      setReviewActionLoading(false)
    } catch (err) {
      console.error("Review action error:", err)
      alert("Error executing review request.")
      setReviewActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return {
          label: isAr ? "قيد المراجعة" : "Pending",
          color: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
        }
      case "Approved":
        return {
          label: isAr ? "مقبول" : "Approved",
          color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        }
      case "Rejected":
        return {
          label: isAr ? "مرفوض" : "Rejected",
          color: "bg-red-500/10 text-red-400 border border-red-500/20"
        }
      default:
        return {
          label: status,
          color: "bg-slate-800 text-slate-400 border border-slate-700"
        }
    }
  }

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || app.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8" dir={dir}>
      {/* HEADER SECTION */}
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-xs font-black text-teal-400 uppercase tracking-widest">
          <ClipboardList className="size-4 shrink-0" />
          <span>{isAr ? "مساحة تقييم الطلبات" : "Registration Worklist"}</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight mt-1">
          {isAr ? "طلبات المشاركة بالمعارض" : "Tradeshow Applications"}
        </h2>
        <p className="text-slate-400 text-xs md:text-sm font-semibold mt-1">
          {isAr
            ? "تقييم واعتماد أو رفض طلبات الشركات للمشاركة بالمعارض التجارية، مع التخصيص الآلي لمساحة جناح فارغة."
            : "Review and approve/reject company requests to showcase prototypes. Approved companies are automatically allocated draft booth workspaces."}
        </p>
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={isAr ? "البحث باسم الشركة أو مسؤول الاتصال..." : "Search by company name or contact..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 ps-11 pe-4 py-2.5 text-xs font-bold text-slate-100 focus:border-teal-500 focus:outline-none min-h-[44px]"
          />
          <Search className="absolute start-4 top-3 size-4.5 text-slate-500" />
        </div>

        {/* Status selection tab */}
        <div className="flex gap-2">
          {["all", "Pending", "Approved", "Rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                statusFilter === status
                  ? "bg-teal-500/10 border-teal-500/30 text-teal-300"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {status === "all" ? (isAr ? "الكل" : "All Statuses") :
               status === "Pending" ? (isAr ? "قيد الانتظار" : "Pending") :
               status === "Approved" ? (isAr ? "مقبول" : "Approved") :
               (isAr ? "مرفوض" : "Rejected")}
            </button>
          ))}
        </div>
      </div>

      {/* APPLICATIONS LIST */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="size-8 text-teal-400 animate-spin" />
          <span className="text-xs font-bold text-slate-400">{isAr ? "جاري تحميل قائمة الطلبات..." : "Loading applications..."}</span>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center text-xs font-bold text-red-400">
          {error}
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center space-y-3">
          <ClipboardList className="size-10 text-slate-600 mx-auto" />
          <p className="text-xs font-bold text-slate-400">{isAr ? "لا توجد طلبات مشاركة مطابقة." : "No applications match."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredApps.map((app) => {
            const badge = getStatusBadge(app.status)
            return (
              <div
                key={app.id}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 p-5 md:flex-row md:items-center gap-4 transition-all hover:border-slate-700/80"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h4 className="text-base font-black text-slate-100">{app.companyName}</h4>
                    <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-400">
                    <p className="flex items-center gap-1.5">
                      <User className="size-3.5 text-teal-500/60" />
                      <span>{app.contactPerson}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Building className="size-3.5 text-teal-500/60" />
                      <span>{app.businessCategory}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Globe className="size-3.5 text-teal-500/60" />
                      <span>{app.country === "TN" ? "Tunisia (🇹🇳)" : app.country}</span>
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center md:justify-end pt-3 md:pt-0 border-t border-slate-800/60 md:border-0">
                  <button
                    onClick={() => handleOpenReview(app)}
                    className="w-full md:w-auto rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 px-4.5 py-2.5 text-xs font-black transition-all border border-slate-700/50"
                  >
                    {isAr ? "مراجعة واتخاذ قرار" : "Review & Act"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* OVERLAY MODAL FOR REVIEW */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedApp(null)} />

          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-6 p-6 z-10">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-100">{selectedApp.companyName}</h3>
                <p className="text-[11px] font-bold text-slate-400">{isAr ? "طلب تسجيل بالمعرض" : "Tradeshow Registration Request"}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Application Data Specs */}
            <div className="space-y-4 max-h-[30vh] overflow-y-auto text-xs font-semibold text-slate-300 leading-relaxed pr-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-black uppercase">{isAr ? "المسؤول" : "Contact Person"}</span>
                  <p className="text-slate-200 font-bold">{selectedApp.contactPerson}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-black uppercase">{isAr ? "البريد الإلكتروني" : "Email Address"}</span>
                  <p className="text-slate-200 font-bold">{selectedApp.email}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-black uppercase">{isAr ? "الهاتف" : "Phone Number"}</span>
                  <p className="text-slate-200 font-bold">{selectedApp.phone}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-black uppercase">{isAr ? "القطاع التجاري" : "Category"}</span>
                  <p className="text-slate-200 font-bold">{selectedApp.businessCategory}</p>
                </div>
              </div>

              <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 font-black uppercase block">{isAr ? "الوصف التعريفي" : "Short Description"}</span>
                <p className="text-slate-300 font-bold">{selectedApp.shortDescription}</p>
              </div>

              {selectedApp.message && (
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-black uppercase block">{isAr ? "رسالة مرافقة" : "Cover Message"}</span>
                  <p className="text-slate-400 italic">&quot;{selectedApp.message}&quot;</p>
                </div>
              )}
            </div>

            {/* Decision panel */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              {/* Review Notes Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-300 block">
                  {isAr ? "ملاحظات المراجعة (إلزامية للرفض) *" : "Administrative Review Notes (Required for rejection) *"}
                </label>
                <textarea
                  rows={2}
                  placeholder={isAr ? "اكتب تفاصيل التقييم أو سبب الرفض لتوجيه الشركة..." : "Write details regarding qualification or rejection cause..."}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-semibold text-slate-100 focus:border-teal-500 focus:outline-none min-h-[60px]"
                />
              </div>

              {/* Booth Number input (Only visible/active if approving or assigning) */}
              {selectedApp.status === "Approved" && (
                <div className="space-y-1.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-200">
                    <Grid3X3 className="size-4 text-teal-400" />
                    <span>{isAr ? "تعديل رقم الجناح" : "Modify Assigned Booth Number"}</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. A-12, B-03"
                    value={boothNumber}
                    onChange={(e) => setBoothNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-bold text-slate-100 focus:border-teal-500 focus:outline-none mt-2"
                  />
                  <button
                    onClick={() => handleReviewAction("assign-booth")}
                    disabled={reviewActionLoading || !boothNumber.trim()}
                    className="mt-3 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 px-4 py-2 text-[10px] font-black tracking-wider transition-all disabled:opacity-50"
                  >
                    {reviewActionLoading ? "..." : (isAr ? "تخصيص رقم الجناح" : "Assign Number")}
                  </button>
                </div>
              )}

              {/* Modal footer decision buttons */}
              {selectedApp.status === "Pending" && (
                <div className="flex items-center justify-end gap-3 pt-2">
                  {reviewActionLoading ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Loader2 className="size-4 animate-spin text-teal-400" />
                      <span>{isAr ? "جاري الحفظ..." : "Processing decision..."}</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleReviewAction("reject")}
                        className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 px-4.5 py-3 text-xs font-black transition-all"
                      >
                        <XCircle className="size-4" />
                        <span>{isAr ? "رفض الطلب" : "Reject Application"}</span>
                      </button>

                      <button
                        onClick={() => handleReviewAction("approve")}
                        className="flex items-center gap-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 px-6 py-3 text-xs font-black transition-all"
                      >
                        <CheckCircle className="size-4" />
                        <span>{isAr ? "قبول وتخصيص جناح" : "Approve & Provision"}</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
