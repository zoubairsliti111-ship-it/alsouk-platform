"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  BadgeCheck,
  Building2,
  ExternalLink,
  Layers,
  MapPin,
  Package,
  Store,
  Globe,
  Calendar,
  Mail,
  Phone,
  Share2,
  AlertTriangle,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  Send,
  MessageSquare,
  Loader2,
  Sparkles,
  Shield,
  FileCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { fetchCompanyBySlug } from "@/lib/services/companies-client"
import { fetchProducts } from "@/lib/services/products-client"
import { fetchFeedPosts } from "@/lib/services/posts-service"
import type { CompanyDetails, CompanyMedia } from "@/lib/domains/company/types"
import type { CommercialPost } from "@/lib/domains/post/types"
import type { ProductSummary } from "@/lib/domains/product/types"
import { Breadcrumbs, MessageState } from "@/components/marketplace/shell"
import { ProductCard } from "@/components/marketplace/product-card"
import { createClient } from "@/lib/supabase/client"
import { directoryT } from "@/lib/directory-i18n"
import {
  EMPTY_RFQ,
  submitRfq,
  validateRfq,
  type RfqField,
  type RfqInput,
} from "@/lib/supabase/rfq-service"

type Status = "loading" | "loaded" | "notFound" | "error"

const LOCAL_I18N = {
  en: {
    sendRfq: "Send RFQ",
    messageCompany: "Message Company",
    share: "Share",
    report: "Report Company",
    reportSuccess: "Thank you! Company reported successfully.",
    reportTitle: "Report this business profile",
    reportDesc: "Let us know if this supplier violates policies or displays incorrect details.",
    submitting: "Submitting...",
    submitReport: "Submit Report",
    cancel: "Cancel",
    profileCompletion: "Profile Completion Score (Owner view)",
    aboutCompany: "About the Company",
    businessDetails: "Business Details",
    established: "Year Established",
    classification: "Business Classification",
    exportMarkets: "Export Markets",
    languages: "Supported Languages",
    gallery: "Company Gallery & Factory Photos",
    certificates: "Certificates & Quality Standard licenses",
    website: "Visit website",
    copyLinkSuccess: "Link copied to clipboard!",
    rfqTitle: "Request a custom quote from",
    rfqDesc: "Directly message this verified supplier to negotiate terms, pricing, and shipping.",
    rfqSuccess: "RFQ submitted successfully!",
    rfqSuccessDesc: "The supplier will review your proposal and reply shortly.",
    noGallery: "No gallery photos uploaded yet.",
    noCertificates: "No certificate documents attached.",
    contactDetails: "Contact details",
    whatsappChat: "Chat on WhatsApp",
    emailUs: "Send Email",
    websiteModeLabel: "Website Mode",
    storeLink: "Visit Company Storefront",
    externalLink: "Visit External Website"
  },
  fr: {
    sendRfq: "Envoyer un devis",
    messageCompany: "Contacter l'entreprise",
    share: "Partager",
    report: "Signaler l'entreprise",
    reportSuccess: "Merci ! L'entreprise a été signalée avec succès.",
    reportTitle: "Signaler ce profil d'entreprise",
    reportDesc: "Indiquez-nous si ce fournisseur ne respecte pas les règles ou affiche des informations incorrectes.",
    submitting: "Soumission...",
    submitReport: "Soumettre",
    cancel: "Annuler",
    profileCompletion: "Score de complétude (Vue Propriétaire)",
    aboutCompany: "À propos de l'entreprise",
    businessDetails: "Détails de l'entreprise",
    established: "Année d'établissement",
    classification: "Classification d'entreprise",
    exportMarkets: "Marchés d'exportation",
    languages: "Langues supportées",
    gallery: "Galerie & Photos de l'usine",
    certificates: "Certificats & Normes de qualité",
    website: "Visiter le site Web",
    copyLinkSuccess: "Lien copié dans le presse-papiers !",
    rfqTitle: "Demander un devis personnalisé à",
    rfqDesc: "Envoyez un message direct à ce fournisseur vérifié pour négocier les conditions et les prix.",
    rfqSuccess: "Demande de devis soumise avec succès !",
    rfqSuccessDesc: "Le fournisseur examinera votre proposition et vous répondra sous peu.",
    noGallery: "Aucune photo de galerie téléchargée pour l'instant.",
    noCertificates: "Aucun document de certificat joint.",
    contactDetails: "Détails de contact",
    whatsappChat: "Discuter sur WhatsApp",
    emailUs: "Envoyer un email",
    websiteModeLabel: "Mode du site Web",
    storeLink: "Visiter la boutique ALSOUK",
    externalLink: "Visiter le site externe"
  },
  ar: {
    sendRfq: "أرسل طلب عرض سعر",
    messageCompany: "مراسلة الشركة",
    share: "مشاركة",
    report: "الإبلاغ عن الشركة",
    reportSuccess: "شكراً لك! تم تقديم البلاغ بنجاح.",
    reportTitle: "الإبلاغ عن الملف التجاري",
    reportDesc: "أخبرنا إذا كان هذا المورد ينتهك السياسات أو يعرض معلومات غير صحيحة.",
    submitting: "جاري الإرسال...",
    submitReport: "إرسال البلاغ",
    cancel: "إلغاء",
    profileCompletion: "مدى اكتمال الملف الشخصي (خاص بالمالك)",
    aboutCompany: "حول الشركة",
    businessDetails: "تفاصيل العمل التجاري",
    established: "سنة التأسيس",
    classification: "تصنيف العمل التجاري",
    exportMarkets: "الأسواق التصديرية المستهدفة",
    languages: "اللغات المدعومة",
    gallery: "معرض صور الشركة والمصنع",
    certificates: "الشهادات وتراخيص الجودة",
    website: "زيارة الموقع الإلكتروني",
    copyLinkSuccess: "تم نسخ الرابط إلى الحافظة!",
    rfqTitle: "طلب عرض سعر مخصص من",
    rfqDesc: "راسل هذا المورد الموثق مباشرة للتفاوض على الأسعار والكميات والشحن.",
    rfqSuccess: "تم إرسال طلب عرض السعر بنجاح!",
    rfqSuccessDesc: "سيقوم المورد بمراجعة طلبك والرد عليك قريباً.",
    noGallery: "لم يتم تحميل صور المعرض بعد.",
    noCertificates: "لا توجد شهادات مرفقة.",
    contactDetails: "معلومات الاتصال",
    whatsappChat: "دردشة عبر واتساب",
    emailUs: "إرسال بريد إلكتروني",
    websiteModeLabel: "استراتيجية الموقع",
    storeLink: "زيارة متجر ALSOUK",
    externalLink: "زيارة الموقع الخارجي"
  }
}

const BUSINESS_TYPE_LABELS: Record<string, Record<string, string>> = {
  en: { manufacturer: "Manufacturer", supplier: "Supplier", exporter: "Exporter", wholesaler: "Wholesaler", distributor: "Distributor", service_provider: "Service Provider" },
  fr: { manufacturer: "Fabricant", supplier: "Fournisseur", exporter: "Exportateur", wholesaler: "Grossiste", distributor: "Distributeur", service_provider: "Prestataire de services" },
  ar: { manufacturer: "مصنع", supplier: "مورد", exporter: "مصدّر", wholesaler: "تاجر جملة", distributor: "موزع", service_provider: "مزود خدمات" }
}

const INDUSTRY_LABELS: Record<string, Record<string, string>> = {
  en: { food: "Food & Beverage", textiles: "Textiles & Apparel", machinery: "Machinery & Equipment", construction: "Construction & Real Estate", handicrafts: "Handicrafts & Art", cosmetics: "Cosmetics & Personal Care", leather: "Leather Goods", chemicals: "Chemicals", agriculture: "Agriculture" },
  fr: { food: "Alimentation", textiles: "Textile & Habillement", machinery: "Machines & Équipements", construction: "Construction & Immobilier", handicrafts: "Artisanat", cosmetics: "Cosmétiques & Soins", leather: "Maroquinerie", chemicals: "Produits Chimiques", agriculture: "Agriculture" },
  ar: { food: "الأغذية والمشروبات", textiles: "المنسوجات والملابس", machinery: "الآلات والمعدات", construction: "البناء والعقارات", handicrafts: "الصناعات التقليدية", cosmetics: "مستحضرات التجميل", leather: "المنتجات الجلدية", chemicals: "المواد الكيميائية", agriculture: "الفلاحة والزراعة" }
}

const LANG_OPTS: Record<string, string> = { ar: "العربية", fr: "Français", en: "English" }
const MARKET_OPTS: Record<string, string> = { tn: "Tunisia 🇹🇳", ly: "Libya 🇱🇾", dz: "Algeria 🇩🇿", eu: "Europe 🇪🇺", gcc: "GCC 🇸🇦", af: "Africa 🌍" }

export function CompanyDetailsView({ slug }: { slug: string }) {
  const { t, lang, dir } = useLanguage()
  const m = t.marketplace.companies
  const dict = LOCAL_I18N[lang] || LOCAL_I18N.en
  const dirT = directoryT[lang] || directoryT.en

  const [state, setState] = useState<{
    slug: string
    status: Status
    company: CompanyDetails | null
    products: ProductSummary[]
  }>({ slug, status: "loading", company: null, products: [] })

  // Owner status check
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isOwner, setIsOwner] = useState(false)

  // Interaction Dialog States
  const [showRfqModal, setShowRfqModal] = useState(false)
  const [rfqValues, setRfqValues] = useState<RfqInput>(EMPTY_RFQ)
  const [rfqErrors, setRfqErrors] = useState<Partial<Record<RfqField, "required" | "email" | "phone" | "message">>>({})
  const [rfqSubmitting, setRfqSubmitting] = useState(false)
  const [rfqStatus, setRfqStatus] = useState<"form" | "success" | "error">("form")

  const [showContactModal, setShowContactModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(false)

  const [copied, setCopied] = useState(false)
  const [companyPosts, setCompanyPosts] = useState<CommercialPost[]>([])

  useEffect(() => {
    let active = true
    fetchCompanyBySlug(slug).then((res) => {
      if (!active) return
      if (res.error) return setState({ slug, status: "error", company: null, products: [] })
      if (res.notFound || !res.data) return setState({ slug, status: "notFound", company: null, products: [] })
      const company = res.data
      setState({ slug, status: "loaded", company, products: [] })

      // Fetch products
      fetchProducts({ companyId: company.id, limit: 12 }).then((items) => {
        if (!active) return
        setState((prev) => (prev.slug === slug ? { ...prev, products: items } : prev))
      })

      // Fetch company commercial posts
      fetchFeedPosts(10, 0, company.id).then((postsRes) => {
        if (active && postsRes.success && postsRes.data) {
          setCompanyPosts(postsRes.data)
        }
      })

      // Fetch user session and verify if company owner
      const supabase = createClient()
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!active) return
        if (session?.user) {
          setCurrentUser(session.user)
          supabase
            .from("company_members")
            .select("role")
            .eq("company_id", company.id)
            .eq("user_id", session.user.id)
            .maybeSingle()
            .then(({ data }) => {
              if (data) {
                setIsOwner(true)
              }
            })
        }
      })
    })
    return () => {
      active = false
    }
  }, [slug])

  const status: Status = state.slug === slug ? state.status : "loading"
  const company = state.slug === slug ? state.company : null
  const products = state.slug === slug ? state.products : []

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="h-64 animate-pulse rounded-[20px] bg-muted" />
        <div className="mt-8 h-10 animate-pulse rounded-full max-w-sm bg-muted" />
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-[20px] bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (status !== "loaded" || !company) {
    const isError = status === "error"
    return (
      <MessageState
        icon={<Building2 className="size-7" />}
        title={isError ? t.marketplace.error : m.notFound}
        description={isError ? t.marketplace.errorDesc : m.notFoundDesc}
        action={<Button render={<Link href="/companies" />} className="rounded-xl">{m.back}</Button>}
      />
    )
  }

  const location = [company.city ? (dirT.cities[company.city] || company.city) : null, company.country ? (dirT.countries[company.country as keyof typeof dirT.countries] || company.country) : null].filter(Boolean).join(", ")

  // Sharing function
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  // Report function
  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportReason.trim()) return
    setReportSubmitting(true)
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 1200))
    setReportSubmitting(false)
    setReportSuccess(true)
    setTimeout(() => {
      setShowReportModal(false)
      setReportSuccess(false)
      setReportReason("")
    }, 2000)
  }

  // RFQ direct submit
  const handleRfqSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const found = validateRfq(rfqValues)
    if (Object.keys(found).length > 0) {
      setRfqErrors(found)
      return
    }
    setRfqSubmitting(true)
    const res = await submitRfq(company.id, rfqValues)
    setRfqSubmitting(false)
    if (res.ok) {
      setRfqStatus("success")
    } else {
      setRfqStatus("error")
    }
  }

  const rfqErrText = (field: RfqField) => {
    const rfqDict = directoryT[lang].rfq
    const errType = rfqErrors[field]
    if (!errType) return null
    if (errType === "required") return rfqDict.errRequired
    if (errType === "email") return rfqDict.errEmail
    if (errType === "phone") return rfqDict.errPhone
    return rfqDict.errMessage
  }

  return (
    <div className="pb-16" dir={dir}>
      <Breadcrumbs
        items={[
          { label: t.marketplace.breadcrumbHome, href: "/" },
          { label: m.title, href: "/companies" },
          { label: company.name },
        ]}
      />

      {/* Hero Header Area: Cover Image + Logo Overlay */}
      <section className="relative bg-card border-b border-border">
        {/* Cover Image banner */}
        <div className="h-44 w-full overflow-hidden bg-gradient-to-r from-blue-950 via-[#1E3A8A] to-slate-900 sm:h-64 relative">
          {company.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.bannerUrl} alt={company.name} className="size-full object-cover" />
          ) : (
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          )}
          {/* Subtle logo/emblem inside cover */}
          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1">
            <Shield className="size-3 text-emerald-400" />
            <span className="uppercase">{company.verificationTier}</span>
          </div>
        </div>

        {/* Brand identity area */}
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-16 relative">
          {/* Overlapping logo container */}
          <div className="absolute -top-16 start-6 size-24 sm:size-28 rounded-3xl border-4 border-card bg-white shadow-xl flex items-center justify-center overflow-hidden shrink-0">
            {company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logoUrl} alt={company.name} className="size-full object-contain p-2" />
            ) : (
              <div className="size-full bg-gradient-to-tr from-primary to-blue-600 text-white font-black text-3xl flex items-center justify-center">
                {company.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  {company.name}
                </h1>
                {company.profileLevel === "enterprise" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 border border-purple-500/25 px-2.5 py-1 text-xs font-black text-purple-600 dark:text-purple-400 animate-pulse">
                    <Shield className="size-4 shrink-0 text-purple-500" />
                    <span>Gold Enterprise Factory</span>
                  </span>
                ) : company.profileLevel === "business" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/25 px-2.5 py-1 text-xs font-black text-blue-600 dark:text-blue-400">
                    <Sparkles className="size-4 shrink-0 text-blue-500" />
                    <span>Verified Business Partner</span>
                  </span>
                ) : (
                  company.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <BadgeCheck className="size-4 shrink-0 text-emerald-500" />
                      {m.verified}
                    </span>
                  )
                )}
              </div>

              {company.tagline && (
                <p className="mt-1 text-sm font-semibold text-muted-foreground">
                  {company.tagline}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-muted-foreground">
                {location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4 text-primary shrink-0" />
                    {location}
                  </span>
                )}
                {(company.profileLevel === "business" || company.profileLevel === "enterprise") && company.yearEstablished && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-4 text-primary shrink-0" />
                    {dict.established}: {company.yearEstablished}
                  </span>
                )}
                {(company.profileLevel === "business" || company.profileLevel === "enterprise") && company.websiteUrl && (
                  <a
                    href={company.websiteUrl.startsWith("http") ? company.websiteUrl : `https://${company.websiteUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <Globe className="size-4 shrink-0" />
                    {company.websiteUrl}
                  </a>
                )}
              </div>
            </div>

            {/* CTA action cluster */}
            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                onClick={() => setShowRfqModal(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-xs font-extrabold text-white py-3 px-5 transition-all shadow-md shadow-primary/10 hover:shadow-lg cursor-pointer active:scale-95"
              >
                <Send className="size-4" />
                <span>{dict.sendRfq}</span>
              </button>

              <button
                onClick={() => setShowContactModal(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-secondary/40 text-xs font-bold text-foreground py-3 px-5 transition-all cursor-pointer"
              >
                <MessageSquare className="size-4 text-muted-foreground" />
                <span>{dict.messageCompany}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-secondary/40 size-11 shrink-0 transition-all cursor-pointer relative"
                title={dict.share}
              >
                {copied ? (
                  <Check className="size-4 text-emerald-500 animate-scale-up" />
                ) : (
                  <Share2 className="size-4 text-muted-foreground" />
                )}
                {copied && (
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-20 font-bold">
                    {dict.copyLinkSuccess}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-secondary/40 size-11 shrink-0 transition-all cursor-pointer"
                title={dict.report}
              >
                <AlertTriangle className="size-4 text-destructive" />
              </button>
            </div>
          </div>

          {/* Owner Only: Profile completion panel */}
          {isOwner && (
            <div className="mt-6 p-4 rounded-2xl border border-dashed border-primary/30 bg-primary/5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5 text-primary">
                  <Sparkles className="size-4" />
                  {dict.profileCompletion}
                </span>
                <span className="text-primary font-black">{company.profileCompletion}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${company.profileCompletion}%` }}></div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main content grid */}
      <div className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left column: Overview details */}
        <div className="lg:col-span-2 space-y-8">

          {/* About section */}
          {company.description && (
            <section className="bg-card border border-border rounded-[20px] p-6 shadow-sm">
              <h2 className="text-base font-black text-foreground tracking-tight mb-4 flex items-center gap-2">
                <Building2 className="size-5 text-primary" />
                <span>{dict.aboutCompany}</span>
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {company.description}
              </p>
            </section>
          )}

          {/* Gallery Media */}
          {company.media && company.media.filter(m => m.mediaType !== "certificate").length > 0 ? (
            <section className="bg-card border border-border rounded-[20px] p-6 shadow-sm">
              <h2 className="text-base font-black text-foreground tracking-tight mb-4 flex items-center gap-2">
                <Layers className="size-5 text-primary" />
                <span>{company.profileLevel === "starter" ? "Showcase Gallery" : dict.gallery}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {company.media.filter(m => m.mediaType !== "certificate")
                  .slice(0, company.profileLevel === "starter" ? 4 : company.profileLevel === "business" ? 12 : undefined)
                  .map((med) => (
                    <div key={med.id} className="relative group rounded-xl overflow-hidden border border-border bg-secondary aspect-video">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={med.url} alt={med.caption || "Showcase photo"} className="size-full object-cover transition-all group-hover:scale-105" />
                      {med.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-xs p-2 text-[10px] text-white font-semibold truncate">
                          {med.caption}
                        </div>
                      )}
                    </div>
                ))}
              </div>
            </section>
          ) : (
            <section className="bg-card border border-border rounded-[20px] p-6 shadow-sm">
              <h2 className="text-base font-black text-foreground tracking-tight mb-4 flex items-center gap-2">
                <Layers className="size-5 text-primary" />
                <span>{dict.gallery}</span>
              </h2>
              <p className="text-xs text-muted-foreground italic">{dict.noGallery}</p>
            </section>
          )}

          {/* Catalog PDFs & Brochures (Business & Enterprise Only) */}
          {(company.profileLevel === "business" || company.profileLevel === "enterprise") && company.metadata?.catalog_url && (
            <section className="bg-card border border-primary/20 bg-primary/5 rounded-[20px] p-6 shadow-sm space-y-3">
              <h2 className="text-base font-black text-foreground tracking-tight flex items-center gap-2">
                <FileCheck className="size-5 text-primary" />
                <span>Official B2B Marketing Catalog</span>
              </h2>
              <p className="text-xs text-muted-foreground">Download our comprehensive, premium catalogue to view certified bulk offers, MOQ, and standard trade parameters.</p>
              <a
                href={company.metadata.catalog_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-primary text-white text-xs font-black py-2.5 px-4 shadow-sm hover:opacity-95"
              >
                <ExternalLink className="size-4" />
                <span>Download Catalogue PDF</span>
              </a>
            </section>
          )}

          {/* Certificates (Enterprise Only) */}
          {company.profileLevel === "enterprise" && (
            company.media && company.media.filter(m => m.mediaType === "certificate").length > 0 ? (
              <section className="bg-card border border-border rounded-[20px] p-6 shadow-sm">
                <h2 className="text-base font-black text-foreground tracking-tight mb-4 flex items-center gap-2">
                  <FileCheck className="size-5 text-primary" />
                  <span>{dict.certificates}</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {company.media.filter(m => m.mediaType === "certificate").map((cert) => (
                    <div key={cert.id} className="relative group rounded-xl overflow-hidden border border-border bg-secondary aspect-[3/4] p-3 flex flex-col justify-between items-center text-center">
                      <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                        <FileCheck className="size-6" />
                      </div>
                      <span className="text-xs font-bold text-foreground line-clamp-2 mb-1">{cert.caption || "Quality standard"}</span>
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-black text-primary hover:underline uppercase tracking-wider"
                      >
                        View doc
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <section className="bg-card border border-border rounded-[20px] p-6 shadow-sm">
                <h2 className="text-base font-black text-foreground tracking-tight mb-4 flex items-center gap-2">
                  <FileCheck className="size-5 text-primary" />
                  <span>{dict.certificates}</span>
                </h2>
                <p className="text-xs text-muted-foreground italic">{dict.noCertificates}</p>
              </section>
            )
          )}

          {/* Daily Updates Feed */}
          {companyPosts && companyPosts.length > 0 && (
            <section className="bg-card border border-border rounded-[20px] p-6 shadow-sm space-y-6">
              <h2 className="text-base font-black text-foreground tracking-tight flex items-center gap-2">
                <FileCheck className="size-5 text-primary" />
                <span>Daily Feed Updates</span>
              </h2>
              <div className="space-y-4">
                {companyPosts.map((post) => {
                  const hasImages = post.images && post.images.length > 0
                  const dateStr = new Date(post.createdAt).toLocaleDateString(
                    lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : "ar-TN",
                    { month: "short", day: "numeric" }
                  )
                  return (
                    <div key={post.id} className="p-4 rounded-xl border border-border/60 bg-secondary/20 space-y-3">
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold">
                        <span>Announced Update</span>
                        <span>{dateStr}</span>
                      </div>
                      <p className="text-xs font-semibold text-foreground leading-relaxed whitespace-pre-wrap break-words">{post.content}</p>
                      {hasImages && (
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                          {post.images.map((img, idx) => (
                            <div key={idx} className="relative size-20 rounded-xl overflow-hidden border border-border/50 shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img} alt="Post media" className="size-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Products Catalogue */}
          <section className="bg-card border border-border rounded-[20px] p-6 shadow-sm">
            <h2 className="text-base font-black text-foreground tracking-tight mb-6 flex items-center gap-2">
              <Package className="size-5 text-primary" />
              <span>{t.marketplace.products.title}</span>
            </h2>
            {products.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-secondary/30 px-4 py-8 text-center text-sm text-muted-foreground">
                {t.marketplace.products.empty}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Right column: Structured metadata */}
        <div className="space-y-8">

          {/* Structured Details Info Card */}
          {(company.profileLevel === "business" || company.profileLevel === "enterprise") && (
            <section className="bg-card border border-border rounded-[20px] p-6 shadow-sm space-y-4">
              <h2 className="text-base font-black text-foreground tracking-tight border-b border-border/60 pb-3 flex items-center gap-2">
                <Layers className="size-5 text-primary" />
                <span>{dict.businessDetails}</span>
              </h2>

              <div className="space-y-4 text-xs font-semibold">
                {company.businessType && (
                  <div className="flex justify-between items-center border-b border-border/50 pb-3">
                    <span className="text-muted-foreground">{dict.classification}</span>
                    <span className="text-foreground font-black capitalize">
                      {BUSINESS_TYPE_LABELS[lang]?.[company.businessType] || company.businessType.replace("_", " ")}
                    </span>
                  </div>
                )}

                {company.primaryIndustry && (
                  <div className="flex justify-between items-center border-b border-border/50 pb-3">
                    <span className="text-muted-foreground">Industry</span>
                    <span className="text-foreground font-black capitalize">
                      {INDUSTRY_LABELS[lang]?.[company.primaryIndustry] || company.primaryIndustry}
                    </span>
                  </div>
                )}

                {company.profileLevel === "enterprise" && company.companySize && (
                  <div className="flex justify-between items-center border-b border-border/50 pb-3">
                    <span className="text-muted-foreground">Company Size</span>
                    <span className="text-foreground font-black">{company.companySize} Employees</span>
                  </div>
                )}

                {company.websiteMode && (
                  <div className="flex justify-between items-center border-b border-border/50 pb-3">
                    <span className="text-muted-foreground">{dict.websiteModeLabel}</span>
                    <span className="text-foreground font-bold uppercase text-[10px] bg-secondary px-2 py-0.5 rounded-md border border-border">
                      {company.websiteMode}
                    </span>
                  </div>
                )}

                {company.profileLevel === "enterprise" && company.taxIdentifier && (
                  <div className="flex justify-between items-center border-b border-border/50 pb-3">
                    <span className="text-muted-foreground">MF / RNE Number</span>
                    <span className="text-foreground font-mono">{company.taxIdentifier}</span>
                  </div>
                )}

                {/* Stores & Websites links inside company */}
                {company.websiteMode !== "external" && company.stores && company.stores.length > 0 && (
                  <div className="pt-2">
                    <Link
                      href={`/stores/${company.stores[0].slug}`}
                      className="w-full flex items-center justify-between p-3.5 bg-primary/10 border border-primary/20 hover:bg-primary/15 rounded-xl text-primary font-bold transition-all text-xs"
                    >
                      <span className="flex items-center gap-2">
                        <Store className="size-4 shrink-0" />
                        <span>{dict.storeLink}</span>
                      </span>
                      <ChevronRight className="size-4 rtl:rotate-180" />
                    </Link>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Social Presence card */}
          {(company.profileLevel === "business" || company.profileLevel === "enterprise") && (company.facebookUrl || company.instagramUrl || company.tiktokUrl || company.linkedinUrl || company.youtubeUrl) && (
            <section className="bg-card border border-border rounded-[20px] p-6 shadow-sm space-y-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Digital Presence</h2>
              <div className="flex flex-wrap gap-2.5">
                {company.facebookUrl && (
                  <a href={company.facebookUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center size-10 rounded-xl border border-border bg-card text-blue-600 hover:bg-blue-500/5 hover:border-blue-500/25 transition-all">
                    <svg className="size-5 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                  </a>
                )}
                {company.instagramUrl && (
                  <a href={company.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center size-10 rounded-xl border border-border bg-card text-pink-600 hover:bg-pink-500/5 hover:border-pink-500/25 transition-all">
                    <svg className="size-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                )}
                {company.tiktokUrl && (
                  <a href={company.tiktokUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center size-10 rounded-xl border border-border bg-card text-slate-800 dark:text-slate-200 hover:bg-slate-500/5 hover:border-slate-500/25 transition-all">
                    <svg className="size-5 fill-current" viewBox="0 0 24 24"><path d="M12.53.02C13.84.04 15.14.39 16.28 1.04c.08-.66.27-1.31.56-1.92h2.23c-.38.89-.58 1.84-.58 2.81 0 3.79 3.08 6.88 6.88 6.88v2.24c-1.35 0-2.67-.4-3.79-1.15-.08.66-.27 1.3-.56 1.91h-2.23c.38-.89.58-1.84.58-2.81 0-3.15-2.12-5.81-5.01-6.62V24H10.3V0h2.23z"/></svg>
                  </a>
                )}
                {company.linkedinUrl && (
                  <a href={company.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center size-10 rounded-xl border border-border bg-card text-blue-700 hover:bg-blue-600/5 hover:border-blue-600/25 transition-all">
                    <svg className="size-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  </a>
                )}
                {company.youtubeUrl && (
                  <a href={company.youtubeUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center size-10 rounded-xl border border-border bg-card text-red-600 hover:bg-red-500/5 hover:border-red-500/25 transition-all">
                    <svg className="size-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Languages & Export tags */}
          {company.profileLevel === "enterprise" && (
            <section className="bg-card border border-border rounded-[20px] p-6 shadow-sm space-y-4">
              {company.exportMarkets && company.exportMarkets.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">{dict.exportMarkets}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {company.exportMarkets.map(m => (
                      <span key={m} className="bg-secondary border border-border px-2.5 py-1 rounded-lg text-xs font-bold text-foreground">
                        {MARKET_OPTS[m] || m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {company.supportedLanguages && company.supportedLanguages.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">{dict.languages}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {company.supportedLanguages.map(l => (
                      <span key={l} className="bg-secondary border border-border px-2.5 py-1 rounded-lg text-xs font-bold text-foreground">
                        {LANG_OPTS[l] || l}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

        </div>

      </div>

      {/* MODAL 1: Send RFQ Form Overlay */}
      {showRfqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                <Send className="size-5 text-primary" />
                <span>{dict.rfqTitle} {company.name}</span>
              </h3>
              <button onClick={() => setShowRfqModal(false)} className="size-8 rounded-xl border border-border hover:bg-secondary/40 flex items-center justify-center text-muted-foreground cursor-pointer">
                <X className="size-4" />
              </button>
            </div>

            {rfqStatus === "success" ? (
              <div className="text-center py-8 space-y-4">
                <div className="size-14 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 flex items-center justify-center mx-auto">
                  <Check className="size-6" />
                </div>
                <div>
                  <h4 className="text-base font-black text-foreground">{dict.rfqSuccess}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{dict.rfqSuccessDesc}</p>
                </div>
                <button
                  onClick={() => {
                    setRfqStatus("form")
                    setRfqValues(EMPTY_RFQ)
                    setShowRfqModal(false)
                  }}
                  className="rounded-xl border border-border px-5 py-2.5 hover:bg-secondary/40 text-xs font-bold text-foreground transition-all cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleRfqSubmit} className="space-y-4" noValidate>
                {rfqStatus === "error" && (
                  <p className="p-3 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-xs font-bold">
                    Submission failed. Please check values and try again.
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground">My Business Name *</label>
                    <input
                      type="text"
                      value={rfqValues.companyName}
                      onChange={(e) => setRfqValues({...rfqValues, companyName: e.target.value})}
                      className={inputClass(Boolean(rfqErrors.companyName))}
                    />
                    {rfqErrors.companyName && <span className="text-[10px] text-destructive block font-bold">{rfqErrText("companyName")}</span>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground">Contact Person Name *</label>
                    <input
                      type="text"
                      value={rfqValues.contactPerson}
                      onChange={(e) => setRfqValues({...rfqValues, contactPerson: e.target.value})}
                      className={inputClass(Boolean(rfqErrors.contactPerson))}
                    />
                    {rfqErrors.contactPerson && <span className="text-[10px] text-destructive block font-bold">{rfqErrText("contactPerson")}</span>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground">Email Address *</label>
                    <input
                      type="email"
                      value={rfqValues.email}
                      onChange={(e) => setRfqValues({...rfqValues, email: e.target.value})}
                      className={inputClass(Boolean(rfqErrors.email))}
                    />
                    {rfqErrors.email && <span className="text-[10px] text-destructive block font-bold">{rfqErrText("email")}</span>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground">Phone Number *</label>
                    <input
                      type="text"
                      value={rfqValues.phone}
                      onChange={(e) => setRfqValues({...rfqValues, phone: e.target.value})}
                      className={inputClass(Boolean(rfqErrors.phone))}
                    />
                    {rfqErrors.phone && <span className="text-[10px] text-destructive block font-bold">{rfqErrText("phone")}</span>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground">Country *</label>
                    <input
                      type="text"
                      value={rfqValues.country}
                      onChange={(e) => setRfqValues({...rfqValues, country: e.target.value})}
                      className={inputClass(Boolean(rfqErrors.country))}
                    />
                    {rfqErrors.country && <span className="text-[10px] text-destructive block font-bold">{rfqErrText("country")}</span>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground">Delivery Destination *</label>
                    <input
                      type="text"
                      value={rfqValues.deliveryDestination}
                      onChange={(e) => setRfqValues({...rfqValues, deliveryDestination: e.target.value})}
                      className={inputClass(Boolean(rfqErrors.deliveryDestination))}
                    />
                    {rfqErrors.deliveryDestination && <span className="text-[10px] text-destructive block font-bold">{rfqErrText("deliveryDestination")}</span>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground">Product Requested *</label>
                    <input
                      type="text"
                      value={rfqValues.productRequested}
                      onChange={(e) => setRfqValues({...rfqValues, productRequested: e.target.value})}
                      className={inputClass(Boolean(rfqErrors.productRequested))}
                    />
                    {rfqErrors.productRequested && <span className="text-[10px] text-destructive block font-bold">{rfqErrText("productRequested")}</span>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground">Quantity Required *</label>
                    <input
                      type="text"
                      value={rfqValues.quantity}
                      onChange={(e) => setRfqValues({...rfqValues, quantity: e.target.value})}
                      className={inputClass(Boolean(rfqErrors.quantity))}
                    />
                    {rfqErrors.quantity && <span className="text-[10px] text-destructive block font-bold">{rfqErrText("quantity")}</span>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Target Price (Optional)</label>
                  <input
                    type="text"
                    value={rfqValues.targetPrice}
                    onChange={(e) => setRfqValues({...rfqValues, targetPrice: e.target.value})}
                    placeholder="e.g. 5 TND / unit"
                    className={inputClass(false)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">RFQ Details Message *</label>
                  <textarea
                    value={rfqValues.message}
                    onChange={(e) => setRfqValues({...rfqValues, message: e.target.value})}
                    placeholder="Describe specific standard, certifications, or custom parameters required."
                    rows={4}
                    className={`${inputClass(Boolean(rfqErrors.message))} resize-none`}
                  />
                  {rfqErrors.message && <span className="text-[10px] text-destructive block font-bold">{rfqErrText("message")}</span>}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={rfqSubmitting}
                    className="flex-1 rounded-xl bg-gradient-to-r from-primary to-blue-600 py-3.5 text-xs font-black text-white hover:opacity-90 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {rfqSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>{dict.submitting}</span>
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        <span>Send RFQ Request</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRfqModal(false)}
                    className="rounded-xl border border-border px-5 py-3.5 hover:bg-secondary/40 text-xs font-bold text-foreground transition-all cursor-pointer"
                  >
                    {dict.cancel}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Message/Contact Overlay */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
              <h3 className="text-base font-black text-foreground">{dict.contactDetails}</h3>
              <button onClick={() => setShowContactModal(false)} className="size-8 rounded-xl border border-border hover:bg-secondary/40 flex items-center justify-center text-muted-foreground cursor-pointer">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4">
              {company.whatsappNumber && (
                <a
                  href={`https://wa.me/${company.whatsappNumber.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 rounded-2xl text-emerald-600 dark:text-emerald-400 font-bold text-xs transition-all"
                >
                  <svg className="size-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.74 0-2.597-1.012-5.05-2.848-6.87C16.656 2.175 14.211 1.157 11.998 1.157c-5.44 0-9.866 4.372-9.87 9.743-.001 1.748.465 3.453 1.348 4.953l-.986 3.6 3.731-.968c1.517.825 3.03 1.259 4.336 1.259z"/></svg>
                  <span>{dict.whatsappChat}</span>
                </a>
              )}

              {company.businessEmail && (
                <a
                  href={`mailto:${company.businessEmail}`}
                  className="w-full flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 hover:bg-primary/15 rounded-2xl text-primary font-bold text-xs transition-all"
                >
                  <Mail className="size-5" />
                  <span>{dict.emailUs}</span>
                </a>
              )}

              {company.phoneNumber && (
                <a
                  href={`tel:${company.phoneNumber}`}
                  className="w-full flex items-center gap-3 p-4 bg-secondary/50 border border-border hover:bg-secondary rounded-2xl text-foreground font-bold text-xs transition-all"
                >
                  <Phone className="size-5 text-muted-foreground" />
                  <span>Call {company.phoneNumber}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Report Profile overlay */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h3 className="text-base font-black text-foreground flex items-center gap-1.5 text-destructive">
                <AlertTriangle className="size-5" />
                <span>{dict.reportTitle}</span>
              </h3>
              <button onClick={() => setShowReportModal(false)} className="size-8 rounded-xl border border-border hover:bg-secondary/40 flex items-center justify-center text-muted-foreground cursor-pointer">
                <X className="size-4" />
              </button>
            </div>

            {reportSuccess ? (
              <p className="py-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 text-center bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                {dict.reportSuccess}
              </p>
            ) : (
              <form onSubmit={handleReport} className="space-y-4">
                <p className="text-xs text-muted-foreground leading-normal">
                  {dict.reportDesc}
                </p>
                <textarea
                  required
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="e.g. Outdated phone number or spam products..."
                  rows={3}
                  className="w-full rounded-xl border border-border bg-secondary/20 p-3 text-xs outline-none focus:border-primary"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="flex-1 rounded-xl bg-destructive py-2.5 text-xs font-bold text-white hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {reportSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                    <span>{dict.submitReport}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="rounded-xl border border-border px-4 py-2.5 hover:bg-secondary/40 text-xs font-bold text-foreground transition-all cursor-pointer"
                  >
                    {dict.cancel}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

function inputClass(hasError: boolean): string {
  return `w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 ${
    hasError ? "border-destructive focus:border-destructive" : "border-border"
  }`
}
