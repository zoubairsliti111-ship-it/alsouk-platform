"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  Tag,
  Loader2,
  ShieldAlert,
  Save,
  X,
  FileText,
  Image as ImageIcon
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { MarketplaceShell, Breadcrumbs } from "@/components/marketplace/shell"
import type { ExhibitionBooth } from "@/lib/domains/exhibition/types"

const dict = {
  en: {
    editTitle: "Edit Booth Profile",
    subtitle: "Customise your virtual pavilion's information and assets. Updates are saved as a Draft.",
    boothNameLabel: "Booth Name / Title",
    boothNamePlaceholder: "e.g. Medina Olive Co. — Sfax Extra Virgin",
    shortDescLabel: "Short Description",
    shortDescPlaceholder: "A brief one-sentence hook for your booth...",
    fullDescLabel: "Full Description / About",
    fullDescPlaceholder: "Write a detailed description of your products, exhibits, company history, and B2B goals...",
    bannerUrlLabel: "Banner Image URL",
    bannerUrlPlaceholder: "https://example.com/your-banner.jpg",
    logoUrlLabel: "Company Logo URL (Booth Override)",
    logoUrlPlaceholder: "https://example.com/your-logo.png",
    saveDraftBtn: "Save Draft",
    cancelBtn: "Cancel",
    aboutSection: "About Booth Pavilion",
    brandingSection: "Visual Identity & Branding",
    loading: "Loading editor...",
    saving: "Saving draft...",
    successSave: "Draft saved successfully! Returning to dashboard.",
    errorSave: "Failed to save draft. Please check your inputs and try again.",
    errorLoad: "Failed to load booth details.",
    backToDashboard: "Cancel and Return",
    characterLimit: "Keep it under 150 characters",
    requiredField: "This field is required",
    categoryLabel: "Product/Service Category",
    categoryPlaceholder: "e.g. Food & Agriculture, Textiles, etc."
  },
  fr: {
    editTitle: "Modifier le profil du stand",
    subtitle: "Personnalisez les informations de votre stand virtuel. Les modifications sont enregistrées en tant que brouillon.",
    boothNameLabel: "Nom / Titre du stand",
    boothNamePlaceholder: "ex. Medina Olive Co. — Huile d'olive extra vierge",
    shortDescLabel: "Description courte",
    shortDescPlaceholder: "Une courte phrase d'accroche pour votre stand...",
    fullDescLabel: "Description complète / À propos",
    fullDescPlaceholder: "Rédigez une description détaillée de vos produits, stands, historique d'entreprise, et objectifs B2B...",
    bannerUrlLabel: "URL de l'image de la bannière",
    bannerUrlPlaceholder: "https://exemple.com/votre-banniere.jpg",
    logoUrlLabel: "URL du logo de l'entreprise (Surcharge)",
    logoUrlPlaceholder: "https://exemple.com/votre-logo.png",
    saveDraftBtn: "Enregistrer le brouillon",
    cancelBtn: "Annuler",
    aboutSection: "À propos du pavillon",
    brandingSection: "Identité visuelle et marque",
    loading: "Chargement de l'éditeur...",
    saving: "Enregistrement du brouillon...",
    successSave: "Brouillon enregistré avec succès ! Retour au tableau de bord.",
    errorSave: "Échec de l'enregistrement du brouillon. Veuillez réessayer.",
    errorLoad: "Échec du chargement des détails du stand.",
    backToDashboard: "Annuler et retourner",
    characterLimit: "Moins de 150 caractères",
    requiredField: "Ce champ est obligatoire",
    categoryLabel: "Catégorie de produit/service",
    categoryPlaceholder: "ex. Agroalimentaire, Textile, etc."
  },
  ar: {
    editTitle: "تعديل الملف التعريفي للجناح",
    subtitle: "تخصيص معلومات وأصول جناحك الافتراضي. سيتم حفظ التحديثات كمسودة.",
    boothNameLabel: "اسم الجناح / العنوان",
    boothNamePlaceholder: "مثال: شركة مدينا للزيتون - زيت بكر ممتاز بصفاقس",
    shortDescLabel: "وصف قصير",
    shortDescPlaceholder: "جملة ترويجية قصيرة لجناحك المعرضي...",
    fullDescLabel: "وصف كامل / حول الجناح",
    fullDescPlaceholder: "اكتب وصفاً تفصيلياً لمنتجاتك، معروضاتك، تاريخ الشركة، وأهدافك التجارية...",
    bannerUrlLabel: "رابط صورة البانر",
    bannerUrlPlaceholder: "https://example.com/your-banner.jpg",
    logoUrlLabel: "رابط شعار الشركة (تخصيص للجناح)",
    logoUrlPlaceholder: "https://example.com/your-logo.png",
    saveDraftBtn: "حفظ كمسودة",
    cancelBtn: "إلغاء",
    aboutSection: "حول جناح المعرض",
    brandingSection: "الهوية البصرية والماركة",
    loading: "جاري تحميل المحرر...",
    saving: "جاري حفظ المسودة...",
    successSave: "تم حفظ المسودة بنجاح! جاري العودة إلى لوحة التحكم.",
    errorSave: "فشل حفظ المسودة. يرجى مراجعة المدخلات والمحاولة مرة أخرى.",
    errorLoad: "فشل في تحميل تفاصيل الجناح.",
    backToDashboard: "إلغاء والعودة",
    characterLimit: "يرجى الإبقاء عليه أقل من 150 حرفاً",
    requiredField: "هذا الحقل مطلوب",
    categoryLabel: "فئة المنتج/الخدمة",
    categoryPlaceholder: "مثال: الأغذية والزراعة، المنسوجات، إلخ."
  }
}

export default function EditBoothPage() {
  return (
    <MarketplaceShell>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
          </div>
        }
      >
        <EditContent />
      </Suspense>
    </MarketplaceShell>
  )
}

function EditContent() {
  const { lang, dir } = useLanguage()
  const d = dict[lang] || dict.en
  const searchParams = useSearchParams()
  const router = useRouter()
  const boothId = searchParams.get("id")

  const [loading, setLoading] = useState(!!boothId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form states
  const [title, setTitle] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [description, setDescription] = useState("")
  const [bannerUrl, setBannerUrl] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [category, setCategory] = useState("")
  const [status, setStatus] = useState<string>("Draft")

  const derivedError = !boothId ? d.errorLoad : null
  const displayError = error || derivedError

  useEffect(() => {
    if (!boothId) {
      return
    }

    let active = true
    fetch(`/api/exhibitions/booth?id=${encodeURIComponent(boothId)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Status " + res.status)
        return res.json()
      })
      .then((json) => {
        if (!active) return
        if (json.success && json.data) {
          const b: ExhibitionBooth = json.data
          setTitle(b.title || b.company?.name || "")
          setShortDescription(b.shortDescription || b.company?.tagline || "")
          setDescription(b.description || "")
          setBannerUrl(b.bannerUrl || "")
          setLogoUrl(b.logoUrl || b.company?.logoUrl || "")
          setCategory(b.category || "")
          setStatus(b.status || "Draft")
        } else {
          setError(json.error || d.errorLoad)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load booth details in editor:", err)
        if (!active) return
        setError(d.errorLoad)
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [boothId, d.errorLoad])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!boothId) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch("/api/exhibitions/booth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: boothId,
          title: title.trim(),
          shortDescription: shortDescription.trim(),
          description: description.trim(),
          bannerUrl: bannerUrl.trim(),
          logoUrl: logoUrl.trim(),
          category: category.trim()
        })
      })

      const json = await res.json()
      if (json.success) {
        setSuccess(d.successSave)
        setTimeout(() => {
          router.push(`/exhibitions/booth/dashboard?id=${boothId}`)
        }, 1500)
      } else {
        setError(json.error || d.errorSave)
        setSaving(false)
      }
    } catch (err) {
      console.error("Failed to save booth draft:", err)
      setError(d.errorSave)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3" dir={dir}>
        <Loader2 className="size-8 text-primary animate-spin" />
        <span className="text-xs font-bold text-muted-foreground">{d.loading}</span>
      </div>
    )
  }

  if (displayError && !title) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-4" dir={dir}>
        <ShieldAlert className="size-10 text-destructive mx-auto" />
        <p className="text-sm font-bold text-foreground">{displayError}</p>
        <button
          onClick={() => router.push("/exhibitions/booth/dashboard")}
          className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold"
        >
          <ArrowLeft className="size-4" />
          <span>{d.backToDashboard}</span>
        </button>
      </div>
    )
  }

  return (
    <div className="pb-16" dir={dir}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Workspace", href: "/exhibitions/booth/dashboard" },
          { label: d.editTitle }
        ]}
      />

      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="space-y-1 mb-8 border-b border-border/60 pb-4">
          <h1 className="text-2xl font-black text-foreground">{d.editTitle}</h1>
          <p className="text-xs font-medium text-muted-foreground">{d.subtitle}</p>
        </div>

        {/* Lock/Read-only banner if Submitted */}
        {status === "Submitted" && (
          <div className="mb-6 rounded-[20px] border border-blue-200 bg-blue-500/10 dark:bg-blue-950/30 dark:border-blue-900/50 p-5 flex gap-4 items-center">
            <ShieldAlert className="size-10 text-blue-600 dark:text-blue-400 shrink-0" />
            <div className="text-left">
              <h4 className="text-sm font-black text-foreground">Editing Profile Locked</h4>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">Your booth has been submitted for review. Editing is disabled until administrator review.</p>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {displayError && (
          <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex gap-3 items-center text-xs font-semibold text-destructive">
            <ShieldAlert className="size-5 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/5 p-4 flex gap-3 items-center text-xs font-semibold text-green-600 dark:text-green-400">
            <Loader2 className="size-5 animate-spin shrink-0 text-green-500" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* About Section */}
          <div className="rounded-[20px] border border-border bg-card p-6 space-y-5 shadow-sm">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
              <FileText className="size-4 text-primary" />
              <span>{d.aboutSection}</span>
            </h2>

            <div className="space-y-4">
              {/* Booth Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                  {d.boothNameLabel} <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={status === "Submitted" || saving}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={d.boothNamePlaceholder}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-xs font-bold text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none min-h-[44px] disabled:opacity-50"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                  {d.categoryLabel}
                </label>
                <input
                  type="text"
                  disabled={status === "Submitted" || saving}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder={d.categoryPlaceholder}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-xs font-bold text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none min-h-[44px] disabled:opacity-50"
                />
              </div>

              {/* Short Description */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                    {d.shortDescLabel}
                  </label>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    {d.characterLimit}
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={150}
                  disabled={status === "Submitted" || saving}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder={d.shortDescPlaceholder}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-xs font-bold text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none min-h-[44px] disabled:opacity-50"
                />
              </div>

              {/* Full Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                  {d.fullDescLabel}
                </label>
                <textarea
                  rows={6}
                  disabled={status === "Submitted" || saving}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={d.fullDescPlaceholder}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none min-h-[100px] resize-y leading-relaxed disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Branding Section */}
          <div className="rounded-[20px] border border-border bg-card p-6 space-y-5 shadow-sm">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
              <ImageIcon className="size-4 text-primary" />
              <span>{d.brandingSection}</span>
            </h2>

            <div className="space-y-4">
              {/* Banner Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                  {d.bannerUrlLabel}
                </label>
                <input
                  type="url"
                  disabled={status === "Submitted" || saving}
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder={d.bannerUrlPlaceholder}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-xs font-bold text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none min-h-[44px] disabled:opacity-50"
                />
              </div>

              {/* Company Logo Override */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                  {d.logoUrlLabel}
                </label>
                <input
                  type="url"
                  disabled={status === "Submitted" || saving}
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder={d.logoUrlPlaceholder}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-xs font-bold text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none min-h-[44px] disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={status === "Submitted" || saving}
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 disabled:bg-primary/50 text-primary-foreground px-5 py-3.5 text-xs font-black transition-all min-h-11"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>{d.saving}</span>
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  <span>{d.saveDraftBtn}</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => router.push(`/exhibitions/booth/dashboard?id=${boothId}`)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-secondary disabled:opacity-50 px-5 py-3.5 text-xs font-black text-foreground transition-all min-h-11"
            >
              <X className="size-4" />
              <span>{d.cancelBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
