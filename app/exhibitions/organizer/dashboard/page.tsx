"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Calendar,
  MapPin,
  Building2,
  Trophy,
  ArrowRight,
  Loader2,
  FileText,
  AlertCircle,
  CheckCircle,
  Eye,
  Settings,
  BarChart3,
  Mail,
  Phone,
  Globe,
  ArrowLeft
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { MarketplaceShell, Breadcrumbs, ListingHeader } from "@/components/marketplace/shell"

const dict = {
  en: {
    title: "Organizer Control Center",
    subtitle: "Command hub for managing trade show applications, virtual booths, exhibition details, and participant statistics.",
    statusOngoing: "Ongoing Event",
    statusUpcoming: "Upcoming Trade Show",
    statusDraft: "Draft Mode",
    details: "Exhibition Profile",
    dates: "Dates",
    location: "Location",
    contactInfo: "Contact Details",
    quickActions: "Quick Controls",
    editExhibition: "Configure Exhibition",
    editExhibitionDesc: "Update dates, category focus, location, and brand assets.",
    manageApplications: "Review Applications",
    manageApplicationsDesc: "Approve or reject participant requests. Automated booth provisioning.",
    manageBooths: "Manage Booth Spaces",
    manageBoothsDesc: "Assign numbers, view layouts, publish or archive approved booths.",
    viewStats: "View Analytics",
    viewStatsDesc: "Deep-dive country statistics, popular booths, and attendee charts.",
    metrics: "Key Metrics",
    totalApplications: "Total Applications",
    pendingApplications: "Pending Review",
    approvedBooths: "Approved Booths",
    publishedBooths: "Published Booths",
    visitors: "Total Virtual Visitors",
    meetings: "B2B Meetings Requested",
    placeholderLabel: "Simulated",
    loading: "Loading dashboard controls...",
    errorLoad: "Failed to load organizer dashboard. Please try again."
  },
  fr: {
    title: "Espace de Contrôle de l'Organisateur",
    subtitle: "Centre de commandement pour gérer les candidatures, les stands virtuels, les profils d'exposition et les statistiques.",
    statusOngoing: "Événement en cours",
    statusUpcoming: "Salon à venir",
    statusDraft: "Mode Brouillon",
    details: "Profil de l'Exposition",
    dates: "Dates",
    location: "Lieu",
    contactInfo: "Contacts",
    quickActions: "Actions Rapides",
    editExhibition: "Configurer le Salon",
    editExhibitionDesc: "Modifier les dates, catégories, adresse et logos.",
    manageApplications: "Évaluer les Candidatures",
    manageApplicationsDesc: "Accepter ou refuser les demandes. Attribution automatique de stands.",
    manageBooths: "Gérer les Stands",
    manageBoothsDesc: "Attribuer les numéros, publier ou archiver les stands approuvés.",
    viewStats: "Statistiques & Analyses",
    viewStatsDesc: "Suivi des pays d'origine, stands populaires et graphiques.",
    metrics: "Indicateurs Clés",
    totalApplications: "Total Candidatures",
    pendingApplications: "En attente",
    approvedBooths: "Stands Approuvés",
    publishedBooths: "Stands Publiés",
    visitors: "Visiteurs Virtuels",
    meetings: "Rendez-vous B2B",
    placeholderLabel: "Simulé",
    loading: "Chargement du tableau de bord...",
    errorLoad: "Impossible de charger le tableau de bord. Veuillez réessayer."
  },
  ar: {
    title: "مركز تحكم المنظم",
    subtitle: "لوحة التحكم لإدارة طلبات المشاركة، الأجنحة الافتراضية، معلومات المعرض، وإحصاءات الحضور.",
    statusOngoing: "حدث جاري الآن",
    statusUpcoming: "معرض قادم",
    statusDraft: "وضع مسودة",
    details: "ملف المعرض",
    dates: "التواريخ",
    location: "الموقع",
    contactInfo: "تفاصيل الاتصال",
    quickActions: "الإجراءات السريعة",
    editExhibition: "تكوين المعرض",
    editExhibitionDesc: "تحديث التواريخ، الفئات المستهدفة، الموقع، والأصول التجارية.",
    manageApplications: "مراجعة طلبات التقديم",
    manageApplicationsDesc: "قبول أو رفض طلبات المشاركين. تخصيص تلقائي للأجنحة.",
    manageBooths: "إدارة مساحات الأجنحة",
    manageBoothsDesc: "تخصيص أرقام الأجنحة، مراجعة التصاميم، ونشر أو أرشفة الأجنحة المعتمدة.",
    viewStats: "عرض التحليلات والإحصاءات",
    viewStatsDesc: "إحصاءات الدول التفصيلية، الأجنحة الأكثر شعبية، ومخططات الحضور.",
    metrics: "المقاييس الرئيسية",
    totalApplications: "إجمالي طلبات التقديم",
    pendingApplications: "قيد المراجعة",
    approvedBooths: "الأجنحة المعتمدة",
    publishedBooths: "الأجنحة المنشورة",
    visitors: "إجمالي الزوار الافتراضيين",
    meetings: "اجتماعات B2B المطلوبة",
    placeholderLabel: "افتراضي",
    loading: "جاري تحميل لوحة التحكم...",
    errorLoad: "فشل تحميل لوحة تحكم المنظم. يرجى المحاولة مرة أخرى."
  }
}

export default function OrganizerDashboardPage() {
  return (
    <MarketplaceShell>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </MarketplaceShell>
  )
}

function DashboardContent() {
  const { lang, dir, t } = useLanguage()
  const d = dict[lang] || dict.en
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{ exhibition: any; stats: any } | null>(null)

  useEffect(() => {
    let active = true
    fetch("/api/exhibitions/organizer/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("HTTP " + res.status)
        return res.json()
      })
      .then((json) => {
        if (!active) return
        if (json.success && json.data) {
          setData(json.data)
        } else {
          setError(json.error || d.errorLoad)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load organizer dashboard:", err)
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

  if (error || !data) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center space-y-6" dir={dir}>
        <div className="rounded-[20px] border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4">
          <AlertCircle className="size-10 text-destructive mx-auto" />
          <p className="text-sm font-bold text-foreground">{error || d.errorLoad}</p>
        </div>
        <button
          onClick={() => router.push("/exhibitions")}
          className="rounded-xl bg-secondary hover:bg-secondary/80 text-foreground px-5 py-3 text-xs font-black"
        >
          {lang === "ar" ? "العودة إلى المعارض" : "Back to Exhibitions"}
        </button>
      </div>
    )
  }

  const { exhibition, stats } = data

  const startStr = new Date(exhibition.startDate).toLocaleDateString(
    lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : "ar-TN",
    { year: "numeric", month: "long", day: "numeric" }
  )
  const endStr = new Date(exhibition.endDate).toLocaleDateString(
    lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : "ar-TN",
    { year: "numeric", month: "long", day: "numeric" }
  )

  // Determine current exhibition event status
  const now = new Date()
  const start = new Date(exhibition.startDate)
  const end = new Date(exhibition.endDate)
  let statusText = d.statusUpcoming
  let statusColor = "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"

  if (now >= start && now <= end) {
    statusText = d.statusOngoing
    statusColor = "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
  } else if (now > end) {
    statusText = lang === "ar" ? "معرض منتهي" : lang === "fr" ? "Exposition terminée" : "Completed Event"
    statusColor = "bg-zinc-500/10 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-400"
  }

  return (
    <div className="pb-16" dir={dir}>
      <Breadcrumbs
        items={[
          { label: t.marketplace.breadcrumbHome, href: "/" },
          { label: "Exhibitions", href: "/exhibitions" },
          { label: d.title }
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <ListingHeader title={d.title} subtitle={d.subtitle} />

        {/* Exhibition Brand Header Panel */}
        <div className="mt-8 overflow-hidden rounded-[20px] border border-border bg-card">
          <div className="relative h-44 md:h-64 bg-secondary shrink-0">
            {exhibition.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={exhibition.coverUrl}
                alt={exhibition.name}
                className="size-full object-cover"
              />
            ) : (
              <div className="size-full bg-gradient-to-br from-primary to-blue-900 opacity-25" />
            )}

            {/* Logo Badge Overlay */}
            <div className="absolute -bottom-6 start-6 md:start-10 overflow-hidden rounded-[20px] border border-border bg-card p-2 shadow-md size-16 md:size-24 flex items-center justify-center shrink-0">
              {exhibition.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={exhibition.logoUrl} alt={exhibition.name} className="size-full object-contain rounded-xl" />
              ) : (
                <Building2 className="size-8 md:size-12 text-primary" />
              )}
            </div>
          </div>

          <div className="pt-10 pb-6 px-6 md:px-10 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl md:text-2xl font-black text-foreground">
                    {exhibition.name}
                  </h2>
                  <span className={`rounded-full px-3 py-0.5 text-[10px] font-bold ${statusColor}`}>
                    {statusText}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Trophy className="size-4 text-primary shrink-0" />
                  <span>{exhibition.organizer}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {exhibition.categories.map((c: string) => (
                  <span
                    key={c}
                    className="rounded-lg bg-secondary px-2.5 py-1 text-[10px] font-black text-muted-foreground uppercase"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Core Exhibition Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/50 text-xs font-semibold text-muted-foreground">
              <div className="flex items-center gap-2.5">
                <Calendar className="size-4.5 text-primary shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-foreground/50 uppercase">{d.dates}</p>
                  <p className="text-foreground font-black">{startStr} – {endStr}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <MapPin className="size-4.5 text-primary shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-foreground/50 uppercase">{d.location}</p>
                  <p className="text-foreground font-black capitalize">
                    {exhibition.city}, {exhibition.country === "TN" ? (lang === "ar" ? "تونس" : "Tunisia") : exhibition.country}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Globe className="size-4.5 text-primary shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-foreground/50 uppercase">{d.contactInfo}</p>
                  <p className="text-foreground font-black">
                    {exhibition.contactEmail || "organizer@alsouk.com"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Metrics Grid */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-black text-foreground">{d.metrics}</h3>

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Total Applications */}
            <div className="rounded-[20px] border border-border bg-card p-5 space-y-2">
              <p className="text-xs font-bold text-muted-foreground leading-snug line-clamp-2 h-8">{d.totalApplications}</p>
              <p className="text-3xl font-black text-foreground">{stats.totalApplications}</p>
            </div>

            {/* Pending Applications */}
            <div className="rounded-[20px] border border-border bg-card p-5 space-y-2 relative overflow-hidden">
              <div className="absolute top-2 end-2 size-2 rounded-full bg-yellow-500 animate-pulse" />
              <p className="text-xs font-bold text-muted-foreground leading-snug line-clamp-2 h-8">{d.pendingApplications}</p>
              <p className="text-3xl font-black text-yellow-600 dark:text-yellow-400">{stats.pendingApplications}</p>
            </div>

            {/* Approved Booths */}
            <div className="rounded-[20px] border border-border bg-card p-5 space-y-2">
              <p className="text-xs font-bold text-muted-foreground leading-snug line-clamp-2 h-8">{d.approvedBooths}</p>
              <p className="text-3xl font-black text-foreground">{stats.approvedBoothCount}</p>
            </div>

            {/* Published Booths */}
            <div className="rounded-[20px] border border-border bg-card p-5 space-y-2">
              <p className="text-xs font-bold text-muted-foreground leading-snug line-clamp-2 h-8">{d.publishedBooths}</p>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.publishedBoothCount}</p>
            </div>

            {/* Visitors (Placeholder) */}
            <div className="rounded-[20px] border border-border bg-card p-5 space-y-2 relative">
              <span className="absolute top-2 end-2 bg-secondary rounded px-1.5 py-0.5 text-[8px] font-black text-muted-foreground uppercase">{d.placeholderLabel}</span>
              <p className="text-xs font-bold text-muted-foreground leading-snug line-clamp-2 h-8">{d.visitors}</p>
              <p className="text-3xl font-black text-foreground">{stats.visitorsPlaceholder.toLocaleString()}</p>
            </div>

            {/* Meetings (Placeholder) */}
            <div className="rounded-[20px] border border-border bg-card p-5 space-y-2 relative">
              <span className="absolute top-2 end-2 bg-secondary rounded px-1.5 py-0.5 text-[8px] font-black text-muted-foreground uppercase">{d.placeholderLabel}</span>
              <p className="text-xs font-bold text-muted-foreground leading-snug line-clamp-2 h-8">{d.meetings}</p>
              <p className="text-3xl font-black text-foreground">{stats.meetingsPlaceholder}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Dashboard Grid */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-black text-foreground">{d.quickActions}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Configure Exhibition Details */}
            <Link
              href="/exhibitions/organizer/dashboard/edit"
              className="group flex items-start gap-4 rounded-[20px] border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0">
                <Settings className="size-6" />
              </div>
              <div className="space-y-1 text-start">
                <h4 className="text-base font-black text-foreground group-hover:text-primary transition-all flex items-center gap-1.5">
                  <span>{d.editExhibition}</span>
                  <ArrowRight className={`size-4 transition-transform group-hover:translate-x-1 ${dir === "rtl" ? "rotate-180" : ""}`} />
                </h4>
                <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
                  {d.editExhibitionDesc}
                </p>
              </div>
            </Link>

            {/* Review Applications */}
            <Link
              href="/exhibitions/organizer/dashboard/applications"
              className="group flex items-start gap-4 rounded-[20px] border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0">
                <FileText className="size-6" />
              </div>
              <div className="space-y-1 text-start">
                <h4 className="text-base font-black text-foreground group-hover:text-primary transition-all flex items-center gap-1.5">
                  <span>{d.manageApplications}</span>
                  {stats.pendingApplications > 0 && (
                    <span className="size-2 rounded-full bg-yellow-500 shrink-0" />
                  )}
                  <ArrowRight className={`size-4 transition-transform group-hover:translate-x-1 ${dir === "rtl" ? "rotate-180" : ""}`} />
                </h4>
                <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
                  {d.manageApplicationsDesc}
                </p>
              </div>
            </Link>

            {/* Manage Booth spaces */}
            <Link
              href="/exhibitions/organizer/dashboard/booths"
              className="group flex items-start gap-4 rounded-[20px] border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0">
                <Building2 className="size-6" />
              </div>
              <div className="space-y-1 text-start">
                <h4 className="text-base font-black text-foreground group-hover:text-primary transition-all flex items-center gap-1.5">
                  <span>{d.manageBooths}</span>
                  <ArrowRight className={`size-4 transition-transform group-hover:translate-x-1 ${dir === "rtl" ? "rotate-180" : ""}`} />
                </h4>
                <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
                  {d.manageBoothsDesc}
                </p>
              </div>
            </Link>

            {/* View Analytics & Charts */}
            <Link
              href="/exhibitions/organizer/dashboard/statistics"
              className="group flex items-start gap-4 rounded-[20px] border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0">
                <BarChart3 className="size-6" />
              </div>
              <div className="space-y-1 text-start">
                <h4 className="text-base font-black text-foreground group-hover:text-primary transition-all flex items-center gap-1.5">
                  <span>{d.viewStats}</span>
                  <ArrowRight className={`size-4 transition-transform group-hover:translate-x-1 ${dir === "rtl" ? "rotate-180" : ""}`} />
                </h4>
                <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
                  {d.viewStatsDesc}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
