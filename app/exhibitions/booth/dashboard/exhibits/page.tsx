"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Copy,
  ArrowUp,
  ArrowDown,
  Sparkles,
  CheckCircle,
  Clock,
  Archive,
  Loader2,
  Inbox,
  Star,
  Globe,
  Video,
  Image as ImageIcon
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { MarketplaceShell, Breadcrumbs, ListingHeader } from "@/components/marketplace/shell"
import type { ExhibitionExhibit, ExhibitionBooth } from "@/lib/domains/exhibition/types"

const dict = {
  en: {
    title: "Manage Exhibition Exhibits",
    subtitle: "Showcase prototypes, machinery, new launches, samples, and specific exhibition items. These are independent of the core marketplace products.",
    backToDashboard: "Back to Booth Workspace",
    addExhibit: "Add New Exhibit",
    loading: "Loading exhibits list...",
    errorLoading: "Failed to load exhibits. Please refresh or try again.",
    emptyStateTitle: "No Exhibits Found",
    emptyStateDesc: "You haven't added any exhibits to this booth pavilion yet. Add your first prototype, machine, product, or B2B sample to stand out to international buyers.",
    duplicateBtn: "Duplicate",
    deleteBtn: "Delete",
    editBtn: "Edit",
    statusDraft: "Draft",
    statusSubmitted: "Submitted",
    statusPublished: "Published",
    featured: "Featured Showroom Item",
    category: "Category",
    confirmDelete: "Are you sure you want to delete this exhibit? This action cannot be undone.",
    saving: "Saving...",
    reorderLabel: "Sort Order",
    moveUp: "Move Up",
    moveDown: "Move Down",
    toastSuccessDuplicate: "✅ Exhibit duplicated successfully!",
    toastSuccessDelete: "✅ Exhibit deleted successfully!",
    toastSuccessReorder: "✅ Exhibit order updated!",
    toastError: "❌ Something went wrong. Please try again.",
    noDescription: "No description provided for this exhibit.",
  },
  fr: {
    title: "Gérer les pièces exposées",
    subtitle: "Présentez des prototypes, des machines, de nouveaux lancements, des échantillons et des articles d'exposition spécifiques. Ceux-ci sont indépendants des produits du marché principal.",
    backToDashboard: "Retour à l'espace stand",
    addExhibit: "Ajouter une pièce exposée",
    loading: "Chargement de la liste...",
    errorLoading: "Échec du chargement. Veuillez rafraîchir ou réessayer.",
    emptyStateTitle: "Aucune pièce trouvée",
    emptyStateDesc: "Vous n'avez pas encore ajouté de pièces d'exposition à ce pavillon. Ajoutez votre premier prototype, machine ou échantillon B2B pour attirer l'attention des acheteurs.",
    duplicateBtn: "Dupliquer",
    deleteBtn: "Supprimer",
    editBtn: "Modifier",
    statusDraft: "Brouillon",
    statusSubmitted: "Soumis",
    statusPublished: "Publié",
    featured: "Article vedette du showroom",
    category: "Catégorie",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cette pièce d'exposition ? Cette action est irréversible.",
    saving: "Enregistrement...",
    reorderLabel: "Ordre",
    moveUp: "Monter",
    moveDown: "Descendre",
    toastSuccessDuplicate: "✅ Pièce dupliquée avec succès !",
    toastSuccessDelete: "✅ Pièce supprimée avec succès !",
    toastSuccessReorder: "✅ Ordre mis à jour !",
    toastError: "❌ Une erreur s'est produite. Veuillez réessayer.",
    noDescription: "Aucune description fournie.",
  },
  ar: {
    title: "إدارة معروضات الجناح",
    subtitle: "اعرض النماذج الأولية، والآلات، والابتكارات الجديدة، والعينات، والمواد المخصصة للمعرض. هذه المعروضات مستقلة تماماً عن منتجات السوق الرئيسي.",
    backToDashboard: "العودة لمساحة عمل الجناح",
    addExhibit: "إضافة معروض جديد",
    loading: "جاري تحميل قائمة المعروضات...",
    errorLoading: "فشل تحميل المعروضات. يرجى إعادة المحاولة.",
    emptyStateTitle: "لا توجد معروضات مضافة بعد",
    emptyStateDesc: "لم تقم بإضافة أي معروضات إلى جناحك بعد. أضف نموذجك الأول أو آلتك أو عينة B2B المخصصة للتميز أمام المشترين الدوليين.",
    duplicateBtn: "تكرار",
    deleteBtn: "حذف",
    editBtn: "تعديل",
    statusDraft: "مسودة",
    statusSubmitted: "تم الإرسال",
    statusPublished: "منشور",
    featured: "معروض مميز بصالة العرض",
    category: "الفئة",
    confirmDelete: "هل أنت متأكد من رغبتك في حذف هذا المعروض؟ لا يمكن التراجع عن هذا الإجراء.",
    saving: "جاري الحفظ...",
    reorderLabel: "الترتيب",
    moveUp: "نقل للأعلى",
    moveDown: "نقل للأسفل",
    toastSuccessDuplicate: "✅ تم تكرار المعروض بنجاح!",
    toastSuccessDelete: "✅ تم حذف المعروض بنجاح!",
    toastSuccessReorder: "✅ تم تحديث ترتيب المعروضات!",
    toastError: "❌ حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    noDescription: "لم يتم تقديم وصف تفصيلي لهذا المعروض.",
  }
}

export default function ExhibitsDashboardPage() {
  return (
    <MarketplaceShell>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
          </div>
        }
      >
        <ExhibitsSuspenseWrapper />
      </Suspense>
    </MarketplaceShell>
  )
}

function ExhibitsSuspenseWrapper() {
  const searchParams = useSearchParams()
  const boothId = searchParams.get("boothId") || ""
  return <ExhibitsContent key={boothId} boothId={boothId} />
}

interface ExhibitsContentProps {
  boothId: string
}

function ExhibitsContent({ boothId }: ExhibitsContentProps) {
  const { lang, dir } = useLanguage()
  const d = dict[lang] || dict.en
  const router = useRouter()

  const [booth, setBooth] = useState<ExhibitionBooth | null>(null)
  const [exhibits, setExhibits] = useState<ExhibitionExhibit[]>([])
  const [loading, setLoading] = useState(!!boothId)
  const [error, setError] = useState<string | null>(boothId ? null : "No boothId provided in URL parameters.")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; isError: boolean } | null>(null)

  // Load booth and exhibits
  useEffect(() => {
    if (!boothId) return

    let active = true

    Promise.all([
      fetch(`/api/exhibitions/booth?id=${encodeURIComponent(boothId)}`).then((r) => r.json()),
      fetch(`/api/exhibitions/booth/exhibits?boothId=${encodeURIComponent(boothId)}`).then((r) => r.json()),
    ])
      .then(([boothRes, exhibitsRes]) => {
        if (!active) return
        if (boothRes.success && boothRes.data) {
          setBooth(boothRes.data)
        } else {
          throw new Error("Failed to load booth information")
        }

        if (exhibitsRes.success && Array.isArray(exhibitsRes.data)) {
          setExhibits(exhibitsRes.data)
        } else {
          throw new Error("Failed to load exhibits list")
        }

        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load exhibits workspace data:", err)
        if (!active) return
        setError(d.errorLoading)
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [boothId, d.errorLoading])

  // Trigger quick automated Toast message
  const triggerToast = (message: string, isError = false) => {
    setToast({ message, isError })
    setTimeout(() => {
      setToast(null)
    }, 4000)
  }

  // Handle Duplication
  const handleDuplicate = async (id: string) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/exhibitions/booth/exhibits/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "duplicate" }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        setExhibits((prev) => [...prev, json.data])
        triggerToast(d.toastSuccessDuplicate)
      } else {
        triggerToast(json.error || d.toastError, true)
      }
    } catch (err) {
      console.error("Error duplicating exhibit:", err)
      triggerToast(d.toastError, true)
    } finally {
      setActionLoading(null)
    }
  }

  // Handle Deletion
  const handleDelete = async (id: string) => {
    if (!confirm(d.confirmDelete)) return
    setActionLoading(id)
    try {
      const res = await fetch(`/api/exhibitions/booth/exhibits/${encodeURIComponent(id)}`, {
        method: "DELETE",
      })
      const json = await res.json()
      if (json.success) {
        setExhibits((prev) => prev.filter((item) => item.id !== id))
        triggerToast(d.toastSuccessDelete)
      } else {
        triggerToast(json.error || d.toastError, true)
      }
    } catch (err) {
      console.error("Error deleting exhibit:", err)
      triggerToast(d.toastError, true)
    } finally {
      setActionLoading(null)
    }
  }

  // Handle Reordering (Move item Up or Down in sequence)
  const handleMove = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return
    if (direction === "down" && index === exhibits.length - 1) return

    const targetIndex = direction === "up" ? index - 1 : index + 1
    const reorderedList = [...exhibits]

    // Swap items
    const temp = reorderedList[index]
    reorderedList[index] = reorderedList[targetIndex]
    reorderedList[targetIndex] = temp

    // Optimistic Update
    setExhibits(reorderedList)

    const orderedIds = reorderedList.map((e) => e.id)
    setActionLoading("reorder")

    try {
      const res = await fetch("/api/exhibitions/booth/exhibits", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ boothId, orderedIds }),
      })
      const json = await res.json()
      if (json.success) {
        triggerToast(d.toastSuccessReorder)
      } else {
        triggerToast(d.toastError, true)
      }
    } catch (err) {
      console.error("Error reordering exhibits:", err)
      triggerToast(d.toastError, true)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="pb-16" dir={dir}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Exhibitor Workspace", href: `/exhibitions/booth/dashboard?id=${boothId}` },
          { label: "Manage Exhibits" },
        ]}
      />

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Toast Notifier */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-black shadow-lg transition-all border ${
              toast.isError
                ? "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50"
                : "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900/50"
            }`}
          >
            <span>{toast.message}</span>
          </div>
        )}

        {/* Back Link */}
        <div className="mb-4">
          <Link
            href={`/exhibitions/booth/dashboard?id=${boothId}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft className="size-4" />
            <span>{d.backToDashboard}</span>
          </Link>
        </div>

        {loading ? (
          /* Loading Skeletons */
          <div className="space-y-6">
            <div className="h-12 w-2/3 bg-secondary animate-pulse rounded-lg" />
            <div className="h-4 w-full bg-secondary animate-pulse rounded-lg" />
            <div className="space-y-4 pt-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 w-full bg-secondary animate-pulse rounded-[20px]" />
              ))}
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="rounded-[20px] border border-destructive/20 bg-destructive/5 p-6 text-center space-y-4">
            <p className="text-sm font-bold text-foreground">{error}</p>
            <button
              onClick={() => router.push(`/exhibitions/booth/dashboard?id=${boothId}`)}
              className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold"
            >
              <ArrowLeft className="size-4" />
              <span>{d.backToDashboard}</span>
            </button>
          </div>
        ) : (
          /* Main Exhibits Workspace Content */
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
              <div className="space-y-1">
                <h1 className="text-2xl font-black text-foreground">{d.title}</h1>
                <p className="text-xs font-medium text-muted-foreground leading-relaxed max-w-xl">
                  {d.subtitle}
                </p>
                {booth && (
                  <p className="text-[11px] font-extrabold text-primary uppercase pt-1">
                    {booth.company?.name} — {booth.boothNumber}
                  </p>
                )}
              </div>

              <button
                onClick={() => router.push(`/exhibitions/booth/dashboard/exhibits/new?boothId=${boothId}`)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground px-5 py-3 text-xs font-black transition-all min-h-[44px] shrink-0"
              >
                <Plus className="size-4" />
                <span>{d.addExhibit}</span>
              </button>
            </div>

            {exhibits.length === 0 ? (
              /* Beautiful B2B Empty State */
              <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-[20px] border-2 border-dashed border-border/60 bg-card/40 space-y-4">
                <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Inbox className="size-7" />
                </div>
                <div className="space-y-1 max-w-md">
                  <h3 className="text-base font-black text-foreground">{d.emptyStateTitle}</h3>
                  <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                    {d.emptyStateDesc}
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/exhibitions/booth/dashboard/exhibits/new?boothId=${boothId}`)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2.5 text-xs font-black"
                >
                  <Plus className="size-4" />
                  <span>{d.addExhibit}</span>
                </button>
              </div>
            ) : (
              /* Exhibits List with controls */
              <div className="space-y-4">
                {exhibits.map((ex, index) => {
                  const isFirst = index === 0
                  const isLast = index === exhibits.length - 1

                  return (
                    <div
                      key={ex.id}
                      className="group relative overflow-hidden rounded-[20px] border border-border bg-card p-4 transition-all hover:shadow-sm"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row">
                        {/* Image preview / icon fallbacks */}
                        <div className="relative size-24 overflow-hidden rounded-xl border border-border bg-secondary/40 shrink-0 m-auto sm:m-0">
                          {ex.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={ex.images[0]}
                              alt={ex.name}
                              className="size-full object-cover"
                            />
                          ) : (
                            <div className="size-full flex flex-col items-center justify-center text-muted-foreground bg-secondary/10">
                              <ImageIcon className="size-5" />
                              <span className="text-[9px] font-bold mt-1">Showroom</span>
                            </div>
                          )}

                          {/* Media count pills */}
                          <div className="absolute bottom-1 right-1 flex gap-1">
                            {ex.videos && ex.videos.length > 0 && (
                              <div className="bg-background/80 backdrop-blur-sm rounded px-1 py-0.5 text-[8px] font-bold flex items-center gap-0.5">
                                <Video className="size-2 text-primary" />
                              </div>
                            )}
                            {(ex.pdfUrl || ex.brochureUrl) && (
                              <div className="bg-background/80 backdrop-blur-sm rounded px-1 py-0.5 text-[8px] font-bold text-primary flex items-center">
                                PDF
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Text and Badges */}
                        <div className="flex-1 min-w-0 space-y-1.5 text-center sm:text-start">
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <h3 className="text-sm font-black text-foreground truncate max-w-xs sm:max-w-md">
                              {ex.name}
                            </h3>

                            {/* Status badge */}
                            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                              <Clock className="size-3" />
                              {d.statusDraft}
                            </span>

                            {/* Featured status badge */}
                            {ex.isFeatured && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary px-2.5 py-0.5 text-[10px] font-extrabold uppercase">
                                <Star className="size-3 fill-current" />
                                {d.featured}
                              </span>
                            )}
                          </div>

                          <p className="text-xs font-medium text-muted-foreground line-clamp-1">
                            {d.category}: <span className="font-extrabold text-foreground">{ex.category || booth?.category}</span>
                          </p>

                          <p className="text-xs font-semibold text-muted-foreground line-clamp-2 leading-relaxed">
                            {ex.shortDescription || ex.description || <span className="italic">{d.noDescription}</span>}
                          </p>
                        </div>

                        {/* Actions (Reorder, Edit, Duplicate, Delete) */}
                        <div className="flex flex-row sm:flex-col justify-center gap-1.5 border-t sm:border-t-0 border-border/60 pt-3 sm:pt-0 sm:ps-4 shrink-0">
                          {/* Reordering Up/Down Controls */}
                          <div className="flex sm:flex-row gap-1 border-r sm:border-r-0 sm:border-b border-border/60 pe-1.5 sm:pe-0 sm:pb-1.5 justify-center">
                            <button
                              disabled={isFirst || actionLoading !== null}
                              onClick={() => handleMove(index, "up")}
                              title={d.moveUp}
                              className="size-8 rounded-lg flex items-center justify-center bg-secondary hover:bg-secondary/80 disabled:opacity-40 text-foreground transition-all shrink-0"
                            >
                              <ArrowUp className="size-3.5" />
                            </button>
                            <button
                              disabled={isLast || actionLoading !== null}
                              onClick={() => handleMove(index, "down")}
                              title={d.moveDown}
                              className="size-8 rounded-lg flex items-center justify-center bg-secondary hover:bg-secondary/80 disabled:opacity-40 text-foreground transition-all shrink-0"
                            >
                              <ArrowDown className="size-3.5" />
                            </button>
                          </div>

                          {/* Item specific actions */}
                          <div className="flex gap-1.5 justify-center">
                            <button
                              disabled={actionLoading !== null}
                              onClick={() => router.push(`/exhibitions/booth/dashboard/exhibits/${ex.id}/edit?boothId=${boothId}`)}
                              title={d.editBtn}
                              className="size-8 rounded-lg flex items-center justify-center border border-border bg-card text-foreground hover:bg-secondary transition-all shrink-0"
                            >
                              <Edit className="size-3.5" />
                            </button>

                            <button
                              disabled={actionLoading !== null}
                              onClick={() => handleDuplicate(ex.id)}
                              title={d.duplicateBtn}
                              className="size-8 rounded-lg flex items-center justify-center border border-border bg-card text-foreground hover:bg-secondary transition-all shrink-0"
                            >
                              {actionLoading === ex.id ? (
                                <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                            </button>

                            <button
                              disabled={actionLoading !== null}
                              onClick={() => handleDelete(ex.id)}
                              title={d.deleteBtn}
                              className="size-8 rounded-lg flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/30 transition-all shrink-0"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
