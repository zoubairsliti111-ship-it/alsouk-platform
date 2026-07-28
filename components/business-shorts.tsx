"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  MessageSquare,
  Share2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Send
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { Button } from "@/components/ui/button"

// Simulated factory/craft process shorts
const SHORTS = [
  {
    id: "short-1",
    title: "Cold-pressing Extra Virgin Olive Oil",
    titleAr: "عصر زيت الزيتون البكر الممتاز على البارد",
    titleFr: "Pressage à froid de l'huile d'olive extra vierge",
    supplier: "Medina Olive Co.",
    city: "Sfax",
    cityAr: "صفاقس",
    cityFr: "Sfax",
    views: "12.4K",
    likes: "3.2K",
    image: "/images/product-oliveoil.png",
    accentColor: "from-emerald-500/20 to-teal-500/20",
    tags: ["Agriculture", "Organic"],
    tagsAr: ["فلاحة", "عضوي"],
    tagsFr: ["Agriculture", "Biologique"],
    description: "Watch our automated premium cold-pressing extraction line in Sfax, operating at peak hygiene standards to deliver pure Tunisian gold.",
    descriptionAr: "شاهد خط الاستخراج الممتاز بالضغط البارد المؤتمت في صفاقس، والذي يعمل بأعلى معايير النظافة لتقديم الذهب التونسي النقي.",
    descriptionFr: "Découvrez notre ligne d'extraction à froid haut de gamme à Sfax, garantissant une hygiène optimale pour offrir l'or pur de Tunisie.",
    link: "/suppliers/1"
  },
  {
    id: "short-2",
    title: "Hand-painting Traditional Ceramic Tiles",
    titleAr: "طلاء بلاط السيراميك التقليدي يدويًا",
    titleFr: "Peinture à la main de carreaux de céramique traditionnels",
    supplier: "Atlas Ceramics",
    city: "Nabeul",
    cityAr: "نابل",
    cityFr: "Nabeul",
    views: "8.9K",
    likes: "2.1K",
    image: "/images/product-ceramics.png",
    accentColor: "from-blue-500/20 to-sky-500/20",
    tags: ["Handicrafts", "Design"],
    tagsAr: ["صناعات تقليدية", "تصميم"],
    tagsFr: ["Artisanat", "Design"],
    description: "Our master artisans in Nabeul paint custom Moorish tiles for luxury hospitality projects worldwide. Experience Tunisian craftsmanship.",
    descriptionAr: "يرسم الحرفيون المهرة لدينا في نابل بلاطًا موريسكيًا مخصصًا لمشاريع الضيافة الفاخرة حول العالم. اختبر الحرفية التونسية.",
    descriptionFr: "Nos maîtres artisans à Nabeul peignent des carreaux mauresques personnalisés pour des projets hôteliers de luxe. L'artisanat tunisien.",
    link: "/suppliers/3"
  },
  {
    id: "short-3",
    title: "Jacquard Looming for Carthage Textiles",
    titleAr: "النسيج بجاكارد لنسيج قرطاج",
    titleFr: "Tissage Jacquard pour Carthage Textiles",
    supplier: "Carthage Textiles",
    city: "Monastir",
    cityAr: "المنستير",
    cityFr: "Monastir",
    views: "15.1K",
    likes: "4.5K",
    image: "/images/product-textiles.png",
    accentColor: "from-indigo-500/20 to-purple-500/20",
    tags: ["Textiles", "Industrial"],
    tagsAr: ["منسوجات", "صناعي"],
    tagsFr: ["Textiles", "Industriel"],
    description: "Inside our modern facility in Monastir. High-speed Jacquard looms weaving 100% premium Tunisian organic cotton fabrics.",
    descriptionAr: "داخل منشأتنا الحديثة في المنستير. نول جاكارد عالي السرعة ينسج أقمشة قطنية عضوية تونسية فاخرة بنسبة 100٪.",
    descriptionFr: "Au cœur de notre usine moderne à Monastir. Métiers à tisser Jacquard à grande vitesse tissant du coton biologique tunisien.",
    link: "/suppliers/2"
  },
  {
    id: "short-4",
    title: "Premium Date Sorting & Export Packaging",
    titleAr: "فرز وتعبئة تمور دقلة النور الفاخرة للتصدير",
    titleFr: "Tri et conditionnement des dattes Deglet Nour de qualité supérieure",
    supplier: "Sahara Dates Export",
    city: "Tozeur",
    cityAr: "توزر",
    cityFr: "Tozeur",
    views: "10.2K",
    likes: "2.8K",
    image: "/images/product-dates.png",
    accentColor: "from-amber-500/20 to-orange-500/20",
    tags: ["Dates", "Export"],
    tagsAr: ["تمور", "تصدير"],
    tagsFr: ["Dattes", "Export"],
    description: "Harvested fresh from Tozeur, our dates undergo meticulous laser sorting and clean-room packaging for direct global distribution.",
    descriptionAr: "تُجنى تمورنا طازجة من توزر، وتخضع لفرز دقيق بالليزر وتعبئة في غرف معقمة للتوزيع العالمي المباشر.",
    descriptionFr: "Récoltées fraîches à Tozeur, nos dattes subissent un tri laser méticuleux et un emballage en salle blanche pour l'exportation.",
    link: "/suppliers/4"
  }
]

export function BusinessShorts() {
  const { lang, t, dir } = useLanguage()
  const [activeIndex, setActiveIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(true)
  const [showInquiryModal, setShowInquiryModal] = useState(false)
  const [inquiryText, setInquiryText] = useState("")
  const [inquirySubmitted, setInquirySubmitted] = useState(false)

  const activeShort = SHORTS[activeIndex]

  // Translation helpers
  const getTitle = (item: typeof SHORTS[0]) => {
    if (lang === "ar") return item.titleAr
    if (lang === "fr") return item.titleFr
    return item.title
  }

  const getCity = (item: typeof SHORTS[0]) => {
    if (lang === "ar") return item.cityAr
    if (lang === "fr") return item.cityFr
    return item.city
  }

  const getDesc = (item: typeof SHORTS[0]) => {
    if (lang === "ar") return item.descriptionAr
    if (lang === "fr") return item.descriptionFr
    return item.description
  }

  const getTags = (item: typeof SHORTS[0]) => {
    if (lang === "ar") return item.tagsAr
    if (lang === "fr") return item.tagsFr
    return item.tags
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % SHORTS.length)
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + SHORTS.length) % SHORTS.length)
  }

  const handleTogglePlay = () => {
    setPlaying(!playing)
  }

  const handleToggleMute = () => {
    setMuted(!muted)
  }

  const handleInquire = () => {
    setShowInquiryModal(true)
    setInquirySubmitted(false)
    setInquiryText("")
  }

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault()
    setInquirySubmitted(true)
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <PremiumBadge variant="accent" className="mb-2">
            <Sparkles className="size-3.5" />
            {lang === "ar" ? "ألسوق شورتس للأعمال" : lang === "fr" ? "Shorts d'affaires ALSOUK" : "ALSOUK Business Shorts"}
          </PremiumBadge>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {lang === "ar" ? "شاهد الإنتاج في قلب المصانع" : lang === "fr" ? "Découvrez la production en direct" : "Watch Production in Real-Time"}
          </h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            {lang === "ar"
              ? "استكشف خطوط التصنيع التونسية والحرف اليدوية عبر جولات فيديو غامرة"
              : lang === "fr"
              ? "Explorez les lignes de fabrication tunisiennes à travers des visites immersives"
              : "Explore Tunisian manufacturing lines and master craft processes via immersive video tours."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrev} aria-label="Previous story">
            <ChevronLeft className="size-5 rtl:rotate-180" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext} aria-label="Next story">
            <ChevronRight className="size-5 rtl:rotate-180" />
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* TikTok Interactive Mobile Player View */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-black shadow-2xl aspect-[9/16] max-h-[640px] w-full mx-auto lg:aspect-auto lg:h-[500px] flex items-center justify-center">
          {/* Main Visual content simulating live looped video */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={activeShort.image}
              alt={getTitle(activeShort)}
              fill
              className={`object-cover transition-all duration-700 ${playing ? "scale-105 filter saturate-[1.1]" : "scale-100 filter brightness-75 blur-[2px]"}`}
              priority
            />
            {/* Visual indicator of looping / overlay gradient */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60 transition-opacity duration-300 ${playing ? "opacity-100" : "opacity-80"}`} />

            {/* Subtle animated overlay representing 'live' scanlines or noise */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15),transparent)]" />
          </div>

          {/* Interactive controls */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-6 text-white z-10">
            {/* Top Bar with Supplier Info & Badges */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/20 backdrop-blur-md font-bold text-sm text-primary-foreground border border-white/10">
                  {activeShort.supplier.charAt(0)}
                </span>
                <div>
                  <h4 className="text-sm font-semibold tracking-wide drop-shadow-md">{activeShort.supplier}</h4>
                  <p className="text-[11px] text-white/80 drop-shadow-sm">{getCity(activeShort)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <PremiumBadge variant="glass" className="backdrop-blur-md">
                  <Eye className="size-3" />
                  {activeShort.views}
                </PremiumBadge>
                {playing && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </div>
            </div>

            {/* Play/Pause Large indicator */}
            {!playing && (
              <button
                onClick={handleTogglePlay}
                className="absolute inset-0 m-auto flex size-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white transition-all hover:scale-110 active:scale-95"
              >
                <Play className="size-8 fill-current translate-x-0.5" />
              </button>
            )}

            {/* Bottom metadata details */}
            <div className="mt-auto space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {getTags(activeShort).map((tag, idx) => (
                  <span key={idx} className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>

              <h3 className="text-xl font-bold tracking-tight text-white drop-shadow-md">
                {getTitle(activeShort)}
              </h3>

              <p className="text-xs text-white/90 leading-relaxed max-w-lg line-clamp-2 md:line-clamp-none drop-shadow-sm">
                {getDesc(activeShort)}
              </p>

              {/* Action Toolbar Inside Video (TikTok style) */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleTogglePlay}
                    className="flex items-center justify-center size-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                    aria-label={playing ? "Pause video" : "Play video"}
                  >
                    {playing ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current translate-x-px" />}
                  </button>

                  <button
                    onClick={handleToggleMute}
                    className="flex items-center justify-center size-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                    aria-label={muted ? "Unmute video" : "Mute video"}
                  >
                    {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={activeShort.link}>
                    <Button variant="secondary" size="sm" className="bg-white text-black hover:bg-white/90 h-9 font-semibold rounded-full text-xs">
                      {lang === "ar" ? "زيارة المصنع" : lang === "fr" ? "Visiter l'usine" : "Visit Facility"}
                    </Button>
                  </Link>

                  <Button onClick={handleInquire} size="sm" className="bg-primary text-white hover:bg-primary/90 h-9 font-semibold rounded-full text-xs">
                    {t.products.inquire}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info Panel */}
        <div className="flex flex-col justify-between gap-6">
          <PremiumCard hoverEffect="none" className="p-6 flex-1 flex flex-col justify-between bg-gradient-to-br from-secondary/50 via-background to-secondary/30">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  {lang === "ar" ? "المعلومات الفنية" : lang === "fr" ? "Détails Techniques" : "Technical Insights"}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {lang === "ar" ? "بث مباشر" : lang === "fr" ? "En Direct" : "Live"}
                </span>
              </div>

              <h4 className="mt-4 text-lg font-bold text-foreground">
                {activeShort.supplier}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                {lang === "ar" ? "مركز الإنتاج:" : lang === "fr" ? "Centre de production:" : "Production hub:"} {getCity(activeShort)}
              </p>

              <p className="mt-4 text-sm text-foreground/80 leading-relaxed">
                {getDesc(activeShort)}
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center text-xs py-2 border-b border-border">
                  <span className="text-muted-foreground">{lang === "ar" ? "الطاقة الإنتاجية" : lang === "fr" ? "Capacité de production" : "Production Capacity"}</span>
                  <span className="font-semibold text-foreground">
                    {activeIndex === 0 ? "50,000 L / month" : activeIndex === 1 ? "10,000 pcs / month" : activeIndex === 2 ? "120,000 m / month" : "50 tons / month"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs py-2 border-b border-border">
                  <span className="text-muted-foreground">{lang === "ar" ? "الشهادات الصحية" : lang === "fr" ? "Certifications" : "Certifications"}</span>
                  <span className="font-semibold text-foreground">ISO 22000, HACCP, Halal</span>
                </div>
                <div className="flex justify-between items-center text-xs py-2">
                  <span className="text-muted-foreground">{lang === "ar" ? "سرعة الاستجابة" : lang === "fr" ? "Délai de réponse" : "Response speed"}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">&lt; 3 hours</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-border">
              <Button onClick={handleInquire} className="w-full bg-primary text-white hover:bg-primary/90 rounded-2xl h-11">
                {lang === "ar" ? "طلب عينة أو مواصفات" : lang === "fr" ? "Demander échantillon / spécifications" : "Request Sample / Specifications"}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Button>
            </div>
          </PremiumCard>
        </div>
      </div>

      {/* Inquiry Quick Modal Overlay */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-background border border-border p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {inquirySubmitted ? (
              <div className="text-center py-8">
                <span className="inline-flex size-14 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <h3 className="mt-4 text-xl font-bold text-foreground">
                  {lang === "ar" ? "تم إرسال الاستفسار بنجاح" : lang === "fr" ? "Demande envoyée avec succès" : "Inquiry Sent Successfully!"}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {lang === "ar"
                    ? "لقد تلقى موردنا طلبك وسيقوم بالرد عليك في غضون ٢٤ ساعة."
                    : lang === "fr"
                    ? "Notre fournisseur a bien reçu votre demande et vous répondra sous 24h."
                    : "Our verified supplier has received your specification request and will respond within 24 hours."}
                </p>
                <Button onClick={() => setShowInquiryModal(false)} className="mt-6 rounded-xl w-full">
                  {lang === "ar" ? "إغلاق" : lang === "fr" ? "Fermer" : "Close"}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry}>
                <h3 className="text-lg font-bold text-foreground">
                  {lang === "ar" ? "استفسار سريع:" : lang === "fr" ? "Inquiry Rapide :" : "Quick Inquiry:"} {activeShort.supplier}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === "ar" ? "تواصل مباشرة بخصوص" : lang === "fr" ? "Contact direct pour" : "Direct inquiry regarding"} {getTitle(activeShort)}
                </p>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      {lang === "ar" ? "رسالتك (المواصفات، الكمية المطلوبة)" : lang === "fr" ? "Votre message (spécifications, quantité)" : "Your Message (Specs, Quantity)"}
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={inquiryText}
                      onChange={(e) => setInquiryText(e.target.value)}
                      placeholder={lang === "ar" ? "اكتب تفاصيل طلبك هنا..." : lang === "fr" ? "Entrez les détails de votre besoin ici..." : "Write details about your trade needs here..."}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowInquiryModal(false)} className="flex-1 rounded-xl">
                    {lang === "ar" ? "إلغاء" : lang === "fr" ? "Annuler" : "Cancel"}
                  </Button>
                  <Button type="submit" className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl">
                    <Send className="size-4 rtl:rotate-180" />
                    {lang === "ar" ? "إرسال الطلب" : lang === "fr" ? "Envoyer" : "Send Inquiry"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
