"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
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
  Bookmark,
  Star,
  QrCode,
  Tag,
  Edit2
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import {
  fetchBoothDetails,
  saveFavorite,
  removeFavoriteItem,
  trackRecentlyViewedItem,
  savePrivateNote,
  fetchVisitorNotes,
  deletePrivateNote,
  fetchFavorites
} from "@/lib/services/exhibitions-client"
import type { ExhibitionBooth, ExhibitionVisitorNote, ExhibitionFavorite } from "@/lib/domains/exhibition/types"
import { MarketplaceShell, Breadcrumbs, MessageState } from "@/components/marketplace/shell"
import { directoryT } from "@/lib/directory-i18n"

export default function ExhibitionBoothPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { slug, id } = use(params)
  return (
    <MarketplaceShell>
      <ExhibitionBoothContent slug={slug} id={id} />
    </MarketplaceShell>
  )
}

function ExhibitionBoothContent({ slug, id }: { slug: string; id: string }) {
  const { t, lang, dir } = useLanguage()
  const exT = t.exhibitions
  const dirT = directoryT[lang] || directoryT.en

  const [booth, setBooth] = useState<ExhibitionBooth | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Visitor state
  const visitorId = "visitor-local"
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [savedExhibits, setSavedExhibits] = useState<Record<string, boolean>>({})

  // Private notepad state
  const [visitorNoteText, setVisitorNoteText] = useState("")
  const [visitorTagsText, setVisitorTagsText] = useState("")
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [noteSaveSuccess, setNoteSaveSuccess] = useState(false)

  // Request Meeting Form states
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [meetingDate, setMeetingDate] = useState("")
  const [meetingTime, setMeetingTime] = useState("10:00 - 11:00")
  const [meetingPurpose, setMeetingPurpose] = useState("Sourcing Contracts")
  const [meetingVolume, setMeetingVolume] = useState("1,000 - 5,000 units")
  const [meetingLanguage, setMeetingLanguage] = useState(lang === "ar" ? "Arabic" : lang === "fr" ? "French" : "English")
  const [meetingNotes, setMeetingNotes] = useState("")
  const [meetingSubmitting, setMeetingSubmitting] = useState(false)
  const [meetingSuccess, setMeetingSuccess] = useState(false)

  // Request Quotation popup states
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quoteProduct, setQuoteProduct] = useState("")
  const [quoteQuantity, setQuoteQuantity] = useState("")
  const [quoteDetails, setQuoteDetails] = useState("")
  const [quoteSubmitting, setQuoteSubmitting] = useState(false)
  const [quoteSuccess, setQuoteSuccess] = useState(false)

  // QR Modal states
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrCodeURI, setQrCodeURI] = useState("")
  const [loadingQR, setLoadingQR] = useState(false)

  // Video playback overlay state
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    // Track recently viewed
    trackRecentlyViewedItem(visitorId, "booth", id)

    fetchBoothDetails(slug, id).then((res) => {
      if (!active) return
      if (res.error || !res.data) {
        setError(true)
        setLoading(false)
        return
      }
      setBooth(res.data)
      setLoading(false)
    }).catch(() => {
      if (active) {
        setError(true)
        setLoading(false)
      }
    })

    // Fetch existing bookmarks and notes
    fetchFavorites(visitorId).then((favs: ExhibitionFavorite[]) => {
      if (!active) return
      const matchedBooth = favs.some(f => f.targetType === "booth" && f.targetId === id)
      setIsBookmarked(matchedBooth)

      const map: Record<string, boolean> = {}
      favs.forEach(f => {
        if (f.targetType === "exhibit") map[f.targetId] = true
      })
      setSavedExhibits(map)
    })

    fetchVisitorNotes(visitorId, id).then((notes) => {
      if (!active) return
      if (notes && notes.length > 0) {
        setVisitorNoteText(notes[0].noteText)
        setVisitorTagsText(notes[0].tags.join(", "))
      }
    })

    return () => {
      active = false
    }
  }, [slug, id])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3" dir={dir}>
        <Loader2 className="size-8 text-primary animate-spin" />
        <span className="text-xs font-bold text-muted-foreground">{t.marketplace.loading}</span>
      </div>
    )
  }

  if (error || !booth || !booth.company) {
    return (
      <MessageState
        icon={<Building2 className="size-7 text-muted-foreground" />}
        title={exT.boothNotFound}
        description={exT.boothNotFoundDesc}
        action={<Link href={`/exhibitions/${slug}`} className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all active:scale-95 min-h-11 flex items-center justify-center">{exT.backToExhibition}</Link>}
      />
    )
  }

  const comp = booth.company
  const compLoc = [comp.city ? (dirT.cities[comp.city] || comp.city) : null, comp.country ? (dirT.countries[comp.country as keyof typeof dirT.countries] || comp.country) : null].filter(Boolean).join(", ")

  // Bookmark Toggle
  const toggleBookmark = async () => {
    try {
      if (isBookmarked) {
        const success = await removeFavoriteItem(visitorId, "booth", id)
        if (success) setIsBookmarked(false)
      } else {
        const res = await saveFavorite(visitorId, "booth", id)
        if (res.data) setIsBookmarked(true)
      }
    } catch (err) {
      console.error("Bookmark toggle failure:", err)
    }
  }

  // Exhibit Bookmark Toggle
  const toggleExhibitBookmark = async (exhibitId: string) => {
    try {
      const isSaved = savedExhibits[exhibitId]
      if (isSaved) {
        const success = await removeFavoriteItem(visitorId, "exhibit", exhibitId)
        if (success) {
          setSavedExhibits(prev => ({ ...prev, [exhibitId]: false }))
        }
      } else {
        const res = await saveFavorite(visitorId, "exhibit", exhibitId)
        if (res.data) {
          setSavedExhibits(prev => ({ ...prev, [exhibitId]: true }))
        }
      }
    } catch (err) {
      console.error("Exhibit bookmark toggle failure:", err)
    }
  }

  // Save private notepad notes
  const handleSavePrivateNotes = async () => {
    setIsSavingNote(true)
    try {
      const tags = visitorTagsText.split(",").map(t => t.trim()).filter(Boolean)
      const res = await savePrivateNote(visitorId, id, visitorNoteText, tags)
      if (res.data) {
        setNoteSaveSuccess(true)
        setTimeout(() => setNoteSaveSuccess(false), 2000)
      }
    } catch (err) {
      console.error("Save private notes failure:", err)
    } finally {
      setIsSavingNote(false)
    }
  }

  // Submit Meeting Request to our mock API
  const handleMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!meetingDate) return

    setMeetingSubmitting(true)
    try {
      const res = await fetch("/api/exhibitions/visitor/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          boothId: booth.id,
          companyId: comp.id,
          preferredDate: meetingDate,
          preferredTime: meetingTime,
          purpose: meetingPurpose,
          expectedVolume: meetingVolume,
          preferredLanguage: meetingLanguage,
          notes: meetingNotes,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMeetingSuccess(true)
        setTimeout(() => {
          setShowMeetingModal(false)
          setMeetingSuccess(false)
          setMeetingDate("")
          setMeetingNotes("")
        }, 2500)
      }
    } catch (err) {
      console.error("Meeting request failure:", err)
    } finally {
      setMeetingSubmitting(false)
    }
  }

  // Submit Quotation Request Form
  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quoteProduct.trim() || !quoteQuantity.trim()) return

    setQuoteSubmitting(true)
    try {
      const res = await fetch("/api/rfqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: quoteProduct,
          quantity: quoteQuantity,
          details: quoteDetails,
          companyId: comp.id,
        }),
      })
      if (res.ok) {
        setQuoteSuccess(true)
        setTimeout(() => {
          setShowQuoteModal(false)
          setQuoteSuccess(false)
          setQuoteProduct("")
          setQuoteQuantity("")
          setQuoteDetails("")
        }, 2500)
      }
    } catch (err) {
      console.error("Quote submit failure:", err)
    } finally {
      setQuoteSubmitting(false)
    }
  }

  // Load and display QR code overlay
  const handleOpenQR = async () => {
    setShowQRModal(true)
    setLoadingQR(true)
    try {
      const res = await fetch(`/api/exhibitions/visitor/qr?boothId=${id}`)
      const json = await res.json()
      if (json.success && json.data) {
        setQrCodeURI(json.data.svg)
      }
    } catch (err) {
      console.error("Fetch QR Code error:", err)
    } finally {
      setLoadingQR(false)
    }
  }

  // Filter exhibition media types
  const imagesMedia = booth.media?.filter((m) => m.mediaType === "image") || []
  const videosMedia = booth.media?.filter((m) => m.mediaType === "video") || []

  return (
    <div className="pb-16" dir={dir}>
      <Breadcrumbs
        items={[
          { label: t.marketplace.breadcrumbHome, href: "/" },
          { label: exT.title, href: "/exhibitions" },
          { label: exT.backToExhibition, href: `/exhibitions/${slug}` },
          { label: comp.name },
        ]}
      />

      {/* Hero Header Area: Booth Cover Banner + Overlapping Logo */}
      <section className="relative bg-card border-b border-border">
        {/* Banner Area */}
        <div className="h-44 w-full overflow-hidden bg-gradient-to-r from-blue-950 via-[#1E3A8A] to-slate-900 sm:h-64 relative">
          {booth.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={booth.bannerUrl} alt={comp.name} loading="lazy" className="size-full object-cover" />
          ) : (
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          )}

          {/* Exclusive Exhibition Badge */}
          <div className="absolute top-4 right-4 bg-primary px-3 py-1.5 rounded-full text-[10px] font-extrabold text-white flex items-center gap-1.5 shadow-md">
            <Sparkles className="size-3" />
            <span className="uppercase">{exT.virtualExhibitor}</span>
          </div>
        </div>

        {/* Brand identity overlay */}
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-16 relative">
          {/* Logo container */}
          <div className="absolute -top-16 start-6 size-24 sm:size-28 rounded-3xl border-4 border-card bg-white shadow-xl flex items-center justify-center overflow-hidden shrink-0">
            {comp.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={comp.logoUrl} alt={comp.name} loading="lazy" className="size-full object-contain p-2" />
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
                  {comp.name}
                </h1>
                {comp.verified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <Shield className="size-4 shrink-0 text-emerald-500" />
                    <span>{exT.verifiedExhibitor}</span>
                  </span>
                )}
              </div>

              {comp.tagline && (
                <p className="mt-1 text-sm font-semibold text-muted-foreground">
                  {comp.tagline}
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

            {/* CTA Buttons */}
            <div className="shrink-0 flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Bookmark booth */}
              <button
                onClick={toggleBookmark}
                className={`size-11 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  isBookmarked
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                    : "border-border bg-card hover:bg-secondary/40 text-muted-foreground"
                }`}
              >
                <Bookmark className={`size-5 ${isBookmarked ? "fill-amber-500" : ""}`} />
              </button>

              {/* QR Code view */}
              <button
                onClick={handleOpenQR}
                className="size-11 rounded-xl border border-border bg-card hover:bg-secondary/40 flex items-center justify-center text-muted-foreground cursor-pointer transition-all"
              >
                <QrCode className="size-5 text-primary" />
              </button>

              {/* Schedule meeting */}
              <button
                onClick={() => setShowMeetingModal(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-xs font-extrabold text-white py-3.5 px-5 transition-all shadow-md shadow-primary/10 hover:shadow-lg cursor-pointer active:scale-95 min-h-11"
              >
                <Calendar className="size-4" />
                <span>{exT.requestMeeting}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Booth layout */}
      <div className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Columns (Exhibition specific description + Exhibits + Gallery + Videos) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Booth custom description */}
          <section className="bg-card border border-border rounded-[20px] p-6 shadow-sm">
            <h2 className="text-base font-black text-foreground tracking-tight mb-4 flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              <span>{exT.showcaseSummary}</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {booth.description}
            </p>
          </section>

          {/* Exhibition Exhibits (Exhibits - NOT marketplace products) */}
          <section className="bg-card border border-border rounded-[20px] p-6 shadow-sm space-y-6">
            <h2 className="text-base font-black text-foreground tracking-tight flex items-center gap-2">
              <FileCheck className="size-5 text-primary" />
              <span>{exT.exhibitsInnovations}</span>
            </h2>

            {!booth.exhibits || booth.exhibits.length === 0 ? (
              <p className="text-xs text-muted-foreground italic bg-secondary/25 p-4 rounded-xl text-center border border-dashed border-border">
                {exT.noExhibits}
              </p>
            ) : (
              <div className="space-y-6">
                {booth.exhibits.map((exhibit) => {
                  const hasImage = exhibit.images && exhibit.images.length > 0
                  const isExhibitSaved = savedExhibits[exhibit.id] || false

                  return (
                    <div
                      key={exhibit.id}
                      className="flex flex-col sm:flex-row gap-5 p-4 rounded-xl border border-border/70 bg-secondary/15 transition-all hover:border-primary/30"
                    >
                      {/* Exhibit media photo */}
                      {hasImage ? (
                        <div className="relative w-full sm:w-40 aspect-square sm:aspect-auto sm:h-32 rounded-xl overflow-hidden border border-border shrink-0 bg-secondary">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={exhibit.images[0]} alt={exhibit.name} loading="lazy" className="size-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-full sm:w-40 h-32 rounded-xl bg-secondary flex items-center justify-center shrink-0 border border-border">
                          <Building2 className="size-8 text-muted-foreground" />
                        </div>
                      )}

                      {/* Exhibit Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <h3 className="text-sm font-black text-foreground truncate">{exhibit.name}</h3>
                              {exhibit.isFeatured && (
                                <span className="text-[9px] font-extrabold uppercase bg-amber-500/10 border border-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded">
                                  {exT.featuredExhibit}
                                </span>
                              )}
                            </div>

                            {/* Bookmark exhibit */}
                            <button
                              onClick={() => toggleExhibitBookmark(exhibit.id)}
                              className={`size-8 rounded-lg border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                isExhibitSaved
                                  ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                                  : "border-border bg-card hover:bg-secondary/40 text-muted-foreground"
                              }`}
                            >
                              <Bookmark className={`size-4.5 ${isExhibitSaved ? "fill-amber-500" : ""}`} />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                            {exhibit.description}
                          </p>
                        </div>

                        {/* Brochure download CTA if available */}
                        {exhibit.brochureUrl && (
                          <div className="flex flex-wrap gap-2 pt-3">
                            <a
                              href={exhibit.brochureUrl}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[10px] font-black text-foreground transition-all hover:bg-secondary/40 min-h-11"
                            >
                              <Download className="size-3.5 text-primary" />
                              <span>{exT.brochure}</span>
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

          {/* Exhibition Gallery & Media */}
          {imagesMedia.length > 0 && (
            <section className="bg-card border border-border rounded-[20px] p-6 shadow-sm space-y-4">
              <h2 className="text-base font-black text-foreground tracking-tight flex items-center gap-2">
                <Layers className="size-5 text-primary" />
                <span>{exT.galleryPhotos}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {imagesMedia.map((med) => (
                  <div key={med.id} className="relative group rounded-xl overflow-hidden border border-border bg-secondary aspect-video">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={med.url} alt={med.caption || ""} loading="lazy" className="size-full object-cover transition-all group-hover:scale-105" />
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
                <span>{exT.demosVideos}</span>
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
                    {/* caption block */}
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

        {/* Right Column (Exhibitor documents + Private Notepad + Contact Links) */}
        <div className="space-y-8">

          {/* Catalog PDFs & Brochures */}
          <section className="bg-card border border-border rounded-[20px] p-6 shadow-sm space-y-4">
            <h2 className="text-base font-black text-foreground tracking-tight border-b border-border/60 pb-3 flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              <span>{exT.catalogPdfs}</span>
            </h2>

            {!booth.documents || booth.documents.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic">{exT.noPdf}</p>
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

          {/* Private Notes Notepad */}
          <section className="bg-card border border-border rounded-[20px] p-6 shadow-sm space-y-4">
            <h2 className="text-base font-black text-foreground tracking-tight border-b border-border/60 pb-3 flex items-center gap-2">
              <Bookmark className="size-5 text-primary" />
              <span>{lang === "ar" ? "مفكرة الملاحظات الخاصة" : lang === "fr" ? "Notes Privées" : "Private Visitor Notes"}</span>
            </h2>

            <div className="space-y-3">
              <p className="text-[10px] text-muted-foreground leading-normal">
                {lang === "ar"
                  ? "اكتب ملاحظاتك الخاصة وتصنيفاتك حول هذا العارض لتسهيل تذكره ومراجعته لاحقاً في لوحتك."
                  : lang === "fr"
                  ? "Enregistrez des notes privées et des tags pour organiser votre visite."
                  : "Draft private notes and tags about this exhibitor. Accessible only in your visitor dashboard."}
              </p>

              <textarea
                value={visitorNoteText}
                onChange={(e) => setVisitorNoteText(e.target.value)}
                placeholder="Write private notes on pricing, lead times, export specs..."
                rows={4}
                className="w-full rounded-xl border border-border bg-secondary/15 p-3 text-xs outline-none focus:border-primary resize-none"
              />

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-muted-foreground">Personal Tags (Comma separated)</label>
                <input
                  type="text"
                  value={visitorTagsText}
                  onChange={(e) => setVisitorTagsText(e.target.value)}
                  placeholder="e.g. Olive Oil, Premium, Sfax"
                  className="w-full rounded-xl border border-border bg-secondary/15 px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <button
                onClick={handleSavePrivateNotes}
                disabled={isSavingNote}
                className="w-full rounded-xl bg-secondary hover:bg-secondary/75 py-2.5 text-xs font-black text-foreground cursor-pointer flex items-center justify-center gap-2 min-h-11 transition-all"
              >
                {isSavingNote ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : noteSaveSuccess ? (
                  <Check className="size-4 text-emerald-500" />
                ) : (
                  <span>{lang === "ar" ? "حفظ الملاحظة" : lang === "fr" ? "Enregistrer" : "Save Notes"}</span>
                )}
              </button>
            </div>
          </section>

          {/* Contact Details */}
          <section className="bg-card border border-border rounded-[20px] p-6 shadow-sm space-y-4">
            <h2 className="text-base font-black text-foreground tracking-tight border-b border-border/60 pb-3 flex items-center gap-2">
              <Mail className="size-5 text-primary" />
              <span>{exT.contact}</span>
            </h2>

            <div className="space-y-3">
              {comp.whatsappNumber && (
                <a
                  href={`https://wa.me/${comp.whatsappNumber.replace(/[^0-9]/g, "")}?text=Hi! I visited your booth at ${exT.title}. I would like to request information on your showcased exhibits.`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center gap-3 p-3.5 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold text-xs transition-all min-h-11"
                >
                  <svg className="size-5 fill-current shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.74 0-2.597-1.012-5.05-2.848-6.87C16.656 2.175 14.211 1.157 11.998 1.157c-5.44 0-9.866 4.372-9.87 9.743-.001 1.748.465 3.453 1.348 4.953l-.986 3.6 3.731-.968c1.517.825 3.03 1.259 4.336 1.259z"/></svg>
                  <span className="truncate">{exT.chatWhatsapp}</span>
                </a>
              )}

              {/* Request Quotation */}
              <button
                onClick={() => setShowQuoteModal(true)}
                className="w-full flex items-center gap-3 p-3.5 bg-primary/10 border border-primary/20 hover:bg-primary/15 rounded-xl text-primary font-bold text-xs transition-all min-h-11 cursor-pointer"
              >
                <FileCheck className="size-5 shrink-0" />
                <span>{lang === "ar" ? "طلب عرض سعر رسمي" : lang === "fr" ? "Demander Devis" : "Request Official Quotation"}</span>
              </button>

              {comp.businessEmail && (
                <a
                  href={`mailto:${comp.businessEmail}?subject=ALSOUK Exhibition Enquiry - ${comp.name}`}
                  className="w-full flex items-center gap-3 p-3.5 bg-secondary/50 border border-border hover:bg-secondary rounded-xl text-foreground font-bold text-xs transition-all min-h-11"
                >
                  <Mail className="size-5 text-muted-foreground shrink-0" />
                  <span className="truncate">{exT.sendEmail}</span>
                </a>
              )}

              {comp.phoneNumber && (
                <a
                  href={`tel:${comp.phoneNumber}`}
                  className="w-full flex items-center gap-3 p-3.5 bg-secondary/50 border border-border hover:bg-secondary rounded-xl text-foreground font-bold text-xs transition-all min-h-11"
                >
                  <Phone className="size-5 text-muted-foreground shrink-0" />
                  <span className="truncate flex items-center gap-1">
                    <span>{exT.callLabel}</span>
                    <span className="font-mono text-[11px]">{comp.phoneNumber}</span>
                  </span>
                </a>
              )}
            </div>
          </section>

        </div>

      </div>

      {/* MODAL 1: B2B Private Meeting Request Form Overlay */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200" dir={dir}>
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <Calendar className="size-5 text-primary" />
                <span>{exT.requestMeetingTitle}</span>
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
                  <h4 className="text-base font-black text-foreground">{exT.meetingSuccess}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {exT.meetingSuccessDesc}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleMeetingSubmit} className="space-y-4">
                <p className="text-xs text-muted-foreground leading-normal">
                  {exT.requestMeetingDesc}
                </p>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">
                    {exT.meetingDate} *
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
                    {exT.meetingTime} *
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

                {/* Additional requested fields */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">
                    Meeting Purpose *
                  </label>
                  <input
                    type="text"
                    required
                    value={meetingPurpose}
                    onChange={(e) => setMeetingPurpose(e.target.value)}
                    placeholder="e.g. Sourcing cold-pressed olive oils, custom yarns..."
                    className="w-full rounded-xl border border-border bg-secondary/15 px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-11"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground">
                      Expected Purchase Volume *
                    </label>
                    <input
                      type="text"
                      required
                      value={meetingVolume}
                      onChange={(e) => setMeetingVolume(e.target.value)}
                      placeholder="e.g. 5,000 Liters, 100 sets..."
                      className="w-full rounded-xl border border-border bg-secondary/15 px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-11"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground">
                      Preferred Language *
                    </label>
                    <select
                      value={meetingLanguage}
                      onChange={(e) => setMeetingLanguage(e.target.value)}
                      className="w-full rounded-xl border border-border bg-secondary/15 px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-11 pr-10"
                    >
                      <option value="Arabic">العربية (Arabic)</option>
                      <option value="French">Français (French)</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">
                    {exT.meetingNotes}
                  </label>
                  <textarea
                    value={meetingNotes}
                    onChange={(e) => setMeetingNotes(e.target.value)}
                    placeholder={exT.meetingNotesPlaceholder}
                    rows={3}
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
                        <span>{exT.meetingSubmitting}</span>
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        <span>{exT.meetingSubmit}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMeetingModal(false)}
                    className="rounded-xl border border-border px-4 py-3.5 hover:bg-secondary/40 text-xs font-bold text-foreground transition-all cursor-pointer min-h-11"
                  >
                    {exT.cancel}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Request Quotation Overlay Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200" dir={dir}>
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <FileCheck className="size-5 text-primary" />
                <span>{lang === "ar" ? "طلب عرض سعر رسمي" : lang === "fr" ? "Demander Devis" : "Request Quotation"}</span>
              </h3>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="size-8 rounded-xl border border-border hover:bg-secondary/40 flex items-center justify-center text-muted-foreground cursor-pointer min-h-11"
              >
                <X className="size-4" />
              </button>
            </div>

            {quoteSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="size-14 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 flex items-center justify-center mx-auto">
                  <Check className="size-6" />
                </div>
                <div>
                  <h4 className="text-base font-black text-foreground">RFQ Submitted Successfully</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your buying request has been recorded for the exhibitor.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="space-y-4">
                <p className="text-xs text-muted-foreground leading-normal">
                  Send a direct product sourcing request to this exhibitor. They will reply with a detailed price spec.
                </p>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">
                    Product/Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={quoteProduct}
                    onChange={(e) => setQuoteProduct(e.target.value)}
                    placeholder="e.g. Cold-Pressed Sfax Reserve Olive Oil"
                    className="w-full rounded-xl border border-border bg-secondary/15 px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-11"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">
                    Expected Sourcing Quantity *
                  </label>
                  <input
                    type="text"
                    required
                    value={quoteQuantity}
                    onChange={(e) => setQuoteQuantity(e.target.value)}
                    placeholder="e.g. 5,000 Liters, 1,000 Meters"
                    className="w-full rounded-xl border border-border bg-secondary/15 px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-11"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">
                    Inquiry Details / Custom Specifications
                  </label>
                  <textarea
                    value={quoteDetails}
                    onChange={(e) => setQuoteDetails(e.target.value)}
                    placeholder="Describe specific packaging, shipping terms, or target certifications required..."
                    rows={4}
                    className="w-full rounded-xl border border-border bg-secondary/15 p-3 text-xs outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={quoteSubmitting}
                    className="flex-1 rounded-xl bg-gradient-to-r from-primary to-blue-600 py-3.5 text-xs font-black text-white hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2 min-h-11"
                  >
                    {quoteSubmitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="size-4" />
                        <span>Submit RFQ</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuoteModal(false)}
                    className="rounded-xl border border-border px-4 py-3.5 hover:bg-secondary/40 text-xs font-bold text-foreground transition-all cursor-pointer min-h-11"
                  >
                    {exT.cancel}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: Booth QR Code generator Overlay Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200" dir={dir}>
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <QrCode className="size-5 text-primary" />
                <span>{lang === "ar" ? "رمز الجناح QR" : lang === "fr" ? "Stand QR Code" : "Booth QR Code"}</span>
              </h3>
              <button
                onClick={() => {
                  setShowQRModal(false)
                  setQrCodeURI("")
                }}
                className="size-8 rounded-xl border border-border hover:bg-secondary/40 flex items-center justify-center text-muted-foreground cursor-pointer min-h-11"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="text-center py-4 space-y-4">
              <p className="text-xs text-muted-foreground leading-normal">
                {lang === "ar"
                  ? "قم بمسح هذا الرمز للتوجه فوراً إلى هذا الجناح الافتراضي في هاتفك المحمول."
                  : lang === "fr"
                  ? "Scannez ce code pour ouvrir instantanément ce stand sur votre mobile."
                  : "Scan this unique code to quickly pull up this virtual booth profile on your smartphone."}
              </p>

              <div className="size-48 rounded-2xl border border-border bg-white flex items-center justify-center mx-auto p-4 relative">
                {loadingQR ? (
                  <Loader2 className="size-8 text-primary animate-spin" />
                ) : qrCodeURI ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrCodeURI} alt="Booth QR Code" className="size-full object-contain" />
                ) : (
                  <span className="text-[11px] text-muted-foreground">Error generating QR</span>
                )}
              </div>

              <div className="bg-secondary/25 border border-border/50 p-2 rounded-xl text-[10px] font-mono text-muted-foreground select-all break-all">
                ID: {id}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Simple Video Overlay player */}
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
