"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  Calendar,
  Globe2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Loader2,
  ShieldAlert,
  Sliders,
  Compass
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { MarketplaceShell, Breadcrumbs, ListingHeader } from "@/components/marketplace/shell"
import type { ExhibitionApplication } from "@/lib/domains/exhibition/types"

const dict = {
  en: {
    adminTitle: "Organizer Review Workspace",
    subtitle: "Review and manage incoming company applications to exhibit in trade shows. Approved companies are automatically provisioned with a Draft booth space.",
    searchPlaceholder: "Search by company, contact, category...",
    filterStatus: "Filter Status",
    all: "All Statuses",
    pending: "Pending Review",
    approved: "Approved",
    rejected: "Rejected",
    sortOrder: "Sort Order",
    newest: "Newest First",
    oldest: "Oldest First",
    companyName: "Company",
    contactPerson: "Contact Person",
    category: "Category",
    country: "Country",
    submittedDate: "Submitted Date",
    status: "Status",
    actions: "Actions",
    viewDetails: "Review Application",
    emptyState: "No applications found.",
    loading: "Loading applications...",
    errorLoad: "Failed to load applications. Please try again.",
    backToDashboard: "Back to Dashboard"
  },
  fr: {
    adminTitle: "Espace d'Évaluation de l'Organisateur",
    subtitle: "Examinez et gérez les candidatures d'entreprises pour exposer. Les entreprises approuvées bénéficient automatiquement d'un espace de stand en mode Brouillon.",
    searchPlaceholder: "Rechercher par entreprise, contact, catégorie...",
    filterStatus: "Filtrer le statut",
    all: "Tous les statuts",
    pending: "En attente d'examen",
    approved: "Approuvé",
    rejected: "Rejeté",
    sortOrder: "Ordre de tri",
    newest: "Plus récent en premier",
    oldest: "Plus ancien en premier",
    companyName: "Entreprise",
    contactPerson: "Contact",
    category: "Catégorie",
    country: "Pays",
    submittedDate: "Date de soumission",
    status: "Statut",
    actions: "Actions",
    viewDetails: "Examiner la candidature",
    emptyState: "Aucune candidature trouvée.",
    loading: "Chargement des candidatures...",
    errorLoad: "Échec du chargement des candidatures. Veuillez réessayer.",
    backToDashboard: "Retour au tableau de bord"
  },
  ar: {
    adminTitle: "مساحة مراجعة المنظم",
    subtitle: "مراجعة وإدارة طلبات الشركات المقدمة للمشاركة في المعارض. يتم تلقائياً تزويد الشركات المعتمدة بمساحة جناح في حالة مسودة.",
    searchPlaceholder: "البحث حسب الشركة، جهة الاتصال، الفئة...",
    filterStatus: "تصفية الحالة",
    all: "جميع الحالات",
    pending: "قيد المراجعة",
    approved: "مقبول",
    rejected: "مرفوض",
    sortOrder: "ترتيب الفرز",
    newest: "الأحدث أولاً",
    oldest: "الأقدم أولاً",
    companyName: "الشركة",
    contactPerson: "شخص الاتصال",
    category: "الفئة",
    country: "البلد",
    submittedDate: "تاريخ التقديم",
    status: "الحالة",
    actions: "الإجراءات",
    viewDetails: "مراجعة الطلب",
    emptyState: "لم يتم العثور على أي طلبات تقديم.",
    loading: "جاري تحميل الطلبات...",
    errorLoad: "فشل تحميل طلبات التقديم. يرجى المحاولة مرة أخرى.",
    backToDashboard: "العودة إلى لوحة التحكم"
  }
}

export default function ApplicationsAdminPage() {
  return (
    <MarketplaceShell>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
          </div>
        }
      >
        <ApplicationsAdminSuspenseWrapper />
      </Suspense>
    </MarketplaceShell>
  )
}

function ApplicationsAdminSuspenseWrapper() {
  const searchParams = useSearchParams()
  const filter = searchParams.get("status") || "all"
  return <ApplicationsAdminContent key={filter} />
}

function ApplicationsAdminContent() {
  const { lang, dir, t } = useLanguage()
  const d = dict[lang] || dict.en
  const router = useRouter()
  const searchParams = useSearchParams()

  const [applications, setApplications] = useState<ExhibitionApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtering states initialized from URL parameters
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">(
    (searchParams.get("sort") as "newest" | "oldest") || "newest"
  )

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Trigger list reload by causing a state dependency transition or manual trigger
    setTriggerReload((prev) => prev + 1)
  }

  const [triggerReload, setTriggerReload] = useState(0)

  useEffect(() => {
    let active = true

    const qParams = new URLSearchParams()
    if (searchTerm) qParams.set("search", searchTerm)
    if (statusFilter !== "all") qParams.set("status", statusFilter)
    qParams.set("sort", sortOrder)

    fetch(`/api/exhibitions/applications?${qParams.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("HTTP " + res.status)
        return res.json()
      })
      .then((json) => {
        if (!active) return
        if (json.success && json.data) {
          setApplications(json.data)
        } else {
          setError(json.error || d.errorLoad)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load applications:", err)
        if (!active) return
        setError(d.errorLoad)
        setLoading(false)
      })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, sortOrder, triggerReload, d.errorLoad])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return {
          label: d.pending,
          classes: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
          icon: <AlertCircle className="size-3.5" />
        }
      case "Approved":
        return {
          label: d.approved,
          classes: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          icon: <CheckCircle2 className="size-3.5" />
        }
      case "Rejected":
        return {
          label: d.rejected,
          classes: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
          icon: <XCircle className="size-3.5" />
        }
      default:
        return {
          label: status,
          classes: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
          icon: <AlertCircle className="size-3.5" />
        }
    }
  }

  return (
    <div className="pb-16" dir={dir}>
      <Breadcrumbs
        items={[
          { label: t.marketplace.breadcrumbHome, href: "/" },
          { label: "Exhibitions", href: "/exhibitions" },
          { label: d.adminTitle }
        ]}
      />

      <div className="mx-auto max-w-4xl px-4 py-8">
        <ListingHeader
          title={d.adminTitle}
          subtitle={d.subtitle}
        />

        {/* Filter Toolbar */}
        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/60 pb-6 mb-6">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder={d.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-border bg-card ps-11 pe-4 py-3 text-xs font-bold text-foreground focus:border-primary focus:outline-none min-h-[44px]"
            />
            <Search className="absolute start-4 top-3 size-4.5 text-muted-foreground" />
            <button type="submit" className="hidden" />
          </form>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground focus:border-primary focus:outline-none min-h-[38px]"
              >
                <option value="all">{d.all}</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Date Sorting */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="size-4 text-muted-foreground" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground focus:border-primary focus:outline-none min-h-[38px]"
              >
                <option value="newest">{d.newest}</option>
                <option value="oldest">{d.oldest}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Application List Container */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-xs font-bold text-muted-foreground">{d.loading}</span>
          </div>
        ) : error ? (
          <div className="rounded-[20px] border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4">
            <ShieldAlert className="size-10 text-destructive mx-auto" />
            <p className="text-sm font-bold text-foreground">{error}</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-border bg-card p-12 text-center space-y-4">
            <Compass className="size-12 text-muted-foreground/60 mx-auto" />
            <p className="text-sm font-black text-foreground">{d.emptyState}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="group flex flex-col justify-between overflow-hidden rounded-[20px] border border-border bg-card p-5 transition-all hover:shadow-md md:flex-row md:items-center gap-4"
              >
                <div className="flex items-start gap-4">
                  {/* Fallback avatar matching company-onboarding style */}
                  <div className="size-12 overflow-hidden rounded-xl border border-border bg-secondary shrink-0 flex items-center justify-center">
                    <Building2 className="size-6 text-primary" />
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-foreground truncate">
                        {app.companyName}
                      </h3>
                      {/* Status badge */}
                      <div className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black ${getStatusBadge(app.status).classes}`}>
                        {getStatusBadge(app.status).icon}
                        <span>{getStatusBadge(app.status).label}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-muted-foreground">
                      <p className="flex items-center gap-1">
                        <span className="font-extrabold text-foreground">{d.contactPerson}:</span>
                        <span>{app.contactPerson}</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <span className="font-extrabold text-foreground">{d.category}:</span>
                        <span>{app.businessCategory}</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <Globe2 className="size-3.5 text-primary shrink-0" />
                        <span>{app.country === "TN" ? "Tunisia (🇹🇳)" : app.country}</span>
                      </p>
                    </div>

                    {/* Submission Date */}
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/80">
                      <Calendar className="size-3.5 shrink-0" />
                      <span>
                        {d.submittedDate}: {new Date(app.submittedAt).toLocaleDateString(lang === "ar" ? "ar-TN" : "en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center md:justify-end">
                  <button
                    onClick={() => router.push(`/exhibitions/admin/applications/${app.id}`)}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2.5 text-xs font-black transition-all group-hover:bg-primary group-hover:text-primary-foreground min-h-11 w-full md:w-auto"
                  >
                    <span>{d.viewDetails}</span>
                    <ChevronRight className={`size-4 transition-transform ${dir === "rtl" ? "rotate-180" : ""}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
