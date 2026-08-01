"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Building2,
  Calendar,
  Download,
  FileText,
  Mail,
  MapPin,
  Phone,
  Play,
  Send,
  Sparkles,
  X,
  Check,
  Loader2,
  FileCheck,
  Shield,
  Layers,
  Video,
  ArrowLeft,
  AlertTriangle,
  Eye,
  CheckCircle2
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { MarketplaceShell, Breadcrumbs, MessageState } from "@/components/marketplace/shell"
import { directoryT } from "@/lib/directory-i18n"
import type { ExhibitionBooth } from "@/lib/domains/exhibition/types"

const dict = {
  en: {
    previewBannerTitle: "Booth Preview Mode",
    previewBannerDesc: "This is a private preview of your booth exactly as visitors will see it. Please review all sections before submitting.",
    btnSubmit: "Submit for Review",
    btnBack: "Back to Dashboard",
    submitting: "Submitting...",
    submitSuccessTitle: "Submission Successful!",
    submitSuccessDesc: "Your booth has been submitted for administrator review. Content editing has been locked until the review is complete.",
    submitError: "Failed to submit booth. Please try again.",
    backToDashboardBtn: "Go to Dashboard",
    boothNotFound: "Booth Space Not Found",
    boothNotFoundDesc: "We could not find the booth space details you are trying to preview.",
    backToExhibition: "Return to Workspace",
    virtualExhibitor: "Virtual Exhibitor",
    verifiedExhibitor: "Verified Exhibitor",
    requestMeeting: "Request Private B2B Meeting",
    showcaseSummary: "Showcase Summary",
    exhibitsInnovations: "Exhibits & Innovations",
    noExhibits: "No virtual exhibits added yet.",
    featuredExhibit: "Featured Exhibit",
    brochure: "Technical Brochure",
    galleryPhotos: "Booth Gallery & Photos",
    demosVideos: "Product Demos & Videos",
    catalogPdfs: "Product Catalogues & PDFs",
    noPdf: "No product catalogues uploaded yet.",
    contact: "Contact Exhibitor",
    chatWhatsapp: "Chat via WhatsApp",
    sendEmail: "Send Direct Email",
    callLabel: "Call Office:",
    requestMeetingTitle: "Request B2B Meeting",
    requestMeetingDesc: "Schedule a virtual or in-person B2B appointment with this exhibitor during the event.",
    meetingDate: "Preferred Date",
    meetingTime: "Preferred Time Slot",
    meetingNotes: "Meeting Agenda / Notes",
    meetingNotesPlaceholder: "Briefly describe your sourcing needs, estimated order volume, or questions...",
    meetingSubmit: "Submit Request",
    meetingSubmitting: "Submitting...",
    meetingSuccess: "Meeting Request Sent!",
    meetingSuccessDesc: "The exhibitor has been notified of your request and will contact you shortly to confirm.",
    cancel: "Cancel"
  },
  fr: {
    previewBannerTitle: "Mode Aperçu du Stand",
    previewBannerDesc: "Ceci est un aperçu privé de votre stand tel que les visiteurs le verront. Veuillez vérifier toutes les sections avant de soumettre.",
    btnSubmit: "Soumettre pour examen",
    btnBack: "Retour au tableau de bord",
    submitting: "Soumission...",
    submitSuccessTitle: "Soumission Réussie !",
    submitSuccessDesc: "Votre stand a été soumis pour examen par l'administrateur. La modification du contenu a été verrouillée jusqu'à la fin de l'examen.",
    submitError: "Échec de la soumission. Veuillez réessayer.",
    backToDashboardBtn: "Aller au tableau de bord",
    boothNotFound: "Stand non trouvé",
    boothNotFoundDesc: "Nous n'avons pas pu trouver les détails du stand que vous essayez de prévisualiser.",
    backToExhibition: "Retourner à l'espace de travail",
    virtualExhibitor: "Exposant Virtuel",
    verifiedExhibitor: "Exposant Vérifié",
    requestMeeting: "Demander un RDV B2B Privé",
    showcaseSummary: "Résumé de la présentation",
    exhibitsInnovations: "Expositions & Innovations",
    noExhibits: "Aucune exposition virtuelle ajoutée pour le moment.",
    featuredExhibit: "Exposition Vedette",
    brochure: "Brochure Technique",
    galleryPhotos: "Galerie & Photos du Stand",
    demosVideos: "Démos Produits & Vidéos",
    catalogPdfs: "Catalogues de Produits & PDF",
    noPdf: "Aucun catalogue de produits téléchargé pour le moment.",
    contact: "Contacter l'exposant",
    chatWhatsapp: "Discuter sur WhatsApp",
    sendEmail: "Envoyer un e-mail direct",
    callLabel: "Appeler le bureau:",
    requestMeetingTitle: "Demander un rendez-vous B2B",
    requestMeetingDesc: "Planifiez un rendez-vous B2B virtuel ou en personne avec cet exposant pendant l'événement.",
    meetingDate: "Date préférée",
    meetingTime: "Créneau horaire préféré",
    meetingNotes: "Ordre du jour / Notes",
    meetingNotesPlaceholder: "Décrivez brièvement vos besoins d'approvisionnement ou vos questions...",
    meetingSubmit: "Soumettre la demande",
    meetingSubmitting: "Soumission...",
    meetingSuccess: "Demande de rendez-vous envoyée !",
    meetingSuccessDesc: "L'exposant a été informé de votre demande et vous contactera sous peu pour confirmer.",
    cancel: "Annuler"
  },
  ar: {
    previewBannerTitle: "وضع معاينة الجناح",
    previewBannerDesc: "هذه معاينة خاصة لجناحك تماماً كما سيراها الزوار. يرجى مراجعة كافة الأقسام قبل الإرسال للمراجعة.",
    btnSubmit: "إرسال للمراجعة",
    btnBack: "العودة إلى لوحة التحكم",
    submitting: "جاري الإرسال...",
    submitSuccessTitle: "تم الإرسال بنجاح!",
    submitSuccessDesc: "تم إرسال جناحك لمراجعة الإدارة. تم قفل إمكانية تعديل المحتوى حتى تكتمل عملية المراجعة.",
    submitError: "فشل إرسال الجناح. يرجى المحاولة مرة أخرى.",
    backToDashboardBtn: "الذهاب إلى لوحة التحكم",
    boothNotFound: "لم يتم العثور على الجناح",
    boothNotFoundDesc: "تعذر العثور على تفاصيل جناح المعرض الذي تحاول معاينته.",
    backToExhibition: "العودة إلى مساحة العمل",
    virtualExhibitor: "عارض افتراضي",
    verifiedExhibitor: "عارض معتمد",
    requestMeeting: "طلب اجتماع B2B خاص",
    showcaseSummary: "ملخص الجناح",
    exhibitsInnovations: "المعروضات والابتكارات",
    noExhibits: "لم يتم إضافة معروضات افتراضية بعد.",
    featuredExhibit: "معروض مميز",
    brochure: "كتيب فني",
    galleryPhotos: "معرض صور الجناح",
    demosVideos: "عروض المنتجات والفيديو",
    catalogPdfs: "كتالوجات المنتجات وملفات PDF",
    noPdf: "لم يتم تحميل كتالوجات منتجات بعد.",
    contact: "الاتصال بالعارض",
    chatWhatsapp: "تحدث عبر واتساب",
    sendEmail: "إرسال بريد إلكتروني مباشر",
    callLabel: "اتصل بالمكتب:",
    requestMeetingTitle: "طلب اجتماع B2B",
    requestMeetingDesc: "قم بجدولة موعد B2B افتراضي أو حضوري مع هذا العارض أثناء الفعالية.",
    meetingDate: "التاريخ المفضل",
    meetingTime: "الوقت المفضل",
    meetingNotes: "جدول أعمال الاجتماع / ملاحظات",
    meetingNotesPlaceholder: "صف باختصار احتياجاتك من التوريد، حجم الطلب المتوقع، أو استفساراتك...",
    meetingSubmit: "إرسال الطلب",
    meetingSubmitting: "جاري الإرسال...",
    meetingSuccess: "تم إرسال طلب الاجتماع!",
    meetingSuccessDesc: "تم إخطار العارض بطلبك وسيتصل بك قريباً للتأكيد.",
    cancel: "إلغاء"
  }
}

export default function BoothPreviewPage() {
  return (
    <MarketplaceShell>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
          </div>
        }
      >
        <PreviewSuspenseWrapper />
      </Suspense>
    </MarketplaceShell>
  )
}

function PreviewSuspenseWrapper() {
  const searchParams = useSearchParams()
  const boothId = searchParams.get("id") || ""
  return <PreviewContent key={boothId} boothId={boothId} />
}

function PreviewContent({ boothId }: { boothId: string }) {
  const { lang, dir } = useLanguage()
  const d = dict[lang] || dict.en
  const dirT = directoryT[lang] || directoryT.en
  const router = useRouter()

  const [booth, setBooth] = useState<ExhibitionBooth | null>(null)
  const [loading, setLoading] = useState(!!boothId)
  const [error, setError] = useState<string | null>(boothId ? null : d.boothNotFoundDesc)

  // Submitting States
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Request Meeting Form states (Interactive mock preview)
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [meetingDate, setMeetingDate] = useState("")
  const [meetingTime, setMeetingTime] = useState("10:00 - 11:00")
  const [meetingNotes, setMeetingNotes] = useState("")
  const [meetingSubmitting, setMeetingSubmitting] = useState(false)
  const [meetingSuccess, setMeetingSuccess] = useState(false)

  // Video playback overlay state
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!boothId) {
      return
    }

    let active = true
    fetch(`/api/exhibitions/booth?id=${encodeURIComponent(boothId)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("HTTP Status " + res.status)
        }
        return res.json()
      })
      .then((json) => {
        if (!active) return
        if (json.success && json.data) {
          setBooth(json.data)
        } else {
          setError(json.error || d.boothNotFoundDesc)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Preview page fetch error:", err)
        if (!active) return
        setError(d.boothNotFoundDesc)
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [boothId, d.boothNotFoundDesc])

  const handleSubmitForReview = async () => {
    if (!boothId || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/exhibitions/booth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: boothId,
          status: "Submitted"
        })
      })

      const json = await res.json()
      if (json.success) {
        setSubmitSuccess(true)
      } else {
        setError(json.error || d.submitError)
        setSubmitting(false)
      }
    } catch (err) {
      console.error("Failed to submit booth:", err)
      setError(d.submitError)
      setSubmitting(false)
    }
  }

  // Request Meeting Form handler
  const handleMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!meetingDate) return
    setMeetingSubmitting(true)
    setTimeout(() => {
      setMeetingSubmitting(false)
      setMeetingSuccess(true)
      setTimeout(() => {
        setShowMeetingModal(false)
        setMeetingSuccess(false)
        setMeetingDate("")
        setMeetingNotes("")
      }, 2500)
    }, 1000)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3" dir={dir}>
        <Loader2 className="size-8 text-primary animate-spin" />
        <span className="text-xs font-bold text-muted-foreground">Loading preview...</span>
      </div>
    )
  }

  if (error || !booth || !booth.company) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16" dir={dir}>
        <MessageState
          icon={<Building2 className="size-10 text-muted-foreground" />}
          title={d.boothNotFound}
          description={error || d.boothNotFoundDesc}
          action={
            <button
              onClick={() => router.push("/exhibitions/booth/dashboard")}
              className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all active:scale-95 min-h-11 flex items-center justify-center"
            >
              {d.backToExhibition}
            </button>
          }
        />
      </div>
    )
  }

  const comp = booth.company
  const compLoc = [
    comp.city ? (dirT.cities[comp.city] || comp.city) : null,
    comp.country ? (dirT.countries[comp.country as keyof typeof dirT.countries] || comp.country) : null
  ].filter(Boolean).join(", ")

  // Filter exhibition media types
  const imagesMedia = booth.media?.filter((m) => m.mediaType === "image") || []
  const videosMedia = booth.media?.filter((m) => m.mediaType === "video") || []

  return (
    <div className="pb-16 relative" dir={dir}>
      {/* Sticky Top Preview Control Alert Banner */}
      <div className="sticky top-[64px] z-40 w-full border-b border-amber-200/40 bg-amber-500/10 dark:bg-amber-950/20 backdrop-blur-md px-4 py-3 shadow-md">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-amber-500/20 dark:bg-amber-500/30 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
              <Eye className="size-5" />
            </div>
            <div>
              <h2 className="text-xs font-black text-foreground">{d.previewBannerTitle}</h2>
              <p className="text-[10px] font-semibold text-muted-foreground leading-normal max-w-lg">
                {d.previewBannerDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => router.push(`/exhibitions/booth/dashboard?id=${boothId}`)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-extrabold text-foreground transition-all hover:bg-secondary min-h-[38px]"
            >
              <ArrowLeft className="size-4" />
              <span>{d.btnBack}</span>
            </button>

            {booth.status !== "Submitted" && (
              <button
                onClick={handleSubmitForReview}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary/95 text-xs font-extrabold text-primary-foreground px-4 py-2 transition-all min-h-[38px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>{d.submitting}</span>
                  </>
                ) : (
                  <>
                    <Check className="size-4" />
                    <span>{d.btnSubmit}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Workspace", href: "/exhibitions/booth/dashboard" },
          { label: "Preview" }
        ]}
      />

      {/* Main Exhibition Booth Layout exactly as visitors will see it */}
      <section className="relative bg-card border-b border-border">
        {/* Banner Area */}
        <div className="h-44 w-full overflow-hidden bg-gradient-to-r from-blue-950 via-[#1E3A8A] to-slate-900 sm:h-64 relative">
          {booth.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={booth.bannerUrl} alt={comp.name} className="size-full object-cover" />
          ) : (
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          )}

          {/* Exclusive Exhibition Badge */}
          <div className="absolute top-4 right-4 bg-primary px-3 py-1.5 rounded-full text-[10px] font-extrabold text-white flex items-center gap-1.5 shadow-md">
            <Sparkles className="size-3" />
            <span className="uppercase">{d.virtualExhibitor}</span>
          </div>
        </div>

        {/* Brand identity overlay */}
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-16 relative">
          {/* Logo container */}
          <div className="absolute -top-16 start-6 size-24 sm:size-28 rounded-3xl border-4 border-card bg-white shadow-xl flex items-center justify-center overflow-hidden shrink-0">
            {comp.logoUrl || booth.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={booth.logoUrl || comp.logoUrl || undefined} alt={comp.name} className="size-full object-contain p-2" />
            ) : (
              <div className="size-full bg-gradient-to-tr from-primary to-blue-600 text-white font-black text-3xl flex items-center justify-center">
                {comp.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  {booth.title || comp.name}
                </h1>
                {comp.verified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <Shield className="size-4 shrink-0 text-emerald-500" />
                    <span>{d.verifiedExhibitor}</span>
                  </span>
                )}
              </div>

              {(booth.shortDescription || comp.tagline) && (
                <p className="mt-1 text-sm font-semibold text-muted-foreground">
                  {booth.shortDescription || comp.tagline}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-muted-foreground">
                {compLoc && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4 text-primary shrink-0" />
                    <span>{compLoc}</span>
                  </span>
                )}
                {comp.yearEstablished && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="size-4 text-primary shrink-0" />
                    <span>Est: {comp.yearEstablished}</span>
                  </span>
                )}
              </div>
            </div>

            {/* CTA Meeting Button */}
            <div className="shrink-0 flex gap-2">
              <button
                onClick={() => setShowMeetingModal(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-xs font-extrabold text-white py-3.5 px-6 transition-all shadow-md shadow-primary/10 hover:shadow-lg cursor-pointer active:scale-95 min-h-11"
              >
                <Calendar className="size-4" />
                <span>{d.requestMeeting}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Booth layout */}
      <div className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns (Exhibition specific description + Exhibits + Gallery + Videos) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Booth description */}
          <section className="bg-card border border-border rounded-[20px] p-6 shadow-sm">
            <h2 className="text-base font-black text-foreground tracking-tight mb-4 flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              <span>{d.showcaseSummary}</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {booth.description || "No full booth description provided yet."}
            </p>
          </section>

          {/* Exhibition Exhibits */}
          <section className="bg-card border border-border rounded-[20px] p-6 shadow-sm space-y-6">
            <h2 className="text-base font-black text-foreground tracking-tight flex items-center gap-2">
              <FileCheck className="size-5 text-primary" />
              <span>{d.exhibitsInnovations}</span>
            </h2>

            {!booth.exhibits || booth.exhibits.length === 0 ? (
              <p className="text-xs text-muted-foreground italic bg-secondary/25 p-4 rounded-xl text-center border border-dashed border-border">
                {d.noExhibits}
              </p>
            ) : (
              <div className="space-y-6">
                {booth.exhibits.map((exhibit) => {
                  const hasImage = exhibit.images && exhibit.images.length > 0
                  return (
                    <div
                      key={exhibit.id}
                      className="flex flex-col sm:flex-row gap-5 p-4 rounded-xl border border-border/70 bg-secondary/15 transition-all hover:border-primary/30"
                    >
                      {/* Exhibit image */}
                      {hasImage ? (
                        <div className="relative w-full sm:w-40 aspect-square sm:aspect-auto sm:h-32 rounded-xl overflow-hidden border border-border shrink-0 bg-secondary">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={exhibit.images[0]} alt={exhibit.name} className="size-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-full sm:w-40 h-32 rounded-xl bg-secondary flex items-center justify-center shrink-0 border border-border">
                          <Building2 className="size-8 text-muted-foreground" />
                        </div>
                      )}

                      {/* Exhibit Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-black text-foreground">{exhibit.name}</h3>
                            {exhibit.category && (
                              <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                {exhibit.category}
                              </span>
                            )}
                            {exhibit.isFeatured && (
                              <span className="text-[9px] font-extrabold uppercase bg-amber-500/10 border border-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded">
                                {d.featuredExhibit}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                            {exhibit.description}
                          </p>
                        </div>

                        {/* Brochure download */}
                        {exhibit.brochureUrl && (
                          <div className="flex flex-wrap gap-2 pt-3">
                            <a
                              href={exhibit.brochureUrl}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[10px] font-black text-foreground transition-all hover:bg-secondary/40 min-h-11"
                            >
                              <Download className="size-3.5 text-primary" />
                              <span>{d.brochure}</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Exhibition Gallery & Photos */}
          {imagesMedia.length > 0 && (
            <section className="bg-card border border-border rounded-[20px] p-6 shadow-sm space-y-4">
              <h2 className="text-base font-black text-foreground tracking-tight flex items-center gap-2">
                <Layers className="size-5 text-primary" />
                <span>{d.galleryPhotos}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {imagesMedia.map((med) => (
                  <div key={med.id} className="relative group rounded-xl overflow-hidden border border-border bg-secondary aspect-video">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={med.url} alt={med.caption || ""} className="size-full object-cover transition-all group-hover:scale-105" />
                    {med.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-xs p-2 text-[10px] text-white font-semibold truncate">
                        {med.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Exhibition Videos */}
          {videosMedia.length > 0 && (
            <section className="bg-card border border-border rounded-[20px] p-6 shadow-sm space-y-4">
              <h2 className="text-base font-black text-foreground tracking-tight flex items-center gap-2">
                <Video className="size-5 text-primary" />
                <span>{d.demosVideos}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videosMedia.map((med) => (
                  <div
                    key={med.id}
                    onClick={() => setActiveVideoUrl(med.url)}
                    className="relative group rounded-xl overflow-hidden border border-border bg-black aspect-video cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors flex items-center justify-center z-10">
                      <div className="size-11 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <Play className="size-5 fill-current" />
                      </div>
                    </div>
                    {med.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-xs p-2 text-[10px] text-white font-semibold truncate z-10">
                        {med.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column (Exhibitor documents + Contacts) */}
        <div className="space-y-8">
          {/* Catalog PDFs & Brochures */}
          <section className="bg-card border border-border rounded-[20px] p-6 shadow-sm space-y-4">
            <h2 className="text-base font-black text-foreground tracking-tight border-b border-border/60 pb-3 flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              <span>{d.catalogPdfs}</span>
            </h2>

            {!booth.documents || booth.documents.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic">{d.noPdf}</p>
            ) : (
              <div className="space-y-2.5">
                {booth.documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/15 hover:bg-secondary/40 transition-all text-xs min-h-11"
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <FileCheck className="size-4.5 text-primary shrink-0" />
                      <span className="font-extrabold text-foreground truncate">{doc.name}</span>
                    </span>
                    {doc.fileSize && (
                      <span className="text-[10px] font-bold text-muted-foreground shrink-0 uppercase">
                        {doc.fileSize}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Contact Details */}
          <section className="bg-card border border-border rounded-[20px] p-6 shadow-sm space-y-4">
            <h2 className="text-base font-black text-foreground tracking-tight border-b border-border/60 pb-3 flex items-center gap-2">
              <Mail className="size-5 text-primary" />
              <span>{d.contact}</span>
            </h2>

            <div className="space-y-3">
              {(booth.contactWhatsapp || comp.whatsappNumber) && (
                <a
                  href={`https://wa.me/${(booth.contactWhatsapp || comp.whatsappNumber || "").replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center gap-3 p-3.5 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold text-xs transition-all min-h-11"
                >
                  <svg className="size-5 fill-current shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.74 0-2.597-1.012-5.05-2.848-6.87C16.656 2.175 14.211 1.157 11.998 1.157c-5.44 0-9.866 4.372-9.87 9.743-.001 1.748.465 3.453 1.348 4.953l-.986 3.6 3.731-.968c1.517.825 3.03 1.259 4.336 1.259z"/></svg>
                  <span className="truncate">{d.chatWhatsapp}</span>
                </a>
              )}

              {(booth.contactEmail || comp.businessEmail) && (
                <a
                  href={`mailto:${booth.contactEmail || comp.businessEmail}`}
                  className="w-full flex items-center gap-3 p-3.5 bg-primary/10 border border-primary/20 hover:bg-primary/15 rounded-xl text-primary font-bold text-xs transition-all min-h-11"
                >
                  <Mail className="size-5 shrink-0" />
                  <span className="truncate">{d.sendEmail}</span>
                </a>
              )}

              {(booth.contactPhone || comp.phoneNumber) && (
                <a
                  href={`tel:${booth.contactPhone || comp.phoneNumber}`}
                  className="w-full flex items-center gap-3 p-3.5 bg-secondary/50 border border-border hover:bg-secondary rounded-xl text-foreground font-bold text-xs transition-all min-h-11"
                >
                  <Phone className="size-5 text-muted-foreground shrink-0" />
                  <span className="truncate flex items-center gap-1">
                    <span>{d.callLabel}</span>
                    <span className="font-mono text-[11px]">{booth.contactPhone || comp.phoneNumber}</span>
                  </span>
                </a>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* SUCCESS SUBMISSION MODAL */}
      {submitSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-[20px] border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-300 text-center space-y-6">
            <div className="size-16 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="size-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-foreground">{d.submitSuccessTitle}</h3>
              <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
                {d.submitSuccessDesc}
              </p>
            </div>
            <div>
              <button
                onClick={() => router.push(`/exhibitions/booth/dashboard?id=${boothId}`)}
                className="w-full rounded-xl bg-primary hover:bg-primary/95 text-xs font-black text-primary-foreground py-3.5 transition-all min-h-11"
              >
                {d.backToDashboardBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MEETING MODAL PREVIEW */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <Calendar className="size-5 text-primary" />
                <span>{d.requestMeetingTitle}</span>
              </h3>
              <button
                onClick={() => setShowMeetingModal(false)}
                className="size-8 rounded-xl border border-border hover:bg-secondary/40 flex items-center justify-center text-muted-foreground cursor-pointer min-h-11"
              >
                <X className="size-4" />
              </button>
            </div>

            {meetingSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="size-14 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 flex items-center justify-center mx-auto">
                  <Check className="size-6" />
                </div>
                <div>
                  <h4 className="text-base font-black text-foreground">{d.meetingSuccess}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {d.meetingSuccessDesc}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleMeetingSubmit} className="space-y-4">
                <p className="text-xs text-muted-foreground leading-normal">
                  {d.requestMeetingDesc}
                </p>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">
                    {d.meetingDate} *
                  </label>
                  <input
                    type="date"
                    required
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-secondary/15 px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-11"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">
                    {d.meetingTime} *
                  </label>
                  <select
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full rounded-xl border border-border bg-secondary/15 px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-11 pr-10"
                  >
                    <option value="09:00 - 10:00">09:00 - 10:00 (GMT+1)</option>
                    <option value="10:00 - 11:00">10:00 - 11:00 (GMT+1)</option>
                    <option value="11:00 - 12:00">11:00 - 12:00 (GMT+1)</option>
                    <option value="14:00 - 15:00">14:00 - 15:00 (GMT+1)</option>
                    <option value="15:00 - 16:00">15:00 - 16:00 (GMT+1)</option>
                    <option value="16:00 - 17:00">16:00 - 17:00 (GMT+1)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">
                    {d.meetingNotes}
                  </label>
                  <textarea
                    value={meetingNotes}
                    onChange={(e) => setMeetingNotes(e.target.value)}
                    placeholder={d.meetingNotesPlaceholder}
                    rows={4}
                    className="w-full rounded-xl border border-border bg-secondary/15 p-3 text-xs outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={meetingSubmitting}
                    className="flex-1 rounded-xl bg-gradient-to-r from-primary to-blue-600 py-3.5 text-xs font-black text-white hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2 min-h-11"
                  >
                    {meetingSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>{d.meetingSubmitting}</span>
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        <span>{d.meetingSubmit}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMeetingModal(false)}
                    className="rounded-xl border border-border px-4 py-3.5 hover:bg-secondary/40 text-xs font-bold text-foreground transition-all cursor-pointer min-h-11"
                  >
                    {d.cancel}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* VIDEO PREVIEW OVERLAY */}
      {activeVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden border border-border/40 shadow-2xl">
            <button
              onClick={() => setActiveVideoUrl(null)}
              className="absolute top-4 right-4 z-20 size-9 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white cursor-pointer min-h-11"
            >
              <X className="size-4" />
            </button>
            <video src={activeVideoUrl} controls autoPlay className="size-full object-cover" />
          </div>
        </div>
      )}
    </div>
  )
}
