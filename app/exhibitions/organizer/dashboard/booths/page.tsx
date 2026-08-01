"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  Calendar,
  Loader2,
  Compass,
  ArrowLeft,
  X,
  FileText,
  AlertCircle,
  Archive,
  Eye,
  EyeOff,
  Edit,
  Save,
  CheckCircle,
  Award,
  Globe,
  ExternalLink
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { MarketplaceShell, Breadcrumbs, ListingHeader } from "@/components/marketplace/shell"
import type { ExhibitionBooth } from "@/lib/domains/exhibition/types"

const dict = {
  en: {
    title: "Virtual Booth spaces",
    subtitle: "Coordinate participant pavilions, verify status updates, publish draft booths live, or archive offline booths.",
    back: "Back to Control Center",
    searchPlaceholder: "Search by company name, booth number...",
    all: "All Booths",
    draft: "Draft Booths",
    published: "Published Live",
    archived: "Archived/Offline",
    sortOrder: "Sort By",
    nameAlpha: "Alphabetical (A-Z)",
    boothNoAlpha: "Booth Number (Asc)",
    lastUpdated: "Recently Updated",
    company: "Company",
    boothNo: "Booth No.",
    category: "Pavilion Category",
    status: "Visibility State",
    lastUpdatedLabel: "Last Updated",
    actions: "Controls",
    btnView: "View Live",
    btnEdit: "Quick Edit",
    btnPublish: "Publish Live",
    btnUnpublish: "Unpublish (Draft)",
    btnArchive: "Archive",
    emptyState: "No booths currently match filtering criteria.",
    loading: "Loading virtual booth records...",
    errorLoad: "Failed to load booth list.",
    successOp: "Booth configuration updated!",
    editBoothTitle: "Quick Configure Booth Coordinates",
    editBoothDesc: "Manage designation, category classification, and profile parameters for this company.",
    boothNoLabel: "Designated Booth Number",
    categoryLabel: "Assigned Category/Pavilion",
    titleLabel: "Display Title Override (Company Name)",
    descriptionLabel: "Exhibitor Intro Description",
    cancel: "Cancel",
    saveChanges: "Save Configurations",
    confirmArchiveTitle: "Archive Booth Space",
    confirmArchiveDesc: "Are you sure you want to archive this booth? It will go offline and be hidden from public directories.",
    confirmUnpublishTitle: "Revert Booth to Draft",
    confirmUnpublishDesc: "This booth will go offline immediately, allowing the exhibitor to review and submit details again.",
    confirmPublishTitle: "Publish Booth Live",
    confirmPublishDesc: "By publishing, this booth and all its associated exhibits (prototypes, catalogs) will go live to virtual trade visitors.",
    confirmAction: "Execute Action"
  },
  fr: {
    title: "Espaces Stands Virtuels",
    subtitle: "Gérez les pavillons des participants, vérifiez les statuts, publiez les brouillons ou archivez les stands hors ligne.",
    back: "Retour au tableau de bord",
    searchPlaceholder: "Rechercher par entreprise, stand...",
    all: "Tous les stands",
    draft: "Mode Brouillon",
    published: "Publiés en direct",
    archived: "Archivés",
    sortOrder: "Trier par",
    nameAlpha: "Alphabétique (A-Z)",
    boothNoAlpha: "Numéro de stand (Asc)",
    lastUpdated: "Récemment mis à jour",
    company: "Entreprise",
    boothNo: "N° Stand",
    category: "Pavillon de placement",
    status: "État de visibilité",
    lastUpdatedLabel: "Mis à jour le",
    actions: "Contrôles",
    btnView: "Voir en direct",
    btnEdit: "Modifier",
    btnPublish: "Publier",
    btnUnpublish: "Dépublier",
    btnArchive: "Archiver",
    emptyState: "Aucun stand ne correspond à votre recherche.",
    loading: "Chargement des stands...",
    errorLoad: "Impossible de charger la liste.",
    successOp: "Configuration du stand mise à jour !",
    editBoothTitle: "Configuration Rapide du Stand",
    editBoothDesc: "Modifiez l'affectation, la catégorie et la description introductive de ce stand.",
    boothNoLabel: "Numéro de stand affecté",
    categoryLabel: "Pavillon de placement",
    titleLabel: "Nom affiché du stand",
    descriptionLabel: "Description de l'exposant",
    cancel: "Annuler",
    saveChanges: "Enregistrer",
    confirmArchiveTitle: "Archiver le Stand",
    confirmArchiveDesc: "Voulez-vous vraiment archiver ce stand ? Il sera mis hors ligne et masqué des annuaires.",
    confirmUnpublishTitle: "Remettre en mode Brouillon",
    confirmUnpublishDesc: "Le stand sera mis hors ligne immédiatement, permettant à l'exposant de modifier ses données.",
    confirmPublishTitle: "Publier le Stand en Direct",
    confirmPublishDesc: "Le stand et ses produits/innovations seront visibles par tous les visiteurs du salon virtuel.",
    confirmAction: "Confirmer"
  },
  ar: {
    title: "مساحات الأجنحة الافتراضية",
    subtitle: "تنسيق أجنحة المشاركين، مراجعة وتحديث الحالات، نشر الأجنحة مسودة، أو أرشفة الأجنحة غير النشطة.",
    back: "العودة إلى لوحة التحكم",
    searchPlaceholder: "البحث حسب اسم الشركة، رقم الجناح...",
    all: "جميع الأجنحة",
    draft: "الأجنحة المسودة",
    published: "المنشورة بث حي",
    archived: "المؤرشفة/المخفية",
    sortOrder: "ترتيب الفرز",
    nameAlpha: "أبجدياً (A-Z)",
    boothNoAlpha: "رقم الجناح (تصاعدي)",
    lastUpdated: "الأحدث تحديثاً",
    company: "الشركة",
    boothNo: "رقم الجناح",
    category: "فئة القطاع",
    status: "حالة الظهور",
    lastUpdatedLabel: "آخر تحديث",
    actions: "التحكم",
    btnView: "عرض البث الحي",
    btnEdit: "تعديل سريع",
    btnPublish: "نشر مباشر",
    btnUnpublish: "إلغاء النشر (مسودة)",
    btnArchive: "أرشفة",
    emptyState: "لا توجد أجنحة تطابق معايير الفرز والبحث حالياً.",
    loading: "جاري تحميل سجلات الأجنحة الافتراضية...",
    errorLoad: "فشل تحميل قائمة الأجنحة.",
    successOp: "تم تحديث تكوين الجناح بنجاح!",
    editBoothTitle: "التكوين السريع لإحداثيات الجناح",
    editBoothDesc: "إدارة الرمز، الفئة المصنفة، والوصف التعريفي للشركة المشتركة.",
    boothNoLabel: "رقم الجناح المخصص",
    categoryLabel: "الفئة والقطاع المعين",
    titleLabel: "الاسم التجاري المعروض للجناح",
    descriptionLabel: "نبذة تعريفية بالعارض",
    cancel: "إلغاء",
    saveChanges: "حفظ الإعدادات",
    confirmArchiveTitle: "أرشفة الجناح",
    confirmArchiveDesc: "هل أنت متأكد من أرشفة هذا الجناح؟ سيتم إخفاؤه وحجبه عن دليل الزوار بالكامل.",
    confirmUnpublishTitle: "إعادة الجناح للمسودة",
    confirmUnpublishDesc: "سيتم إلغاء نشر الجناح فوراً لإتاحة المجال للعارض لتحديث بياناته وإعادة تقديمها.",
    confirmPublishTitle: "نشر الجناح بث مباشر",
    confirmPublishDesc: "بموجب النشر المباشر، سيتمكن زوار المعرض من استعراض الجناح وكتالوجات المنتجات الملحقة.",
    confirmAction: "تأكيد الإجراء"
  }
}

export default function BoothsManagementPage() {
  return (
    <MarketplaceShell>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
          </div>
        }
      >
        <BoothsListContent />
      </Suspense>
    </MarketplaceShell>
  )
}

function BoothsListContent() {
  const { lang, dir, t } = useLanguage()
  const d = dict[lang] || dict.en
  const router = useRouter()

  const [booths, setBooths] = useState<ExhibitionBooth[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Filtering / Sorting
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState<"updated" | "alpha" | "booth">("updated")
  const [triggerReload, setTriggerReload] = useState(0)

  // Interactive Action Overlays
  const [selectedBooth, setSelectedBooth] = useState<ExhibitionBooth | null>(null)
  const [actionType, setActionType] = useState<"edit" | "publish" | "unpublish" | "archive" | null>(null)

  // Quick Edit input parameters
  const [inputBoothNo, setInputBoothNo] = useState("")
  const [inputCategory, setInputCategory] = useState("")
  const [inputTitle, setInputTitle] = useState("")
  const [inputDescription, setInputDescription] = useState("")
  const [submittingAction, setSubmittingAction] = useState(false)

  useEffect(() => {
    let active = true

    fetch("/api/exhibitions/organizer/booths")
      .then((res) => res.json())
      .then((json) => {
        if (!active) return
        if (json.success && json.data) {
          setBooths(json.data)
        } else {
          setError(json.error || d.errorLoad)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load booths list:", err)
        if (!active) return
        setError(d.errorLoad)
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [triggerReload, d.errorLoad])

  const handleActionExecute = async () => {
    if (!selectedBooth || !actionType) return
    setSubmittingAction(true)
    setError(null)
    setSuccess(null)

    try {
      if (actionType === "edit") {
        // Save Coordinates
        const resCoord = await fetch("/api/exhibitions/organizer/applications", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "assign-booth",
            id: selectedBooth.id,
            boothNumber: inputBoothNo.trim(),
            category: inputCategory.trim(),
          }),
        })
        const coordJson = await resCoord.json()
        if (!coordJson.success) throw new Error(coordJson.error)

        // Overwrite title & description
        const resDraft = await fetch("/api/exhibitions/booth", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            id: selectedBooth.id,
            title: inputTitle.trim(),
            description: inputDescription.trim(),
            status: selectedBooth.status,
          }),
        })
        const draftJson = await resDraft.json()
        if (!draftJson.success) throw new Error(draftJson.error)

      } else {
        // Status State Transitions (Publish, Unpublish, Archive)
        const targetStatus =
          actionType === "publish" ? "Published" :
          actionType === "unpublish" ? "Draft" : "Archived"

        const res = await fetch("/api/exhibitions/organizer/booths", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "update-status",
            boothId: selectedBooth.id,
            status: targetStatus,
          }),
        })
        const json = await res.json()
        if (!json.success) throw new Error(json.error)
      }

      setSuccess(d.successOp)
      setSelectedBooth(null)
      setActionType(null)
      setTriggerReload((prev) => prev + 1)
    } catch (err: any) {
      console.error("Failed booth coordinate action:", err)
      setError(err.message || "Operation failed")
    } finally {
      setSubmittingAction(false)
    }
  }

  // Frontend list search, filtering, and sorting
  const filteredBooths = booths
    .filter((b) => {
      // 1. Search Query
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase()
        const companyName = (b.title || b.company?.name || "").toLowerCase()
        const boothNo = (b.boothNumber || "").toLowerCase()
        const desc = (b.description || "").toLowerCase()
        if (!companyName.includes(query) && !boothNo.includes(query) && !desc.includes(query)) {
          return false
        }
      }

      // 2. Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "Draft" && b.status !== "Draft" && b.status !== "Submitted") return false
        if (statusFilter === "Published" && (b.status !== "Published" || b.isArchived)) return false
        if (statusFilter === "Archived" && !b.isArchived && b.status !== "Archived") return false
      }

      return true
    })
    .sort((a, b) => {
      if (sortOrder === "alpha") {
        const nameA = a.title || a.company?.name || ""
        const nameB = b.title || b.company?.name || ""
        return nameA.localeCompare(nameB)
      }
      if (sortOrder === "booth") {
        const numA = a.boothNumber || ""
        const numB = b.boothNumber || ""
        return numA.localeCompare(numB, undefined, { numeric: true, sensitivity: 'base' })
      }
      // Default Recently updated
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
      return dateB - dateA
    })

  const getStatusBadge = (status: string, archived: boolean) => {
    if (archived || status === "Archived") {
      return {
        label: d.archived,
        classes: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        icon: <Archive className="size-3.5 shrink-0" />
      }
    }
    if (status === "Published") {
      return {
        label: d.published,
        classes: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        icon: <CheckCircle className="size-3.5 shrink-0" />
      }
    }
    // Draft or Submitted
    return {
      label: d.draft,
      classes: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      icon: <AlertCircle className="size-3.5 shrink-0" />
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

        {/* Global Operational successes */}
        {success && (
          <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle className="size-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Filters Toolbar */}
        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/60 pb-6 mb-6">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder={d.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-border bg-card ps-11 pe-4 py-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none min-h-[44px]"
            />
            <Search className="absolute start-4 top-3 size-4.5 text-muted-foreground" />
          </div>

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
                <option value="Draft">{d.draft}</option>
                <option value="Published">{d.published}</option>
                <option value="Archived">{d.archived}</option>
              </select>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="size-4 text-muted-foreground shrink-0" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-bold text-foreground focus:border-primary focus:outline-none min-h-[38px] cursor-pointer"
              >
                <option value="updated">{d.lastUpdated}</option>
                <option value="alpha">{d.nameAlpha}</option>
                <option value="booth">{d.boothNoAlpha}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Booth Card Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-xs font-bold text-muted-foreground">{d.loading}</span>
          </div>
        ) : filteredBooths.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-border bg-card p-12 text-center space-y-4">
            <Compass className="size-12 text-muted-foreground/60 mx-auto" />
            <p className="text-sm font-black text-foreground">{d.emptyState}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBooths.map((b) => {
              const companyName = b.title || b.company?.name || "Premium Participant"
              const hasPremiumBadge = b.isFeatured || b.company?.verificationTier === "premium"

              return (
                <div
                  key={b.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-[20px] border border-border bg-card p-5 transition-all hover:shadow-md md:flex-row md:items-center gap-4 text-start"
                >
                  <div className="flex items-start gap-4">
                    {/* Secondary logo avatar */}
                    <div className="size-12 overflow-hidden rounded-xl border border-border bg-secondary shrink-0 flex items-center justify-center relative">
                      {b.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.logoUrl} alt={companyName} className="size-full object-cover" />
                      ) : (
                        <Building2 className="size-6 text-primary" />
                      )}
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-black text-foreground truncate flex items-center gap-1.5">
                          <span>{companyName}</span>
                          {hasPremiumBadge && (
                            <Award className="size-4 text-amber-500 shrink-0 fill-amber-500" />
                          )}
                        </h3>

                        {/* Status label */}
                        <div className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadge(b.status || "Draft", b.isArchived).classes}`}>
                          {getStatusBadge(b.status || "Draft", b.isArchived).icon}
                          <span>{getStatusBadge(b.status || "Draft", b.isArchived).label}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-muted-foreground">
                        <p className="flex items-center gap-1">
                          <span className="font-extrabold text-foreground">{d.boothNo}:</span>
                          <span className="bg-secondary px-1.5 py-0.5 rounded font-black text-[11px] text-foreground">
                            {b.boothNumber || "Not Assigned"}
                          </span>
                        </p>
                        <p className="flex items-center gap-1">
                          <span className="font-extrabold text-foreground">{d.category}:</span>
                          <span>{b.category || "General Pavilion"}</span>
                        </p>
                      </div>

                      {/* Description clip */}
                      <p className="text-xs text-muted-foreground font-semibold leading-relaxed line-clamp-1">
                        {b.description}
                      </p>

                      {/* Last updated indicator */}
                      {b.updatedAt && (
                        <p className="text-[10px] font-semibold text-muted-foreground/80 flex items-center gap-1">
                          <Calendar className="size-3.5" />
                          <span>
                            {d.lastUpdatedLabel}: {new Date(b.updatedAt).toLocaleDateString()}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Panel */}
                  <div className="shrink-0 flex flex-wrap items-center gap-2">
                    {/* View Booth public layout */}
                    <a
                      href={`/exhibitions/booth/dashboard/preview`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-border bg-card hover:bg-secondary text-foreground px-3 py-2 text-xs font-black transition-all min-h-[38px] flex items-center gap-1"
                    >
                      <span>{d.btnView}</span>
                      <ExternalLink className="size-3.5 shrink-0" />
                    </a>

                    <button
                      onClick={() => {
                        setSelectedBooth(b)
                        setActionType("edit")
                        setInputBoothNo(b.boothNumber || "")
                        setInputCategory(b.category || "")
                        setInputTitle(b.title || b.company?.name || "")
                        setInputDescription(b.description || "")
                      }}
                      className="rounded-xl bg-secondary hover:bg-secondary/80 text-foreground px-3 py-2 text-xs font-black transition-all min-h-[38px] flex items-center gap-1"
                    >
                      <Edit className="size-3.5 shrink-0" />
                      <span>{d.btnEdit}</span>
                    </button>

                    {/* Publish/Unpublish toggle */}
                    {b.status !== "Published" && !b.isArchived && (
                      <button
                        onClick={() => {
                          setSelectedBooth(b)
                          setActionType("publish")
                        }}
                        className="rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-2 text-xs font-black transition-all min-h-[38px]"
                      >
                        {d.btnPublish}
                      </button>
                    )}

                    {b.status === "Published" && !b.isArchived && (
                      <button
                        onClick={() => {
                          setSelectedBooth(b)
                          setActionType("unpublish")
                        }}
                        className="rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-3 py-2 text-xs font-black transition-all min-h-[38px]"
                      >
                        {d.btnUnpublish}
                      </button>
                    )}

                    {!b.isArchived && b.status !== "Archived" && (
                      <button
                        onClick={() => {
                          setSelectedBooth(b)
                          setActionType("archive")
                        }}
                        className="rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-3 py-2 text-xs font-black transition-all min-h-[38px]"
                      >
                        {d.btnArchive}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal overlays */}
        {selectedBooth && actionType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-[20px] border border-border bg-card p-6 shadow-xl space-y-5 relative">
              <button
                onClick={() => {
                  setSelectedBooth(null)
                  setActionType(null)
                  setError(null)
                }}
                className="absolute top-4 end-4 text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="size-5" />
              </button>

              <div className="space-y-1 text-start pe-6">
                <h4 className="text-lg font-black text-foreground">
                  {actionType === "edit" && d.editBoothTitle}
                  {actionType === "publish" && d.confirmPublishTitle}
                  {actionType === "unpublish" && d.confirmUnpublishTitle}
                  {actionType === "archive" && d.confirmArchiveTitle}
                </h4>
                <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                  {actionType === "edit" && d.editBoothDesc}
                  {actionType === "publish" && d.confirmPublishDesc}
                  {actionType === "unpublish" && d.confirmUnpublishDesc}
                  {actionType === "archive" && d.confirmArchiveDesc}
                </p>
              </div>

              {/* Quick Configuration Inputs */}
              {actionType === "edit" && (
                <div className="space-y-4 text-start">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">{d.titleLabel}</label>
                    <input
                      type="text"
                      required
                      value={inputTitle}
                      onChange={(e) => setInputTitle(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-4 py-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none min-h-[44px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">{d.boothNoLabel}</label>
                      <input
                        type="text"
                        required
                        value={inputBoothNo}
                        onChange={(e) => setInputBoothNo(e.target.value)}
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

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">{d.descriptionLabel}</label>
                    <textarea
                      rows={3}
                      required
                      value={inputDescription}
                      onChange={(e) => setInputDescription(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-4 py-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {error && (
                <p className="text-xs font-black text-destructive text-start">{error}</p>
              )}

              {/* Footer controls */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                <button
                  onClick={() => {
                    setSelectedBooth(null)
                    setActionType(null)
                    setError(null)
                  }}
                  className="rounded-xl border border-border bg-card hover:bg-secondary text-foreground px-4 py-2.5 text-xs font-black min-h-10 cursor-pointer"
                >
                  {d.cancel}
                </button>

                <button
                  disabled={submittingAction}
                  onClick={handleActionExecute}
                  className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 text-xs font-black min-h-10 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submittingAction && <Loader2 className="size-3.5 animate-spin shrink-0" />}
                  <span>{actionType === "edit" ? d.saveChanges : d.confirmAction}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
