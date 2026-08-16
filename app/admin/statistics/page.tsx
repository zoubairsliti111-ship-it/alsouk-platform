"use client"

import { useEffect, useState } from "react"
import {
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  Users,
  Building,
  CalendarCheck,
  FileCheck,
  QrCode,
  Clock,
  TrendingUp,
  Globe,
  Layers,
  Award,
  Loader2,
  RefreshCw,
  BarChart3,
  BookmarkCheck
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import type { Exhibition, OrganizerAnalytics } from "@/lib/domains/exhibition/types"

export default function AdminStatisticsPage() {
  const { lang, dir } = useLanguage()
  const isAr = lang === "ar"

  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [exhibitionsLoading, setExhibitionsLoading] = useState<boolean>(true)
  const [selectedExhId, setSelectedExhId] = useState<string>("")
  const [range, setRange] = useState<string>("7days")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [data, setData] = useState<OrganizerAnalytics | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Load exhibitions
  useEffect(() => {
    let active = true
    fetch("/api/exhibitions")
      .then((res) => res.json())
      .then((json) => {
        if (!active) return
        if (json.success && json.data) {
          setExhibitions(json.data)
          if (json.data.length > 0) {
            setSelectedExhId(json.data[0].id)
          }
        }
        // No exhibitions yet: the stats effect below never runs (guarded on
        // selectedExhId), so stop the spinner here instead of hanging forever.
        setExhibitionsLoading(false)
      })
      .catch((err) => {
        console.error("Exhibition load stats error:", err)
        if (!active) return
        setExhibitionsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  // Fetch stats when exhibition or range changes
  useEffect(() => {
    if (!selectedExhId) return
    let active = true

    let url = `/api/exhibitions/analytics/organizer?exhibitionId=${encodeURIComponent(selectedExhId)}&range=${encodeURIComponent(range)}`
    if (range === "custom" && startDate && endDate) {
      url += `&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Server stats failure")
        return res.json()
      })
      .then((json) => {
        if (!active) return
        if (json.success) {
          setData(json.data)
        } else {
          setError(json.error || "Failed to load metrics.")
        }
        setLoading(false)
      })
      .catch((err) => {
        if (!active) return
        console.error("Error loading admin stats:", err)
        setError("Unable to connect to analytics servers.")
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [selectedExhId, range, startDate, endDate])

  const renderTrendChart = (trends: OrganizerAnalytics["trafficTrends"]) => {
    if (!trends || trends.length === 0) return null

    const maxVal = Math.max(...trends.map((t) => t.visitors), 100)
    const chartHeight = 150

    return (
      <div className="relative w-full h-[200px] border border-slate-800 bg-slate-900/40 rounded-[20px] p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold px-2">
          <span>{isAr ? "اتجاه حركة المرور (الزيارات الإجمالية مقابل الزوار الفريدين)" : "Traffic Performance (Total vs Unique)"}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-teal-400" /> {isAr ? "الإجمالي" : "Total"}</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-blue-400" /> {isAr ? "الفريد" : "Unique"}</span>
          </div>
        </div>

        <div className="flex-1 flex items-end gap-3 px-2 pt-4">
          {trends.map((t, idx) => {
            const visitorsHeight = `${(t.visitors / maxVal) * chartHeight}px`
            const uniqueHeight = `${(t.uniqueVisitors / maxVal) * chartHeight}px`
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full flex justify-center items-end gap-1 h-full max-h-[150px]">
                  {/* Total Visitors Bar */}
                  <div
                    style={{ height: visitorsHeight }}
                    className="w-2.5 bg-teal-400 rounded-t-sm transition-all duration-300 hover:opacity-80"
                    title={`Total: ${t.visitors}`}
                  />
                  {/* Unique Visitors Bar */}
                  <div
                    style={{ height: uniqueHeight }}
                    className="w-2.5 bg-blue-400 rounded-t-sm transition-all duration-300 hover:opacity-80"
                    title={`Unique: ${t.uniqueVisitors}`}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-black whitespace-nowrap">{t.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8" dir={dir}>
      {/* HEADER TOOLBAR */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-teal-400 uppercase tracking-widest">
            <BarChart3 className="size-4 shrink-0" />
            <span>{isAr ? "التحليلات والمؤشرات الإستراتيجية" : "B2B Analytics Office"}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight mt-1">
            {isAr ? "إحصائيات المنصة الكلية" : "Platform Performance Indicators"}
          </h2>
          <p className="text-slate-400 text-xs md:text-sm font-semibold mt-1">
            {isAr
              ? "متابعة حركة المرور، ومعدلات تحويل طلبات الأجنحة، واجتماعات التوفيق ومعدلات تنزيل الكتالوجات."
              : "Consolidated system traffic, meeting conversions, catalog downloads, and booth view rankings."}
          </p>
        </div>

        {/* Exhibition Selector */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 shrink-0">
          <span className="text-slate-500">{isAr ? "المعرض التجاري:" : "Exhibition:"}</span>
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

      {/* FILTER RANGE PANEL */}
      <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "today", label: isAr ? "اليوم" : "Today" },
            { id: "7days", label: isAr ? "آخر 7 أيام" : "Last 7 Days" },
            { id: "30days", label: isAr ? "آخر 30 يوماً" : "Last 30 Days" }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setRange(f.id)}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                range === f.id
                  ? "bg-teal-500 text-slate-950 font-black shadow-lg shadow-teal-500/10"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {isAr ? "البيانات يتم تحديثها تلقائياً" : "Updated automatically based on active sessions"}
        </div>
      </div>

      {exhibitionsLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-slate-900/20 border border-slate-800 rounded-2xl">
          <Loader2 className="size-9 text-teal-400 animate-spin" />
          <span className="text-xs font-bold text-slate-400">{isAr ? "جاري تحميل المعارض..." : "Loading exhibitions..."}</span>
        </div>
      ) : exhibitions.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs font-bold text-slate-400">
          {isAr ? "لا يوجد أي معرض تم إنشاؤه بعد." : "No exhibitions have been created yet."}
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-slate-900/20 border border-slate-800 rounded-2xl">
          <Loader2 className="size-9 text-teal-400 animate-spin" />
          <span className="text-xs font-bold text-slate-400">{isAr ? "جاري إنتاج إحصائيات التوفيق المتقدمة..." : "Generating analytics metrics..."}</span>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center text-xs font-bold text-red-400">
          {error}
        </div>
      ) : !data ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs font-bold text-slate-400">
          No data recorded.
        </div>
      ) : !data.hasActivity ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs font-bold text-slate-400 space-y-1.5">
          <p>{isAr ? "لا توجد بيانات مشاركة مسجلة بعد لهذا المعرض." : "No participation data recorded yet for this exhibition."}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {data.isSimulated && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs font-bold text-amber-400">
              ⚠️ {isAr
                ? "أرقام الزيارات، الاجتماعات، طلبات الأسعار، التنزيلات، مسح الرموز، الجغرافيا، واتجاهات الحركة أدناه افتراضية — لا توجد بنية تتبع حقيقية بعد. أعداد الأجنحة والطلبات حقيقية."
                : "Visitor, meeting, RFQ, download, QR-scan, geography and traffic-trend figures below are simulated — no real tracking infrastructure exists yet. Booth and application counts are real."}
            </div>
          )}
          {/* KPI CARDS GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Visitors */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{isAr ? "الزيارات الإجمالية" : "Total Visits"}</span>
              <p className="text-2xl font-black text-slate-100">{data.totalVisitors}</p>
              <p className="text-[10px] font-bold text-slate-400">{data.uniqueVisitors} {isAr ? "فريد" : "Unique Visitors"}</p>
            </div>

            {/* Total Booths */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{isAr ? "الأجنحة" : "Total Booths"}</span>
              <p className="text-2xl font-black text-slate-100">{data.totalBooths}</p>
              <p className="text-[10px] font-bold text-emerald-400">{data.activeBooths} {isAr ? "منشور للعامة" : "Active & Published"}</p>
            </div>

            {/* Total Applications */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{isAr ? "طلبات المشاركة" : "Applications"}</span>
              <p className="text-2xl font-black text-slate-100">{data.approvedApplications + data.pendingApplications + data.rejectedApplications}</p>
              <p className="text-[10px] font-bold text-slate-400">
                <span className="text-yellow-400">{data.pendingApplications} pnd</span> /{" "}
                <span className="text-emerald-400">{data.approvedApplications} app</span>
              </p>
            </div>

            {/* scheduled B2B meetings */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{isAr ? "اجتماعات التوفيق" : "B2B Meetings"}</span>
              <p className="text-2xl font-black text-slate-100">{data.totalMeetings}</p>
              <p className="text-[10px] font-bold text-emerald-400">{data.completedMeetings} {isAr ? "مكتمل" : "Completed"}</p>
            </div>
          </div>

          {/* SECOND KPI CARDS GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total downloads */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{isAr ? "تحميل الكتالوجات" : "Downloads"}</span>
              <p className="text-2xl font-black text-slate-100">{data.totalCatalogDownloads}</p>
              <p className="text-[10px] font-bold text-slate-400">{isAr ? "كتيبات فنية ومواصفات" : "Specs and Catalog PDFs"}</p>
            </div>

            {/* Total RFQs */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{isAr ? "طلبات عرض الأسعار" : "RFQs Submitted"}</span>
              <p className="text-2xl font-black text-slate-100">{data.totalRfqs}</p>
              <p className="text-[10px] font-bold text-slate-400">{isAr ? "موجهة للأجنحة الفاعلة" : "Directed to pavilion booths"}</p>
            </div>

            {/* scans and visit duration */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{isAr ? "مسح الرموز" : "QR Code Scans"}</span>
              <p className="text-2xl font-black text-slate-100">{data.qrScans}</p>
              <p className="text-[10px] font-bold text-slate-400">{isAr ? "تفاعل بطاقات الأعمال" : "Active virtual card exchanges"}</p>
            </div>

            {/* avg session duration */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{isAr ? "متوسط البقاء" : "Avg Session Duration"}</span>
              <p className="text-2xl font-black text-slate-100">{Math.round(data.averageSessionDuration / 60)}m</p>
              <p className="text-[10px] font-bold text-slate-400">{isAr ? "لكل زائر فاعل" : "Per unique visitor"}</p>
            </div>
          </div>

          {/* TRAFFIC PERFORMANCE CHART AND INDUSTRIES LIST */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-base font-black text-slate-200 mb-4">{isAr ? "مخطط حركة الزوار" : "Traffic Trends Map"}</h3>
              {renderTrendChart(data.trafficTrends)}
            </div>

            {/* Category breakdown */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-base font-black text-slate-200 flex items-center gap-2">
                <Layers className="size-4.5 text-teal-400 shrink-0" />
                <span>{isAr ? "توزيع القطاعات" : "Industry Pavilion Mix"}</span>
              </h3>
              <div className="space-y-4">
                {data.topCategories.map((c, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300 truncate max-w-[60%]">{c.name}</span>
                      <span className="text-slate-500">{c.percentage}% ({c.count})</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${c.percentage}%` }}
                        className="h-full bg-teal-400 rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TOP PERFORMING BOOTHS TABLE AND VISITOR ORIGINS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-base font-black text-slate-200 flex items-center gap-2">
                <Award className="size-4.5 text-teal-400 shrink-0" />
                <span>{isAr ? "الأجنحة الأكثر فاعلية" : "Top Ranked Booth Spaces"}</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-bold">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-start">
                      <th className="pb-3 text-start font-black">{isAr ? "الجناح" : "Booth"}</th>
                      <th className="pb-3 text-start font-black">{isAr ? "الشركة" : "Company"}</th>
                      <th className="pb-3 text-center font-black">{isAr ? "الزيارات" : "Views"}</th>
                      <th className="pb-3 text-center font-black">{isAr ? "التفاعل" : "Contacts"}</th>
                      <th className="pb-3 text-end font-black">{isAr ? "التقييم" : "Rating"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topPerformingBooths.map((b, idx) => (
                      <tr key={idx} className="border-b border-slate-800/40 hover:bg-slate-800/30 transition-all">
                        <td className="py-3 text-start font-black text-teal-400">{b.boothNumber}</td>
                        <td className="py-3 text-start text-slate-200">{b.companyName}</td>
                        <td className="py-3 text-center text-slate-400">{b.views}</td>
                        <td className="py-3 text-center text-teal-300 font-extrabold">{b.contacts}</td>
                        <td className="py-3 text-end text-slate-200 font-black">⭐ {b.rating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black text-slate-200 mb-4 flex items-center gap-2">
                  <Globe className="size-4.5 text-teal-400 shrink-0" />
                  <span>{isAr ? "النشاط الجغرافي للزوار" : "Visitor Demographics"}</span>
                </h3>
                <div className="space-y-4">
                  {data.visitorCountries.map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="text-base">
                          {c.code === "TN" ? "🇹🇳" : c.code === "FR" ? "🇫🇷" : c.code === "IT" ? "🇮🇹" : c.code === "DZ" ? "🇩🇿" : "🇱🇾"}
                        </span>
                        <span className="text-slate-300">{c.name}</span>
                      </div>
                      <span className="text-slate-500 font-extrabold">{c.percentage}% ({c.count})</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/60 text-center text-[10px] font-bold text-slate-500 mt-6">
                {isAr ? "تم تحديث البيانات للتواقيع الزمنية الحالية" : "Refreshed based on real-time trade show activity."}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
