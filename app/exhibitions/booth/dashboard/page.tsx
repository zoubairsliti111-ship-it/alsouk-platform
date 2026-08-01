"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  Tag,
  Edit2,
  Trophy,
  Loader2,
  ExternalLink,
  ShieldAlert,
  Sliders,
  CheckCircle,
  Clock,
  Archive,
  FileText
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { MarketplaceShell, Breadcrumbs, ListingHeader } from "@/components/marketplace/shell"
import type { ExhibitionBooth } from "@/lib/domains/exhibition/types"

const dict = {
  en: {
    dashboardTitle: "Exhibitor Workspace",
    selectBooth: "Select Your Exhibition Booth",
    selectBoothDesc: "Choose one of your approved exhibition booths to manage its contents, customise your banner, and edit your profile description.",
    boothDetails: "Booth Space Overview",
    editBooth: "Edit Booth Details",
    status: "Status",
    boothNumber: "Booth Number",
    category: "Category",
    aboutSection: "About Booth",
    brandingSection: "Branding Details",
    lastUpdated: "Last updated",
    emptyState: "No booth details found.",
    loading: "Loading your exhibitor workspace...",
    errorLoading: "Failed to load booth details. Please refresh or try again.",
    backToDashboard: "Switch Booths",
    backToExhibitions: "Back to Exhibitions",
    viewDashboard: "Manage Booth",
    draft: "Draft",
    submitted: "Submitted",
    published: "Published",
    archived: "Archived",
    aboutHeading: "Exhibition Description",
    shortDescPlaceholder: "No short description provided.",
    fullDescPlaceholder: "No full description provided.",
    bannerPreview: "Banner Image",
    logoPreview: "Logo Image",
    editBoothBtn: "Edit Booth Profile",
  },
  fr: {
    dashboardTitle: "Espace Exposant",
    selectBooth: "Sélectionnez votre stand d'exposition",
    selectBoothDesc: "Choisissez l'un de vos stands d'exposition approuvés pour gérer ses contenus, personnaliser votre bannière et éditer votre description.",
    boothDetails: "Aperçu de l'espace stand",
    editBooth: "Modifier les détails du stand",
    status: "Statut",
    boothNumber: "Numéro de stand",
    category: "Catégorie",
    aboutSection: "À propos du stand",
    brandingSection: "Image de marque",
    lastUpdated: "Dernière mise à jour",
    emptyState: "Aucun détail de stand trouvé.",
    loading: "Chargement de votre espace exposant...",
    errorLoading: "Échec du chargement des détails du stand. Veuillez réessayer.",
    backToDashboard: "Changer de stand",
    backToExhibitions: "Retour aux expositions",
    viewDashboard: "Gérer le stand",
    draft: "Brouillon",
    submitted: "Soumis",
    published: "Publié",
    archived: "Archivé",
    aboutHeading: "Description de l'exposition",
    shortDescPlaceholder: "Aucune description courte fournie.",
    fullDescPlaceholder: "Aucune description complète fournie.",
    bannerPreview: "Image de la bannière",
    logoPreview: "Image du logo",
    editBoothBtn: "Modifier le profil du stand",
  },
  ar: {
    dashboardTitle: "مساحة عمل العارض",
    selectBooth: "اختر جناح المعرض الخاص بك",
    selectBoothDesc: "اختر أحد أجنحة المعارض المعتمدة لديك لإدارة محتوياتها وتخصيص البانر الخاص بك وتعديل الوصف التعريفي للجناح.",
    boothDetails: "نظرة عامة على الجناح",
    editBooth: "تعديل تفاصيل الجناح",
    status: "الحالة",
    boothNumber: "رقم الجناح",
    category: "الفئة",
    aboutSection: "حول الجناح",
    brandingSection: "الهوية البصرية",
    lastUpdated: "آخر تحديث",
    emptyState: "لم يتم العثور على تفاصيل الجناح.",
    loading: "جاري تحميل مساحة عمل العارض الخاصة بك...",
    errorLoading: "فشل في تحميل تفاصيل الجناح. يرجى المحاولة مرة أخرى.",
    backToDashboard: "تغيير الأجنحة",
    backToExhibitions: "العودة إلى المعارض",
    viewDashboard: "إدارة الجناح",
    draft: "مسودة",
    submitted: "تم الإرسال",
    published: "منشور",
    archived: "مؤرشف",
    aboutHeading: "الوصف التعريفي للجناح",
    shortDescPlaceholder: "لم يتم تقديم وصف قصير.",
    fullDescPlaceholder: "لم يتم تقديم وصف كامل بعد.",
    bannerPreview: "صورة البانر",
    logoPreview: "شعار الشركة",
    editBoothBtn: "تعديل الملف التعريفي للجناح",
  }
}

export default function BoothDashboardPage() {
  return (
    <MarketplaceShell>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
          </div>
        }
      >
        <DashboardSuspenseWrapper />
      </Suspense>
    </MarketplaceShell>
  )
}

function DashboardSuspenseWrapper() {
  const searchParams = useSearchParams()
  const boothId = searchParams.get("id") || "gateway"
  return <DashboardContent key={boothId} />
}

function DashboardContent() {
  const { lang, dir, t } = useLanguage()
  const d = dict[lang] || dict.en
  const searchParams = useSearchParams()
  const router = useRouter()
  const boothId = searchParams.get("id")

  const [booth, setBooth] = useState<ExhibitionBooth | null>(null)
  const [loading, setLoading] = useState(!!boothId)
  const [error, setError] = useState<string | null>(null)

  // Hardcoded list of approved mocks for selection (realistic Tunisian B2B data)
  const availableBooths = [
    {
      id: "booth-medina",
      companyName: "Medina Olive Co.",
      exhibitionName: "Tunisia Food Expo 2026",
      boothNumber: "A-01",
      category: "Food & Agriculture",
      logoUrl: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=150",
    },
    {
      id: "booth-sahara",
      companyName: "Sahara Dates Export",
      exhibitionName: "Tunisia Food Expo 2026",
      boothNumber: "A-02",
      category: "Food & Agriculture",
      logoUrl: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&q=80&w=150",
    },
    {
      id: "booth-carthage",
      companyName: "Carthage Textiles",
      exhibitionName: "Carthage Textile International 2026",
      boothNumber: "B-15",
      category: "Textiles & Apparel",
      logoUrl: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=150",
    }
  ]

  useEffect(() => {
    if (!boothId) {
      return
    }

    let active = true

    fetch(`/api/exhibitions/booth?id=${encodeURIComponent(boothId)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("HTTP status " + res.status)
        }
        return res.json()
      })
      .then((json) => {
        if (!active) return
        if (json.success && json.data) {
          setBooth(json.data)
        } else {
          setError(json.error || d.errorLoading)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load booth details:", err)
        if (!active) return
        setError(d.errorLoading)
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [boothId, d.errorLoading])

  // Get status badge colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft":
        return {
          label: d.draft,
          classes: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
          icon: <Clock className="size-3.5" />
        }
      case "Submitted":
        return {
          label: d.submitted,
          classes: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
          icon: <FileText className="size-3.5" />
        }
      case "Published":
        return {
          label: d.published,
          classes: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          icon: <CheckCircle className="size-3.5" />
        }
      case "Archived":
        return {
          label: d.archived,
          classes: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
          icon: <Archive className="size-3.5" />
        }
      default:
        return {
          label: status,
          classes: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
          icon: <Clock className="size-3.5" />
        }
    }
  }

  return (
    <div className="pb-16" dir={dir}>
      <Breadcrumbs
        items={[
          { label: t.marketplace.breadcrumbHome, href: "/" },
          { label: d.dashboardTitle }
        ]}
      />

      <div className="mx-auto max-w-4xl px-4 py-8">
        {!boothId ? (
          /* Selection Gateway Page */
          <div className="space-y-6">
            <ListingHeader
              title={d.dashboardTitle}
              subtitle={d.selectBoothDesc}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {availableBooths.map((ab) => (
                <div
                  key={ab.id}
                  className="flex flex-col justify-between overflow-hidden rounded-[20px] border border-border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {/* Logo fallback */}
                      <div className="size-12 overflow-hidden rounded-xl border border-border bg-secondary shrink-0">
                        {ab.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={ab.logoUrl}
                            alt={ab.companyName}
                            className="size-full object-cover"
                          />
                        ) : (
                          <Building2 className="size-5 text-muted-foreground m-auto.5" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-foreground line-clamp-1">
                          {ab.companyName}
                        </h3>
                        <p className="text-[11px] font-bold text-primary">
                          {ab.category}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs font-semibold text-muted-foreground">
                      <p className="flex items-center gap-1.5 line-clamp-1">
                        <Trophy className="size-3.5 text-primary shrink-0" />
                        <span>{ab.exhibitionName}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Tag className="size-3.5 text-primary shrink-0" />
                        <span>{d.boothNumber}: {ab.boothNumber}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <button
                      onClick={() => router.push(`/exhibitions/booth/dashboard?id=${ab.id}`)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-3 text-xs font-black transition-all min-h-[44px]"
                    >
                      <span>{d.viewDashboard}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : loading ? (
          /* Loading State */
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-xs font-bold text-muted-foreground">{d.loading}</span>
          </div>
        ) : error ? (
          /* Error State */
          <div className="rounded-[20px] border border-destructive/20 bg-destructive/5 p-6 text-center space-y-4">
            <ShieldAlert className="size-10 text-destructive mx-auto" />
            <p className="text-sm font-bold text-foreground">{error}</p>
            <button
              onClick={() => router.push("/exhibitions/booth/dashboard")}
              className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold"
            >
              <ArrowLeft className="size-4" />
              <span>{d.backToDashboard}</span>
            </button>
          </div>
        ) : booth ? (
          /* Main Booth Dashboard Overview */
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-black text-foreground">{d.boothDetails}</h1>
                <p className="text-xs font-medium text-muted-foreground">
                  {booth.company?.name || "Company Booth"} at {booth.exhibitionId === "exh-101" ? "Tunisia Food Expo 2026" : "Carthage Textile International 2026"}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => router.push("/exhibitions/booth/dashboard")}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-black text-foreground transition-all hover:bg-secondary min-h-11"
                >
                  <Sliders className="size-4" />
                  <span>{d.backToDashboard}</span>
                </button>

                <button
                  onClick={() => router.push(`/exhibitions/booth/dashboard/edit?id=${booth.id}`)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary/95 px-4 py-2.5 text-xs font-black text-primary-foreground transition-all min-h-11"
                >
                  <Edit2 className="size-4" />
                  <span>{d.editBoothBtn}</span>
                </button>
              </div>
            </div>

            {/* Profile Display / Banner */}
            <div className="overflow-hidden rounded-[20px] border border-border bg-card shadow-sm">
              {/* Booth Banner */}
              <div className="relative h-44 w-full bg-secondary">
                {booth.bannerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={booth.bannerUrl}
                    alt={d.bannerPreview}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="size-full bg-gradient-to-r from-primary/30 to-blue-500/20" />
                )}

                {/* Floating Status Badge */}
                <div className="absolute top-4 end-4">
                  <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black shadow-sm bg-background backdrop-blur-md ${getStatusBadge(booth.status || "Draft").classes}`}>
                    {getStatusBadge(booth.status || "Draft").icon}
                    <span>{getStatusBadge(booth.status || "Draft").label}</span>
                  </div>
                </div>
              </div>

              <div className="relative px-6 pb-6 pt-16">
                {/* Floating Company Logo */}
                <div className="absolute -top-12 start-6 size-20 overflow-hidden rounded-[20px] border-4 border-card bg-card shadow-md shrink-0">
                  {booth.logoUrl || booth.company?.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={booth.logoUrl || booth.company?.logoUrl || undefined}
                      alt={d.logoPreview}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Building2 className="size-8 text-muted-foreground m-auto" />
                  )}
                </div>

                {/* Name and Info */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-black text-foreground">
                      {booth.title || booth.company?.name}
                    </h2>
                    <p className="text-xs font-extrabold text-primary uppercase tracking-wider">
                      {booth.category}
                    </p>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 gap-3 rounded-xl bg-secondary/50 p-4 sm:grid-cols-2 text-xs font-semibold text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Trophy className="size-4 text-primary" />
                      <span>{booth.exhibitionId === "exh-101" ? "Tunisia Food Expo 2026" : "Carthage Textile International 2026"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Tag className="size-4 text-primary" />
                      <span>{d.boothNumber}: {booth.boothNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About / Descriptions Section */}
            <div className="rounded-[20px] border border-border bg-card p-6 space-y-4 shadow-sm">
              <h3 className="text-base font-black text-foreground border-b border-border/40 pb-2">{d.aboutSection}</h3>

              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-extrabold text-muted-foreground uppercase">{d.shortDescPlaceholder}</h4>
                  <p className="text-sm font-bold text-foreground mt-1 leading-relaxed">
                    {booth.shortDescription || booth.company?.tagline || <span className="italic text-muted-foreground font-medium">{d.shortDescPlaceholder}</span>}
                  </p>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-extrabold text-muted-foreground uppercase">{d.fullDescPlaceholder}</h4>
                  <p className="text-xs font-medium text-muted-foreground mt-1 whitespace-pre-line leading-relaxed">
                    {booth.description || <span className="italic text-muted-foreground">{d.fullDescPlaceholder}</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {d.emptyState}
          </div>
        )}
      </div>
    </div>
  )
}
