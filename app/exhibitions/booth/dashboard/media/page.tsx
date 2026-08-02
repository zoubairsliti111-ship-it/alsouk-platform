"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Loader2,
  ShieldAlert,
  Plus,
  Trash2,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Video,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Edit,
  Download,
  X
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { MarketplaceShell, Breadcrumbs } from "@/components/marketplace/shell"
import {
  createMediaItem,
  updateMediaItem,
  deleteMediaItem,
  updateMediaSortOrder,
  setBoothCoverImage,
  createDocumentItem,
  deleteDocumentItem
} from "@/lib/services/exhibitions-client"
import type { ExhibitionMedia, ExhibitionDocument, ExhibitionBooth } from "@/lib/domains/exhibition/types"

const dict = {
  en: {
    title: "Booth Media & Documents",
    subtitle: "Manage your gallery images, virtual show videos, and product catalog booklets/brochures.",
    imagesTab: "Gallery Images",
    videosTab: "Show Videos",
    documentsTab: "Documents & Catalogs",
    emptyImages: "No gallery images uploaded yet.",
    emptyVideos: "No promotional videos listed yet.",
    emptyDocs: "No catalog or PDF booklets uploaded yet.",
    uploading: "Uploading...",
    adding: "Adding...",
    deleting: "Deleting...",
    save: "Save",
    addBtn: "Add Item",
    captionLabel: "Image Caption (Optional)",
    urlLabel: "File URL",
    urlPlaceholder: "https://example.com/file.jpg",
    addVideoUrlPlaceholder: "https://youtube.com/watch?v=... or direct MP4",
    videoTitleLabel: "Video Title",
    videoTitlePlaceholder: "e.g. Factory Tour & Loom Sourcing Walkthrough",
    videoThumbLabel: "Video Thumbnail URL (Optional)",
    videoThumbPlaceholder: "https://example.com/thumbnail.jpg",
    docNameLabel: "Document/Catalog Title",
    docNamePlaceholder: "e.g. Sfax Olive Oil Product Brochure 2026",
    docLangLabel: "Language",
    docDescLabel: "Brief Booklet Description",
    docDescPlaceholder: "Summary of this catalog, export terms, MOQ sheets...",
    isCover: "Cover Image",
    setAsCover: "Set as Cover",
    moveUp: "Move Up",
    moveDown: "Move Down",
    delete: "Delete",
    successMsg: "Action completed successfully!",
    errorMsg: "Failed to perform action. Please try again.",
    preview: "Preview",
    backToDashboard: "Return to Dashboard",
    loading: "Loading assets...",
    allLanguages: "All Languages",
    editCaption: "Edit Caption",
    saveChanges: "Save Changes",
  },
  fr: {
    title: "Médias & Documents du stand",
    subtitle: "Gérez vos images de galerie, vos vidéos de démonstration virtuelle et vos catalogues ou brochures de produits.",
    imagesTab: "Images de la Galerie",
    videosTab: "Vidéos de Démo",
    documentsTab: "Documents & Catalogues",
    emptyImages: "Aucune image de galerie importée pour le moment.",
    emptyVideos: "Aucune vidéo de démonstration répertoriée.",
    emptyDocs: "Aucun catalogue ou brochure PDF importé.",
    uploading: "Téléversement...",
    adding: "Ajout...",
    deleting: "Suppression...",
    save: "Enregistrer",
    addBtn: "Ajouter l'élément",
    captionLabel: "Légende de l'image (Optionnel)",
    urlLabel: "URL du fichier",
    urlPlaceholder: "https://exemple.com/fichier.jpg",
    addVideoUrlPlaceholder: "Lien YouTube ou direct MP4...",
    videoTitleLabel: "Titre de la vidéo",
    videoTitlePlaceholder: "ex. Visite guidée de l'usine textile",
    videoThumbLabel: "URL de la miniature (Optionnel)",
    videoThumbPlaceholder: "https://exemple.com/miniature.jpg",
    docNameLabel: "Titre du document/catalogue",
    docNamePlaceholder: "ex. Brochure d'huile d'olive de Sfax 2026",
    docLangLabel: "Langue",
    docDescLabel: "Brève description du livret",
    docDescPlaceholder: "Résumé du catalogue, conditions d'exportation, MOQ...",
    isCover: "Image de couverture",
    setAsCover: "Définir comme couverture",
    moveUp: "Monter",
    moveDown: "Descendre",
    delete: "Supprimer",
    successMsg: "Action effectuée avec succès !",
    errorMsg: "Échec de l'action. Veuillez réessayer.",
    preview: "Aperçu",
    backToDashboard: "Retour au tableau de bord",
    loading: "Chargement des ressources...",
    allLanguages: "Toutes les langues",
    editCaption: "Modifier la légende",
    saveChanges: "Enregistrer",
  },
  ar: {
    title: "الوسائط والمستندات الخاصة بالجناح",
    subtitle: "إدارة صور المعرض، ومقاطع الفيديو الترويجية، وكتيبات وكتالوجات المنتجات الخاصة بك.",
    imagesTab: "صور المعرض",
    videosTab: "مقاطع الفيديو",
    documentsTab: "المستندات والكتالوجات",
    emptyImages: "لم يتم تحميل أي صور في المعرض بعد.",
    emptyVideos: "لم يتم إدراج أي مقاطع فيديو ترويجية بعد.",
    emptyDocs: "لم يتم تحميل أي كتيبات كتالوج أو ملفات PDF بعد.",
    uploading: "جاري الرفع...",
    adding: "جاري الإضافة...",
    deleting: "جاري الحذف...",
    save: "حفظ",
    addBtn: "إضافة عنصر",
    captionLabel: "تسمية توضيحية للصورة (اختياري)",
    urlLabel: "رابط الملف",
    urlPlaceholder: "https://example.com/file.jpg",
    addVideoUrlPlaceholder: "رابط يوتيوب أو فيديو MP4 مباشر...",
    videoTitleLabel: "عنوان الفيديو",
    videoTitlePlaceholder: "مثال: جولة في المصنع واستعراض خط الإنتاج",
    videoThumbLabel: "رابط الصورة المصغرة للفيديو (اختياري)",
    videoThumbPlaceholder: "https://example.com/thumbnail.jpg",
    docNameLabel: "عنوان المستند/الكتالوج",
    docNamePlaceholder: "مثال: كتيب منتجات زيت الزيتون بصفاقس 2026",
    docLangLabel: "اللغة",
    docDescLabel: "وصف تعريفي قصير للمستند",
    docDescPlaceholder: "ملخص الكتالوج، شروط التصدير، الحد الأدنى للطلب...",
    isCover: "صورة الغلاف",
    setAsCover: "تحديد كصورة غلاف",
    moveUp: "تحريك لأعلى",
    moveDown: "تحريك لأسفل",
    delete: "حذف",
    successMsg: "تمت العملية بنجاح!",
    errorMsg: "فشلت العملية. يرجى المحاولة مرة أخرى.",
    preview: "عرض",
    backToDashboard: "العودة إلى لوحة التحكم",
    loading: "جاري تحميل الأصول...",
    allLanguages: "جميع اللغات",
    editCaption: "تعديل التسمية التوضيحية",
    saveChanges: "حفظ التغييرات",
  }
}

export default function BoothMediaPage() {
  return (
    <MarketplaceShell>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
          </div>
        }
      >
        <BoothMediaContent />
      </Suspense>
    </MarketplaceShell>
  )
}

function BoothMediaContent() {
  const { lang, dir } = useLanguage()
  const d = dict[lang] || dict.en
  const searchParams = useSearchParams()
  const router = useRouter()
  const boothId = searchParams.get("boothId") || "booth-medina"

  const [activeTab, setActiveTab] = useState<"images" | "videos" | "documents">("images")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("Draft")

  // Data collections
  const [mediaList, setMediaList] = useState<ExhibitionMedia[]>([])
  const [docList, setDocList] = useState<ExhibitionDocument[]>([])

  // Image upload states
  const [imgUrl, setImgUrl] = useState("")
  const [imgCaption, setImgCaption] = useState("")
  const [imgAdding, setImgAdding] = useState(false)

  // Edit Caption Modal States
  const [editingMedia, setEditingMedia] = useState<ExhibitionMedia | null>(null)
  const [editCaptionText, setEditCaptionText] = useState("")
  const [editSaving, setEditSaving] = useState(false)

  // Video states
  const [vidUrl, setVidUrl] = useState("")
  const [vidTitle, setVidTitle] = useState("")
  const [vidThumb, setVidThumb] = useState("")
  const [vidAdding, setVidAdding] = useState(false)

  // Document states
  const [docUrl, setDocUrl] = useState("")
  const [docName, setDocName] = useState("")
  const [docLang, setDocLang] = useState("fr")
  const [docDesc, setDocDesc] = useState("")
  const [docAdding, setDocAdding] = useState(false)

  // Lightbox / Previews
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null)

  const images = mediaList.filter((m) => m.mediaType === "image")
  const videos = mediaList.filter((m) => m.mediaType === "video")

  useEffect(() => {
    let active = true

    const loadAllAssets = async () => {
      try {
        const [boothRes, mediaRes, docRes] = await Promise.all([
          fetch(`/api/exhibitions/booth?id=${encodeURIComponent(boothId)}`),
          fetch(`/api/exhibitions/booth/media?boothId=${encodeURIComponent(boothId)}`),
          fetch(`/api/exhibitions/booth/documents?boothId=${encodeURIComponent(boothId)}`)
        ])

        const bJson = await boothRes.json()
        const mJson = await mediaRes.json()
        const dJson = await docRes.json()

        if (!active) return

        if (bJson.success && bJson.data) {
          setStatus(bJson.data.status || "Draft")
        }

        if (mJson.success) {
          setMediaList(mJson.data || [])
        } else {
          setError(mJson.error || d.errorMsg)
        }

        if (dJson.success) {
          setDocList(dJson.data || [])
        } else {
          setError(dJson.error || d.errorMsg)
        }
      } catch (err: any) {
        console.error(err)
        if (active) setError(d.errorMsg)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadAllAssets()

    return () => {
      active = false
    }
  }, [boothId, d.errorMsg])

  const loadAllAssets = async () => {
    try {
      const [mediaRes, docRes] = await Promise.all([
        fetch(`/api/exhibitions/booth/media?boothId=${encodeURIComponent(boothId)}`),
        fetch(`/api/exhibitions/booth/documents?boothId=${encodeURIComponent(boothId)}`)
      ])
      const mJson = await mediaRes.json()
      const dJson = await docRes.json()
      if (mJson.success) setMediaList(mJson.data || [])
      if (dJson.success) setDocList(dJson.data || [])
    } catch (err) {
      console.error("Async reload assets failed:", err)
    }
  }

  const triggerAlert = (type: "success" | "error", message: string) => {
    if (type === "success") {
      setSuccess(message)
      setTimeout(() => setSuccess(null), 3000)
    } else {
      setError(message)
      setTimeout(() => setError(null), 3000)
    }
  }

  // Gallery Actions
  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imgUrl.trim() || status === "Submitted") return

    setImgAdding(true)
    try {
      const maxSort = images.reduce((acc, curr) => Math.max(acc, curr.sortOrder), 0)
      const res = await createMediaItem({
        boothId,
        mediaType: "image",
        url: imgUrl.trim(),
        caption: imgCaption.trim() || null,
        sortOrder: maxSort + 1,
        isCover: images.length === 0
      })

      if (res.data) {
        triggerAlert("success", d.successMsg)
        setImgUrl("")
        setImgCaption("")
        await loadAllAssets()
      } else {
        triggerAlert("error", d.errorMsg)
      }
    } catch (err) {
      console.error(err)
      triggerAlert("error", d.errorMsg)
    } finally {
      setImgAdding(false)
    }
  }

  const handleEditCaption = (m: ExhibitionMedia) => {
    if (status === "Submitted") return
    setEditingMedia(m)
    setEditCaptionText(m.caption || "")
  }

  const handleSaveCaption = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMedia || status === "Submitted") return

    setEditSaving(true)
    try {
      const res = await updateMediaItem(editingMedia.id, { caption: editCaptionText.trim() || null })
      if (res.data) {
        triggerAlert("success", d.successMsg)
        setEditingMedia(null)
        await loadAllAssets()
      } else {
        triggerAlert("error", d.errorMsg)
      }
    } catch (err) {
      console.error(err)
      triggerAlert("error", d.errorMsg)
    } finally {
      setEditSaving(false)
    }
  }

  const handleDeleteMedia = async (id: string) => {
    if (status === "Submitted") return
    if (!confirm("Are you sure you want to delete this media item?")) return
    try {
      const ok = await deleteMediaItem(id)
      if (ok) {
        triggerAlert("success", d.successMsg)
        await loadAllAssets()
      } else {
        triggerAlert("error", d.errorMsg)
      }
    } catch (err) {
      console.error(err)
      triggerAlert("error", d.errorMsg)
    }
  }

  const handleSetCover = async (id: string) => {
    if (status === "Submitted") return
    try {
      const ok = await setBoothCoverImage(boothId, id)
      if (ok) {
        triggerAlert("success", d.successMsg)
        await loadAllAssets()
      } else {
        triggerAlert("error", d.errorMsg)
      }
    } catch (err) {
      console.error(err)
      triggerAlert("error", d.errorMsg)
    }
  }

  const handleMoveImage = async (idx: number, direction: "up" | "down") => {
    if (status === "Submitted") return
    const targetIdx = direction === "up" ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= images.length) return

    const newImages = [...images]
    const temp = newImages[idx]
    newImages[idx] = newImages[targetIdx]
    newImages[targetIdx] = temp

    try {
      const orderedIds = newImages.map((m) => m.id)
      const ok = await updateMediaSortOrder(boothId, orderedIds)
      if (ok) {
        await loadAllAssets()
      } else {
        triggerAlert("error", d.errorMsg)
      }
    } catch (err) {
      console.error(err)
      triggerAlert("error", d.errorMsg)
    }
  }

  // Video Actions
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vidUrl.trim() || !vidTitle.trim() || status === "Submitted") return

    setVidAdding(true)
    try {
      const maxSort = videos.reduce((acc, curr) => Math.max(acc, curr.sortOrder), 0)
      const res = await createMediaItem({
        boothId,
        mediaType: "video",
        url: vidUrl.trim(),
        caption: vidTitle.trim(),
        sortOrder: maxSort + 1,
        thumbnailUrl: vidThumb.trim() || null,
        isCover: false
      })

      if (res.data) {
        triggerAlert("success", d.successMsg)
        setVidUrl("")
        setVidTitle("")
        setVidThumb("")
        await loadAllAssets()
      } else {
        triggerAlert("error", d.errorMsg)
      }
    } catch (err) {
      console.error(err)
      triggerAlert("error", d.errorMsg)
    } finally {
      setVidAdding(false)
    }
  }

  // Document Actions
  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!docUrl.trim() || !docName.trim() || status === "Submitted") return

    setDocAdding(true)
    try {
      const maxSort = docList.reduce((acc, curr) => Math.max(acc, curr.sortOrder), 0)
      const fileSizes = ["1.5 MB", "2.8 MB", "4.2 MB", "820 KB", "3.1 MB"]
      const deterministicIndex = (docName.length + docUrl.length) % fileSizes.length
      const randomSize = fileSizes[deterministicIndex]

      const res = await createDocumentItem({
        boothId,
        name: docName.trim(),
        url: docUrl.trim(),
        fileSize: randomSize,
        sortOrder: maxSort + 1,
        language: docLang,
        description: docDesc.trim() || null
      })

      if (res.data) {
        triggerAlert("success", d.successMsg)
        setDocUrl("")
        setDocName("")
        setDocDesc("")
        await loadAllAssets()
      } else {
        triggerAlert("error", d.errorMsg)
      }
    } catch (err) {
      console.error(err)
      triggerAlert("error", d.errorMsg)
    } finally {
      setDocAdding(false)
    }
  }

  const handleDeleteDoc = async (id: string) => {
    if (status === "Submitted") return
    if (!confirm("Are you sure you want to delete this document?")) return
    try {
      const ok = await deleteDocumentItem(id)
      if (ok) {
        triggerAlert("success", d.successMsg)
        await loadAllAssets()
      } else {
        triggerAlert("error", d.errorMsg)
      }
    } catch (err) {
      console.error(err)
      triggerAlert("error", d.errorMsg)
    }
  }

  return (
    <div className="pb-16" dir={dir}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Workspace", href: `/exhibitions/booth/dashboard?id=${boothId}` },
          { label: d.title }
        ]}
      />

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5 mb-8">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-foreground">{d.title}</h1>
            <p className="text-xs font-medium text-muted-foreground">{d.subtitle}</p>
          </div>

          <button
            onClick={() => router.push(`/exhibitions/booth/dashboard?id=${boothId}`)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-black text-foreground hover:bg-secondary min-h-11 transition-all"
          >
            <ArrowLeft className="size-4 shrink-0" />
            <span>{d.backToDashboard}</span>
          </button>
        </div>

        {/* Lock/Read-only banner if Submitted */}
        {status === "Submitted" && (
          <div className="mb-6 rounded-[20px] border border-blue-200 bg-blue-500/10 dark:bg-blue-950/30 dark:border-blue-900/50 p-5 flex gap-4 items-center">
            <ShieldAlert className="size-10 text-blue-600 dark:text-blue-400 shrink-0" />
            <div className="text-left">
              <h4 className="text-sm font-black text-foreground">Media Workspace Locked</h4>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">Your booth has been submitted for review. Media uploads and document modifications are disabled until administrator review.</p>
            </div>
          </div>
        )}

        {/* Global Alerts */}
        {error && (
          <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex gap-3 items-center text-xs font-semibold text-destructive">
            <ShieldAlert className="size-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/5 p-4 flex gap-3 items-center text-xs font-semibold text-green-600 dark:text-green-400">
            <CheckCircle2 className="size-5 shrink-0 text-green-500 animate-bounce" />
            <span>{success}</span>
          </div>
        )}

        {/* Workspace Tab Navigators */}
        <div className="flex border-b border-border mb-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("images")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-black border-b-2 whitespace-nowrap min-h-11 transition-all ${activeTab === "images" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <ImageIcon className="size-4 shrink-0" />
            <span>{d.imagesTab}</span>
            <span className="text-[10px] bg-secondary text-foreground px-2 py-0.5 rounded-full font-bold">{images.length}</span>
          </button>

          <button
            onClick={() => setActiveTab("videos")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-black border-b-2 whitespace-nowrap min-h-11 transition-all ${activeTab === "videos" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <Video className="size-4 shrink-0" />
            <span>{d.videosTab}</span>
            <span className="text-[10px] bg-secondary text-foreground px-2 py-0.5 rounded-full font-bold">{videos.length}</span>
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-black border-b-2 whitespace-nowrap min-h-11 transition-all ${activeTab === "documents" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <FileText className="size-4 shrink-0" />
            <span>{d.documentsTab}</span>
            <span className="text-[10px] bg-secondary text-foreground px-2 py-0.5 rounded-full font-bold">{docList.length}</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-xs font-bold text-muted-foreground">{d.loading}</span>
          </div>
        ) : (
          /* Main Workspace Sections */
          <div className="space-y-8">
            {/* 1. IMAGES WORKSPACE */}
            {activeTab === "images" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Image Upload Form */}
                <div className="md:col-span-1">
                  <div className="rounded-[20px] border border-border bg-card p-5 space-y-4 shadow-sm sticky top-6">
                    <h2 className="text-sm font-black text-foreground">Upload Image URL</h2>

                    <form onSubmit={handleAddImage} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold text-foreground uppercase tracking-wider">
                          {d.urlLabel} <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="url"
                          required
                          disabled={status === "Submitted" || imgAdding}
                          value={imgUrl}
                          onChange={(e) => setImgUrl(e.target.value)}
                          placeholder={d.urlPlaceholder}
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-bold text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none min-h-11 disabled:opacity-50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold text-foreground uppercase tracking-wider">
                          {d.captionLabel}
                        </label>
                        <input
                          type="text"
                          disabled={status === "Submitted" || imgAdding}
                          value={imgCaption}
                          onChange={(e) => setImgCaption(e.target.value)}
                          placeholder="e.g. Sfax olive mill cold pressing"
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-bold text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none min-h-11 disabled:opacity-50"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={status === "Submitted" || imgAdding}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-black py-3 min-h-11 transition-all disabled:opacity-50"
                      >
                        {imgAdding ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            <span>{d.adding}</span>
                          </>
                        ) : (
                          <>
                            <Plus className="size-4" />
                            <span>{d.addBtn}</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Images Grid */}
                <div className="md:col-span-2 space-y-4">
                  {images.length === 0 ? (
                    <div className="text-center py-16 rounded-[20px] border-2 border-dashed border-border bg-card">
                      <ImageIcon className="size-10 text-muted-foreground/60 mx-auto mb-3" />
                      <p className="text-xs font-bold text-muted-foreground">{d.emptyImages}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {images.map((m, idx) => (
                        <div
                          key={m.id}
                          className="group relative overflow-hidden rounded-[20px] border border-border bg-card shadow-sm flex flex-col justify-between"
                        >
                          {/* Image preview box */}
                          <div className="relative aspect-video w-full bg-secondary overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={m.url}
                              alt={m.caption || "Gallery"}
                              className="size-full object-cover transition-transform group-hover:scale-105"
                            />

                            {/* Cover Badge */}
                            {m.isCover && (
                              <div className="absolute top-2.5 start-2.5 bg-green-500 text-white rounded-full px-2.5 py-1 text-[10px] font-black shadow-sm flex items-center gap-1">
                                <CheckCircle2 className="size-3 shrink-0" />
                                <span>{d.isCover}</span>
                              </div>
                            )}

                            {/* Action Buttons overlay */}
                            <div className="absolute top-2.5 end-2.5 flex gap-1.5">
                              <button
                                onClick={() => setLightboxUrl(m.url)}
                                className="size-8 rounded-lg bg-background/90 text-foreground hover:bg-background shadow-md flex items-center justify-center transition-all"
                                title={d.preview}
                              >
                                <ExternalLink className="size-3.5" />
                              </button>
                              {status !== "Submitted" && (
                                <button
                                  onClick={() => handleEditCaption(m)}
                                  className="size-8 rounded-lg bg-background/90 text-foreground hover:bg-background shadow-md flex items-center justify-center transition-all"
                                  title={d.editCaption}
                                >
                                  <Edit className="size-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Footer Details */}
                          <div className="p-4 space-y-3">
                            <p className="text-xs font-bold text-foreground line-clamp-2 min-h-8">
                              {m.caption || <span className="italic text-muted-foreground font-medium">Untitled Caption</span>}
                            </p>

                            <div className="flex items-center justify-between gap-2 border-t border-border/40 pt-2.5">
                              {/* Reordering Up/Down Triggers */}
                              <div className="flex gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(idx, "up")}
                                  disabled={idx === 0 || status === "Submitted"}
                                  className="size-7 rounded-lg border border-border hover:bg-secondary disabled:opacity-30 text-muted-foreground hover:text-foreground flex items-center justify-center"
                                >
                                  <ChevronUp className="size-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(idx, "down")}
                                  disabled={idx === images.length - 1 || status === "Submitted"}
                                  className="size-7 rounded-lg border border-border hover:bg-secondary disabled:opacity-30 text-muted-foreground hover:text-foreground flex items-center justify-center"
                                >
                                  <ChevronDown className="size-3.5" />
                                </button>
                              </div>

                              <div className="flex gap-1.5">
                                {!m.isCover && status !== "Submitted" && (
                                  <button
                                    onClick={() => handleSetCover(m.id)}
                                    className="px-2.5 py-1.5 rounded-lg border border-border hover:bg-secondary text-[10px] font-black text-foreground"
                                  >
                                    {d.setAsCover}
                                  </button>
                                )}
                                {status !== "Submitted" && (
                                  <button
                                    onClick={() => handleDeleteMedia(m.id)}
                                    className="size-7 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive flex items-center justify-center transition-all"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. VIDEOS WORKSPACE */}
            {activeTab === "videos" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Video Add Form */}
                <div className="md:col-span-1">
                  <div className="rounded-[20px] border border-border bg-card p-5 space-y-4 shadow-sm sticky top-6">
                    <h2 className="text-sm font-black text-foreground">Add Video Link</h2>

                    <form onSubmit={handleAddVideo} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold text-foreground uppercase tracking-wider">
                          {d.urlLabel} <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="url"
                          required
                          disabled={status === "Submitted" || vidAdding}
                          value={vidUrl}
                          onChange={(e) => setVidUrl(e.target.value)}
                          placeholder={d.addVideoUrlPlaceholder}
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-bold text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none min-h-11 disabled:opacity-50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold text-foreground uppercase tracking-wider">
                          {d.videoTitleLabel} <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          disabled={status === "Submitted" || vidAdding}
                          value={vidTitle}
                          onChange={(e) => setVidTitle(e.target.value)}
                          placeholder={d.videoTitlePlaceholder}
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-bold text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none min-h-11 disabled:opacity-50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold text-foreground uppercase tracking-wider">
                          {d.videoThumbLabel}
                        </label>
                        <input
                          type="url"
                          disabled={status === "Submitted" || vidAdding}
                          value={vidThumb}
                          onChange={(e) => setVidThumb(e.target.value)}
                          placeholder={d.videoThumbPlaceholder}
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-bold text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none min-h-11 disabled:opacity-50"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={status === "Submitted" || vidAdding}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-black py-3 min-h-11 transition-all disabled:opacity-50"
                      >
                        {vidAdding ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            <span>{d.adding}</span>
                          </>
                        ) : (
                          <>
                            <Plus className="size-4" />
                            <span>{d.addBtn}</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Videos Listing */}
                <div className="md:col-span-2 space-y-4">
                  {videos.length === 0 ? (
                    <div className="text-center py-16 rounded-[20px] border-2 border-dashed border-border bg-card">
                      <Video className="size-10 text-muted-foreground/60 mx-auto mb-3" />
                      <p className="text-xs font-bold text-muted-foreground">{d.emptyVideos}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {videos.map((v) => (
                        <div
                          key={v.id}
                          className="rounded-[20px] border border-border bg-card p-4 space-y-3.5 shadow-sm flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            {/* Video Fake Thumbnail / Icon display */}
                            <div className="relative aspect-video w-full bg-secondary/80 rounded-xl flex items-center justify-center overflow-hidden border border-border">
                              {v.thumbnailUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={v.thumbnailUrl}
                                  alt={v.caption || "video thumbnail"}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-blue-500/5 flex items-center justify-center" />
                              )}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <button
                                  onClick={() => setPreviewVideoUrl(v.url)}
                                  className="size-11 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                                >
                                  <Video className="size-5 shrink-0" />
                                </button>
                              </div>
                            </div>

                            <p className="text-xs font-black text-foreground leading-relaxed line-clamp-2">
                              {v.caption}
                            </p>
                          </div>

                          <div className="flex items-center justify-between border-t border-border/40 pt-3">
                            <span className="text-[10px] text-muted-foreground font-black truncate max-w-[150px]">
                              {v.url}
                            </span>

                            {status !== "Submitted" && (
                              <button
                                onClick={() => handleDeleteMedia(v.id)}
                                className="size-8 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive flex items-center justify-center transition-all"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. DOCUMENTS WORKSPACE */}
            {activeTab === "documents" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Catalog booklet Form */}
                <div className="md:col-span-1">
                  <div className="rounded-[20px] border border-border bg-card p-5 space-y-4 shadow-sm sticky top-6">
                    <h2 className="text-sm font-black text-foreground">Upload Catalog PDF</h2>

                    <form onSubmit={handleAddDoc} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold text-foreground uppercase tracking-wider">
                          {d.urlLabel} <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="url"
                          required
                          disabled={status === "Submitted" || docAdding}
                          value={docUrl}
                          onChange={(e) => setDocUrl(e.target.value)}
                          placeholder="https://example.com/catalog.pdf"
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-bold text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none min-h-11 disabled:opacity-50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold text-foreground uppercase tracking-wider">
                          {d.docNameLabel} <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          disabled={status === "Submitted" || docAdding}
                          value={docName}
                          onChange={(e) => setDocName(e.target.value)}
                          placeholder={d.docNamePlaceholder}
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-bold text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none min-h-11 disabled:opacity-50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold text-foreground uppercase tracking-wider">
                          {d.docLangLabel}
                        </label>
                        <select
                          value={docLang}
                          disabled={status === "Submitted" || docAdding}
                          onChange={(e) => setDocLang(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-black text-foreground focus:border-primary focus:outline-none min-h-11 disabled:opacity-50"
                        >
                          <option value="fr">Français (FR)</option>
                          <option value="en">English (EN)</option>
                          <option value="ar">العربية (AR)</option>
                          <option value="all">{d.allLanguages}</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold text-foreground uppercase tracking-wider">
                          {d.docDescLabel}
                        </label>
                        <textarea
                          rows={4}
                          disabled={status === "Submitted" || docAdding}
                          value={docDesc}
                          onChange={(e) => setDocDesc(e.target.value)}
                          placeholder={d.docDescPlaceholder}
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none min-h-20 resize-none leading-relaxed disabled:opacity-50"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={status === "Submitted" || docAdding}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-black py-3 min-h-11 transition-all disabled:opacity-50"
                      >
                        {docAdding ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            <span>{d.adding}</span>
                          </>
                        ) : (
                          <>
                            <Plus className="size-4" />
                            <span>{d.addBtn}</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Catalog Booklet listings */}
                <div className="md:col-span-2 space-y-4">
                  {docList.length === 0 ? (
                    <div className="text-center py-16 rounded-[20px] border-2 border-dashed border-border bg-card">
                      <FileText className="size-10 text-muted-foreground/60 mx-auto mb-3" />
                      <p className="text-xs font-bold text-muted-foreground">{d.emptyDocs}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {docList.map((doc) => (
                        <div
                          key={doc.id}
                          className="rounded-[20px] border border-border bg-card p-5 shadow-sm space-y-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
                        >
                          <div className="flex items-start gap-4">
                            {/* PDF indicator icon */}
                            <div className="size-12 rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 flex items-center justify-center shrink-0">
                              <FileText className="size-6" />
                            </div>

                            <div className="space-y-1.5 min-w-0">
                              <h3 className="text-xs font-black text-foreground truncate leading-snug">
                                {doc.name}
                              </h3>

                              <div className="flex flex-wrap gap-2 text-[10px] font-black">
                                <span className="bg-secondary text-foreground px-2 py-0.5 rounded-full">
                                  {doc.language === "all" ? d.allLanguages : doc.language?.toUpperCase() || "FR"}
                                </span>
                                <span className="bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                                  {doc.fileSize || "1.5 MB"}
                                </span>
                              </div>

                              {doc.description && (
                                <p className="text-[11px] font-medium text-muted-foreground mt-1 leading-relaxed">
                                  {doc.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 self-end sm:self-start shrink-0">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="size-9 rounded-xl border border-border hover:bg-secondary text-foreground flex items-center justify-center transition-all"
                              title="Download Catalog"
                            >
                              <Download className="size-4" />
                            </a>

                            {status !== "Submitted" && (
                              <button
                                onClick={() => handleDeleteDoc(doc.id)}
                                className="size-9 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive flex items-center justify-center transition-all"
                                title="Delete booklet"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 end-4 size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
          >
            <X className="size-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxUrl}
            alt="Lightbox preview"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}

      {/* VIDEO PREVIEW MODAL */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <button
            onClick={() => setPreviewVideoUrl(null)}
            className="absolute top-4 end-4 size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
          >
            <X className="size-6" />
          </button>
          <div className="w-full max-w-2xl aspect-video rounded-xl overflow-hidden bg-black shadow-2xl">
            {previewVideoUrl.endsWith(".mp4") || previewVideoUrl.includes("mov_bbb") ? (
              <video src={previewVideoUrl} controls autoPlay className="size-full" />
            ) : (
              <iframe
                src={previewVideoUrl}
                className="size-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      )}

      {/* EDIT CAPTION MODAL */}
      {editingMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[20px] bg-card border border-border p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-black text-foreground">{d.editCaption}</h3>
              <button
                onClick={() => setEditingMedia(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCaption} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-foreground uppercase tracking-wider">
                  Caption / Description
                </label>
                <input
                  type="text"
                  required
                  value={editCaptionText}
                  onChange={(e) => setEditCaptionText(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-bold text-foreground focus:border-primary focus:outline-none min-h-11"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={editSaving}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-black py-3 min-h-11 transition-all"
                >
                  {editSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <span>{d.saveChanges}</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingMedia(null)}
                  className="px-4 py-3 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-black text-foreground"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
