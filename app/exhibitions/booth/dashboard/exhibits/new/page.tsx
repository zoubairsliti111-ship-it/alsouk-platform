"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  FileText,
  Video,
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { MarketplaceShell, Breadcrumbs, ListingHeader } from "@/components/marketplace/shell"
import type { ExhibitionBooth } from "@/lib/domains/exhibition/types"

const dict = {
  en: {
    title: "Add New Exhibit",
    subtitle: "Create a dedicated virtual exhibit showcasing a product, machinery prototype, or sample specifically for your pavilion.",
    backToExhibits: "Back to Exhibits List",
    loading: "Loading pavilion details...",
    errorLoading: "Failed to verify booth. Please return and try again.",
    saving: "Creating Exhibit...",

    // Form labels
    nameLabel: "Exhibit Name / Title *",
    namePlaceholder: "e.g., Cold-Pressed Sfax Blend, Bio Thread Spinner 2000...",
    shortDescLabel: "Short Description (Under 150 characters) *",
    shortDescPlaceholder: "A brief summary that will entice buyers in the gallery directory...",
    fullDescLabel: "Full Description / Technical About *",
    fullDescPlaceholder: "Write comprehensive details, specific materials used, dimension sheets, prototype innovations, or sample details...",
    categoryLabel: "Product/Service Category",
    categoryPlaceholder: "e.g., Machinery, Raw Ingredients, Organic Olive Oil...",
    featuredLabel: "Feature in virtual pavilion showroom?",
    featuredDesc: "Yes, showcase this item prominently in the main gallery.",

    // Media Attachments
    mediaHeading: "Exhibit Attachments",
    mediaDesc: "Attach digital representations belonging only to this exhibition item.",
    imageUrlLabel: "Image Cover URL (PNG, JPG, or WEBP)",
    imageUrlPlaceholder: "https://images.unsplash.com/photo-...",
    videoUrlLabel: "Promotional Video URL (MP4 or YouTube)",
    videoUrlPlaceholder: "https://www.w3schools.com/html/mov_bbb.mp4",
    pdfUrlLabel: "PDF Catalogue / Technical Brochure URL",
    pdfUrlPlaceholder: "https://mysite.com/brochures/...",

    // Actions
    submitBtn: "Save Draft & Create",
    cancelBtn: "Cancel",

    // Feedback
    successMsg: "Exhibit created successfully! Redirecting...",
    errorFields: "Please fill out all mandatory fields marked with (*).",
    errorLength: "Short description should be under 150 characters.",
  },
  fr: {
    title: "Ajouter une pièce exposée",
    subtitle: "Créez une exposition virtuelle dédiée à un produit, un prototype de machine ou un échantillon.",
    backToExhibits: "Retour à la liste des pièces",
    loading: "Chargement...",
    errorLoading: "Échec de chargement. Veuillez retourner et réessayer.",
    saving: "Création en cours...",

    nameLabel: "Nom de la pièce exposée / Titre *",
    namePlaceholder: "ex: Mélange Sfax pressé à froid...",
    shortDescLabel: "Brève description (Moins de 150 caractères) *",
    shortDescPlaceholder: "Un résumé rapide pour attirer les acheteurs...",
    fullDescLabel: "Description complète / Fiche technique *",
    fullDescPlaceholder: "Rédigez des détails complets, spécifications techniques, matériaux utilisés...",
    categoryLabel: "Catégorie de produit/service",
    categoryPlaceholder: "ex: Machines, Ingrédients bruts, Huile d'olive bio...",
    featuredLabel: "Mettre en vedette dans le showroom ?",
    featuredDesc: "Oui, afficher cet article en premier dans la galerie.",

    mediaHeading: "Pièces Jointes",
    mediaDesc: "Attachez des documents numériques appartenant uniquement à cet article.",
    imageUrlLabel: "URL de l'image de couverture (PNG, JPG ou WEBP)",
    imageUrlPlaceholder: "https://images.unsplash.com/photo-...",
    videoUrlLabel: "URL de la vidéo promotionnelle (MP4 ou YouTube)",
    videoUrlPlaceholder: "https://www.w3schools.com/html/mov_bbb.mp4",
    pdfUrlLabel: "URL de la brochure technique PDF",
    pdfUrlPlaceholder: "https://mysite.com/brochures/...",

    submitBtn: "Enregistrer le brouillon",
    cancelBtn: "Annuler",

    successMsg: "Pièce créée avec succès ! Redirection...",
    errorFields: "Veuillez remplir tous les champs obligatoires marqués d'un (*).",
    errorLength: "La description courte doit comporter moins de 150 caractères.",
  },
  ar: {
    title: "إضافة معروض جديد",
    subtitle: "أنشئ معروضاً افتراضياً مخصصاً لعرض منتج، أو نموذج آلة، أو عينة مخصصة لجناحك.",
    backToExhibits: "العودة لقائمة المعروضات",
    loading: "جاري التحميل...",
    errorLoading: "فشل في التحقق من تفاصيل الجناح. يرجى العودة والمحاولة مرة أخرى.",
    saving: "جاري إنشاء المعروض...",

    nameLabel: "اسم المعروض / العنوان *",
    namePlaceholder: "مثال: خليط زيت صفاقس العضوي، آلة غزل الخيوط...",
    shortDescLabel: "وصف قصير (أقل من 150 حرفاً) *",
    shortDescPlaceholder: "ملخص موجز لجذب اهتمام المشترين في صالة العرض...",
    fullDescLabel: "وصف تفصيلي / التفاصيل الفنية *",
    fullDescPlaceholder: "اكتب تفاصيل شاملة، والمواد المستخدمة، وأبعاد المنتج أو تفاصيل العينة...",
    categoryLabel: "فئة المعروض",
    categoryPlaceholder: "مثال: آلات ومعدات، مواد خام، منتجات عضوية...",
    featuredLabel: "تميز المعروض في صالة العرض الافتراضية للجناح؟",
    featuredDesc: "نعم، اعرض هذا العنصر بشكل بارز في مقدمة صالة العرض.",

    mediaHeading: "الملحقات الرقمية للمعروض",
    mediaDesc: "أرفق تمثيلاً رقمياً مخصصاً لهذا المعروض.",
    imageUrlLabel: "رابط الصورة الرئيسية (PNG, JPG أو WEBP)",
    imageUrlPlaceholder: "https://images.unsplash.com/photo-...",
    videoUrlLabel: "رابط فيديو ترويجي (MP4 أو YouTube)",
    videoUrlPlaceholder: "https://www.w3schools.com/html/mov_bbb.mp4",
    pdfUrlLabel: "رابط كتالوج PDF أو بروشور فني",
    pdfUrlPlaceholder: "https://mysite.com/brochures/...",

    submitBtn: "حفظ كمسودة وإنشاء",
    cancelBtn: "إلغاء",

    successMsg: "تم إنشاء المعروض بنجاح! جاري تحويلك...",
    errorFields: "يرجى ملء جميع الحقول الإلزامية التي تحتوي على علامة (*).",
    errorLength: "يجب ألا يتجاوز الوصف القصير 150 حرفاً.",
  }
}

export default function CreateExhibitPage() {
  return (
    <MarketplaceShell>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
          </div>
        }
      >
        <CreateExhibitSuspenseWrapper />
      </Suspense>
    </MarketplaceShell>
  )
}

function CreateExhibitSuspenseWrapper() {
  const searchParams = useSearchParams()
  const boothId = searchParams.get("boothId") || ""
  return <CreateExhibitForm key={boothId} boothId={boothId} />
}

interface CreateExhibitFormProps {
  boothId: string
}

function CreateExhibitForm({ boothId }: CreateExhibitFormProps) {
  const { lang, dir } = useLanguage()
  const d = dict[lang] || dict.en
  const router = useRouter()

  const [booth, setBooth] = useState<ExhibitionBooth | null>(null)
  const [loading, setLoading] = useState(!!boothId)
  const [error, setError] = useState<string | null>(boothId ? null : "No boothId parameter found.")
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  // Form states
  const [name, setName] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [isFeatured, setIsFeatured] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [pdfUrl, setPdfUrl] = useState("")

  useEffect(() => {
    if (!boothId) return

    let active = true
    fetch(`/api/exhibitions/booth?id=${encodeURIComponent(boothId)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Status " + res.status)
        return res.json()
      })
      .then((json) => {
        if (!active) return
        if (json.success && json.data) {
          setBooth(json.data)
        } else {
          setError(d.errorLoading)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error verifying booth:", err)
        if (!active) return
        setError(d.errorLoading)
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [boothId, d.errorLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    // Validation
    if (!name.trim() || !shortDescription.trim() || !description.trim()) {
      setFormError(d.errorFields)
      return
    }

    if (shortDescription.length > 150) {
      setFormError(d.errorLength)
      return
    }

    setSaving(true)

    const payload = {
      boothId,
      name: name.trim(),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      category: category.trim() || null,
      isFeatured,
      images: imageUrl.trim() ? [imageUrl.trim()] : [],
      videos: videoUrl.trim() ? [videoUrl.trim()] : [],
      pdfUrl: pdfUrl.trim() || null,
      brochureUrl: pdfUrl.trim() || null,
      sortOrder: 1,
      status: "Draft",
    }

    try {
      const res = await fetch("/api/exhibitions/booth/exhibits", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      if (json.success) {
        setFormSuccess(d.successMsg)
        setTimeout(() => {
          router.push(`/exhibitions/booth/dashboard/exhibits?boothId=${boothId}`)
        }, 2000)
      } else {
        setFormError(json.error || "Failed to create exhibit. Please try again.")
        setSaving(false)
      }
    } catch (err) {
      console.error("Submit error:", err)
      setFormError("Server error occurred. Please try again later.")
      setSaving(false)
    }
  };

  return (
    <div className="pb-16" dir={dir}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Exhibitor Workspace", href: `/exhibitions/booth/dashboard?id=${boothId}` },
          { label: "Manage Exhibits", href: `/exhibitions/booth/dashboard/exhibits?boothId=${boothId}` },
          { label: "Add Exhibit" },
        ]}
      />

      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-4">
          <Link
            href={`/exhibitions/booth/dashboard/exhibits?boothId=${boothId}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft className="size-4" />
            <span>{d.backToExhibits}</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-xs font-bold text-muted-foreground">{d.loading}</span>
          </div>
        ) : error ? (
          <div className="rounded-[20px] border border-destructive/20 bg-destructive/5 p-6 text-center space-y-4">
            <p className="text-sm font-bold text-foreground">{error}</p>
            <button
              onClick={() => router.push(`/exhibitions/booth/dashboard?id=${boothId}`)}
              className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold"
            >
              <ArrowLeft className="size-4" />
              <span>{d.backToExhibits}</span>
            </button>
          </div>
        ) : booth?.status === "Submitted" ? (
          <div className="rounded-[20px] border border-blue-200 bg-blue-500/10 dark:bg-blue-950/30 dark:border-blue-900/50 p-6 text-center space-y-4">
            <AlertTriangle className="size-10 text-blue-500 mx-auto" />
            <h4 className="text-sm font-black text-foreground">Exhibits Workspace Locked</h4>
            <p className="text-xs font-medium text-muted-foreground leading-relaxed max-w-md mx-auto">
              Your booth has been submitted for review. Creating new exhibits is disabled until administrator review.
            </p>
            <button
              onClick={() => router.push(`/exhibitions/booth/dashboard/exhibits?boothId=${boothId}`)}
              className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold"
            >
              <ArrowLeft className="size-4" />
              <span>{d.backToExhibits}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <ListingHeader title={d.title} subtitle={d.subtitle} />

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Main content card */}
              <div className="rounded-[20px] border border-border bg-card p-6 space-y-4 shadow-sm">
                {/* Form feedback */}
                {formError && (
                  <div className="flex items-center gap-2 rounded-xl border border-destructive/25 bg-destructive/5 p-3.5 text-xs font-bold text-destructive">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {formSuccess && (
                  <div className="flex items-center gap-2 rounded-xl border border-green-250 bg-green-50 text-green-800 p-3.5 text-xs font-bold dark:bg-green-950/30 dark:text-green-300 dark:border-green-900/50">
                    <CheckCircle className="size-4 shrink-0 animate-bounce" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                {/* Exhibit Name */}
                <div className="space-y-1.5">
                  <label htmlFor="exhibit-name" className="text-xs font-black text-foreground">{d.nameLabel}</label>
                  <input
                    id="exhibit-name"
                    type="text"
                    required
                    disabled={saving}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={d.namePlaceholder}
                    className="flex min-h-[48px] w-full rounded-xl border border-border bg-background px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label htmlFor="exhibit-category" className="text-xs font-black text-foreground">{d.categoryLabel}</label>
                  <input
                    id="exhibit-category"
                    type="text"
                    disabled={saving}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder={d.categoryPlaceholder}
                    className="flex min-h-[48px] w-full rounded-xl border border-border bg-background px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Short Description */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <label htmlFor="exhibit-short-desc" className="font-black text-foreground">{d.shortDescLabel}</label>
                    <span className={`text-[10px] font-bold ${shortDescription.length > 150 ? "text-destructive" : "text-muted-foreground"}`}>
                      {shortDescription.length} / 150
                    </span>
                  </div>
                  <input
                    id="exhibit-short-desc"
                    type="text"
                    required
                    disabled={saving}
                    maxLength={180}
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder={d.shortDescPlaceholder}
                    className="flex min-h-[48px] w-full rounded-xl border border-border bg-background px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Full Description / Technical Specifications */}
                <div className="space-y-1.5">
                  <label htmlFor="exhibit-desc" className="text-xs font-black text-foreground">{d.fullDescLabel}</label>
                  <textarea
                    id="exhibit-desc"
                    required
                    disabled={saving}
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={d.fullDescPlaceholder}
                    className="flex w-full rounded-xl border border-border bg-background p-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Featured item toggle */}
                <div className="flex items-center justify-between rounded-xl border border-border/80 bg-secondary/20 p-4">
                  <div className="space-y-0.5">
                    <label htmlFor="exhibit-featured" className="text-xs font-black text-foreground">{d.featuredLabel}</label>
                    <p className="text-[10px] font-bold text-muted-foreground">{d.featuredDesc}</p>
                  </div>
                  <input
                    id="exhibit-featured"
                    type="checkbox"
                    disabled={saving}
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="size-5 rounded-md border-border text-primary focus:ring-primary/20 cursor-pointer"
                  />
                </div>
              </div>

              {/* Media attachments card */}
              <div className="rounded-[20px] border border-border bg-card p-6 space-y-4 shadow-sm">
                <div className="border-b border-border/40 pb-2">
                  <h3 className="text-sm font-black text-foreground">{d.mediaHeading}</h3>
                  <p className="text-[10px] font-medium text-muted-foreground mt-0.5">{d.mediaDesc}</p>
                </div>

                {/* Cover Image URL */}
                <div className="space-y-1.5">
                  <label htmlFor="exhibit-cover-url" className="text-xs font-black text-foreground flex items-center gap-1.5">
                    <ImageIcon className="size-4 text-primary shrink-0" />
                    <span>{d.imageUrlLabel}</span>
                  </label>
                  <input
                    id="exhibit-cover-url"
                    type="url"
                    disabled={saving}
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder={d.imageUrlPlaceholder}
                    className="flex min-h-[48px] w-full rounded-xl border border-border bg-background px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {imageUrl.trim() && (
                    <div className="mt-2 overflow-hidden rounded-xl border border-border max-w-[200px] bg-secondary/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt="Cover Preview" className="h-28 w-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Promotional Video URL */}
                <div className="space-y-1.5">
                  <label htmlFor="exhibit-video-url" className="text-xs font-black text-foreground flex items-center gap-1.5">
                    <Video className="size-4 text-primary shrink-0" />
                    <span>{d.videoUrlLabel}</span>
                  </label>
                  <input
                    id="exhibit-video-url"
                    type="url"
                    disabled={saving}
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder={d.videoUrlPlaceholder}
                    className="flex min-h-[48px] w-full rounded-xl border border-border bg-background px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* PDF Brochures / Technical catalogue */}
                <div className="space-y-1.5">
                  <label htmlFor="exhibit-pdf-url" className="text-xs font-black text-foreground flex items-center gap-1.5">
                    <FileText className="size-4 text-primary shrink-0" />
                    <span>{d.pdfUrlLabel}</span>
                  </label>
                  <input
                    id="exhibit-pdf-url"
                    type="url"
                    disabled={saving}
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    placeholder={d.pdfUrlPlaceholder}
                    className="flex min-h-[48px] w-full rounded-xl border border-border bg-background px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => router.push(`/exhibitions/booth/dashboard/exhibits?boothId=${boothId}`)}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-border bg-card px-5 text-xs font-black text-foreground transition-all hover:bg-secondary"
                >
                  {d.cancelBtn}
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground px-6 text-xs font-black transition-all"
                >
                  {saving && <Loader2 className="size-3.5 animate-spin" />}
                  <span>{d.submitBtn}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
