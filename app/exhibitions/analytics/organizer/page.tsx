"use client"

import { useEffect, useState } from "react"
import {
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  Users,
  Building2,
  CalendarCheck2,
  FileCheck,
  QrCode,
  Clock,
  TrendingUp,
  Globe2,
  Layers,
  Award,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { MarketplaceShell, Breadcrumbs } from "@/components/marketplace/shell"
import { fetchExhibitions } from "@/lib/services/exhibitions-client"
import type { Exhibition, OrganizerAnalytics } from "@/lib/domains/exhibition/types"

export default function OrganizerAnalyticsPage() {
  return (
    <MarketplaceShell>
      <OrganizerAnalyticsContent />
    </MarketplaceShell>
  )
}

function OrganizerAnalyticsContent() {
  const { t, lang, dir } = useLanguage()

  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [exhibitionsLoading, setExhibitionsLoading] = useState<boolean>(true)
  const [selectedExhId, setSelectedExhId] = useState<string>("")
  const [range, setRange] = useState<string>("7days")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [data, setData] = useState<OrganizerAnalytics | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Load initial exhibitions list
  useEffect(() => {
    let active = true
    fetchExhibitions()
      .then((list) => {
        if (!active) return
        setExhibitions(list)
        if (list.length > 0) {
          setSelectedExhId(list[0].id)
        }
        // No exhibitions yet: nothing for the stats effect below to fetch,
        // so it never runs — stop the spinner here instead of hanging forever.
        setExhibitionsLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load exhibitions:", err)
        if (!active) return
        setError("Could not load exhibitions.")
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

    // Set loading asynchronously to prevent react-hooks/set-state-in-effect warning
    Promise.resolve().then(() => {
      if (active) {
        setLoading(true)
        setError(null)
      }
    })

    let url = `/api/exhibitions/analytics/organizer?exhibitionId=${encodeURIComponent(selectedExhId)}&range=${encodeURIComponent(range)}`
    if (range === "custom" && startDate && endDate) {
      url += `&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Server returned error stats")
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
        console.error("Error loading organizer stats:", err)
        setError("Unable to connect to analytics servers.")
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [selectedExhId, range, startDate, endDate])

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (!selectedExhId) return
    let url = `/api/exhibitions/analytics/export?id=${encodeURIComponent(selectedExhId)}&type=organizer&format=${format}&range=${range}`
    if (range === "custom" && startDate && endDate) {
      url += `&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
    }
    window.open(url, "_blank")
  }

  // Render responsive interactive SVG charts
  const renderTrendChart = (trends: OrganizerAnalytics["trafficTrends"]) => {
    if (!trends || trends.length === 0) return null

    const maxVal = Math.max(...trends.map((t) => t.visitors), 100)
    const padding = 30
    const chartHeight = 150

    return (
      <div className="relative w-full h-[200px] border border-border/60 bg-secondary/10 rounded-[20px] p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold px-2">
          <span>Traffic Trend (Visitors vs. Unique)</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-primary" /> Total</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-blue-400" /> Unique</span>
          </div>
        </div>

        {/* Dynamic visual bars matrix for gorgeous mobile-first responsive scaling */}
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
                    className="w-2.5 bg-primary rounded-t-sm transition-all duration-500 hover:opacity-80"
                    title={`Total: ${t.visitors}`}
                  />
                  {/* Unique Visitors Bar */}
                  <div
                    style={{ height: uniqueHeight }}
                    className="w-2.5 bg-blue-400 rounded-t-sm transition-all duration-500 hover:opacity-80"
                    title={`Unique: ${t.uniqueVisitors}`}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-black whitespace-nowrap">{t.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="pb-16" dir={dir}>
      <Breadcrumbs
        items={[
          { label: t.marketplace.breadcrumbHome, href: "/" },
          { label: t.nav.exhibitions, href: "/exhibitions" },
          { label: "Analytics Selector", href: "/exhibitions/analytics" },
          { label: "Organizer Workspace" },
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header toolbar */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-border pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Organizer Analytics Hub
            </h1>
            <p className="mt-1 text-sm text-muted-foreground font-medium">
              Monitor tradeshow metrics, applicant conversion rates, and visitor insights.
            </p>
          </div>

          {/* Exhibition dropdown */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 bg-card border border-border px-3 py-2 rounded-xl text-xs font-bold text-foreground">
              <span className="text-muted-foreground">Exhibition:</span>
              <select
                value={selectedExhId}
                onChange={(e) => setSelectedExhId(e.target.value)}
                className="bg-transparent font-black focus:outline-none cursor-pointer"
              >
                {exhibitions.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setSelectedExhId(selectedExhId)}
              className="flex size-9 items-center justify-center rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-all"
            >
              <RefreshCw className="size-4" />
            </button>
          </div>
        </div>

        {/* Filter controls & Date picker */}
        <div className="bg-card border border-border p-4 rounded-[20px] mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between shadow-sm">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "today", label: "Today" },
              { id: "7days", label: "Last 7 Days" },
              { id: "30days", label: "Last 30 Days" },
              { id: "custom", label: "Custom Date Range" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setRange(f.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  range === f.id
                    ? "bg-primary text-white shadow-sm"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {range === "custom" && (
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <div className="flex items-center gap-1.5 border border-border bg-secondary/20 p-2 rounded-xl">
                <Calendar className="size-3.5 text-muted-foreground" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent focus:outline-none text-foreground font-semibold"
                />
              </div>
              <span className="text-muted-foreground font-extrabold px-1">to</span>
              <div className="flex items-center gap-1.5 border border-border bg-secondary/20 p-2 rounded-xl">
                <Calendar className="size-3.5 text-muted-foreground" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent focus:outline-none text-foreground font-semibold"
                />
              </div>
            </div>
          )}

          {/* Export action dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleExport("csv")}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card hover:bg-secondary/40 px-3.5 py-2 text-xs font-black text-foreground transition-all"
            >
              <Download className="size-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => handleExport("excel")}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card hover:bg-secondary/40 px-3.5 py-2 text-xs font-black text-foreground transition-all"
            >
              <FileSpreadsheet className="size-3.5 text-emerald-500" />
              <span>Excel</span>
            </button>
            <button
              onClick={() => handleExport("pdf")}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card hover:bg-secondary/40 px-3.5 py-2 text-xs font-black text-foreground transition-all"
            >
              <FileText className="size-3.5 text-rose-500" />
              <span>PDF Report</span>
            </button>
          </div>
        </div>

        {/* Loading and Error States */}
        {exhibitionsLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 bg-card border border-border rounded-[20px]">
            <Loader2 className="size-10 text-primary animate-spin" />
            <span className="text-xs font-black text-muted-foreground">Loading exhibitions...</span>
          </div>
        ) : exhibitions.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground font-bold bg-card border border-border rounded-[20px]">
            No exhibitions have been created yet. Analytics will appear here once one exists.
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 bg-card border border-border rounded-[20px]">
            <Loader2 className="size-10 text-primary animate-spin" />
            <span className="text-xs font-black text-muted-foreground">Generating B2B intelligence data...</span>
          </div>
        ) : error ? (
          <div className="p-12 text-center bg-rose-500/5 border border-rose-500/20 text-rose-600 rounded-[20px] font-black">
            {error}
          </div>
        ) : !data ? (
          <div className="p-12 text-center text-muted-foreground font-bold bg-card border border-border rounded-[20px]">
            No data available for this range.
          </div>
        ) : !data.hasActivity ? (
          <div className="p-12 text-center text-muted-foreground font-bold bg-card border border-border rounded-[20px] space-y-2">
            <p>No participation data recorded yet for this exhibition.</p>
            <p className="text-xs font-semibold">Analytics appear once booths are approved or applications come in.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {data.isSimulated && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs font-bold text-amber-700 dark:text-amber-400">
                ⚠️ Visitor, meeting, RFQ, download, QR-scan, geography and traffic-trend figures below are simulated — no real tracking infrastructure exists yet. Show counts and applications counts are real.
              </div>
            )}
            {/* KPI metrics cards grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {/* Total Exhibitions */}
              <div className="bg-card border border-border/80 p-5 rounded-[20px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase">Total Shows</span>
                  <Award className="size-4 text-primary" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black text-foreground tracking-tight">{data.totalExhibitions}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-bold">In-system tradeshows</div>
                </div>
              </div>

              {/* Total Booths */}
              <div className="bg-card border border-border/80 p-5 rounded-[20px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase">Total Booths</span>
                  <Building2 className="size-4 text-blue-500" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black text-foreground tracking-tight">{data.totalBooths}</div>
                  <div className="text-[10px] text-emerald-500 font-black mt-0.5">{data.activeBooths} published</div>
                </div>
              </div>

              {/* Applications conversion */}
              <div className="bg-card border border-border/80 p-5 rounded-[20px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase">Applications</span>
                  <FileCheck className="size-4 text-amber-500" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black text-foreground tracking-tight">
                    {data.approvedApplications + data.pendingApplications + data.rejectedApplications}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-bold">
                    <span className="text-amber-500 font-extrabold">{data.pendingApplications} pend.</span> /{" "}
                    <span className="text-emerald-500 font-extrabold">{data.approvedApplications} appr.</span>
                  </div>
                </div>
              </div>

              {/* Total Visitors */}
              <div className="bg-card border border-border/80 p-5 rounded-[20px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase">Total Visitors</span>
                  <Users className="size-4 text-indigo-500" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black text-foreground tracking-tight">{data.totalVisitors}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-bold">{data.uniqueVisitors} unique views</div>
                </div>
              </div>

              {/* Scheduled B2B Meetings */}
              <div className="bg-card border border-border/80 p-5 rounded-[20px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase">B2B Meetings</span>
                  <CalendarCheck2 className="size-4 text-emerald-500" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black text-foreground tracking-tight">{data.totalMeetings}</div>
                  <div className="text-[10px] text-emerald-500 mt-0.5 font-black">
                    {data.completedMeetings} completed
                  </div>
                </div>
              </div>

              {/* Total RFQs Submitted */}
              <div className="bg-card border border-border/80 p-5 rounded-[20px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase">RFQs Posted</span>
                  <TrendingUp className="size-4 text-teal-500" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black text-foreground tracking-tight">{data.totalRfqs}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-bold">Assigned to booths</div>
                </div>
              </div>

              {/* Catalog downloads */}
              <div className="bg-card border border-border/80 p-5 rounded-[20px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase">Downloads</span>
                  <Download className="size-4 text-rose-500" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black text-foreground tracking-tight">{data.totalCatalogDownloads}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-bold">Catalog spec sheets</div>
                </div>
              </div>

              {/* QR Scans and session duration */}
              <div className="bg-card border border-border/80 p-5 rounded-[20px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase">Scan / Session</span>
                  <QrCode className="size-4 text-purple-500" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black text-foreground tracking-tight">{data.qrScans} scans</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-bold flex items-center gap-1">
                    <Clock className="size-3 text-muted-foreground shrink-0" />
                    <span>{Math.round(data.averageSessionDuration / 60)}m avg visit</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Traffic Trends Chart */}
              <div className="lg:col-span-2 bg-card border border-border p-6 rounded-[20px] shadow-sm">
                <h3 className="text-base font-black text-foreground mb-4">Traffic Performance Trends</h3>
                {renderTrendChart(data.trafficTrends)}
              </div>

              {/* Categories breakdown list */}
              <div className="bg-card border border-border p-6 rounded-[20px] shadow-sm">
                <h3 className="text-base font-black text-foreground mb-4 flex items-center gap-1.5">
                  <Layers className="size-4 text-primary shrink-0" />
                  <span>Top Industries</span>
                </h3>
                <div className="space-y-4">
                  {data.topCategories.map((c, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-black">
                        <span className="text-foreground">{c.name}</span>
                        <span className="text-muted-foreground">{c.percentage}% ({c.count} booths)</span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          style={{ width: `${c.percentage}%` }}
                          className="h-full bg-primary rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Geographical origin & Top Performing Booths tables grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Top performing booths */}
              <div className="lg:col-span-2 bg-card border border-border p-6 rounded-[20px] shadow-sm">
                <h3 className="text-base font-black text-foreground mb-4 flex items-center gap-1.5">
                  <Award className="size-4 text-emerald-500 shrink-0" />
                  <span>Top Performing Pavilion Booths</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-bold">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-start">
                        <th className="pb-3 text-start font-black">Booth</th>
                        <th className="pb-3 text-start font-black">Exhibitor Company</th>
                        <th className="pb-3 text-center font-black">Views</th>
                        <th className="pb-3 text-center font-black">Contacts</th>
                        <th className="pb-3 text-end font-black">Avg Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topPerformingBooths.map((b, idx) => (
                        <tr key={idx} className="border-b border-border/40 hover:bg-secondary/20 transition-all">
                          <td className="py-3 text-start font-black text-primary">{b.boothNumber}</td>
                          <td className="py-3 text-start text-foreground">{b.companyName}</td>
                          <td className="py-3 text-center text-muted-foreground">{b.views}</td>
                          <td className="py-3 text-center text-emerald-600 font-extrabold">{b.contacts}</td>
                          <td className="py-3 text-end text-foreground font-black">⭐ {b.rating}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Geographic Country origins */}
              <div className="bg-card border border-border p-6 rounded-[20px] shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black text-foreground mb-4 flex items-center gap-1.5">
                    <Globe2 className="size-4 text-primary shrink-0" />
                    <span>Visitor Geographical Origin</span>
                  </h3>
                  <div className="space-y-4">
                    {data.visitorCountries.map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-xs font-black">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {c.code === "TN" ? "🇹🇳" : c.code === "FR" ? "🇫🇷" : c.code === "IT" ? "🇮🇹" : c.code === "DZ" ? "🇩🇿" : "🇱🇾"}
                          </span>
                          <span className="text-foreground">{c.name}</span>
                        </div>
                        <span className="text-muted-foreground">{c.percentage}% ({c.count} visits)</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/40 text-center text-[10px] font-bold text-muted-foreground">
                  Refreshed automatically based on active sessions.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
