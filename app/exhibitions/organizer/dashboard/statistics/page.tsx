"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import {
  Loader2,
  AlertCircle,
  BarChart3,
  Calendar,
  Globe,
  Award,
  ArrowLeft,
  Building2,
  PieChart,
  TrendingUp,
  Mail,
  Eye,
  MessageSquare
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { MarketplaceShell, Breadcrumbs, ListingHeader } from "@/components/marketplace/shell"

const dict = {
  en: {
    title: "Trade Show Analytics",
    subtitle: "Consolidated performance statistics for exhibitor participation, country demographics, focus category weight, and most visited booth leaderboards.",
    back: "Back to Control Center",
    loading: "Computing analytics metrics...",
    errorLoad: "Failed to load statistics.",
    appSection: "Applications Distribution",
    boothSection: "Virtual Booth visibility",
    countrySection: "Participant Origin Countries",
    categorySection: "Exhibited Sectors Weight",
    leaderboardSection: "Top Performing Booths",
    viewsLabel: "Page Views",
    contactsLabel: "B2B Messages",
    totalLabel: "Total Records",
    approved: "Approved Applications",
    rejected: "Rejected Applications",
    pending: "Pending Review",
    published: "Published Live Booths",
    draft: "Draft / Offline Booths",
    archived: "Archived Booths",
    emptyStats: "No participation statistics recorded yet.",
    rank: "Rank",
    boothNo: "Booth"
  },
  fr: {
    title: "Analyses & Statistiques",
    subtitle: "Rapports d'activité consolidés concernant les exposants, les pays d'origine, le poids des secteurs d'activité et l'engagement des visiteurs.",
    back: "Retour au tableau de bord",
    loading: "Calcul des statistiques en cours...",
    errorLoad: "Impossible de charger les rapports.",
    appSection: "Répartition des Candidatures",
    boothSection: "État des Stands Virtuels",
    countrySection: "Pays d'Origine des Participants",
    categorySection: "Poids des Secteurs Exposés",
    leaderboardSection: "Stands les Plus Populaires",
    viewsLabel: "Vues",
    contactsLabel: "Messages B2B",
    totalLabel: "Total des Dossiers",
    approved: "Candidatures Approuvées",
    rejected: "Candidatures Refusées",
    pending: "Candidatures en Attente",
    published: "Stands en Ligne",
    draft: "Stands Hors Ligne / Brouillons",
    archived: "Stands Archivés",
    emptyStats: "Aucune donnée statistique enregistrée.",
    rank: "Rang",
    boothNo: "Stand"
  },
  ar: {
    title: "تحليلات وإحصاءات المعرض",
    subtitle: "إحصاءات الأداء الموحدة لمشاركات العارضين، التوزع الديموغرافي للدول، نسب الفئات المستهدفة، وقائمة الأجنحة الأكثرEngaged.",
    back: "العودة إلى لوحة التحكم",
    loading: "جاري حساب التحليلات والإحصاءات...",
    errorLoad: "فشل تحميل التقارير الإحصائية.",
    appSection: "توزع طلبات التقديم",
    boothSection: "حالة ظهور الأجنحة",
    countrySection: "دول منشأ المشاركين",
    categorySection: "وزن ونسب قطاعات العرض",
    leaderboardSection: "الأجنحة الأكثرEngaged وتفاعلاً",
    viewsLabel: "مشاهدات",
    contactsLabel: "رسائل B2B",
    totalLabel: "إجمالي السجلات",
    approved: "الطلبات المقبولة",
    rejected: "الطلبات المرفوضة",
    pending: "طلبات قيد المراجعة",
    published: "الأجنحة المنشورة مباشرة",
    draft: "أجنحة مسودة/غير متصلة",
    archived: "الأجنحة المؤرشفة",
    emptyStats: "لا توجد أي بيانات إحصائية مسجلة حتى الآن.",
    rank: "المرتبة",
    boothNo: "الجناح"
  }
}

export default function StatisticsPage() {
  return (
    <MarketplaceShell>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
          </div>
        }
      >
        <StatisticsContent />
      </Suspense>
    </MarketplaceShell>
  )
}

function StatisticsContent() {
  const { lang, dir, t } = useLanguage()
  const d = dict[lang] || dict.en
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any | null>(null)

  useEffect(() => {
    let active = true
    fetch("/api/exhibitions/organizer/statistics")
      .then((res) => res.json())
      .then((json) => {
        if (!active) return
        if (json.success && json.data) {
          setStats(json.data)
        } else {
          setError(json.error || d.errorLoad)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch analytics statistics:", err)
        if (!active) return
        setError(d.errorLoad)
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [d.errorLoad])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3" dir={dir}>
        <Loader2 className="size-9 text-primary animate-spin" />
        <span className="text-xs font-bold text-muted-foreground">{d.loading}</span>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center space-y-6" dir={dir}>
        <div className="rounded-[20px] border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4">
          <AlertCircle className="size-10 text-destructive mx-auto" />
          <p className="text-sm font-bold text-foreground">{error || d.errorLoad}</p>
        </div>
        <button
          onClick={() => router.push("/exhibitions/organizer/dashboard")}
          className="rounded-xl bg-secondary hover:bg-secondary/80 text-foreground px-5 py-3 text-xs font-black"
        >
          {d.back}
        </button>
      </div>
    )
  }

  // Calculate percentages for beautiful progress meters
  const appsTotal = stats.applications.total || 1
  const appApprovedPct = Math.round((stats.applications.approved / appsTotal) * 100)
  const appRejectedPct = Math.round((stats.applications.rejected / appsTotal) * 100)
  const appPendingPct = Math.round((stats.applications.pending / appsTotal) * 100)

  const boothsTotal = stats.booths.total || 1
  const boothPublishedPct = Math.round((stats.booths.published / boothsTotal) * 100)
  const boothDraftPct = Math.round((stats.booths.draft / boothsTotal) * 100)
  const boothArchivedPct = Math.round((stats.booths.archived / boothsTotal) * 100)

  return (
    <div className="pb-16" dir={dir}>
      <Breadcrumbs
        items={[
          { label: t.marketplace.breadcrumbHome, href: "/" },
          { label: "Exhibitions", href: "/exhibitions" },
          { label: lang === "ar" ? "مركز تحكم المنظم" : "Organizer Control Center", href: "/exhibitions/organizer/dashboard" },
          { label: d.title }
        ]}
      />

      <div className="mx-auto max-w-5xl px-4 py-8 text-start">
        {/* Navigation back */}
        <button
          onClick={() => router.push("/exhibitions/organizer/dashboard")}
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-black text-primary hover:underline cursor-pointer"
        >
          <ArrowLeft className={`size-4 shrink-0 ${dir === "rtl" ? "rotate-180" : ""}`} />
          <span>{d.back}</span>
        </button>

        <ListingHeader title={d.title} subtitle={d.subtitle} />

        {/* Analytics Breakdown Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Application Distributions Card */}
          <div className="rounded-[20px] border border-border bg-card p-6 md:p-8 space-y-6">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <TrendingUp className="size-5 text-primary shrink-0" />
              <span>{d.appSection}</span>
            </h3>

            <div className="space-y-4">
              {/* Total Card */}
              <div className="bg-secondary p-4 rounded-xl flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground">{d.totalLabel}</span>
                <span className="text-2xl font-black text-foreground">{stats.applications.total}</span>
              </div>

              {/* Progress meters */}
              <div className="space-y-3 pt-2">
                {/* Approved */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-foreground">
                    <span>{d.approved}</span>
                    <span>{stats.applications.approved} ({appApprovedPct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${appApprovedPct}%` }} />
                  </div>
                </div>

                {/* Pending */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-foreground">
                    <span>{d.pending}</span>
                    <span>{stats.applications.pending} ({appPendingPct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${appPendingPct}%` }} />
                  </div>
                </div>

                {/* Rejected */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-foreground">
                    <span>{d.rejected}</span>
                    <span>{stats.applications.rejected} ({appRejectedPct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${appRejectedPct}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Booth visibility states Card */}
          <div className="rounded-[20px] border border-border bg-card p-6 md:p-8 space-y-6">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <PieChart className="size-5 text-primary shrink-0" />
              <span>{d.boothSection}</span>
            </h3>

            <div className="space-y-4">
              {/* Total Card */}
              <div className="bg-secondary p-4 rounded-xl flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground">{d.totalLabel}</span>
                <span className="text-2xl font-black text-foreground">{stats.booths.total}</span>
              </div>

              {/* Progress meters */}
              <div className="space-y-3 pt-2">
                {/* Published */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-foreground">
                    <span>{d.published}</span>
                    <span>{stats.booths.published} ({boothPublishedPct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${boothPublishedPct}%` }} />
                  </div>
                </div>

                {/* Draft / offline */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-foreground">
                    <span>{d.draft}</span>
                    <span>{stats.booths.draft} ({boothDraftPct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${boothDraftPct}%` }} />
                  </div>
                </div>

                {/* Archived */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-foreground">
                    <span>{d.archived}</span>
                    <span>{stats.booths.archived} ({boothArchivedPct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${boothArchivedPct}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Demographic origins (Country) */}
          <div className="rounded-[20px] border border-border bg-card p-6 md:p-8 space-y-5">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <Globe className="size-5 text-primary shrink-0" />
              <span>{d.countrySection}</span>
            </h3>

            <div className="divide-y divide-border/50">
              {stats.countries.map((c: any) => (
                <div key={c.code} className="py-3 flex justify-between items-center text-xs font-semibold text-muted-foreground">
                  <span className="text-foreground font-black">
                    {c.code === "TN" ? "Tunisia (🇹🇳)" : c.name}
                  </span>
                  <span className="bg-secondary px-2.5 py-1 rounded-lg text-foreground font-black">
                    {c.count}
                  </span>
                </div>
              ))}
              {stats.countries.length === 0 && (
                <p className="text-xs text-muted-foreground italic py-4">{d.emptyStats}</p>
              )}
            </div>
          </div>

          {/* 4. Focus category weight */}
          <div className="rounded-[20px] border border-border bg-card p-6 md:p-8 space-y-5">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <Building2 className="size-5 text-primary shrink-0" />
              <span>{d.categorySection}</span>
            </h3>

            <div className="divide-y divide-border/50">
              {stats.categories.map((cat: any) => (
                <div key={cat.name} className="py-3 flex justify-between items-center text-xs font-semibold text-muted-foreground">
                  <span className="text-foreground font-black">{cat.name}</span>
                  <span className="bg-secondary px-2.5 py-1 rounded-lg text-foreground font-black">
                    {cat.count}
                  </span>
                </div>
              ))}
              {stats.categories.length === 0 && (
                <p className="text-xs text-muted-foreground italic py-4">{d.emptyStats}</p>
              )}
            </div>
          </div>
        </div>

        {/* 5. Leaders leaderboard list */}
        <div className="mt-6 rounded-[20px] border border-border bg-card p-6 md:p-8 space-y-6">
          <h3 className="text-base font-black text-foreground flex items-center gap-2">
            <Award className="size-5 text-primary shrink-0" />
            <span>{d.leaderboardSection}</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse text-xs font-semibold text-muted-foreground">
              <thead>
                <tr className="border-b border-border/80 text-[10px] uppercase text-foreground/60 font-black">
                  <th className="py-3 px-2 text-start w-16">{d.rank}</th>
                  <th className="py-3 px-2 text-start">{d.company}</th>
                  <th className="py-3 px-2 text-start w-28">{d.boothNo}</th>
                  <th className="py-3 px-2 text-end w-32">{d.viewsLabel}</th>
                  <th className="py-3 px-2 text-end w-32">{d.contactsLabel}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {stats.topBooths.map((tb: any, i: number) => (
                  <tr key={tb.id} className="hover:bg-secondary/40 transition-all">
                    <td className="py-4.5 px-2 font-black text-foreground">#{i + 1}</td>
                    <td className="py-4.5 px-2 font-black text-foreground">{tb.companyName}</td>
                    <td className="py-4.5 px-2">
                      <span className="bg-secondary px-2 py-0.5 rounded font-black text-foreground">
                        {tb.boothNumber}
                      </span>
                    </td>
                    <td className="py-4.5 px-2 text-end font-black text-foreground">
                      <div className="inline-flex items-center gap-1">
                        <Eye className="size-3.5 text-muted-foreground" />
                        <span>{tb.views}</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-2 text-end font-black text-foreground">
                      <div className="inline-flex items-center gap-1">
                        <MessageSquare className="size-3.5 text-muted-foreground" />
                        <span>{tb.contacts}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {stats.topBooths.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center italic">
                      {d.emptyStats}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
