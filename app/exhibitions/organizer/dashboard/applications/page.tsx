"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  Calendar,
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Sliders,
  Compass,
  ArrowLeft,
  X,
  FileText,
  User,
  ShieldCheck,
  Check,
  ChevronRight
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { MarketplaceShell, Breadcrumbs, ListingHeader } from "@/components/marketplace/shell"
import type { ExhibitionApplication } from "@/lib/domains/exhibition/types"

const dict = {
  en: {
    title: "Incoming Participant Applications",
    subtitle: "Approve or reject exhibition requests from global and Tunisian trade players. Approved companies are automatically provisioned with a custom booth.",
    back: "Back to Control Center",
    searchPlaceholder: "Search company, contact person...",
    all: "All Applications",
    pending: "Pending Review",
    approved: "Approved Requests",
    rejected: "Rejected Requests",
    sortOrder: "Sort Date",
    newest: "Newest First",
    oldest: "Oldest First",
    company: "Company",
    contact: "Contact Details",
    category: "Business Sector",
    country: "Country",
    date: "Submitted Date",
    status: "Status",
    actions: "Actions",
    btnApprove: "Approve",
    btnReject: "Reject",
    btnAssign: "Assign Booth No.",
    btnView: "View Details",
    notes: "Review Notes",
    emptyState: "No candidate applications match current search criteria.",
    loading: "Loading applicant records...",
    errorLoad: "Failed to load applications list. Please refresh.",
    confirmApproveTitle: "Approve Exhibition Request",
    confirmApproveDesc: "By approving, this applicant will join the trade show. A corresponding empty booth will be instantly provisioned in Draft status.",
    confirmRejectTitle: "Reject Exhibition Request",
    confirmRejectDesc: "Please provide review notes specifying the grounds for rejection. An email notification will be sent.",
    confirmAssignTitle: "Designate Booth Coordinates",
    confirmAssignDesc: "Set a unique pavilion code and category placement to help visitors navigate to this company's booth.",
    boothNumberLabel: "Booth Designation (e.g., A-15, B-03)",
    categoryLabel: "Assigned Pavilion Category",
    close: "Close",
    cancel: "Cancel",
    submitAction: "Confirm Decision",
    notesPlaceholder: "Write specific feedback or review notes here...",
    successOp: "Action executed successfully!"
  },
  fr: {
    title: "Candidatures Exposants",
    subtitle: "Gérez les demandes de participation. Les entreprises acceptées bénéficient automatiquement d'un espace de stand.",
    back: "Retour au tableau de bord",
    searchPlaceholder: "Rechercher par entreprise, contact...",
    all: "Toutes les demandes",
    pending: "En attente",
    approved: "Approuvées",
    rejected: "Refusées",
    sortOrder: "Trier par date",
    newest: "Plus récent d'abord",
    oldest: "Plus ancien d'abord",
    company: "Entreprise",
    contact: "Contact",
    category: "Secteur d'activité",
    country: "Pays",
    date: "Date de soumission",
    status: "Statut",
    actions: "Actions",
    btnApprove: "Approuver",
    btnReject: "Rejeter",
    btnAssign: "Attribuer Stand",
    btnView: "Détails",
    notes: "Notes d'évaluation",
    emptyState: "Aucune candidature ne correspond à votre recherche.",
    loading: "Chargement des candidatures...",
    errorLoad: "Impossible de charger les candidatures.",
    confirmApproveTitle: "Approuver la Demande",
    confirmApproveDesc: "En approuvant cette demande, un stand vide en mode Brouillon sera créé pour cet exposant.",
    confirmRejectTitle: "Rejeter la Demande",
    confirmRejectDesc: "Veuillez saisir un commentaire de refus expliquant les motifs de rejet.",
    confirmAssignTitle: "Attribuer les Coordonnées du Stand",
    confirmAssignDesc: "Saisissez un numéro de stand et la catégorie associée pour ce participant.",
    boothNumberLabel: "Numéro du stand (ex: A-15, B-03)",
    categoryLabel: "Pavillon de placement",
    close: "Fermer",
    cancel: "Annuler",
    submitAction: "Confirmer la décision",
    notesPlaceholder: "Saisissez vos commentaires ici...",
    successOp: "Action effectuée avec succès !"
  },
  ar: {
    title: "طلبات المشاركة الواردة",
    subtitle: "مراجعة وإقرار طلبات المشاركة من الفاعلين المحليين والدوليين. عند قبول الطلب، يتم حجز جناح مسودة تلقائياً.",
    back: "العودة إلى مركز التحكم",
    searchPlaceholder: "البحث عن الشركة، شخص الاتصال...",
    all: "جميع الطلبات",
    pending: "قيد المراجعة",
    approved: "الطلبات المقبولة",
    rejected: "الطلبات المرفوضة",
    sortOrder: "فرز التواريخ",
    newest: "الأحدث أولاً",
    oldest: "الأقدم أولاً",
    company: "الشركة",
    contact: "معلومات الاتصال",
    category: "قطاع الأعمال",
    country: "البلد",
    date: "تاريخ التقديم",
    status: "الحالة",
    actions: "الإجراءات",
    btnApprove: "قبول",
    btnReject: "رفض",
    btnAssign: "تخصيص جناح",
    btnView: "عرض التفاصيل",
    notes: "ملاحظات المراجعة",
    emptyState: "لا توجد طلبات مشاركة تطابق معايير البحث الحالية.",
    loading: "جاري تحميل سجلات المتقدمين...",
    errorLoad: "فشل تحميل قائمة طلبات التقديم. يرجى إعادة المحاولة.",
    confirmApproveTitle: "الموافقة على طلب المشاركة",
    confirmApproveDesc: "بالموافقة على هذا المتقدم، سينضم للمعرض. سيتم إنشاء جناح فارغ في حالة مسودة على الفور.",
    confirmRejectTitle: "رفض طلب المشاركة",
    confirmRejectDesc: "يرجى كتابة أسباب الرفض بوضوح ليتم إرسالها إلى المتقدم.",
    confirmAssignTitle: "تخصيص إحداثيات الجناح",
    confirmAssignDesc: "حدد رمز الجناح الفريد والفئة لمساعدة الزوار في الوصول إلى مقر هذه الشركة.",
    boothNumberLabel: "رقم/رمز الجناح (مثال: A-15, B-03)",
    categoryLabel: "فئة الجناح والقطاع",
    close: "إغلاق",
    cancel: "إلغاء",
    submitAction: "تأكيد القرار",
    notesPlaceholder: "اكتب ملاحظات المراجعة أو التعليقات التفصيلية هنا...",
    successOp: "تم تنفيذ الإجراء بنجاح!"
  }
}

export default function ApplicationsManagementPage() {
  return (
    <MarketplaceShell>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
          </div>
        }
      >
        <ApplicationsListContent />
      </Suspense>
    </MarketplaceShell>
  )
}

function ApplicationsListContent() {
  const { lang, dir, t } = useLanguage()
  const d = dict[lang] || dict.en
  const router = useRouter()

  const [applications, setApplications] = useState<ExhibitionApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Filtering parameters
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [triggerReload, setTriggerReload] = useState(0)

  // Interactive Action Modals
  const [selectedApp, setSelectedApp] = useState<ExhibitionApplication | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | "assign" | "view" | null>(null)
  const [inputNotes, setInputNotes] = useState("")
  const [inputBoothNo, setInputBoothNo] = useState("")
  const [inputCategory, setInputCategory] = useState("")
  const [actionSubmitting, setActionSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    const q = new URLSearchParams()
    if (searchTerm) q.set("search", searchTerm)
    if (statusFilter !== "all") q.set("status", statusFilter)
    q.set("sort", sortOrder)

    fetch(`/api/exhibitions/organizer/applications?${q.toString()}`)
      .then((res) => res.json())
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
        console.error("Failed to fetch applications:", err)
        if (!active) return
        setError(d.errorLoad)
        setLoading(false)
      })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, sortOrder, triggerReload, d.errorLoad])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTriggerReload((prev) => prev + 1)
  }

  const handleActionExecute = async () => {
    if (!selectedApp || !actionType) return

    setActionSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      if (actionType === "approve") {
        const res = await fetch("/api/exhibitions/organizer/applications", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "approve",
            id: selectedApp.id,
            reviewNotes: inputNotes.trim(),
          }),
        })
        const json = await res.json()
        if (!json.success) throw new Error(json.error)
      } else if (actionType === "reject") {
        if (!inputNotes.trim()) {
          setError(d.notesPlaceholder)
          setActionSubmitting(false)
          return
        }
        const res = await fetch("/api/exhibitions/organizer/applications", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "reject",
            id: selectedApp.id,
            reviewNotes: inputNotes.trim(),
          }),
        })
        const json = await res.json()
        if (!json.success) throw new Error(json.error)
      } else if (actionType === "assign") {
        // Resolve associated booth first
        // In this implementation, the backend automatically provisions a draft booth when approved.
        // We can assign/edit the booth number by fetching the booths or using `/api/exhibitions/organizer/applications` 'assign-booth' action with booth ID.
        // Wait, what's the booth ID? Let's check how we resolved boothId inside API/mocks.
        // Since we're assigning coordinates to an approved application, we need to know the booth record's ID.
        // Let's resolve the booth record ID first. Let's list all booths and find the one matching companyId/exhibitionId.
        const resBooths = await fetch(`/api/exhibitions/organizer/booths?exhibitionId=${selectedApp.exhibitionId}`)
        const boothsJson = await resBooths.json()

        let targetBoothId = ""
        if (boothsJson.success && boothsJson.data) {
          const match = boothsJson.data.find(
            (b: any) => b.companyId === selectedApp.companyId || b.title === selectedApp.companyName
          )
          if (match) {
            targetBoothId = match.id
          }
        }

        if (!targetBoothId) {
          throw new Error("No approved booth record found for this company yet.")
        }

        const res = await fetch("/api/exhibitions/organizer/applications", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "assign-booth",
            id: targetBoothId,
            boothNumber: inputBoothNo.trim(),
            category: inputCategory.trim(),
          }),
        })
        const json = await res.json()
        if (!json.success) throw new Error(json.error)
      }

      setSuccess(d.successOp)
      setSelectedApp(null)
      setActionType(null)
      setInputNotes("")
      setInputBoothNo("")
      setInputCategory("")
      setTriggerReload((prev) => prev + 1)
    } catch (err: any) {
      console.error("Action execution failed:", err)
      setError(err.message || "Action failed")
    } finally {
      setActionSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return {
          label: d.pending,
          classes: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
          icon: <AlertCircle className="size-3.5 shrink-0" />
        }
      case "Approved":
        return {
          label: d.approved,
          classes: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          icon: <CheckCircle className="size-3.5 shrink-0" />
        }
      case "Rejected":
        return {
          label: d.rejected,
          classes: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
          icon: <XCircle className="size-3.5 shrink-0" />
        }
      default:
        return {
          label: status,
          classes: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
          icon: <AlertCircle className="size-3.5 shrink-0" />
        }
    }
  }

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

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Navigation back */}
        <button
          onClick={() => router.push("/exhibitions/organizer/dashboard")}
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-black text-primary hover:underline"
        >
          <ArrowLeft className={`size-4 shrink-0 ${dir === "rtl" ? "rotate-180" : ""}`} />
          <span>{d.back}</span>
        </button>

        <ListingHeader title={d.title} subtitle={d.subtitle} />

        {/* Global operational feedback banners */}
        {success && (
          <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle className="size-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Filters Toolbar */}
        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/60 pb-6 mb-6">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder={d.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-border bg-card ps-11 pe-4 py-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none min-h-[44px]"
            />
            <Search className="absolute start-4 top-3 size-4.5 text-muted-foreground" />
            <button type="submit" className="hidden" />
          </form>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-bold text-foreground focus:border-primary focus:outline-none min-h-[38px] cursor-pointer"
              >
                <option value="all">{d.all}</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Date Sorting */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="size-4 text-muted-foreground shrink-0" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                className="rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-bold text-foreground focus:border-primary focus:outline-none min-h-[38px] cursor-pointer"
              >
                <option value="newest">{d.newest}</option>
                <option value="oldest">{d.oldest}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Application list container */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-xs font-bold text-muted-foreground">{d.loading}</span>
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
                  <div className="size-12 overflow-hidden rounded-xl border border-border bg-secondary shrink-0 flex items-center justify-center">
                    <Building2 className="size-6 text-primary" />
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-foreground truncate">
                        {app.companyName}
                      </h3>
                      {/* Status badge */}
                      <div className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadge(app.status).classes}`}>
                        {getStatusBadge(app.status).icon}
                        <span>{getStatusBadge(app.status).label}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-muted-foreground">
                      <p className="flex items-center gap-1">
                        <span className="font-extrabold text-foreground">{d.contact}:</span>
                        <span>{app.contactPerson} ({app.phone})</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <span className="font-extrabold text-foreground">{d.category}:</span>
                        <span>{app.businessCategory}</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <Globe className="size-3.5 text-primary shrink-0" />
                        <span>{app.country === "TN" ? "Tunisia (🇹🇳)" : app.country}</span>
                      </p>
                    </div>

                    {/* Submission Date */}
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground/80">
                      <Calendar className="size-3.5 shrink-0" />
                      <span>
                        {d.date}: {new Date(app.submittedAt).toLocaleDateString(lang === "ar" ? "ar-TN" : "en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </span>
                    </div>

                    {/* Review notes showcase if present */}
                    {app.reviewNotes && (
                      <div className="mt-2 text-[11px] bg-secondary p-2.5 rounded-lg border border-border/60 leading-relaxed font-semibold">
                        <p className="text-foreground font-black mb-0.5">{d.notes}:</p>
                        <p className="text-muted-foreground italic">&quot;{app.reviewNotes}&quot;</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedApp(app)
                      setActionType("view")
                    }}
                    className="rounded-xl bg-secondary hover:bg-secondary/80 text-foreground px-3 py-2 text-xs font-black transition-all min-h-[38px]"
                  >
                    {d.btnView}
                  </button>

                  {app.status === "Pending" && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedApp(app)
                          setActionType("approve")
                        }}
                        className="rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-2 text-xs font-black transition-all min-h-[38px]"
                      >
                        {d.btnApprove}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedApp(app)
                          setActionType("reject")
                        }}
                        className="rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-3 py-2 text-xs font-black transition-all min-h-[38px]"
                      >
                        {d.btnReject}
                      </button>
                    </>
                  )}

                  {app.status === "Approved" && (
                    <button
                      onClick={() => {
                        setSelectedApp(app)
                        setActionType("assign")
                        setInputBoothNo("")
                        setInputCategory(app.businessCategory)
                      }}
                      className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-2 text-xs font-black transition-all min-h-[38px]"
                    >
                      {d.btnAssign}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal overlays */}
        {selectedApp && actionType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-[20px] border border-border bg-card p-6 shadow-xl space-y-5 relative">
              <button
                onClick={() => {
                  setSelectedApp(null)
                  setActionType(null)
                  setError(null)
                }}
                className="absolute top-4 end-4 text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="size-5" />
              </button>

              <div className="space-y-1 text-start pe-6">
                <h4 className="text-lg font-black text-foreground">
                  {actionType === "view" && d.btnView}
                  {actionType === "approve" && d.confirmApproveTitle}
                  {actionType === "reject" && d.confirmRejectTitle}
                  {actionType === "assign" && d.confirmAssignTitle}
                </h4>
                <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                  {actionType === "view" && selectedApp.companyName}
                  {actionType === "approve" && d.confirmApproveDesc}
                  {actionType === "reject" && d.confirmRejectDesc}
                  {actionType === "assign" && d.confirmAssignDesc}
                </p>
              </div>

              {/* View details panel */}
              {actionType === "view" && (
                <div className="space-y-3 pt-3 border-t border-border/50 text-xs font-semibold text-start">
                  <div className="flex items-start gap-2">
                    <User className="size-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-foreground font-black">{selectedApp.contactPerson}</p>
                      <p className="text-muted-foreground">{selectedApp.email} | {selectedApp.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Building2 className="size-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-foreground font-black">{selectedApp.businessCategory}</p>
                      <p className="text-muted-foreground italic">&quot;{selectedApp.shortDescription}&quot;</p>
                    </div>
                  </div>

                  {selectedApp.message && (
                    <div className="bg-secondary p-3 rounded-lg border border-border/60">
                      <p className="text-foreground font-black text-[10px] uppercase mb-1">Applicant Message:</p>
                      <p className="text-muted-foreground leading-relaxed italic">&quot;{selectedApp.message}&quot;</p>
                    </div>
                  )}
                </div>
              )}

              {/* Approve / Reject Notes input */}
              {(actionType === "approve" || actionType === "reject") && (
                <div className="space-y-1.5 text-start">
                  <label className="text-xs font-bold text-foreground">
                    {d.notes} {actionType === "reject" && <span className="text-destructive">*</span>}
                  </label>
                  <textarea
                    rows={3}
                    required={actionType === "reject"}
                    value={inputNotes}
                    onChange={(e) => setInputNotes(e.target.value)}
                    placeholder={d.notesPlaceholder}
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              )}

              {/* Assign Booth inputs */}
              {actionType === "assign" && (
                <div className="space-y-4 text-start">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">{d.boothNumberLabel}</label>
                    <input
                      type="text"
                      required
                      value={inputBoothNo}
                      onChange={(e) => setInputBoothNo(e.target.value)}
                      placeholder="e.g. A-12"
                      className="w-full rounded-xl border border-border bg-card px-4 py-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none min-h-[44px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">{d.categoryLabel}</label>
                    <input
                      type="text"
                      required
                      value={inputCategory}
                      onChange={(e) => setInputCategory(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-4 py-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none min-h-[44px]"
                    />
                  </div>
                </div>
              )}

              {error && (
                <p className="text-xs font-black text-destructive text-start">{error}</p>
              )}

              {/* Footer buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                <button
                  onClick={() => {
                    setSelectedApp(null)
                    setActionType(null)
                    setError(null)
                  }}
                  className="rounded-xl border border-border bg-card hover:bg-secondary text-foreground px-4 py-2.5 text-xs font-black min-h-10 cursor-pointer"
                >
                  {d.cancel}
                </button>

                {actionType !== "view" && (
                  <button
                    disabled={actionSubmitting}
                    onClick={handleActionExecute}
                    className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 text-xs font-black min-h-10 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {actionSubmitting && <Loader2 className="size-3.5 animate-spin shrink-0" />}
                    <span>{d.submitAction}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
