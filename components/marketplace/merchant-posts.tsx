"use client"

import { useEffect, useState, useCallback } from "react"
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Eye,
  Loader2,
  X,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Globe,
  Lock,
  ExternalLink
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  type CommercialPost,
  type CommercialPostStatus
} from "@/lib/domains/post/types"
import {
  createPost,
  updatePost,
  deletePost,
  fetchCompanyPosts,
  publishPost,
  unpublishPost
} from "@/lib/services/posts-service"

interface MerchantPostsProps {
  companyId: string
  lang: string
}

const MT = {
  en: {
    loadFailed: "Failed to load posts.",
    sizeError: "File size exceeds 5MB limit. Please upload a smaller image.",
    typeError: "Invalid file type. Only PNG, JPEG, JPG, and WEBP formats are supported.",
    urlError: "Could not retrieve public URL.",
    uploadFailed: "Failed to upload image. Ensure storage bucket is configured.",
    contentRequired: "Post content or caption is required.",
    updateSuccess: "Post updated successfully!",
    updateFailed: "Failed to update post.",
    createSuccess: "New post created successfully!",
    createFailed: "Failed to create post.",
    saveUnexpected: "An unexpected error occurred while saving.",
    unpublishSuccess: "Post unpublished successfully.",
    publishSuccess: "Post published to feed successfully!",
    statusFailed: "Failed to change post status.",
    deleteConfirm: "Are you sure you want to delete this post? This action cannot be undone.",
    deleteSuccess: "Post deleted successfully.",
    deleteFailed: "Failed to delete post.",
    feedTitle: "Commercial Feed Posts",
    feedSubtitle: "Broadcast stock updates, arrivals, promotions, or behind-the-scenes videos to Tunisian and regional B2B buyers.",
    newPost: "New Update Post",
    emptyTitle: "No updates published yet",
    emptyDesc: "Commercial updates keep your business visible on the regional Discover Feed. Start by writing your first update or promotional post today!",
    createFirst: "Create First Post",
    published: "Published",
    draft: "Draft",
    viewsSuffix: "views",
    unpublish: "Unpublish",
    publish: "Publish",
    editTitle: "Edit Post",
    editBtn: "Edit",
    deleteTitle: "Delete Post",
    deleteBtn: "Delete",
    editModalTitle: "Edit Commercial Post",
    createModalTitle: "Create Commercial Post",
    contentLabel: "Post Update content *",
    contentPlaceholder: "What's new? Describe your new arrivals, bulk packages, factory updates, or wholesale discounts...",
    statusLabel: "Status",
    optDraft: "Save as Draft (Private)",
    optPublish: "Publish to Public Feed",
    visibilityLabel: "Visibility",
    optPublic: "Publicly Discoverable",
    mediaLabel: "Post Media Attachments",
    attachedAlt: "Attached file",
    thumbAlt: "Thumbnail",
    removeImage: "Remove image",
    uploading: "Uploading...",
    uploadPhoto: "Upload Photo",
    fileHint: "PNG, JPEG or WEBP under 5MB (Max 10 images)",
    saveChanges: "Save Changes",
    publishUpdate: "Publish Update",
    cancel: "Cancel",
  },
  fr: {
    loadFailed: "Échec du chargement des publications.",
    sizeError: "La taille du fichier dépasse la limite de 5 Mo. Veuillez charger une image plus petite.",
    typeError: "Type de fichier invalide. Seuls les formats PNG, JPEG, JPG et WEBP sont pris en charge.",
    urlError: "Impossible de récupérer l'URL publique.",
    uploadFailed: "Échec du chargement de l'image. Vérifiez la configuration du bucket de stockage.",
    contentRequired: "Le contenu ou la légende de la publication est requis.",
    updateSuccess: "Publication mise à jour avec succès !",
    updateFailed: "Échec de la mise à jour de la publication.",
    createSuccess: "Nouvelle publication créée avec succès !",
    createFailed: "Échec de la création de la publication.",
    saveUnexpected: "Une erreur inattendue s'est produite lors de l'enregistrement.",
    unpublishSuccess: "Publication dépubliée avec succès.",
    publishSuccess: "Publication publiée dans le fil avec succès !",
    statusFailed: "Échec du changement de statut de la publication.",
    deleteConfirm: "Voulez-vous vraiment supprimer cette publication ? Cette action est irréversible.",
    deleteSuccess: "Publication supprimée avec succès.",
    deleteFailed: "Échec de la suppression de la publication.",
    feedTitle: "Publications du fil commercial",
    feedSubtitle: "Diffusez des mises à jour de stock, des arrivages, des promotions ou des vidéos coulisses aux acheteurs B2B tunisiens et régionaux.",
    newPost: "Nouvelle publication",
    emptyTitle: "Aucune mise à jour publiée pour le moment",
    emptyDesc: "Les mises à jour commerciales gardent votre entreprise visible sur le fil Découvrir régional. Commencez par rédiger votre première mise à jour ou publication promotionnelle dès aujourd'hui !",
    createFirst: "Créer la première publication",
    published: "Publié",
    draft: "Brouillon",
    viewsSuffix: "vues",
    unpublish: "Dépublier",
    publish: "Publier",
    editTitle: "Modifier la publication",
    editBtn: "Modifier",
    deleteTitle: "Supprimer la publication",
    deleteBtn: "Supprimer",
    editModalTitle: "Modifier la publication commerciale",
    createModalTitle: "Créer une publication commerciale",
    contentLabel: "Contenu de la publication *",
    contentPlaceholder: "Quoi de neuf ? Décrivez vos nouveaux arrivages, lots en gros, mises à jour d'usine ou remises de gros...",
    statusLabel: "Statut",
    optDraft: "Enregistrer comme brouillon (privé)",
    optPublish: "Publier sur le fil public",
    visibilityLabel: "Visibilité",
    optPublic: "Publiquement visible",
    mediaLabel: "Pièces jointes multimédias",
    attachedAlt: "Fichier joint",
    thumbAlt: "Miniature",
    removeImage: "Supprimer l'image",
    uploading: "Chargement...",
    uploadPhoto: "Charger une photo",
    fileHint: "PNG, JPEG ou WEBP de moins de 5 Mo (10 images max)",
    saveChanges: "Enregistrer",
    publishUpdate: "Publier la mise à jour",
    cancel: "Annuler",
  },
  ar: {
    loadFailed: "فشل تحميل المنشورات.",
    sizeError: "حجم الملف يتجاوز الحد 5 ميجابايت. يرجى تحميل صورة أصغر.",
    typeError: "نوع ملف غير صالح. الصيغ المدعومة فقط: PNG وJPEG وJPG وWEBP.",
    urlError: "تعذر الحصول على الرابط العام.",
    uploadFailed: "فشل تحميل الصورة. تأكد من إعداد حاوية التخزين.",
    contentRequired: "محتوى المنشور أو التعليق مطلوب.",
    updateSuccess: "تم تحديث المنشور بنجاح!",
    updateFailed: "فشل تحديث المنشور.",
    createSuccess: "تم إنشاء منشور جديد بنجاح!",
    createFailed: "فشل إنشاء المنشور.",
    saveUnexpected: "حدث خطأ غير متوقع أثناء الحفظ.",
    unpublishSuccess: "تم إلغاء نشر المنشور بنجاح.",
    publishSuccess: "تم نشر المنشور في الخلاصة بنجاح!",
    statusFailed: "فشل تغيير حالة المنشور.",
    deleteConfirm: "هل أنت متأكد من حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء.",
    deleteSuccess: "تم حذف المنشور بنجاح.",
    deleteFailed: "فشل حذف المنشور.",
    feedTitle: "منشورات الخلاصة التجارية",
    feedSubtitle: "انشر تحديثات المخزون والوصولات الجديدة والعروض أو فيديوهات من الكواليس لمشتري B2B في تونس والمنطقة.",
    newPost: "منشور تحديث جديد",
    emptyTitle: "لم يتم نشر أي تحديثات بعد",
    emptyDesc: "التحديثات التجارية تبقي نشاطك ظاهراً في خلاصة الاكتشاف الإقليمية. ابدأ بكتابة أول تحديث أو منشور ترويجي اليوم!",
    createFirst: "إنشاء أول منشور",
    published: "منشور",
    draft: "مسودة",
    viewsSuffix: "مشاهدة",
    unpublish: "إلغاء النشر",
    publish: "نشر",
    editTitle: "تعديل المنشور",
    editBtn: "تعديل",
    deleteTitle: "حذف المنشور",
    deleteBtn: "حذف",
    editModalTitle: "تعديل المنشور التجاري",
    createModalTitle: "إنشاء منشور تجاري",
    contentLabel: "محتوى المنشور *",
    contentPlaceholder: "ما الجديد؟ صف وصولاتك الجديدة أو عبواتك بالجملة أو تحديثات المصنع أو خصومات الجملة...",
    statusLabel: "الحالة",
    optDraft: "حفظ كمسودة (خاص)",
    optPublish: "النشر في الخلاصة العامة",
    visibilityLabel: "الظهور",
    optPublic: "قابل للاكتشاف علناً",
    mediaLabel: "مرفقات وسائط المنشور",
    attachedAlt: "ملف مرفق",
    thumbAlt: "صورة مصغرة",
    removeImage: "إزالة الصورة",
    uploading: "جارٍ التحميل...",
    uploadPhoto: "تحميل صورة",
    fileHint: "PNG أو JPEG أو WEBP بحجم أقل من 5 ميجابايت (10 صور كحد أقصى)",
    saveChanges: "حفظ التغييرات",
    publishUpdate: "نشر التحديث",
    cancel: "إلغاء",
  },
} as const

export function MerchantPosts({ companyId, lang }: MerchantPostsProps) {
  const tr = MT[(lang as "en" | "fr" | "ar")] || MT.en
  const [posts, setPosts] = useState<CommercialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Modal States
  const [showModal, setShowModal] = useState(false)
  const [editingPost, setEditingPost] = useState<CommercialPost | null>(null)

  // Form Fields
  const [content, setContent] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [status, setStatus] = useState<CommercialPostStatus>("draft")
  const [visibility, setVisibility] = useState("public")

  // Form Actions Loading states
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const loadPosts = useCallback(async () => {
    await Promise.resolve()
    setLoading(true)
    setError(null)
    const res = await fetchCompanyPosts(companyId)
    if (res.success) {
      setPosts(res.data)
    } else {
      setError(res.error || tr.loadFailed)
    }
    setLoading(false)
  }, [companyId, tr.loadFailed])

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    loadPosts()
  }, [loadPosts])

  // Open modal for creation
  const handleOpenCreate = () => {
    setEditingPost(null)
    setContent("")
    setImages([])
    setStatus("draft")
    setVisibility("public")
    setFormError(null)
    setShowModal(true)
  }

  // Open modal for editing
  const handleOpenEdit = (post: CommercialPost) => {
    setEditingPost(post)
    setContent(post.content)
    setImages(post.images)
    setStatus(post.status)
    setVisibility(post.visibility)
    setFormError(null)
    setShowModal(true)
  }

  // Handles raw image upload directly to Supabase storage 'commercial-posts' bucket
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFormError(null)

    // 1. Validate File Size (< 5MB)
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      setFormError(tr.sizeError)
      return
    }

    // 2. Validate File Type (must be PNG, JPEG, JPG, WEBP)
    const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFormError(tr.typeError)
      return
    }

    setUploading(true)
    const supabase = createClient()

    try {
      // 3. Construct unique file name path
      const fileExt = file.name.split(".").pop() || "png"
      const fileName = `post-${companyId}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      const filePath = `${companyId}/${fileName}`

      // 4. Upload object
      const { data, error: uploadError } = await supabase.storage
        .from("commercial-posts")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      // 5. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from("commercial-posts")
        .getPublicUrl(filePath)

      if (publicUrlData?.publicUrl) {
        setImages((prev) => [...prev, publicUrlData.publicUrl])
      } else {
        throw new Error(tr.urlError)
      }

    } catch (err: any) {
      console.error("Storage upload error:", err)
      setFormError(err.message || tr.uploadFailed)
    } finally {
      setUploading(false)
    }
  }

  // Removes a thumbnail from the current post form
  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  // Handles full save action (creation or update)
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!content.trim()) {
      setFormError(tr.contentRequired)
      return
    }

    setSaving(true)

    try {
      if (editingPost) {
        const res = await updatePost(editingPost.id, {
          content,
          images,
          status,
          visibility
        })

        if (res.success && res.data) {
          setSuccess(tr.updateSuccess)
          setShowModal(false)
          loadPosts()
          setTimeout(() => setSuccess(null), 3000)
        } else {
          setFormError(res.error || tr.updateFailed)
        }
      } else {
        const res = await createPost({
          companyId,
          content,
          images,
          status,
          visibility
        })

        if (res.success && res.data) {
          setSuccess(tr.createSuccess)
          setShowModal(false)
          loadPosts()
          setTimeout(() => setSuccess(null), 3000)
        } else {
          setFormError(res.error || tr.createFailed)
        }
      }
    } catch (err: any) {
      setFormError(err.message || tr.saveUnexpected)
    } finally {
      setSaving(false)
    }
  }

  // Toggles publication status of a post directly from the list
  const handleToggleStatus = async (post: CommercialPost) => {
    setSuccess(null)
    const isCurrentlyPublished = post.status === "published"
    const toggleFunc = isCurrentlyPublished ? unpublishPost : publishPost

    const res = await toggleFunc(post.id)
    if (res.success) {
      setSuccess(isCurrentlyPublished ? tr.unpublishSuccess : tr.publishSuccess)
      loadPosts()
      setTimeout(() => setSuccess(null), 3000)
    } else {
      setError(res.error || tr.statusFailed)
      setTimeout(() => setError(null), 3000)
    }
  }

  // Deletes a post with soft-delete
  const handleDeletePost = async (postId: string) => {
    if (!confirm(tr.deleteConfirm)) {
      return
    }

    setSuccess(null)
    const res = await deletePost(postId)
    if (res.success) {
      setSuccess(tr.deleteSuccess)
      loadPosts()
      setTimeout(() => setSuccess(null), 3000)
    } else {
      setError(res.error || tr.deleteFailed)
      setTimeout(() => setError(null), 3000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab Header with Create button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h4 className="text-base font-black text-foreground tracking-tight flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            <span>{tr.feedTitle}</span>
          </h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-md">
            {tr.feedSubtitle}
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-blue-600 px-4 py-2.5 text-xs font-black text-white hover:opacity-95 shadow-md shadow-primary/10 transition-all cursor-pointer active:scale-98"
        >
          <Plus className="size-4" />
          <span>{tr.newPost}</span>
        </button>
      </div>

      {/* Success / Error Banners */}
      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2 animate-scale-up">
          <CheckCircle className="size-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold rounded-xl flex items-center gap-2 animate-scale-up">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Posts list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-border bg-secondary/10 px-6 py-12 text-center max-w-lg mx-auto space-y-4">
          <div className="size-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
            <FileText className="size-6" />
          </div>
          <div>
            <h5 className="text-sm font-black text-foreground">{tr.emptyTitle}</h5>
            <p className="text-xs text-muted-foreground mt-1 leading-normal">
              {tr.emptyDesc}
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="rounded-xl border border-primary text-primary hover:bg-primary/5 px-4 py-2 text-xs font-bold transition-all cursor-pointer"
          >
            {tr.createFirst}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {posts.map((post) => {
            const hasImages = post.images && post.images.length > 0
            const timestampStr = new Date(post.createdAt).toLocaleDateString(
              lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : "ar-TN",
              { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
            )

            return (
              <div
                key={post.id}
                className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col sm:flex-row justify-between gap-4 items-start"
              >
                <div className="space-y-3 min-w-0 flex-1">
                  {/* Status Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    {post.status === "published" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                        <Globe className="size-3" />
                        <span>{tr.published}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase">
                        <Lock className="size-3" />
                        <span>{tr.draft}</span>
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {timestampStr}
                    </span>
                  </div>

                  {/* Caption */}
                  <p className="text-xs font-semibold text-foreground leading-relaxed whitespace-pre-wrap break-words">
                    {post.content}
                  </p>

                  {/* Images Carousel/Rail */}
                  {hasImages && (
                    <div className="flex gap-2 py-1 overflow-x-auto no-scrollbar">
                      {post.images.map((imgUrl, imgIdx) => (
                        <div
                          key={imgIdx}
                          className="relative size-16 rounded-xl overflow-hidden border border-border/60 bg-secondary shrink-0"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgUrl}
                            alt={tr.attachedAlt}
                            className="size-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* View count */}
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                    <Eye className="size-3.5" />
                    <span>{post.viewCount} {tr.viewsSuffix}</span>
                  </div>
                </div>

                {/* Operations */}
                <div className="flex sm:flex-col gap-2 w-full sm:w-auto pt-2 sm:pt-0 shrink-0 border-t sm:border-t-0 border-border/40">
                  <button
                    onClick={() => handleToggleStatus(post)}
                    className={`flex-1 sm:flex-initial text-center rounded-lg px-3 py-2 text-[10px] font-black transition-all cursor-pointer ${
                      post.status === "published"
                        ? "bg-secondary text-foreground hover:bg-secondary/80"
                        : "bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20"
                    }`}
                  >
                    {post.status === "published" ? tr.unpublish : tr.publish}
                  </button>

                  <div className="flex gap-2 flex-1 sm:flex-initial">
                    <button
                      onClick={() => handleOpenEdit(post)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 rounded-lg border border-border bg-card hover:bg-secondary/40 text-[10px] font-bold text-foreground py-2 px-3 transition-all cursor-pointer"
                      title={tr.editTitle}
                    >
                      <Edit className="size-3 text-muted-foreground" />
                      <span>{tr.editBtn}</span>
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-[10px] font-bold text-destructive py-2 px-3 transition-all cursor-pointer"
                      title={tr.deleteTitle}
                    >
                      <Trash2 className="size-3" />
                      <span>{tr.deleteBtn}</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Creation & Editing Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h4 className="text-base font-black text-foreground flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                <span>{editingPost ? tr.editModalTitle : tr.createModalTitle}</span>
              </h4>
              <button
                onClick={() => setShowModal(false)}
                className="size-8 rounded-xl border border-border hover:bg-secondary/40 flex items-center justify-center text-muted-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Rich Text / Content field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">{tr.contentLabel}</label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={tr.contentPlaceholder}
                  className="w-full rounded-xl border border-border bg-secondary/10 px-3.5 py-2.5 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 resize-none"
                />
              </div>

              {/* Status Selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">{tr.statusLabel}</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-secondary/10 px-3 py-2.5 text-xs text-foreground focus:border-primary"
                  >
                    <option value="draft">{tr.optDraft}</option>
                    <option value="published">{tr.optPublish}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">{tr.visibilityLabel}</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-full rounded-xl border border-border bg-secondary/10 px-3 py-2.5 text-xs text-foreground focus:border-primary"
                  >
                    <option value="public">{tr.optPublic}</option>
                  </select>
                </div>
              </div>

              {/* Image Upload section */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <ImageIcon className="size-4 text-primary" />
                  <span>{tr.mediaLabel}</span>
                </label>

                {/* Thumbnail Previews with delete buttons */}
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 py-1.5">
                    {images.map((imgUrl, imgIdx) => (
                      <div
                        key={imgIdx}
                        className="relative size-20 rounded-xl overflow-hidden border border-border bg-secondary aspect-square group animate-scale-up"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={tr.thumbAlt}
                          className="size-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(imgIdx)}
                          className="absolute top-1 end-1 size-5 rounded-lg bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-all cursor-pointer"
                          title={tr.removeImage}
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button wrapper */}
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center justify-center gap-2 rounded-xl border border-border hover:bg-secondary/40 text-xs font-bold text-foreground py-2.5 px-4 transition-all cursor-pointer">
                    {uploading ? (
                      <>
                        <Loader2 className="size-4 animate-spin text-primary" />
                        <span>{tr.uploading}</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="size-4 text-muted-foreground" />
                        <span>{tr.uploadPhoto}</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleImageUpload}
                      disabled={uploading || images.length >= 10}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    {tr.fileHint}
                  </span>
                </div>
              </div>

              {/* Save & Cancel buttons */}
              <div className="flex gap-3 pt-4 border-t border-border/50">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 py-3.5 text-xs font-black text-white hover:opacity-95 shadow-md shadow-primary/15 transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  <span>{editingPost ? tr.saveChanges : tr.publishUpdate}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-border px-5 py-3.5 hover:bg-secondary/40 text-xs font-bold text-foreground transition-all cursor-pointer"
                >
                  {tr.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
