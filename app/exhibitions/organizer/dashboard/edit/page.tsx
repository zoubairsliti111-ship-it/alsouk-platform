"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import {
  Loader2,
  AlertCircle,
  Save,
  CheckCircle,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Globe
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { MarketplaceShell, Breadcrumbs, ListingHeader } from "@/components/marketplace/shell"

const dict = {
  en: {
    title: "Configure Exhibition Details",
    subtitle: "Modify the public profile, event schedules, category focus, and branding assets of your virtual exhibition pavilion.",
    back: "Back to Dashboard",
    general: "General Settings",
    exhibitionName: "Exhibition Name",
    description: "Exhibition Description",
    descriptionHelp: "Explain the main purpose of the trade show and target audience.",
    categories: "Focus Categories",
    categoriesHelp: "Use comma-separated values (e.g. Food & Agriculture, Textiles, Tech).",
    dates: "Event Schedule",
    startDate: "Start Date & Time",
    endDate: "End Date & Time",
    location: "Hosting Location",
    city: "City",
    country: "Country",
    branding: "Branding Assets",
    logoUrl: "Logo Image URL",
    coverUrl: "Banner Cover Image URL",
    contact: "Organizer Contact Details",
    email: "Contact Email",
    phone: "Contact Phone",
    website: "Event Website",
    saveDraft: "Save Draft",
    publishChanges: "Publish Changes",
    loading: "Loading profile configurations...",
    successSave: "Exhibition details updated successfully!",
    errorLoad: "Failed to load configurations.",
    saving: "Saving changes...",
    requiredFields: "Please fill out all required fields."
  },
  fr: {
    title: "Configurer l'Exposition",
    subtitle: "Modifiez le profil public, les dates, les catégories cibles et l'image de marque de votre salon virtuel.",
    back: "Retour au tableau de bord",
    general: "Paramètres Généraux",
    exhibitionName: "Nom de l'Exposition",
    description: "Description de l'Exposition",
    descriptionHelp: "Expliquez l'objectif du salon et les acheteurs ciblés.",
    categories: "Catégories cibles",
    categoriesHelp: "Séparez les catégories par des virgules (ex: Food, Textiles, Tech).",
    dates: "Dates de l'événement",
    startDate: "Date de début",
    endDate: "Date de fin",
    location: "Lieu de l'événement",
    city: "Ville",
    country: "Pays",
    branding: "Identité Visuelle",
    logoUrl: "URL du Logo",
    coverUrl: "URL de la Bannière de couverture",
    contact: "Contact de l'Organisateur",
    email: "Email de contact",
    phone: "Téléphone de contact",
    website: "Site Web",
    saveDraft: "Enregistrer le Brouillon",
    publishChanges: "Publier les Modifications",
    loading: "Chargement de la configuration...",
    successSave: "Salon mis à jour avec succès !",
    errorLoad: "Impossible de charger la configuration.",
    saving: "Enregistrement en cours...",
    requiredFields: "Veuillez remplir tous les champs obligatoires."
  },
  ar: {
    title: "تكوين تفاصيل المعرض",
    subtitle: "تعديل الملف العام، جدول المواعيد، الفئات المستهدفة، وعناصر الهوية التجارية لمعرضك الافتراضي.",
    back: "العودة إلى لوحة التحكم",
    general: "الإعدادات العامة",
    exhibitionName: "اسم المعرض",
    description: "وصف المعرض",
    descriptionHelp: "اشرح الغرض الرئيسي من المعرض التجاري والجمهور المستهدف.",
    categories: "الفئات المستهدفة",
    categoriesHelp: "استخدم الفواصل للفصل بين الفئات (مثال: الأغذية والزراعة، المنسوجات، التكنولوجيا).",
    dates: "جدول المواعيد",
    startDate: "تاريخ ووقت البدء",
    endDate: "تاريخ ووقت الانتهاء",
    location: "موقع الاستضافة",
    city: "المدينة",
    country: "البلد",
    branding: "أصول الهوية التجارية",
    logoUrl: "رابط شعار المعرض",
    coverUrl: "رابط بنر غلاف المعرض",
    contact: "تفاصيل اتصال المنظم",
    email: "البريد الإلكتروني للاتصال",
    phone: "هاتف الاتصال",
    website: "موقع المعرض الإلكتروني",
    saveDraft: "حفظ مسودة",
    publishChanges: "نشر التغييرات",
    loading: "جاري تحميل تفاصيل التكوين...",
    successSave: "تم تحديث تفاصيل المعرض بنجاح!",
    errorLoad: "فشل تحميل التكوينات.",
    saving: "جاري الحفظ الآن...",
    requiredFields: "يرجى ملء جميع الحقول المطلوبة."
  }
}

export default function EditExhibitionPage() {
  return (
    <MarketplaceShell>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
          </div>
        }
      >
        <EditFormContent />
      </Suspense>
    </MarketplaceShell>
  )
}

function EditFormContent() {
  const { lang, dir, t } = useLanguage()
  const d = dict[lang] || dict.en
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form parameters
  const [exhibitionId, setExhibitionId] = useState("")
  const [name, setName] = useState("")
  const [organizer, setOrganizer] = useState("")
  const [description, setDescription] = useState("")
  const [categoriesInput, setCategoriesInput] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("")
  const [coverUrl, setCoverUrl] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [website, setWebsite] = useState("")

  useEffect(() => {
    let active = true
    fetch("/api/exhibitions/organizer/dashboard")
      .then((res) => res.json())
      .then((json) => {
        if (!active) return
        if (json.success && json.data?.exhibition) {
          const ex = json.data.exhibition
          setExhibitionId(ex.id)
          setName(ex.name || "")
          setOrganizer(ex.organizer || "")
          setDescription(ex.description || "")
          setCategoriesInput((ex.categories || []).join(", "))
          setCity(ex.city || "")
          setCountry(ex.country || "TN")
          setCoverUrl(ex.coverUrl || "")
          setLogoUrl(ex.logoUrl || "")
          setContactEmail(ex.contactEmail || "")
          setContactPhone(ex.contactPhone || "")
          setWebsite(ex.website || "")

          // Format Timestamptz dates for datetime-local inputs
          if (ex.startDate) {
            setStartDate(new Date(ex.startDate).toISOString().slice(0, 16))
          }
          if (ex.endDate) {
            setEndDate(new Date(ex.endDate).toISOString().slice(0, 16))
          }
        } else {
          setError(d.errorLoad)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load configs:", err)
        if (!active) return
        setError(d.errorLoad)
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [d.errorLoad])

  const handleSubmit = async (e: React.FormEvent, isPublish: boolean) => {
    e.preventDefault()
    setSuccess(false)
    setError(null)

    if (!name.trim() || !organizer.trim() || !city.trim() || !startDate || !endDate) {
      setError(d.requiredFields)
      return
    }

    setSaving(true)

    // Parse focus categories
    const categories = categoriesInput
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c.length > 0)

    try {
      const res = await fetch("/api/exhibitions/organizer/exhibition", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: exhibitionId,
          name: name.trim(),
          organizer: organizer.trim(),
          description: description.trim(),
          categories,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          city: city.trim().toLowerCase(),
          country: country.trim().toUpperCase(),
          coverUrl: coverUrl.trim(),
          logoUrl: logoUrl.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim(),
          website: website.trim(),
        }),
      })

      const json = await res.json()
      if (json.success) {
        setSuccess(true)
        // Auto dismiss success toast
        setTimeout(() => setSuccess(false), 5000)
      } else {
        setError(json.error || "Failed to update")
      }
    } catch (err: any) {
      console.error("Failed to save:", err)
      setError(err.message || "An unexpected error occurred")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3" dir={dir}>
        <Loader2 className="size-9 text-primary animate-spin" />
        <span className="text-xs font-bold text-muted-foreground">{d.loading}</span>
      </div>
    )
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

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Navigation back */}
        <button
          onClick={() => router.push("/exhibitions/organizer/dashboard")}
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-black text-primary hover:underline"
        >
          <ArrowLeft className={`size-4 shrink-0 ${dir === "rtl" ? "rotate-180" : ""}`} />
          <span>{d.back}</span>
        </button>

        <ListingHeader title={d.title} subtitle={d.subtitle} />

        {/* State Banners */}
        {success && (
          <div className="mt-8 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="size-5 shrink-0" />
            <span>{d.successSave}</span>
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex items-center gap-3 text-xs font-bold text-destructive">
            <AlertCircle className="size-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, false)} className="mt-8 space-y-6">
          {/* General settings card */}
          <div className="rounded-[20px] border border-border bg-card p-6 md:p-8 space-y-5">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <Sparkles className="size-5 text-primary shrink-0" />
              <span>{d.general}</span>
            </h3>

            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {d.exhibitionName} <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none min-h-[44px]"
                />
              </div>

              {/* Organizer */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {lang === "ar" ? "المنظم المسؤول" : lang === "fr" ? "Organisateur principal" : "Lead Organizer"} <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none min-h-[44px]"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">{d.description}</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={d.descriptionHelp}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none leading-relaxed"
                />
              </div>

              {/* Categories focus */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Layers className="size-4 text-muted-foreground" />
                  <span>{d.categories}</span>
                </label>
                <input
                  type="text"
                  value={categoriesInput}
                  onChange={(e) => setCategoriesInput(e.target.value)}
                  placeholder="e.g. Food & Agriculture, Textiles"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none min-h-[44px]"
                />
                <p className="text-[10px] text-muted-foreground/80 font-semibold">{d.categoriesHelp}</p>
              </div>
            </div>
          </div>

          {/* Schedule and dates card */}
          <div className="rounded-[20px] border border-border bg-card p-6 md:p-8 space-y-5">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <Calendar className="size-5 text-primary shrink-0" />
              <span>{d.dates}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {d.startDate} <span className="text-destructive">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none min-h-[44px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {d.endDate} <span className="text-destructive">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Location and contact card */}
          <div className="rounded-[20px] border border-border bg-card p-6 md:p-8 space-y-5">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <MapPin className="size-5 text-primary shrink-0" />
              <span>{d.location}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {d.city} <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none min-h-[44px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {d.country} <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Media cover image assets */}
          <div className="rounded-[20px] border border-border bg-card p-6 md:p-8 space-y-5">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <Globe className="size-5 text-primary shrink-0" />
              <span>{d.branding}</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">{d.coverUrl}</label>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none min-h-[44px]"
                />
                {coverUrl && (
                  <div className="mt-2 h-32 w-full overflow-hidden rounded-xl border border-border bg-secondary">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={coverUrl} alt="Cover Preview" className="size-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">{d.logoUrl}</label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/logo..."
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none min-h-[44px]"
                />
                {logoUrl && (
                  <div className="mt-2 size-20 overflow-hidden rounded-xl border border-border bg-secondary flex items-center justify-center p-1 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="Logo Preview" className="size-full object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact details */}
          <div className="rounded-[20px] border border-border bg-card p-6 md:p-8 space-y-5">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <Mail className="size-5 text-primary shrink-0" />
              <span>{d.contact}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">{d.email}</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="organizer@example.com"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none min-h-[44px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">{d.phone}</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+216 71 000 000"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none min-h-[44px]"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-foreground">{d.website}</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://exhibition.example.com"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-border/50">
            <button
              type="button"
              disabled={saving}
              onClick={(e) => handleSubmit(e, false)}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-secondary text-foreground px-6 py-3 text-xs font-black min-h-12 cursor-pointer disabled:opacity-50"
            >
              <span>{d.saveDraft}</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              onClick={(e) => handleSubmit(e, true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-xs font-black min-h-12 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              <span>{d.publishChanges}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
