"use client"

import { useEffect, useState, Suspense } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  Calendar,
  Globe2,
  Mail,
  Phone,
  Tag,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldAlert,
  Send,
  HelpCircle,
  X
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { MarketplaceShell, Breadcrumbs } from "@/components/marketplace/shell"
import type { ExhibitionApplication } from "@/lib/domains/exhibition/types"

const dict = {
  en: {
    detailsTitle: "Application Review",
    subtitle: "Examine company credentials, contact details, and core exhibition parameters to approve or reject the trade show application.",
    companyInfo: "Company Profile",
    contactInfo: "Contact Details",
    exhibitorCategory: "Business Category",
    shortDescription: "Short Description",
    message: "Message to Organizer",
    submittedDate: "Submitted At",
    status: "Current Status",
    reviewNotesLabel: "Organizer Review Notes",
    reviewNotesPlaceholder: "Specify rejection reasons, onboarding feedback, or comments for the company...",
    approveBtn: "Approve Application",
    rejectBtn: "Reject Application",
    requestInfoBtn: "Request More Information",
    requestInfoMsg: "The request for more information has been logged (placeholder simulation).",
    approveSuccess: "Application approved successfully! A corresponding Draft exhibition booth space has been provisioned.",
    rejectSuccess: "Application rejected successfully. Notes have been recorded and saved.",
    loading: "Loading application details...",
    errorLoad: "Failed to load application.",
    backToList: "Return to Application List",
    statusPending: "Pending Review",
    statusApproved: "Approved & Provisioned",
    statusRejected: "Rejected",
    characterLimit: "Keep feedback constructive and clear",
    reviewNotesRequired: "Please specify review notes detailing the rejection reasons before rejecting.",
  },
  fr: {
    detailsTitle: "Examen de la Candidature",
    subtitle: "Examinez les informations d'identification de l'entreprise, les coordonnées de contact et les paramètres de l'exposition pour approuver ou rejeter.",
    companyInfo: "Profil de l'entreprise",
    contactInfo: "Coordonnées de Contact",
    exhibitorCategory: "Catégorie d'activité",
    shortDescription: "Description Courte",
    message: "Message à l'organisateur",
    submittedDate: "Soumis le",
    status: "Statut Actuel",
    reviewNotesLabel: "Notes d'examen de l'organisateur",
    reviewNotesPlaceholder: "Précisez les raisons du rejet, les commentaires d'intégration ou les remarques pour l'entreprise...",
    approveBtn: "Approuver la candidature",
    rejectBtn: "Rejeter la candidature",
    requestInfoBtn: "Demander des informations complémentaires",
    requestInfoMsg: "La demande d'informations complémentaires a été enregistrée (simulation).",
    approveSuccess: "Candidature approuvée avec succès ! Un espace de stand d'exposition en mode Brouillon a été provisionné.",
    rejectSuccess: "Candidature rejetée avec succès. Les notes ont été enregistrées.",
    loading: "Chargement des détails de la candidature...",
    errorLoad: "Échec du chargement de la candidature.",
    backToList: "Retour à la liste des candidatures",
    statusPending: "En attente d'examen",
    statusApproved: "Approuvé & Provisionné",
    statusRejected: "Rejeté",
    characterLimit: "Gardez les commentaires constructifs et clairs",
    reviewNotesRequired: "Veuillez spécifier des notes d'examen détaillant les raisons du rejet avant de rejeter.",
  },
  ar: {
    detailsTitle: "مراجعة طلب التقديم",
    subtitle: "فحص أوراق اعتماد الشركة، وتفاصيل الاتصال، ومعايير المعرض الأساسية لقبول أو رفض طلب المشاركة في المعرض.",
    companyInfo: "ملف تعريف الشركة",
    contactInfo: "بيانات الاتصال",
    exhibitorCategory: "فئة النشاط التجاري",
    shortDescription: "وصف قصير",
    message: "رسالة إلى المنظم",
    submittedDate: "تم التقديم في",
    status: "الحالة الحالية",
    reviewNotesLabel: "ملاحظات مراجعة المنظم",
    reviewNotesPlaceholder: "حدد أسباب الرفض، أو تعليقات التوجيه والتهيئة، أو الملاحظات العامة الموجهة للشركة...",
    approveBtn: "قبول طلب التقديم",
    rejectBtn: "رفض طلب التقديم",
    requestInfoBtn: "طلب معلومات إضافية",
    requestInfoMsg: "تم تسجيل طلب الحصول على معلومات إضافية بنجاح (محاكاة).",
    approveSuccess: "تم قبول طلب التقديم بنجاح! وجاري تخصيص مساحة جناح معرض (مسودة) للعارض.",
    rejectSuccess: "تم رفض طلب التقديم بنجاح. وحفظ ملاحظات المراجعة.",
    loading: "جاري تحميل تفاصيل الطلب...",
    errorLoad: "فشل تحميل تفاصيل طلب التقديم.",
    backToList: "العودة إلى قائمة الطلبات",
    statusPending: "قيد المراجعة والتدقيق",
    statusApproved: "مقبول ومخصص",
    statusRejected: "مرفوض",
    characterLimit: "يرجى إبقاء التعليقات والملاحظات بناءة وواضحة",
    reviewNotesRequired: "يرجى تحديد تفاصيل وأسباب الرفض في حقل ملاحظات المراجعة قبل الضغط على رفض.",
  }
}

export default function ApplicationDetailsPage() {
  return (
    <MarketplaceShell>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
          </div>
        }
      >
        <DetailsSuspenseWrapper />
      </Suspense>
    </MarketplaceShell>
  )
}

function DetailsSuspenseWrapper() {
  const params = useParams()
  const id = params?.id as string
  return <ApplicationDetailsContent key={id} id={id} />
}

interface ApplicationDetailsContentProps {
  id: string
}

function ApplicationDetailsContent({ id }: ApplicationDetailsContentProps) {
  const { lang, dir } = useLanguage()
  const d = dict[lang] || dict.en
  const router = useRouter()

  const [application, setApplication] = useState<ExhibitionApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Review & form states
  const [reviewNotes, setReviewNotes] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [placeholderLogged, setPlaceholderLogged] = useState(false)

  useEffect(() => {
    if (!id) return

    let active = true

    fetch(`/api/exhibitions/applications/${encodeURIComponent(id)}`)
      .then((res) => {
        if (!res.ok) throw new Error("HTTP Status " + res.status)
        return res.json()
      })
      .then((json) => {
        if (!active) return
        if (json.success && json.data) {
          setApplication(json.data)
          setReviewNotes(json.data.reviewNotes || "")
        } else {
          setError(json.error || d.errorLoad)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load application details:", err)
        if (!active) return
        setError(d.errorLoad)
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id, d.errorLoad])

  const handleAction = async (action: "Approve" | "Reject") => {
    if (actionLoading) return
    setError(null)
    setPlaceholderLogged(false)

    // Rejection notes validation
    if (action === "Reject" && !reviewNotes.trim()) {
      setError(d.reviewNotesRequired)
      return
    }

    setActionLoading(true)

    try {
      const res = await fetch(`/api/exhibitions/applications/${encodeURIComponent(id)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, reviewNotes: reviewNotes.trim() })
      })
      const json = await res.json()
      if (json.success && json.data) {
        setApplication(json.data)
        setSuccessMsg(action === "Approve" ? d.approveSuccess : d.rejectSuccess)
        setTimeout(() => {
          setSuccessMsg(null)
          router.push("/exhibitions/admin/applications")
        }, 2000)
      } else {
        setError(json.error || "Failed to update application status.")
      }
    } catch (err) {
      console.error("Failed to complete action:", err)
      setError("An unexpected server error occurred.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleRequestInfoPlaceholder = () => {
    setPlaceholderLogged(true)
    setTimeout(() => setPlaceholderLogged(false), 3500)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return {
          label: d.statusPending,
          classes: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
          icon: <AlertCircle className="size-4" />
        }
      case "Approved":
        return {
          label: d.statusApproved,
          classes: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          icon: <CheckCircle2 className="size-4" />
        }
      case "Rejected":
        return {
          label: d.statusRejected,
          classes: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
          icon: <XCircle className="size-4" />
        }
      default:
        return {
          label: status,
          classes: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
          icon: <AlertCircle className="size-4" />
        }
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

  if (error && !application) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-4" dir={dir}>
        <ShieldAlert className="size-10 text-destructive mx-auto" />
        <p className="text-sm font-bold text-foreground">{error}</p>
        <button
          onClick={() => router.push("/exhibitions/admin/applications")}
          className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold"
        >
          <ArrowLeft className="size-4" />
          <span>{d.backToList}</span>
        </button>
      </div>
    )
  }

  return (
    <div className="pb-16" dir={dir}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Workspace", href: "/exhibitions/admin/applications" },
          { label: d.detailsTitle }
        ]}
      />

      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/exhibitions/admin/applications")}
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-secondary shrink-0"
          >
            <ArrowLeft className={`size-4 ${dir === "rtl" ? "rotate-180" : ""}`} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-foreground">{d.detailsTitle}</h1>
            <p className="text-xs font-medium text-muted-foreground leading-relaxed">{d.subtitle}</p>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex gap-3 items-center text-xs font-semibold text-destructive">
            <ShieldAlert className="size-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/5 p-4 flex gap-3 items-center text-xs font-semibold text-green-600 dark:text-green-400">
            <CheckCircle2 className="size-5 shrink-0 text-green-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {placeholderLogged && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-500/10 dark:bg-blue-950/30 p-4 flex gap-3 items-center text-xs font-semibold text-blue-600 dark:text-blue-400">
            <HelpCircle className="size-5 shrink-0" />
            <span>{d.requestInfoMsg}</span>
          </div>
        )}

        {application && (
          <div className="space-y-6">
            {/* Status Section */}
            <div className="rounded-[20px] border border-border bg-card p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">{d.status}</span>
                <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black w-fit mt-1 ${getStatusBadge(application.status).classes}`}>
                  {getStatusBadge(application.status).icon}
                  <span>{getStatusBadge(application.status).label}</span>
                </div>
              </div>

              {application.reviewedAt && (
                <div className="text-right text-xs font-medium text-muted-foreground">
                  <p>{d.submittedDate}: {new Date(application.submittedAt).toLocaleDateString()}</p>
                  <p className="mt-0.5">Reviewed on {new Date(application.reviewedAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {/* Company Profile Section */}
            <div className="rounded-[20px] border border-border bg-card p-6 space-y-4 shadow-sm">
              <h2 className="text-sm font-black text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                <Building2 className="size-4 text-primary" />
                <span>{d.companyInfo}</span>
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase">Company Name</span>
                  <p className="text-xs font-black text-foreground">{application.companyName}</p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase">{d.exhibitorCategory}</span>
                  <p className="text-xs font-black text-foreground">{application.businessCategory}</p>
                </div>

                <div className="space-y-0.5 sm:col-span-2">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase">{d.shortDescription}</span>
                  <p className="text-xs font-semibold text-foreground leading-relaxed">{application.shortDescription}</p>
                </div>
              </div>
            </div>

            {/* Contact Details Section */}
            <div className="rounded-[20px] border border-border bg-card p-6 space-y-4 shadow-sm">
              <h2 className="text-sm font-black text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                <Mail className="size-4 text-primary" />
                <span>{d.contactInfo}</span>
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase">Contact Person</span>
                  <p className="text-xs font-black text-foreground">{application.contactPerson}</p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase">Email Address</span>
                  <p className="text-xs font-semibold text-primary">{application.email}</p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase">Phone Number</span>
                  <p className="text-xs font-semibold text-foreground">{application.phone}</p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase">Country</span>
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Globe2 className="size-3.5 text-primary shrink-0" />
                    <span>{application.country === "TN" ? "Tunisia (🇹🇳)" : application.country}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Message to Organizer */}
            {application.message && (
              <div className="rounded-[20px] border border-border bg-card p-6 space-y-3 shadow-sm">
                <h2 className="text-sm font-black text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                  <MessageSquare className="size-4 text-primary" />
                  <span>{d.message}</span>
                </h2>
                <p className="text-xs font-medium text-foreground whitespace-pre-line leading-relaxed">
                  {application.message}
                </p>
              </div>
            )}

            {/* Review Notes Section */}
            <div className="rounded-[20px] border border-border bg-card p-6 space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-border/40 pb-2">
                <h2 className="text-sm font-black text-foreground flex items-center gap-2">
                  <Tag className="size-4 text-primary" />
                  <span>{d.reviewNotesLabel}</span>
                </h2>
                <span className="text-[10px] text-muted-foreground font-semibold">{d.characterLimit}</span>
              </div>

              <textarea
                rows={4}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                disabled={application.status !== "Pending" || actionLoading}
                placeholder={d.reviewNotesPlaceholder}
                className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none min-h-[80px] leading-relaxed disabled:opacity-75"
              />
            </div>

            {/* Action Buttons */}
            {application.status === "Pending" && (
              <div className="flex flex-col gap-3 pt-4">
                <div className="flex flex-wrap gap-3">
                  {/* Approve Action */}
                  <button
                    onClick={() => handleAction("Approve")}
                    disabled={actionLoading}
                    className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground px-5 py-3.5 text-xs font-black transition-all min-h-11"
                  >
                    {actionLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    <span>{d.approveBtn}</span>
                  </button>

                  {/* Reject Action */}
                  <button
                    onClick={() => handleAction("Reject")}
                    disabled={actionLoading}
                    className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 rounded-xl border-2 border-destructive bg-transparent hover:bg-destructive/5 text-destructive px-5 py-3.5 text-xs font-black transition-all min-h-11"
                  >
                    {actionLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <XCircle className="size-4" />
                    )}
                    <span>{d.rejectBtn}</span>
                  </button>
                </div>

                {/* Request More Information (simulation placeholder) */}
                <button
                  onClick={handleRequestInfoPlaceholder}
                  disabled={actionLoading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-secondary text-foreground px-5 py-3 text-xs font-black transition-all min-h-11"
                >
                  <Send className="size-4 text-primary" />
                  <span>{d.requestInfoBtn}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
