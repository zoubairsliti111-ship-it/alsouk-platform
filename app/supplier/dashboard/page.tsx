"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Building2,
  MapPin,
  Globe,
  Check,
  ChevronDown,
  ShieldCheck,
  Plus,
  Compass,
  ArrowUpRight,
  TrendingUp,
  MessageSquare,
  FileText,
  Eye,
  Settings,
  LogOut,
  Users,
  Briefcase,
  Store
} from "lucide-react"

import { LanguageProvider, useLanguage } from "@/components/language-provider"
import { LANGS } from "@/lib/i18n"

// Custom SVG Brand Icons since they are not bundled in this version of lucide-react
const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

// Default mock data if no query params are parsed
const DEFAULT_SUPPLIER_DATA = {
  fullName: "Noureddine El Sfaxi",
  email: "noureddine@carthageoliveoil.tn",
  phone: "+216 98 456 123",
  companyName: "Carthage Olive Oil Co.",
  businessType: "Manufacturer & Exporter",
  country: "Tunisia",
  governorate: "Sfax",
  city: "Sfax Industrial Zone",
  businessAddress: "Route de Gabès Km 4, Sfax, 3000",
  website: "https://www.carthageoliveoil.tn",
  businessDescription: "Premium extra virgin Tunisian olive oil producer with fully automated cold-press facilities, exporting globally.",
  storeLogo: "/images/product-oliveoil.png",
  coverImage: "/images/supplier-factory.png",
  storeName: "Carthage Premium Oils Store",
  storeUrl: "carthage-oils",
  storeDescription: "Direct factory store for award-winning extra virgin olive oils, organic blends, and bulk packaging options.",
  profilePhoto: "/images/product-ceramics.png",
  ownerName: "Noureddine El Sfaxi",
  position: "Managing Director",
  shortBio: "3rd generation olive mill master, dedicated to showcasing premium Tunisian agricultural products to the world.",
  businessPhone: "+216 74 200 400",
  businessEmail: "sales@carthageoliveoil.tn",
  facebook: "https://facebook.com/carthageoliveoil",
  linkedin: "https://linkedin.com/company/carthageoliveoil",
  instagram: "carthage.oils",
  tiktok: "carthage.oils"
}

// Localized translation keys
const DASH_TRANS = {
  en: {
    dashboard: "Supplier Dashboard",
    liveBadge: "LIVE & VERIFIED",
    welcome: "Welcome back",
    subtitle: "Manage your store, products, and incoming buyer quotation requests.",
    overview: "Store Overview",
    totalViews: "Store Views",
    activeRfqs: "Relevant RFQs",
    receivedQuotes: "Quotes Sent",
    storeHealth: "Store Health",
    storefront: "Your Digital Storefront",
    visitStorefront: "View Storefront",
    ownerProfile: "Owner Profile",
    recentInquiries: "Recent Buyer Inquiries",
    buyer: "Buyer",
    request: "Requests for",
    status: "Status",
    action: "Action",
    replied: "Replied",
    pending: "Pending response",
    addProd: "Add Product",
    settings: "Settings",
    logOut: "Log Out",
    quickActions: "Quick Actions",
    postOffer: "Post Live Offer"
  },
  fr: {
    dashboard: "Tableau de Bord Fournisseur",
    liveBadge: "ACTIF & VÉRIFIÉ",
    welcome: "Bon retour",
    subtitle: "Gérez votre boutique, vos produits et les demandes de devis des acheteurs.",
    overview: "Aperçu de la Boutique",
    totalViews: "Vues de la boutique",
    activeRfqs: "RFQs Pertinents",
    receivedQuotes: "Devis Envoyés",
    storeHealth: "Santé de la boutique",
    storefront: "Votre Vitrine Digitale",
    visitStorefront: "Voir la boutique",
    ownerProfile: "Profil du propriétaire",
    recentInquiries: "Demandes Récentes des Acheteurs",
    buyer: "Acheteur",
    request: "Demande pour",
    status: "Statut",
    action: "Action",
    replied: "Répondu",
    pending: "En attente",
    addProd: "Ajouter un produit",
    settings: "Paramètres",
    logOut: "Se déconnecter",
    quickActions: "Actions Rapides",
    postOffer: "Publier offre"
  },
  ar: {
    dashboard: "لوحة تحكم المورد",
    liveBadge: "مباشر وموثق",
    welcome: "مرحباً بك مجدداً",
    subtitle: "إدارة متجرك، ومنتجاتك، وطلبات عروض الأسعار الواردة من المشترين.",
    overview: "نظرة عامة على المتجر",
    totalViews: "زيارات المتجر",
    activeRfqs: "طلبات السعر المتطابقة",
    receivedQuotes: "العروض المرسلة",
    storeHealth: "حالة المتجر",
    storefront: "واجهة متجرك الرقمية",
    visitStorefront: "عرض المتجر",
    ownerProfile: "ملف صاحب المتجر",
    recentInquiries: "استفسارات المشترين الأخيرة",
    buyer: "المشتري",
    request: "طلب لـ",
    status: "الحالة",
    action: "إجراء",
    replied: "تم الرد",
    pending: "قيد الانتظار",
    addProd: "إضافة منتج",
    settings: "الإعدادات",
    logOut: "تسجيل الخروج",
    quickActions: "إجراءات سريعة",
    postOffer: "نشر عرض مباشر"
  }
}

function DashboardContent() {
  const { lang, setLang, dir } = useLanguage()
  const [langOpen, setLangOpen] = useState(false)
  const currentLang = LANGS.find((l) => l.code === lang) || LANGS[0]
  const router = useRouter()

  const t = DASH_TRANS[lang as keyof typeof DASH_TRANS] || DASH_TRANS.en

  const searchParams = useSearchParams()

  const rawData = searchParams.get("data")
  let supplierData = DEFAULT_SUPPLIER_DATA
  if (rawData) {
    try {
      const parsed = JSON.parse(decodeURIComponent(rawData))
      supplierData = {
        ...DEFAULT_SUPPLIER_DATA,
        ...parsed
      }
    } catch (e) {
      console.error("Failed to parse supplier data from URL parameters", e)
    }
  }

  // Mock buyer messages for realism
  const MOCK_INQUIRIES = [
    {
      id: "inq-1",
      buyerName: "Yassine Sassi (Tunis Importers Ltd)",
      product: "Bulk Extra Virgin Olive Oil - 10,000L",
      date: "Today, 10:15 AM",
      status: "pending"
    },
    {
      id: "inq-2",
      buyerName: "Sophie Martin (Marseille Fine Foods)",
      product: "Deglet Nour Date Pallets - 2,000 kg",
      date: "Yesterday",
      status: "replied"
    },
    {
      id: "inq-3",
      buyerName: "Ahmed Al-Mansouri (Dubai Sourcing)",
      product: "Handpainted Ceramic Tableware Sets",
      date: "2 days ago",
      status: "replied"
    }
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] pb-12" dir={dir}>

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full h-[64px] border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto h-full flex items-center justify-between px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#2563EB] text-lg font-bold text-white shadow-sm">
              A
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              AL<span className="text-[#2563EB]">SOUK</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Globe className="size-4 text-[#2563EB]" />
                <span>{currentLang.native}</span>
                <ChevronDown className={`size-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
              </button>

              {langOpen && (
                <div className={`absolute ${dir === "rtl" ? "left-0" : "right-0"} top-full mt-2 z-50 w-36 rounded-xl border border-slate-100 bg-white p-1.5 shadow-lg`}>
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code)
                        setLangOpen(false)
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <span className="w-full text-start">{l.native}</span>
                      {l.code === lang && <Check className="size-4 text-[#2563EB]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Logout/Back Home */}
            <Link href="/" className="flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <LogOut className="size-[18px]" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Welcome banner */}
      <section className="bg-gradient-to-r from-[#2563EB] to-blue-700 text-white py-10 px-6 shadow-sm border-b border-blue-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold tracking-wider uppercase">
              <ShieldCheck className="size-4 text-emerald-400 fill-emerald-400/20" />
              <span>{t.liveBadge}</span>
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t.welcome}, {supplierData.ownerName}!
            </h1>
            <p className="text-sm text-blue-100 font-medium leading-relaxed max-w-xl">
              {t.subtitle}
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/products">
              <button className="rounded-full bg-white px-5 py-2.5 text-xs font-bold text-[#2563EB] shadow-md hover:bg-slate-50 transition-all flex items-center gap-1.5">
                <Plus className="size-4 stroke-[3]" />
                <span>{t.addProd}</span>
              </button>
            </Link>
            <button className="rounded-full bg-blue-600 px-5 py-2.5 text-xs font-bold text-white border border-blue-500 shadow-md hover:bg-blue-500 transition-all">
              {t.postOffer}
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left column: Overview metrics, Store Card */}
        <div className="lg:col-span-2 space-y-8">

          {/* Overview Metric cards */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">{t.overview}</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

              {/* Store Views */}
              <div className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.totalViews}</span>
                  <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                    <Eye className="size-4" />
                  </span>
                </div>
                <div className="mt-4">
                  <span className="text-xl font-black text-slate-800">1,420</span>
                  <p className="text-[10px] font-bold text-emerald-500 mt-1 flex items-center gap-0.5">
                    <TrendingUp className="size-3" />
                    <span>+24% this week</span>
                  </p>
                </div>
              </div>

              {/* Active RFQs */}
              <div className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.activeRfqs}</span>
                  <span className="flex size-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <FileText className="size-4" />
                  </span>
                </div>
                <div className="mt-4">
                  <span className="text-xl font-black text-slate-800">18</span>
                  <p className="text-[10px] font-bold text-[#2563EB] mt-1">Matched categories</p>
                </div>
              </div>

              {/* Received Quotes */}
              <div className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.receivedQuotes}</span>
                  <span className="flex size-7 items-center justify-center rounded-lg bg-green-50 text-green-600">
                    <Check className="size-4 stroke-[3]" />
                  </span>
                </div>
                <div className="mt-4">
                  <span className="text-xl font-black text-slate-800">5</span>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">2 awaiting buyer review</p>
                </div>
              </div>

              {/* Store Health */}
              <div className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.storeHealth}</span>
                  <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <ShieldCheck className="size-4" />
                  </span>
                </div>
                <div className="mt-4">
                  <span className="text-sm font-black text-emerald-600 uppercase">98% PERFECT</span>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">Verification level A</p>
                </div>
              </div>

            </div>
          </section>

          {/* Digital Storefront Summary Card */}
          <section className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden">
            {/* Banner/Cover Frame */}
            <div className="relative h-44 bg-slate-900 overflow-hidden">
              {supplierData.coverImage && (
                <Image
                  src={supplierData.coverImage}
                  alt={supplierData.storeName}
                  fill
                  sizes="800px"
                  className="object-cover opacity-60"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-4 left-6 flex items-end gap-4">
                {/* Logo wrapper */}
                <div className="relative flex size-16 shrink-0 items-center justify-center rounded-xl bg-white p-1 border border-slate-200 shadow-md overflow-hidden">
                  {supplierData.storeLogo && (
                    <Image
                      src={supplierData.storeLogo}
                      alt={supplierData.storeName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="text-white">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-lg font-bold tracking-tight">{supplierData.storeName}</h3>
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-400">
                      <ShieldCheck className="size-3.5" />
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-semibold flex items-center gap-1.5 mt-0.5">
                    <MapPin className="size-3.5 text-slate-300" />
                    <span>{supplierData.city}, {supplierData.governorate}, {supplierData.country}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Storefront Info Body */}
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4 items-start">
                <div className="flex-1 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.storefront}</h4>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {supplierData.storeDescription}
                  </p>
                  <div className="text-xs text-slate-400 font-semibold pt-1">
                    Store URL: <span className="text-[#2563EB] underline font-bold">alsouk.tn/stores/{supplierData.storeUrl}</span>
                  </div>
                </div>

                <button className="rounded-xl border border-[#2563EB]/20 bg-[#2563EB]/5 px-4 py-2.5 text-xs font-bold text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-all shadow-sm flex items-center gap-1.5 shrink-0">
                  <span>{t.visitStorefront}</span>
                  <ArrowUpRight className="size-3.5" />
                </button>
              </div>

              {/* Business details snippet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="font-semibold text-slate-400">Company Name:</span>
                    <span className="font-bold text-slate-700">{supplierData.companyName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="font-semibold text-slate-400">Business Type:</span>
                    <span className="font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md text-xs">{supplierData.businessType}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="font-semibold text-slate-400">Business Address:</span>
                    <span className="font-bold text-slate-700 truncate max-w-[180px]">{supplierData.businessAddress}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="font-semibold text-slate-400">Website:</span>
                    <span className="font-bold text-slate-700 truncate max-w-[180px]">{supplierData.website || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Buyer Inquiries */}
          <section className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">{t.recentInquiries}</h2>

            <div className="divide-y divide-slate-100">
              {MOCK_INQUIRIES.map((inq) => (
                <div key={inq.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{inq.buyerName}</p>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      {t.request}: <span className="text-slate-700 font-bold">{inq.product}</span>
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{inq.date}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {inq.status === "replied" ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600 border border-emerald-100 flex items-center gap-1">
                        <Check className="size-3 stroke-[3]" />
                        <span>{t.replied}</span>
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-600 border border-amber-100 flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>{t.pending}</span>
                      </span>
                    )}

                    <button className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition-all">
                      Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right column: Owner Profile, Contact, Socials */}
        <div className="space-y-8">

          {/* Owner Card */}
          <section className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100 space-y-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t.ownerProfile}</h2>

            <div className="flex items-center gap-4">
              <div className="relative size-16 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-50">
                {supplierData.profilePhoto && (
                  <Image
                    src={supplierData.profilePhoto}
                    alt={supplierData.ownerName}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-800 truncate">{supplierData.ownerName}</h3>
                <p className="text-xs font-bold text-[#2563EB]">{supplierData.position}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{supplierData.companyName}</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100/50">
              {supplierData.shortBio}
            </p>

            {/* Profile info fields */}
            <div className="space-y-3 pt-2 text-xs font-semibold">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-400">Business Phone:</span>
                <span className="text-slate-700">{supplierData.businessPhone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-400">Business Email:</span>
                <span className="text-slate-700 truncate max-w-[160px]">{supplierData.businessEmail}</span>
              </div>
            </div>
          </section>

          {/* Social Presence Card */}
          <section className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Social Presence</h2>

            <div className="space-y-3 text-xs font-bold">
              {supplierData.facebook && (
                <div className="flex items-center justify-between bg-slate-50 hover:bg-slate-100/40 p-2.5 rounded-xl border border-slate-100/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Facebook className="size-4 text-[#1877F2]" />
                    <span className="text-slate-700">Facebook</span>
                  </div>
                  <span className="text-slate-400 font-medium truncate max-w-[150px]">{supplierData.facebook}</span>
                </div>
              )}

              {supplierData.linkedin && (
                <div className="flex items-center justify-between bg-slate-50 hover:bg-slate-100/40 p-2.5 rounded-xl border border-slate-100/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Linkedin className="size-4 text-[#0A66C2]" />
                    <span className="text-slate-700">LinkedIn</span>
                  </div>
                  <span className="text-slate-400 font-medium truncate max-w-[150px]">{supplierData.linkedin}</span>
                </div>
              )}

              {supplierData.instagram && (
                <div className="flex items-center justify-between bg-slate-50 hover:bg-slate-100/40 p-2.5 rounded-xl border border-slate-100/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Instagram className="size-4 text-[#E1306C]" />
                    <span className="text-slate-700">Instagram</span>
                  </div>
                  <span className="text-slate-400 font-medium truncate max-w-[150px]">@{supplierData.instagram}</span>
                </div>
              )}

              {supplierData.tiktok && (
                <div className="flex items-center justify-between bg-slate-50 hover:bg-slate-100/40 p-2.5 rounded-xl border border-slate-100/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 text-sm font-black">@</span>
                    <span className="text-slate-700">TikTok</span>
                  </div>
                  <span className="text-slate-400 font-medium truncate max-w-[150px]">@{supplierData.tiktok}</span>
                </div>
              )}
            </div>
          </section>

          {/* Quick Actions Panel */}
          <section className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t.quickActions}</h2>

            <div className="grid grid-cols-2 gap-3 text-center text-xs font-bold">
              <button className="flex flex-col items-center gap-2 bg-slate-50 hover:bg-slate-100/70 p-4 rounded-xl border border-slate-100/50 transition-all">
                <Store className="size-5 text-[#2563EB]" />
                <span>Customize Store</span>
              </button>
              <button className="flex flex-col items-center gap-2 bg-slate-50 hover:bg-slate-100/70 p-4 rounded-xl border border-slate-100/50 transition-all">
                <Settings className="size-5 text-slate-500" />
                <span>{t.settings}</span>
              </button>
            </div>
          </section>

        </div>

      </main>

    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center font-bold text-slate-600">Loading Dashboard...</div>}>
      <LanguageProvider>
        <DashboardContent />
      </LanguageProvider>
    </Suspense>
  )
}
