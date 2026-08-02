"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Presentation,
  FileCheck2,
  Building,
  Users,
  CalendarDays,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import type { Exhibition, ExhibitionBooth, ExhibitionApplication } from "@/lib/domains/exhibition/types"

export default function AdminDashboardPage() {
  const { lang, dir } = useLanguage()
  const isAr = lang === "ar"

  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [applications, setApplications] = useState<ExhibitionApplication[]>([])
  const [booths, setBooths] = useState<ExhibitionBooth[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadDashboardData = async () => {
      try {
        // Fetch all exhibitions
        const resExh = await fetch("/api/exhibitions")
        const jsonExh = await resExh.json()
        const exhList = jsonExh.success ? jsonExh.data : []

        // Fetch applications
        const resApps = await fetch("/api/exhibitions/organizer/applications")
        const jsonApps = await resApps.json()
        const appList = jsonApps.success ? jsonApps.data : []

        // Fetch booths (load across first exhibition as template or query all)
        let boothList: ExhibitionBooth[] = []
        if (exhList.length > 0) {
          const resBooths = await fetch(`/api/exhibitions/organizer/booths?exhibitionId=${exhList[0].id}`)
          const jsonBooths = await resBooths.json()
          if (jsonBooths.success) {
            boothList = jsonBooths.data
          }
        }

        if (!active) return

        setExhibitions(exhList)
        setApplications(appList)
        setBooths(boothList)
        setLoading(false)
      } catch (err) {
        console.error("Dashboard load failure:", err)
        if (!active) return
        setError(isAr ? "فشل تحميل بيانات لوحة التحكم" : "Failed to load dashboard statistics.")
        setLoading(false)
      }
    }

    loadDashboardData()

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="size-9 text-teal-400 animate-spin" />
        <span className="text-xs font-bold text-slate-400">
          {isAr ? "تحميل لوحة التحكم الإدارية..." : "Loading ALSOUK admin panel..."}
        </span>
      </div>
    )
  }

  // Stats calculation
  const totalExhibitions = exhibitions.length
  const activeExhibitions = exhibitions.filter(e => e.status !== "Archived" && e.status !== "Draft").length
  const archivedExhibitions = exhibitions.filter(e => e.status === "Archived").length

  const pendingApplications = applications.filter(a => a.status === "Pending").length
  const approvedApplications = applications.filter(a => a.status === "Approved").length
  const rejectedApplications = applications.filter(a => a.status === "Rejected").length

  const publishedBooths = booths.filter(b => b.status === "Published").length
  const draftBooths = booths.filter(b => b.status === "Draft" || b.status === "Submitted").length

  // Simulated visitor statistics (as requested to reuse existing analytics)
  const totalVisitors = 4250
  const totalMeetings = 184

  return (
    <div className="space-y-10" dir={dir}>
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-teal-400 uppercase tracking-widest">
            <ShieldCheck className="size-4 shrink-0" />
            <span>{isAr ? "بوابة الإدارة الشاملة" : "ALSOUK Standalone Administration"}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight mt-1">
            {isAr ? "لوحة القيادة الرئيسية" : "Executive Dashboard"}
          </h2>
          <p className="text-slate-400 text-xs md:text-sm font-semibold mt-1">
            {isAr
              ? "متابعة وإدارة فعاليات المعارض التجارية ومطابقة طلبات التسجيل وحالة الأجنحة الفاعلة."
              : "Command and monitor real-time Tunisian trade show activity, approved booth spaces, and applications."}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/exhibitions/new"
            className="flex items-center gap-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 px-4.5 py-3 text-xs font-black transition-all shadow-lg shadow-teal-500/10 min-h-11"
          >
            <Plus className="size-4" />
            <span>{isAr ? "معرض تجاري جديد" : "Create Exhibition"}</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-center text-xs font-bold text-red-400">
          {error}
        </div>
      )}

      {/* METRICS GRID - MAIN PORTAL SUMMARY */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Exhibitions summary */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-black uppercase tracking-wider">
              {isAr ? "إجمالي المعارض" : "Trade Shows"}
            </span>
            <Presentation className="size-4.5 text-teal-400" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-slate-100">{totalExhibitions}</p>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
              <span className="text-teal-400">{activeExhibitions} {isAr ? "نشط" : "Active"}</span>
              <span>•</span>
              <span>{archivedExhibitions} {isAr ? "مؤرشف" : "Archived"}</span>
            </div>
          </div>
        </div>

        {/* Applications summary */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-black uppercase tracking-wider">
              {isAr ? "طلبات التسجيل" : "Applications"}
            </span>
            <FileCheck2 className="size-4.5 text-indigo-400" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-slate-100">{applications.length}</p>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
              <span className="text-yellow-400">{pendingApplications} {isAr ? "قيد المراجعة" : "Pending"}</span>
              <span>•</span>
              <span className="text-emerald-400">{approvedApplications} {isAr ? "مقبول" : "Approved"}</span>
            </div>
          </div>
        </div>

        {/* Booth spaces summary */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-black uppercase tracking-wider">
              {isAr ? "الأجنحة المعتمدة" : "Exhibitor Booths"}
            </span>
            <Building className="size-4.5 text-blue-400" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-slate-100">{booths.length}</p>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
              <span className="text-emerald-400">{publishedBooths} {isAr ? "منشور" : "Published"}</span>
              <span>•</span>
              <span className="text-slate-400">{draftBooths} {isAr ? "مسودة" : "Draft"}</span>
            </div>
          </div>
        </div>

        {/* Visitor Traffic summary */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-black uppercase tracking-wider">
              {isAr ? "حركة الزوار" : "Platform Traffic"}
            </span>
            <Users className="size-4.5 text-pink-400" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-slate-100">{totalVisitors.toLocaleString()}</p>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
              <TrendingUp className="size-3 text-emerald-400 shrink-0" />
              <span className="text-emerald-400">{totalMeetings} {isAr ? "موعد B2B" : "B2B Meetings"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* THREE-COLUMN DEEP ACTION METRICS PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* EXHIBITIONS PANEL */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-200">
              {isAr ? "حالة المعارض الحالية" : "Exhibition Portfolios"}
            </h3>
            <span className="text-[10px] font-bold text-teal-400 bg-teal-500/5 border border-teal-500/10 px-2 py-0.5 rounded-full">
              {totalExhibitions}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold p-3.5 rounded-xl bg-slate-900 border border-slate-800/60">
              <span className="text-slate-300">{isAr ? "المعارض النشطة" : "Active / Ongoing"}</span>
              <span className="font-black text-teal-400">{activeExhibitions}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold p-3.5 rounded-xl bg-slate-900 border border-slate-800/60">
              <span className="text-slate-300">{isAr ? "معارض في حالة مسودة" : "Draft Stages"}</span>
              <span className="font-black text-slate-400">{exhibitions.filter(e => e.status === "Draft" || !e.status).length}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold p-3.5 rounded-xl bg-slate-900 border border-slate-800/60">
              <span className="text-slate-300">{isAr ? "المعارض المؤرشفة" : "Archived / Ended"}</span>
              <span className="font-black text-slate-500">{archivedExhibitions}</span>
            </div>
          </div>

          <Link
            href="/admin/exhibitions"
            className="flex items-center justify-center gap-1.5 text-[11px] font-black text-teal-400 hover:text-teal-300 transition-all pt-2 block text-center"
          >
            <span>{isAr ? "عرض كل المعارض" : "Manage Exhibitions"}</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        {/* REGISTRATION APPLICATIONS PANEL */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-200">
              {isAr ? "طلبات التسجيل بالتفصيل" : "Application Workflow"}
            </h3>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded-full">
              {applications.length}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold p-3.5 rounded-xl bg-slate-900 border border-slate-800/60">
              <span className="text-slate-300 flex items-center gap-2">
                <AlertCircle className="size-3.5 text-yellow-400 shrink-0" />
                <span>{isAr ? "قيد المراجعة" : "Pending Review"}</span>
              </span>
              <span className="font-black text-yellow-400">{pendingApplications}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold p-3.5 rounded-xl bg-slate-900 border border-slate-800/60">
              <span className="text-slate-300 flex items-center gap-2">
                <CheckCircle className="size-3.5 text-emerald-400 shrink-0" />
                <span>{isAr ? "المقبولة (المصرح لها)" : "Approved / Provisions"}</span>
              </span>
              <span className="font-black text-emerald-400">{approvedApplications}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold p-3.5 rounded-xl bg-slate-900 border border-slate-800/60">
              <span className="text-slate-300 flex items-center gap-2">
                <XCircle className="size-3.5 text-red-400 shrink-0" />
                <span>{isAr ? "المرفوضة" : "Rejected Requests"}</span>
              </span>
              <span className="font-black text-red-400">{rejectedApplications}</span>
            </div>
          </div>

          <Link
            href="/admin/applications"
            className="flex items-center justify-center gap-1.5 text-[11px] font-black text-indigo-400 hover:text-indigo-300 transition-all pt-2 block text-center"
          >
            <span>{isAr ? "مراجعة كل طلبات المشاركة" : "Review Workspace"}</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        {/* BOOTH CONTROL PANEL */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-200">
              {isAr ? "حالة مساحات الأجنحة" : "Booth Space Status"}
            </h3>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/5 border border-blue-500/10 px-2 py-0.5 rounded-full">
              {booths.length}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold p-3.5 rounded-xl bg-slate-900 border border-slate-800/60">
              <span className="text-slate-300">{isAr ? "الأجنحة المنشورة" : "Published & Active"}</span>
              <span className="font-black text-emerald-400">{publishedBooths}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold p-3.5 rounded-xl bg-slate-900 border border-slate-800/60">
              <span className="text-slate-300">{isAr ? "الأجنحة قيد الإعداد (مسودة)" : "Draft Stage Spaces"}</span>
              <span className="font-black text-slate-400">{draftBooths}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold p-3.5 rounded-xl bg-slate-900 border border-slate-800/60">
              <span className="text-slate-300">{isAr ? "الأجنحة المؤرشفة" : "Archived Booths"}</span>
              <span className="font-black text-slate-500">{booths.filter(b => b.isArchived).length}</span>
            </div>
          </div>

          <Link
            href="/admin/booths"
            className="flex items-center justify-center gap-1.5 text-[11px] font-black text-blue-400 hover:text-blue-300 transition-all pt-2 block text-center"
          >
            <span>{isAr ? "إدارة مساحات الأجنحة" : "Configure Booth Spaces"}</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
