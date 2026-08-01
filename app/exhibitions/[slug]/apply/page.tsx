"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Building2,
  Calendar,
  MapPin,
  Trophy,
  Loader2,
  AlertCircle,
  CheckCircle,
  Building,
  User,
  Mail,
  Phone,
  Globe,
  Tag,
  FileText,
  MessageSquare,
  ArrowRight,
  ArrowLeft
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { fetchExhibitionBySlug, submitExhibitionApplication } from "@/lib/services/exhibitions-client"
import type { Exhibition } from "@/lib/domains/exhibition/types"
import { MarketplaceShell, Breadcrumbs, MessageState } from "@/components/marketplace/shell"
import { directoryT } from "@/lib/directory-i18n"

// Localized translation dictionaries to prevent any global pollution
const formTranslations = {
  en: {
    pageTitle: "Apply to Exhibit",
    subtitle: "Submit your business details to participate in this virtual trade show.",
    compName: "Company Name",
    compNamePlaceholder: "e.g. Medina Olive Co.",
    contactPerson: "Contact Person",
    contactPersonPlaceholder: "e.g. Mohamed Ben Ali",
    email: "Email Address",
    emailPlaceholder: "e.g. export@company.com",
    phone: "Phone Number",
    phonePlaceholder: "55123456",
    country: "Country",
    businessCategory: "Business Category",
    shortDesc: "Short Description",
    shortDescPlaceholder: "Briefly describe your company's core products, innovations or exhibits...",
    message: "Message to Organizer (Optional)",
    messagePlaceholder: "Ask questions or describe your specific setup needs...",
    confirmCheckbox: "I confirm that all information is correct.",
    submitBtn: "Submit Application",
    cancelBtn: "Cancel",
    submitting: "Submitting Application...",
    requiredField: "This field is required",
    invalidEmail: "Please enter a valid email address",
    invalidPhone: "Please enter a valid Tunisian phone number (8 digits)",
    descTooLong: "Short description is too long (max 500 characters)",
    duplicateError: "You have already submitted an application for this exhibition.",
    errorSubmitting: "Failed to submit application. Please try again.",
    successTitle: "Application Submitted",
    successPendingStatus: "Status: Pending",
    successMsg: "Thank you for applying! The exhibition organizer will review your business details and contact you. Once approved, you will be able to set up and manage your virtual booth.",
    viewStatusBtn: "View Application Status",
    charCount: "characters remaining",
    selectCategory: "Select a Category",
  },
  fr: {
    pageTitle: "Demande de stand",
    subtitle: "Soumettez les détails de votre entreprise pour participer à ce salon virtuel.",
    compName: "Nom de l'entreprise",
    compNamePlaceholder: "ex. Medina Olive Co.",
    contactPerson: "Personne de contact",
    contactPersonPlaceholder: "ex. Mohamed Ben Ali",
    email: "Adresse e-mail",
    emailPlaceholder: "ex. export@entreprise.com",
    phone: "Numéro de téléphone",
    phonePlaceholder: "55123456",
    country: "Pays",
    businessCategory: "Secteur d'activité",
    shortDesc: "Brève description",
    shortDescPlaceholder: "Décrivez brièvement les produits phares, innovations ou pièces exposées...",
    message: "Message à l'organisateur (Optionnel)",
    messagePlaceholder: "Posez des questions ou décrivez vos besoins d'installation...",
    confirmCheckbox: "Je confirme que toutes les informations sont correctes.",
    submitBtn: "Soumettre la demande",
    cancelBtn: "Annuler",
    submitting: "Envoi en cours...",
    requiredField: "Ce champ est requis",
    invalidEmail: "Veuillez entrer une adresse e-mail valide",
    invalidPhone: "Veuillez entrer un numéro de téléphone tunisien valide (8 chiffres)",
    descTooLong: "La description est trop longue (max 500 caractères)",
    duplicateError: "Vous avez déjà soumis une demande pour cette exposition.",
    errorSubmitting: "Échec de l'envoi de la demande. Veuillez réessayer.",
    successTitle: "Demande soumise avec succès",
    successPendingStatus: "Statut : En attente",
    successMsg: "Merci pour votre candidature ! L'organisateur de l'exposition examinera vos coordonnées et vous contactera. Une fois approuvé, vous pourrez configurer et gérer votre stand virtuel.",
    viewStatusBtn: "Voir le statut de la demande",
    charCount: "caractères restants",
    selectCategory: "Sélectionnez une catégorie",
  },
  ar: {
    pageTitle: "طلب المشاركة كعارض",
    subtitle: "قدّم تفاصيل شركتك للمشاركة في هذا المعرض التجاري الافتراضي.",
    compName: "اسم الشركة",
    compNamePlaceholder: "مثال: شركة مدينة للزيتون",
    contactPerson: "الشخص المسؤول",
    contactPersonPlaceholder: "مثال: محمد بن علي",
    email: "البريد الإلكتروني",
    emailPlaceholder: "مثال: export@company.com",
    phone: "رقم الهاتف",
    phonePlaceholder: "55123456",
    country: "البلد",
    businessCategory: "فئة العمل / القطاع",
    shortDesc: "وصف قصير عن الشركة",
    shortDescPlaceholder: "صف بإيجاز منتجات شركتك الأساسية أو ابتكاراتك أو معروضاتك...",
    message: "رسالة إلى المنظم (اختياري)",
    messagePlaceholder: "اطرح أسئلة أو صف احتياجات الإعداد الخاصة بك...",
    confirmCheckbox: "أؤكد أن جميع المعلومات المقدمة صحيحة.",
    submitBtn: "تقديم الطلب",
    cancelBtn: "إلغاء",
    submitting: "جاري تقديم الطلب...",
    requiredField: "هذا الحقل مطلوب",
    invalidEmail: "يرجى إدخال بريد إلكتروني صحيح",
    invalidPhone: "يرجى إدخال رقم هاتف تونسي صحيح (8 أرقام)",
    descTooLong: "الوصف قصير طويل جداً (الحد الأقصى 500 حرف)",
    duplicateError: "لقد قمت بتقديم طلب بالفعل لهذا المعرض.",
    errorSubmitting: "فشل تقديم الطلب. يرجى المحاولة مرة أخرى.",
    successTitle: "تم تقديم الطلب بنجاح",
    successPendingStatus: "الحالة: قيد الانتظار",
    successMsg: "شكراً لتقديم طلبك! سيقوم منظم المعرض بمراجعة تفاصيل شركتك والاتصال بك. بمجرد الموافقة، ستتمكن من إعداد وإدارة جناحك الافتراضي بنجاح.",
    viewStatusBtn: "عرض حالة الطلب",
    charCount: "حروف متبقية",
    selectCategory: "اختر الفئة",
  }
}

const categoriesMap = {
  en: [
    "Food & Agriculture",
    "Agri-Food Tech",
    "Textiles & Apparel",
    "Industrial Machinery",
    "Construction & Building",
    "Handicrafts & Ceramics",
    "Cosmetics & Health",
    "Leather & Footwear",
    "Chemicals & Plastics"
  ],
  fr: [
    "Alimentation & Agriculture",
    "Agroalimentaire Tech",
    "Textiles & Habillement",
    "Machines Industrielles",
    "Construction & Bâtiment",
    "Artisanat & Céramique",
    "Cosmétiques & Santé",
    "Cuir & Chaussures",
    "Chimie & Plastiques"
  ],
  ar: [
    "الأغذية والزراعة",
    "تكنولوجيا الأغذية والزراعة",
    "المنسوجات والملابس",
    "الآلات الصناعية",
    "البناء والتشييد",
    "الحرف والخزف",
    "مستحضرات التجميل والصحة",
    "الجلود والأحذية",
    "الكيماويات والبلاستيك"
  ]
}

export default function ExhibitionApplyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return (
    <MarketplaceShell>
      <ExhibitionApplyContent slug={slug} />
    </MarketplaceShell>
  )
}

function ExhibitionApplyContent({ slug }: { slug: string }) {
  const { t, lang, dir } = useLanguage()
  const router = useRouter()
  const exT = t.exhibitions
  const dirT = directoryT[lang] || directoryT.en
  const fT = formTranslations[lang] || formTranslations.en
  const industries = categoriesMap[lang] || categoriesMap.en

  // Data states
  const [exhibition, setExhibition] = useState<Exhibition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Form states
  const [companyName, setCompanyName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [country, setCountry] = useState("TN")
  const [businessCategory, setBusinessCategory] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [message, setMessage] = useState("")
  const [confirmed, setConfirmed] = useState(false)

  // Status/submission states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    let active = true

    fetchExhibitionBySlug(slug)
      .then((res) => {
        if (!active) return
        if (res.error || !res.data) {
          setError(true)
          setLoading(false)
          return
        }
        setExhibition(res.data)
        setLoading(false)
      })
      .catch(() => {
        if (active) {
          setError(true)
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!exhibition) return

    setIsSubmitting(true)
    setSubmissionError(null)
    setValidationErrors({})

    const errors: Record<string, string> = {}

    // Required fields check
    if (!companyName.trim()) errors.companyName = fT.requiredField
    if (!contactPerson.trim()) errors.contactPerson = fT.requiredField
    if (!email.trim()) {
      errors.email = fT.requiredField
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = fT.invalidEmail
    }

    if (!phone.trim()) {
      errors.phone = fT.requiredField
    } else if (phone.trim().length !== 8 || !/^\d{8}$/.test(phone.trim())) {
      errors.phone = fT.invalidPhone
    }

    if (!country.trim()) errors.country = fT.requiredField
    if (!businessCategory.trim()) errors.businessCategory = fT.requiredField

    if (!shortDescription.trim()) {
      errors.shortDescription = fT.requiredField
    } else if (shortDescription.trim().length > 500) {
      errors.shortDescription = fT.descTooLong
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setIsSubmitting(false)
      return
    }

    try {
      const res = await submitExhibitionApplication({
        exhibitionId: exhibition.id,
        companyId: null, // Isolated from auth
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        country: country.trim(),
        businessCategory: businessCategory.trim(),
        shortDescription: shortDescription.trim(),
        message: message.trim() || null,
      })

      if (res.error) {
        // Resolve duplicate state vs normal failure
        setIsSubmitting(false)
        setSubmissionError(fT.duplicateError)
        return
      }

      if (res.data) {
        setSubmissionSuccess(res.data.id)
      } else {
        setSubmissionError(fT.errorSubmitting)
      }
    } catch (err) {
      console.error("[exhibitions-apply] Error submitting application:", err)
      setSubmissionError(fT.errorSubmitting)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Premium, beautiful loading skeleton screen
  if (loading) {
    return (
      <div className="pb-16 max-w-[480px] mx-auto px-4 pt-6" dir={dir}>
        <div className="h-4 w-32 bg-secondary/40 rounded-sm mb-6 animate-pulse" />
        <div className="border border-border p-6 rounded-[20px] bg-card space-y-6 animate-pulse">
          <div className="space-y-2 text-center pb-6 border-b border-border/40">
            <div className="h-5 w-24 bg-primary/10 border border-primary/25 rounded-full mx-auto" />
            <div className="h-8 w-2/3 bg-secondary/35 rounded-xl mx-auto" />
            <div className="h-4 w-3/4 bg-secondary/25 rounded-md mx-auto" />
          </div>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="space-y-2">
              <div className="h-3 w-16 bg-secondary/35 rounded-xs" />
              <div className="h-11 w-full bg-secondary/25 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !exhibition) {
    return (
      <MessageState
        icon={<Building2 className="size-7 text-muted-foreground" />}
        title={t.marketplace.error}
        description={exT.boothNotFoundDesc}
        action={
          <Link href="/exhibitions" className="rounded-[20px] bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition-all">
            {exT.backToExhibitionsList}
          </Link>
        }
      />
    )
  }

  const startStr = new Date(exhibition.startDate).toLocaleDateString(
    lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : "ar-TN",
    { year: "numeric", month: "long", day: "numeric" }
  )
  const endStr = new Date(exhibition.endDate).toLocaleDateString(
    lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : "ar-TN",
    { year: "numeric", month: "long", day: "numeric" }
  )
  const cityLoc = dirT.cities[exhibition.city] || exhibition.city
  const isTunisia = exhibition.country === "TN"

  // 1. SUCCESS VIEW IN-PAGE
  if (submissionSuccess) {
    return (
      <div className="pb-16 max-w-[480px] mx-auto px-4 pt-6" dir={dir}>
        <Breadcrumbs
          items={[
            { label: t.marketplace.breadcrumbHome, href: "/" },
            { label: exT.title, href: "/exhibitions" },
            { label: exhibition.name, href: `/exhibitions/${slug}` },
            { label: fT.pageTitle },
          ]}
        />

        <div className="mt-6 border border-emerald-500/30 rounded-[20px] bg-card p-6 text-center shadow-lg shadow-emerald-500/5 transition-all animate-in fade-in zoom-in-95 duration-300">
          <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto mb-5 shadow-xs">
            <CheckCircle className="size-9" />
          </div>

          <h2 className="text-xl font-black text-foreground mb-1 leading-tight">
            {fT.successTitle}
          </h2>

          <span className="inline-block rounded-full bg-emerald-500/15 border border-emerald-500/20 px-3 py-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-6">
            {fT.successPendingStatus}
          </span>

          <p className="text-xs font-semibold leading-relaxed text-muted-foreground mb-8 max-w-sm mx-auto">
            {fT.successMsg}
          </p>

          <Link
            href={`/exhibitions/application/${submissionSuccess}`}
            className="w-full min-h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-xs font-black text-white transition-all active:scale-95 shadow-md shadow-primary/10"
          >
            <span>{fT.viewStatusBtn}</span>
            {dir === "rtl" ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
          </Link>
        </div>
      </div>
    )
  }

  // 2. MAIN APPLICATION FORM VIEW
  return (
    <div className="pb-16 max-w-[480px] mx-auto px-4 pt-6" dir={dir}>
      <Breadcrumbs
        items={[
          { label: t.marketplace.breadcrumbHome, href: "/" },
          { label: exT.title, href: "/exhibitions" },
          { label: exhibition.name, href: `/exhibitions/${slug}` },
          { label: fT.pageTitle },
        ]}
      />

      <div className="mt-6 border border-border bg-card rounded-[20px] overflow-hidden shadow-xs">
        {/* Exhibition Mini Hero Header inside application form */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 p-6 text-white relative">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />

          <div className="relative space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-2.5 py-0.5 text-[9px] font-black tracking-wide uppercase">
              <Trophy className="size-3" />
              <span>{fT.pageTitle}</span>
            </span>

            <h2 className="text-lg font-black leading-tight truncate">
              {exhibition.name}
            </h2>

            <div className="grid grid-cols-2 gap-3 text-[11px] font-bold text-white/80 border-t border-white/10 pt-3">
              <div className="flex items-center gap-1.5 min-w-0">
                <Calendar className="size-3.5 text-primary-foreground shrink-0" />
                <span className="truncate">{startStr}</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="size-3.5 text-primary-foreground shrink-0" />
                <span className="truncate capitalize">{cityLoc}, {isTunisia ? "Tunisia" : exhibition.country}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="pb-2">
            <h3 className="text-sm font-black text-foreground">
              {fT.pageTitle}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {fT.subtitle}
            </p>
          </div>

          {/* Error Feedbacks */}
          {submissionError && (
            <div className="flex items-start gap-2.5 rounded-xl bg-destructive/10 p-4 text-xs font-semibold text-destructive animate-in fade-in duration-200">
              <AlertCircle className="size-4.5 shrink-0 mt-0.5" />
              <span>{submissionError}</span>
            </div>
          )}

          {/* Company Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-foreground flex items-center gap-1">
              <Building className="size-3.5 text-primary" />
              <span>{fT.compName}</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={fT.compNamePlaceholder}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                maxLength={255}
                className={`w-full rounded-xl border bg-card py-3.5 px-4 text-xs font-bold transition-all outline-none focus:ring-2 focus:ring-primary/10 ${
                  validationErrors.companyName
                    ? "border-destructive focus:border-destructive"
                    : "border-border focus:border-primary"
                }`}
              />
            </div>
            {validationErrors.companyName && (
              <p className="text-[10px] text-destructive font-bold mt-1">
                {validationErrors.companyName}
              </p>
            )}
          </div>

          {/* Contact Person */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-foreground flex items-center gap-1">
              <User className="size-3.5 text-primary" />
              <span>{fT.contactPerson}</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={fT.contactPersonPlaceholder}
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                maxLength={255}
                className={`w-full rounded-xl border bg-card py-3.5 px-4 text-xs font-bold transition-all outline-none focus:ring-2 focus:ring-primary/10 ${
                  validationErrors.contactPerson
                    ? "border-destructive focus:border-destructive"
                    : "border-border focus:border-primary"
                }`}
              />
            </div>
            {validationErrors.contactPerson && (
              <p className="text-[10px] text-destructive font-bold mt-1">
                {validationErrors.contactPerson}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-foreground flex items-center gap-1">
              <Mail className="size-3.5 text-primary" />
              <span>{fT.email}</span>
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder={fT.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-xl border bg-card py-3.5 px-4 text-xs font-bold transition-all outline-none focus:ring-2 focus:ring-primary/10 ${
                  validationErrors.email
                    ? "border-destructive focus:border-destructive"
                    : "border-border focus:border-primary"
                }`}
              />
            </div>
            {validationErrors.email && (
              <p className="text-[10px] text-destructive font-bold mt-1">
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-foreground flex items-center gap-1">
              <Phone className="size-3.5 text-primary" />
              <span>{fT.phone}</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute start-4 flex items-center gap-1 text-xs font-extrabold text-muted-foreground border-e pe-2.5 border-border h-5">
                <span className="text-sm">🇹🇳</span>
                <span>+216</span>
              </span>
              <input
                type="tel"
                maxLength={8}
                placeholder={fT.phonePlaceholder}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))}
                className={`w-full rounded-xl border bg-card py-3.5 pe-4 ps-[92px] text-xs font-extrabold tracking-wider transition-all outline-none focus:ring-2 focus:ring-primary/10 ${
                  validationErrors.phone
                    ? "border-destructive focus:border-destructive"
                    : "border-border focus:border-primary"
                }`}
              />
            </div>
            {validationErrors.phone && (
              <p className="text-[10px] text-destructive font-bold mt-1">
                {validationErrors.phone}
              </p>
            )}
          </div>

          {/* Country (readonly or dropdown, default Tunisia TN) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-foreground flex items-center gap-1">
              <Globe className="size-3.5 text-primary" />
              <span>{fT.country}</span>
            </label>
            <div className="relative">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-card py-3.5 px-4 text-xs font-bold transition-all outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer pr-10"
              >
                <option value="TN">{lang === "ar" ? "تونس 🇹🇳" : lang === "fr" ? "Tunisie 🇹🇳" : "Tunisia 🇹🇳"}</option>
                <option value="LY">{lang === "ar" ? "ليبيا 🇱🇾" : lang === "fr" ? "Libye 🇱🇾" : "Libya 🇱🇾"}</option>
                <option value="DZ">{lang === "ar" ? "الجزائر 🇩🇿" : lang === "fr" ? "Algérie 🇩🇿" : "Algeria 🇩🇿"}</option>
              </select>
            </div>
          </div>

          {/* Business Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-foreground flex items-center gap-1">
              <Tag className="size-3.5 text-primary" />
              <span>{fT.businessCategory}</span>
            </label>
            <div className="relative">
              <select
                value={businessCategory}
                onChange={(e) => setBusinessCategory(e.target.value)}
                className={`w-full appearance-none rounded-xl border bg-card py-3.5 px-4 text-xs font-bold transition-all outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer ${
                  validationErrors.businessCategory
                    ? "border-destructive focus:border-destructive"
                    : "border-border focus:border-primary"
                }`}
              >
                <option value="">-- {fT.selectCategory} --</option>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>
            {validationErrors.businessCategory && (
              <p className="text-[10px] text-destructive font-bold mt-1">
                {validationErrors.businessCategory}
              </p>
            )}
          </div>

          {/* Short Description */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-black text-foreground">
              <label className="flex items-center gap-1">
                <FileText className="size-3.5 text-primary" />
                <span>{fT.shortDesc}</span>
              </label>
              <span className="text-[10px] font-semibold text-muted-foreground/80">
                {500 - shortDescription.length} {fT.charCount}
              </span>
            </div>
            <div className="relative">
              <textarea
                placeholder={fT.shortDescPlaceholder}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value.slice(0, 500))}
                rows={3}
                className={`w-full rounded-xl border bg-card py-3 px-4 text-xs font-bold transition-all outline-none focus:ring-2 focus:ring-primary/10 resize-none ${
                  validationErrors.shortDescription
                    ? "border-destructive focus:border-destructive"
                    : "border-border focus:border-primary"
                }`}
              />
            </div>
            {validationErrors.shortDescription && (
              <p className="text-[10px] text-destructive font-bold mt-1">
                {validationErrors.shortDescription}
              </p>
            )}
          </div>

          {/* Message to Organizer */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-foreground flex items-center gap-1">
              <MessageSquare className="size-3.5 text-primary" />
              <span>{fT.message}</span>
            </label>
            <div className="relative">
              <textarea
                placeholder={fT.messagePlaceholder}
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
                rows={3}
                className="w-full rounded-xl border border-border bg-card py-3 px-4 text-xs font-bold transition-all outline-none focus:ring-2 focus:ring-primary/10 resize-none"
              />
            </div>
          </div>

          {/* Checkbox confirmation */}
          <div className="flex items-start gap-2.5 pt-2">
            <input
              type="checkbox"
              id="confirm"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="size-4.5 rounded-sm border-border bg-card text-primary focus:ring-primary/10 mt-0.5 cursor-pointer"
            />
            <label htmlFor="confirm" className="text-xs font-bold text-muted-foreground select-none leading-tight cursor-pointer">
              {fT.confirmCheckbox}
            </label>
          </div>

          {/* Buttons: Submit & Cancel */}
          <div className="flex flex-col gap-2.5 pt-4 border-t border-border/40">
            <button
              type="submit"
              disabled={isSubmitting || !confirmed}
              className="w-full min-h-12 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-xs font-black text-white transition-all active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-primary/10"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4.5 animate-spin" />
                  <span>{fT.submitting}</span>
                </>
              ) : (
                <span>{fT.submitBtn}</span>
              )}
            </button>

            <Link
              href={`/exhibitions/${slug}`}
              className="w-full min-h-12 flex items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-secondary/20 text-xs font-black text-foreground transition-all active:scale-98 cursor-pointer"
            >
              {fT.cancelBtn}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
