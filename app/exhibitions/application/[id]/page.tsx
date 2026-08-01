"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import {
  Building2,
  Calendar,
  MapPin,
  Trophy,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Building,
  User,
  ArrowRight,
  ArrowLeft
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { fetchExhibitionApplication } from "@/lib/services/exhibitions-client"
import type { ExhibitionApplication } from "@/lib/domains/exhibition/types"
import { MarketplaceShell, Breadcrumbs, MessageState } from "@/components/marketplace/shell"
import { directoryT } from "@/lib/directory-i18n"

const statusTranslations = {
  en: {
    pageTitle: "Application Status",
    appNumber: "Application ID",
    exhibition: "Exhibition",
    company: "Company Name",
    contactPerson: "Contact Person",
    submissionDate: "Submission Date",
    currentStatus: "Current Status",
    organizer: "Organizer",
    dates: "Event Dates",

    pendingStatus: "Pending Review",
    approvedStatus: "Approved",
    rejectedStatus: "Rejected",

    pendingMsg: "Your application is currently being reviewed by the event organizers. They will verify your business details soon. Thank you for your patience!",
    approvedMsg: "Congratulations! Your application has been approved by the organizers.",
    approvedDetail: "Your virtual exhibition booth is being prepared. It will become available for configuration and showcase management once fully activated by the administrator.",
    rejectedMsg: "Unfortunately, your application could not be accepted for this exhibition.",
    rejectedNotes: "Review Notes from Organizer:",
    noNotes: "No review notes were provided.",

    backBtn: "Back to Exhibition",
    exploreBtn: "Explore Exhibitions",
    appNotFound: "Application Not Found",
    appNotFoundDesc: "This application ID does not exist or has been removed from the platform.",
  },
  fr: {
    pageTitle: "Statut de la demande",
    appNumber: "ID de la demande",
    exhibition: "Exposition",
    company: "Nom de l'entreprise",
    contactPerson: "Personne de contact",
    submissionDate: "Date de soumission",
    currentStatus: "Statut actuel",
    organizer: "Organisateur",
    dates: "Dates de l'événement",

    pendingStatus: "En attente d'examen",
    approvedStatus: "Approuvée",
    rejectedStatus: "Refusée",

    pendingMsg: "Votre demande est en cours d'examen par les organisateurs de l'événement. Ils vérifieront bientôt les détails de votre entreprise. Merci de votre patience !",
    approvedMsg: "Félicitations ! Votre demande a été approuvée par les organisateurs.",
    approvedDetail: "Votre stand d'exposition virtuel est en cours de préparation. Il sera disponible pour la configuration et la gestion dès son activation complète par l'administrateur.",
    rejectedMsg: "Malheureusement, votre candidature n'a pas pu être acceptée pour cette exposition.",
    rejectedNotes: "Notes d'examen de l'organisateur :",
    noNotes: "Aucune note d'examen n'a été fournie.",

    backBtn: "Retour à l'exposition",
    exploreBtn: "Explorer les expositions",
    appNotFound: "Demande introuvable",
    appNotFoundDesc: "Cet identifiant de demande n'existe pas ou a été supprimé de la plateforme.",
  },
  ar: {
    pageTitle: "حالة طلب المشاركة",
    appNumber: "رقم الطلب",
    exhibition: "المعرض",
    company: "اسم الشركة",
    contactPerson: "الشخص المسؤول",
    submissionDate: "تاريخ التقديم",
    currentStatus: "الحالة الحالية",
    organizer: "الجهة المنظمة",
    dates: "تواريخ المعرض",

    pendingStatus: "قيد المراجعة",
    approvedStatus: "مقبول",
    rejectedStatus: "مرفوض",

    pendingMsg: "طلبك قيد المراجعة حاليًا من قبل منظمي المعرض. سيتم التحقق من تفاصيل شركتك قريبًا. شكرًا لجهودك وصبرك معنا!",
    approvedMsg: "تهانينا! تم قبول طلب المشاركة الخاص بك من قبل الجهة المنظمة.",
    approvedDetail: "جاري إعداد جناحك الافتراضي للمعرض. سيكون متاحاً للإعداد والتعديل وإدارة المعروضات فور تفعيله بالكامل من قبل مدير النظام.",
    rejectedMsg: "للأسف، تعذر قبول طلب مشاركتك في هذا المعرض.",
    rejectedNotes: "ملاحظات المراجعة من المنظم:",
    noNotes: "لم يتم تقديم أي ملاحظات للمراجعة.",

    backBtn: "العودة إلى المعرض",
    exploreBtn: "استكشاف المعارض الافتراضية",
    appNotFound: "الطلب غير موجود",
    appNotFoundDesc: "معرّف طلب المشاركة هذا غير موجود أو تمت إزالته من المنصة.",
  }
}

export default function ExhibitionApplicationStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <MarketplaceShell>
      <ApplicationStatusContent id={id} />
    </MarketplaceShell>
  )
}

function ApplicationStatusContent({ id }: { id: string }) {
  const { t, lang, dir } = useLanguage()
  const exT = t.exhibitions
  const dirT = directoryT[lang] || directoryT.en
  const sT = statusTranslations[lang] || statusTranslations.en

  const [application, setApplication] = useState<ExhibitionApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true

    fetchExhibitionApplication(id)
      .then((res) => {
        if (!active) return
        if (res.error || !res.data) {
          setError(true)
          setLoading(false)
          return
        }
        setApplication(res.data)
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
  }, [id])

  // Premium loading state skeleton
  if (loading) {
    return (
      <div className="pb-16 max-w-[480px] mx-auto px-4 pt-6" dir={dir}>
        <div className="h-4 w-32 bg-secondary/40 rounded-sm mb-6 animate-pulse" />
        <div className="border border-border p-6 rounded-[20px] bg-card space-y-6 animate-pulse">
          <div className="flex flex-col items-center gap-2 text-center pb-6 border-b border-border/40">
            <div className="size-12 rounded-full bg-secondary/35" />
            <div className="h-6 w-1/3 bg-secondary/35 rounded-md mt-2" />
            <div className="h-4 w-1/2 bg-secondary/25 rounded-md mt-1" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex justify-between items-center py-2 border-b border-border/20">
                <div className="h-3.5 w-20 bg-secondary/35 rounded-xs" />
                <div className="h-3.5 w-32 bg-secondary/25 rounded-xs" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !application) {
    return (
      <MessageState
        icon={<AlertCircle className="size-7 text-muted-foreground" />}
        title={sT.appNotFound}
        description={sT.appNotFoundDesc}
        action={
          <Link href="/exhibitions" className="rounded-[20px] bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition-all">
            {sT.exploreBtn}
          </Link>
        }
      />
    )
  }

  const { exhibition } = application
  const startStr = exhibition
    ? new Date(exhibition.startDate).toLocaleDateString(
        lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : "ar-TN",
        { year: "numeric", month: "long", day: "numeric" }
      )
    : ""
  const endStr = exhibition
    ? new Date(exhibition.endDate).toLocaleDateString(
        lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : "ar-TN",
        { year: "numeric", month: "long", day: "numeric" }
      )
    : ""
  const cityLoc = exhibition ? dirT.cities[exhibition.city] || exhibition.city : ""

  const submittedDateStr = new Date(application.submittedAt).toLocaleDateString(
    lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : "ar-TN",
    { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
  )

  // Status visual layout mapping
  const statusConfig = {
    Pending: {
      colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      icon: <Clock className="size-8 text-amber-500" />,
      label: sT.pendingStatus,
      bgGradient: "from-amber-500/5 to-transparent",
    },
    Approved: {
      colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: <CheckCircle2 className="size-8 text-emerald-500" />,
      label: sT.approvedStatus,
      bgGradient: "from-emerald-500/5 to-transparent",
    },
    Rejected: {
      colorClass: "bg-destructive/10 text-destructive border-destructive/20",
      icon: <XCircle className="size-8 text-destructive" />,
      label: sT.rejectedStatus,
      bgGradient: "from-destructive/5 to-transparent",
    }
  }[application.status] || {
    colorClass: "bg-secondary/40 text-muted-foreground border-border",
    icon: <Clock className="size-8 text-muted-foreground" />,
    label: application.status,
    bgGradient: "from-secondary/10 to-transparent",
  }

  return (
    <div className="pb-16 max-w-[480px] mx-auto px-4 pt-6" dir={dir}>
      <Breadcrumbs
        items={[
          { label: t.marketplace.breadcrumbHome, href: "/" },
          { label: exT.title, href: "/exhibitions" },
          ...(exhibition
            ? [{ label: exhibition.name, href: `/exhibitions/${exhibition.slug}` }]
            : []),
          { label: sT.pageTitle },
        ]}
      />

      <div className="mt-6 border border-border bg-card rounded-[20px] overflow-hidden shadow-xs transition-all duration-300">

        {/* Card Header Status Indicator */}
        <div className={`p-6 border-b border-border/40 bg-gradient-to-b ${statusConfig.bgGradient} flex flex-col items-center text-center space-y-4`}>
          <div className="size-14 rounded-full bg-card border border-border flex items-center justify-center shadow-xs">
            {statusConfig.icon}
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-black text-foreground">
              {sT.pageTitle}
            </h2>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {sT.appNumber}: <span className="font-extrabold text-foreground">{application.id.slice(0, 8)}...</span>
            </p>
          </div>

          <span className={`inline-flex rounded-full border px-3.5 py-1 text-xs font-black uppercase tracking-wide ${statusConfig.colorClass}`}>
            {statusConfig.label}
          </span>
        </div>

        {/* Detailed Application info & Custom Messages */}
        <div className="p-6 space-y-6">

          {/* Status descriptive messages */}
          <div className="rounded-2xl bg-secondary/35 border border-border/50 p-4 leading-relaxed text-xs font-semibold text-foreground">
            {application.status === "Pending" && (
              <p className="text-muted-foreground">
                {sT.pendingMsg}
              </p>
            )}

            {application.status === "Approved" && (
              <div className="space-y-2">
                <p className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>{sT.approvedMsg}</span>
                </p>
                <p className="text-muted-foreground font-semibold leading-relaxed">
                  {sT.approvedDetail}
                </p>
              </div>
            )}

            {application.status === "Rejected" && (
              <div className="space-y-3">
                <p className="text-destructive font-extrabold flex items-center gap-1.5">
                  <XCircle className="size-4 shrink-0" />
                  <span>{sT.rejectedMsg}</span>
                </p>

                <div className="border-t border-border/50 pt-2.5 space-y-1">
                  <p className="text-[10px] uppercase font-black tracking-wide text-muted-foreground">
                    {sT.rejectedNotes}
                  </p>
                  <p className="text-foreground leading-relaxed italic">
                    {application.reviewNotes ? application.reviewNotes : sT.noNotes}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Exhibition / Event details */}
          {exhibition && (
            <div className="space-y-3.5 pb-5 border-b border-border/45">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider">
                {sT.exhibition}
              </h3>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Building2 className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-foreground truncate">
                      {exhibition.name}
                    </p>
                    <p className="text-[10px] font-semibold text-muted-foreground leading-none mt-0.5">
                      {sT.organizer}: {exhibition.organizer}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Calendar className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-foreground">
                      {startStr} – {endStr}
                    </p>
                    <p className="text-[10px] font-semibold text-muted-foreground leading-none mt-0.5">
                      {cityLoc}, {exhibition.country === "TN" ? "Tunisia" : exhibition.country}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submission parameters */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider">
              {lang === "ar" ? "تفاصيل الطلب" : lang === "fr" ? "Détails de la demande" : "Application Parameters"}
            </h3>

            <div className="space-y-2.5 text-xs font-semibold">
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Building className="size-3.5 text-muted-foreground" />
                  {sT.company}
                </span>
                <span className="text-foreground font-extrabold">
                  {application.companyName}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <User className="size-3.5 text-muted-foreground" />
                  {sT.contactPerson}
                </span>
                <span className="text-foreground font-extrabold">
                  {application.contactPerson}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <FileText className="size-3.5 text-muted-foreground" />
                  {sT.submissionDate}
                </span>
                <span className="text-foreground font-bold">
                  {submittedDateStr}
                </span>
              </div>
            </div>
          </div>

          {/* Back button */}
          {exhibition && (
            <div className="pt-2">
              <Link
                href={`/exhibitions/${exhibition.slug}`}
                className="w-full min-h-12 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-secondary/20 text-xs font-black text-foreground transition-all active:scale-95 shadow-2xs"
              >
                {dir === "rtl" ? <ArrowRight className="size-4 text-primary" /> : <ArrowLeft className="size-4 text-primary" />}
                <span>{sT.backBtn}</span>
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
