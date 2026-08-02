"use client"

import { useEffect, useState } from "react"
import {
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  Users,
  Eye,
  CalendarDays,
  FolderDown,
  PhoneCall,
  Mail,
  ExternalLink,
  Percent,
  TrendingUp,
  QrCode,
  Image as ImageIcon,
  Video,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { MarketplaceShell, Breadcrumbs } from "@/components/marketplace/shell"
import type { ExhibitorAnalytics } from "@/lib/domains/exhibition/types"

export default function ExhibitorAnalyticsPage() {
  return (
    <MarketplaceShell>
      <ExhibitorAnalyticsContent />
    </MarketplaceShell>
  )
}

function ExhibitorAnalyticsContent() {
  const { t, lang, dir } = useLanguage()

  const [selectedBoothId, setSelectedBoothId] = useState<string>("booth-medina")
  const [range, setRange] = useState<string>("7days")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [data, setData] = useState<ExhibitorAnalytics | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const boothsList = [
    { id: "booth-medina", name: "Medina Olive Co. (Booth A-01)" },
    { id: "booth-sahara", name: "Sahara Dates Export (Booth A-02)" },
    { id: "booth-carthage", name: "Carthage Textiles (Booth B-15)" },
  ]

  // Fetch stats when booth or range changes
  useEffect(() => {
    let active = true

    // Set loading asynchronously to prevent react-hooks/set-state-in-effect warning
    Promise.resolve().then(() => {
      if (active) {
        setLoading(true)
        setError(null)
      }
    })

    let url = `/api/exhibitions/analytics/exhibitor?boothId=${encodeURIComponent(selectedBoothId)}&range=${encodeURIComponent(range)}`
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
        console.error("Error loading exhibitor stats:", err)
        setError("Unable to connect to analytics servers.")
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [selectedBoothId, range, startDate, endDate])

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    let url = `/api/exhibitions/analytics/export?id=${encodeURIComponent(selectedBoothId)}&type=exhibitor&format=${format}&range=${range}`
    if (range === "custom" && startDate && endDate) {
      url += `&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
    }
    window.open(url, "_blank")
  }

  // Render traffic trends line/area charts
  const renderExhibitorTrend = (trends: ExhibitorAnalytics["trafficTrends"]) => {
    if (!trends || trends.length === 0) return null

    const maxVal = Math.max(...trends.map((t) => t.views), 100)
    const padding = 30
    const chartHeight = 150

    return (
      <div className="relative w-full h-[200px] border border-border/60 bg-secondary/10 rounded-[20px] p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold px-2">
          <span>Views Trends (Total Views vs Unique)</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500" /> Views</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-indigo-400" /> Unique</span>
          </div>
        </div>

        {/* Dynamic visual bars matrix for gorgeous mobile-first responsive scaling */}
        <div className="flex-1 flex items-end gap-3 px-2 pt-4">
          {trends.map((t, idx) => {
            const viewsHeight = `${(t.views / maxVal) * chartHeight}px`
            const uniqueHeight = `${(t.unique / maxVal) * chartHeight}px`
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full flex justify-center items-end gap-1 h-full max-h-[150px]">
                  {/* Total Views Bar */}
                  <div
                    style={{ height: viewsHeight }}
                    className="w-2.5 bg-emerald-500 rounded-t-sm transition-all duration-500 hover:opacity-80"
                    title={`Views: ${t.views}`}
                  />
                  {/* Unique Views Bar */}
                  <div
                    style={{ height: uniqueHeight }}
                    className="w-2.5 bg-indigo-400 rounded-t-sm transition-all duration-500 hover:opacity-80"
                    title={`Unique: ${t.unique}`}
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
          { label: "Exhibitor Dashboard" },
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header Toolbar */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-border pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Exhibitor Analytics Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground font-medium">
              Analyze booth engagement levels, exhibit performance, and buyer clicks.
            </p>
          </div>

          {/* Booth Selection dropdown */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 bg-card border border-border px-3 py-2 rounded-xl text-xs font-bold text-foreground">
              <span className="text-muted-foreground">My Booth:</span>
              <select
                value={selectedBoothId}
                onChange={(e) => setSelectedBoothId(e.target.value)}
                className="bg-transparent font-black focus:outline-none cursor-pointer"
              >
                {boothsList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setSelectedBoothId(selectedBoothId)}
              className="flex size-9 items-center justify-center rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-all"
            >
              <RefreshCw className="size-4" />
            </button>
          </div>
        </div>

        {/* Filters controls & Date picker */}
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
                    ? "bg-emerald-600 text-white shadow-sm"
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

          {/* Export action buttons */}
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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 bg-card border border-border rounded-[20px]">
            <Loader2 className="size-10 text-emerald-600 animate-spin" />
            <span className="text-xs font-black text-muted-foreground">Aggregating booth tracking data...</span>
          </div>
        ) : error ? (
          <div className="p-12 text-center bg-rose-500/5 border border-rose-500/20 text-rose-600 rounded-[20px] font-black">
            {error}
          </div>
        ) : !data ? (
          <div className="p-12 text-center text-muted-foreground font-bold bg-card border border-border rounded-[20px]">
            No data available for this range.
          </div>
        ) : (
          <div className="space-y-8">
            {/* KPI overview grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {/* Booth views */}
              <div className="bg-card border border-border/80 p-5 rounded-[20px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase">Booth Views</span>
                  <Eye className="size-4 text-emerald-500" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black text-foreground tracking-tight">{data.boothViews}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-bold">{data.uniqueVisitors} unique views</div>
                </div>
              </div>

              {/* Exhibit views */}
              <div className="bg-card border border-border/80 p-5 rounded-[20px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase">Exhibit Views</span>
                  <TrendingUp className="size-4 text-indigo-500" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black text-foreground tracking-tight">{data.exhibitViews}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-bold">Total item detail clicks</div>
                </div>
              </div>

              {/* Catalog downloads */}
              <div className="bg-card border border-border/80 p-5 rounded-[20px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase">Downloads</span>
                  <FolderDown className="size-4 text-blue-500" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black text-foreground tracking-tight">{data.catalogDownloads}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-bold">PDF spec sheet clicks</div>
                </div>
              </div>

              {/* QR Scans */}
              <div className="bg-card border border-border/80 p-5 rounded-[20px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase">QR Scans</span>
                  <QrCode className="size-4 text-purple-500" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black text-foreground tracking-tight">{data.qrScans}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-bold">From device cameras</div>
                </div>
              </div>

              {/* RFQs Received */}
              <div className="bg-card border border-border/80 p-5 rounded-[20px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase">RFQs Received</span>
                  <FileSpreadsheet className="size-4 text-teal-500" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black text-foreground tracking-tight">{data.rfqsReceived}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-bold">Targeted RFQ submissions</div>
                </div>
              </div>

              {/* B2B Meeting Requests */}
              <div className="bg-card border border-border/80 p-5 rounded-[20px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase">B2B Meetings</span>
                  <CalendarDays className="size-4 text-amber-500" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black text-foreground tracking-tight">{data.meetingRequests} reqs</div>
                  <div className="text-[10px] text-emerald-500 font-black mt-0.5">{data.completedMeetings} completed</div>
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="bg-card border border-border/80 p-5 rounded-[20px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase">Conversion</span>
                  <Percent className="size-4 text-emerald-600" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black text-foreground tracking-tight">{data.conversionRate}%</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-bold">Clicks & meetings vs visits</div>
                </div>
              </div>

              {/* Gallery & Video views */}
              <div className="bg-card border border-border/80 p-5 rounded-[20px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase">Media Views</span>
                  <ImageIcon className="size-4 text-rose-500" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black text-foreground tracking-tight">
                    {data.galleryViews + data.videoViews}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-bold">
                    {data.galleryViews} gallery / {data.videoViews} videos
                  </div>
                </div>
              </div>
            </div>

            {/* Charts & Trends layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Traffic Chart */}
              <div className="lg:col-span-2 bg-card border border-border p-6 rounded-[20px] shadow-sm">
                <h3 className="text-base font-black text-foreground mb-4">Traffic Performance Trends</h3>
                {renderExhibitorTrend(data.trafficTrends)}
              </div>

              {/* Click conversions breakdown */}
              <div className="bg-card border border-border p-6 rounded-[20px] shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black text-foreground mb-4">Buyer Action Clicks</h3>
                  <div className="space-y-4">
                    {/* WhatsApp */}
                    <div className="flex items-center justify-between text-xs font-bold border-b border-border/40 pb-3">
                      <div className="flex items-center gap-2">
                        <PhoneCall className="size-4 text-emerald-500 shrink-0" />
                        <span className="text-foreground">WhatsApp Inquiries</span>
                      </div>
                      <span className="text-foreground font-black">{data.whatsAppClicks} clicks</span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center justify-between text-xs font-bold border-b border-border/40 pb-3">
                      <div className="flex items-center gap-2">
                        <Mail className="size-4 text-blue-500 shrink-0" />
                        <span className="text-foreground">Email Inquiries</span>
                      </div>
                      <span className="text-foreground font-black">{data.emailClicks} clicks</span>
                    </div>

                    {/* Website */}
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="size-4 text-indigo-500 shrink-0" />
                        <span className="text-foreground">Website Referrals</span>
                      </div>
                      <span className="text-foreground font-black">{data.websiteClicks} clicks</span>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/20 p-3.5 rounded-xl text-[10px] text-muted-foreground leading-relaxed font-bold mt-6">
                  💡 High WhatsApp clicks suggest strong immediate sourcing interest. Complete more catalogs to boost conversion!
                </div>
              </div>
            </div>

            {/* Exhibits performance list table */}
            <div className="bg-card border border-border p-6 rounded-[20px] shadow-sm">
              <h3 className="text-base font-black text-foreground mb-4 flex items-center gap-1.5">
                <Eye className="size-4 text-indigo-500 shrink-0" />
                <span>Indivudal Exhibit Performance Metrics</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-bold">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-start">
                      <th className="pb-3 text-start font-black">Exhibit Content ID</th>
                      <th className="pb-3 text-start font-black">Exhibit Name</th>
                      <th className="pb-3 text-center font-black">Total Views</th>
                      <th className="pb-3 text-end font-black">Spec Sheet Downloads</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.exhibitsPerformance.map((ex, idx) => (
                      <tr key={idx} className="border-b border-border/40 hover:bg-secondary/20 transition-all">
                        <td className="py-3 text-start font-black text-muted-foreground">{ex.id}</td>
                        <td className="py-3 text-start text-foreground">{ex.name}</td>
                        <td className="py-3 text-center text-foreground font-black">{ex.views}</td>
                        <td className="py-3 text-end text-emerald-600 font-extrabold">{ex.downloads} files</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
