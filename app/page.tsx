"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Search,
  Bell,
  Menu,
  Globe,
  Check,
  ChevronDown,
  Sparkles,
  MapPin,
  Star,
  Users,
  Send,
  MessageSquare,
  Home,
  Grid,
  FileText,
  User,
  Coffee,
  Shirt,
  HardHat,
  Cpu,
  Box,
  Sprout,
  Sofa,
  Tv,
  FlaskConical,
  MoreHorizontal,
  ChevronRight,
  ShieldCheck,
  Flame,
  ArrowUpRight,
  Tv2
} from "lucide-react"

import { LanguageProvider, useLanguage } from "@/components/language-provider"
import { AssistantWidget } from "@/components/ai/assistant-widget"
import { Button } from "@/components/ui/button"
import { LANGS } from "@/lib/i18n"

// --- LOCALIZED DICTIONARY FOR HOMEPAGE REBUILD ---
const LOCAL_TRANS = {
  en: {
    searchPlaceholder: "Search products, suppliers or factories...",
    searchBtn: "Search",
    todayOpportunities: "Today's Opportunities",
    todayOpportunitiesSub: "High-priority live deals from premium Tunisian facilities",
    categoriesTitle: "Sourcing Categories",
    categoriesSub: "Browse premium industries in Tunisia",
    featuredSuppliers: "Featured Suppliers",
    featuredSuppliersSub: "Verified manufacturers and wholesalers ready to trade",
    featuredProducts: "Featured Products",
    featuredProductsSub: "Premium B2B products from certified suppliers",
    liveMarketplace: "Live Sourcing",
    liveMarketplaceSub: "TikTok-style live tours directly from factories",
    rfqTitle: "Send one RFQ and receive quotations from multiple suppliers.",
    rfqBtn: "Create RFQ",
    viewAll: "View All",
    visitStore: "Visit Store",
    requestQuote: "Request Quote",
    openLive: "Open Live",
    viewerCount: "watching",
    liveBadge: "LIVE",
    tnd: "د.ت",
    moq: "MOQ",
    bottomHome: "Home",
    bottomCat: "Categories",
    bottomRfq: "RFQ",
    bottomMsg: "Messages",
    bottomAcc: "Account"
  },
  fr: {
    searchPlaceholder: "Rechercher des produits, fournisseurs ou usines...",
    searchBtn: "Rechercher",
    todayOpportunities: "Opportunités du jour",
    todayOpportunitiesSub: "Offres directes à haute priorité des usines tunisiennes",
    categoriesTitle: "Catégories de sourcing",
    categoriesSub: "Parcourir les industries premium en Tunisie",
    featuredSuppliers: "Fournisseurs vedettes",
    featuredSuppliersSub: "Fabricants et grossistes vérifiés prêts à commercer",
    featuredProducts: "Produits vedettes",
    featuredProductsSub: "Produits B2B de qualité supérieure des fournisseurs certifiés",
    liveMarketplace: "Marché en direct",
    liveMarketplaceSub: "Visites en direct style TikTok depuis les usines",
    rfqTitle: "Envoyez un RFQ et recevez des devis de plusieurs fournisseurs.",
    rfqBtn: "Créer un RFQ",
    viewAll: "Voir Tout",
    visitStore: "Visiter Boutique",
    requestQuote: "Demander Devis",
    openLive: "Ouvrir Direct",
    viewerCount: "spectateurs",
    liveBadge: "DIRECT",
    tnd: "د.ت",
    moq: "MOQ",
    bottomHome: "Accueil",
    bottomCat: "Catégories",
    bottomRfq: "RFQ",
    bottomMsg: "Messages",
    bottomAcc: "Compte"
  },
  ar: {
    searchPlaceholder: "ابحث عن منتجات، موردين أو مصانع...",
    searchBtn: "بحث",
    todayOpportunities: "فرص اليوم 🔥",
    todayOpportunitiesSub: "عروض مباشرة ذات أولوية عالية من المصانع التونسية",
    categoriesTitle: "فئات التوريد",
    categoriesSub: "تصفح القطاعات الفاخرة في تونس",
    featuredSuppliers: "موردون مميزون",
    featuredSuppliersSub: "مصنعون وموزعون معتمدون جاهزون للتعامل التجاري",
    featuredProducts: "المنتجات المميزة",
    featuredProductsSub: "منتجات تجارية فاخرة من موردين موثوقين",
    liveMarketplace: "السوق المباشر 🎥",
    liveMarketplaceSub: "جولات حية تفاعلية مباشرة من داخل المصانع",
    rfqTitle: "أرسل طلب عرض سعر واحد واحصل على عروض من موردين متعددين.",
    rfqBtn: "إنشاء طلب عرض سعر",
    viewAll: "عرض الكل",
    visitStore: "زيارة المتجر",
    requestQuote: "طلب عرض سعر",
    openLive: "دخول البث",
    viewerCount: "مشاهد",
    liveBadge: "مباشر",
    tnd: "د.ت",
    moq: "الحد الأدنى",
    bottomHome: "الرئيسية",
    bottomCat: "الفئات",
    bottomRfq: "طلب السعر",
    bottomMsg: "الرسائل",
    bottomAcc: "حسابي"
  }
}

// --- CURATED DATASETS FOR HOMEPAGE REBUILD ---
const OPPORTUNITIES = [
  {
    id: "opp-1",
    name: "Extra Virgin Olive Oil Bulk - Medina Co.",
    price: "15.950",
    image: "/images/product-oliveoil.png",
    badge: "LIVE",
    moq: "2,000 L",
    badgeColor: "bg-red-500 text-white animate-pulse"
  },
  {
    id: "opp-2",
    name: "Premium Cotton Fabric Yarn Rolls",
    price: "7.200",
    image: "/images/product-textiles.png",
    badge: "35% OFF",
    moq: "500 m",
    badgeColor: "bg-amber-500 text-white"
  },
  {
    id: "opp-3",
    name: "Handcrafted Tunisian Ceramic Set",
    price: "34.500",
    image: "/images/product-ceramics.png",
    badge: "Ready to Ship",
    moq: "100 sets",
    badgeColor: "bg-green-600 text-white"
  },
  {
    id: "opp-4",
    name: "Deglet Nour Organic Dates Pallets",
    price: "11.200",
    image: "/images/product-dates.png",
    badge: "Top Deal",
    moq: "1,000 kg",
    badgeColor: "bg-blue-600 text-white"
  },
  {
    id: "opp-5",
    name: "Industrial Packaging Kraft Boxes",
    price: "1.850",
    image: "/images/product-machinery.png",
    badge: "Export Ready",
    moq: "5,000 pcs",
    badgeColor: "bg-purple-600 text-white"
  }
]

const CATEGORIES = [
  { name: "Food", icon: Coffee, color: "bg-orange-50 text-orange-600 border-orange-100" },
  { name: "Textile", icon: Shirt, color: "bg-blue-50 text-blue-600 border-blue-100" },
  { name: "Construction", icon: HardHat, color: "bg-yellow-50 text-yellow-600 border-yellow-100" },
  { name: "Machinery", icon: Cpu, color: "bg-purple-50 text-purple-600 border-purple-100" },
  { name: "Packaging", icon: Box, color: "bg-teal-50 text-teal-600 border-teal-100" },
  { name: "Agriculture", icon: Sprout, color: "bg-green-50 text-green-600 border-green-100" },
  { name: "Furniture", icon: Sofa, color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  { name: "Electronics", icon: Tv, color: "bg-red-50 text-red-600 border-red-100" },
  { name: "Chemicals", icon: FlaskConical, color: "bg-pink-50 text-pink-600 border-pink-100" },
  { name: "More", icon: MoreHorizontal, color: "bg-gray-50 text-gray-600 border-gray-100" }
]

const SUPPLIERS = [
  {
    id: "sup-1",
    name: "Carthage Olive Oil Co.",
    city: "Sfax",
    rating: 4.9,
    monogram: "CO",
    logoColor: "green",
    verified: true,
    logoUrl: "/images/product-oliveoil.png"
  },
  {
    id: "sup-2",
    name: "Sahel Textile Factory",
    city: "Monastir",
    rating: 4.8,
    monogram: "ST",
    logoColor: "blue",
    verified: true,
    logoUrl: "/images/product-textiles.png"
  },
  {
    id: "sup-3",
    name: "Atlas Ceramic Artisans",
    city: "Nabeul",
    rating: 4.7,
    monogram: "AC",
    logoColor: "blue",
    verified: true,
    logoUrl: "/images/product-ceramics.png"
  },
  {
    id: "sup-4",
    name: "Sahara Gold Dates Export",
    city: "Tozeur",
    rating: 4.9,
    monogram: "SG",
    logoColor: "green",
    verified: true,
    logoUrl: "/images/product-dates.png"
  }
]

const PRODUCTS = [
  {
    id: "prod-1",
    name: "Premium Handpainted Ceramic Wall Tiles",
    price: "45.000",
    image: "/images/product-ceramics.png",
    supplier: "Atlas Ceramic Artisans",
    moq: "200 pcs"
  },
  {
    id: "prod-2",
    name: "Genuine Leather Handbags & Accessories",
    price: "85.000",
    image: "/images/product-leather.png",
    supplier: "Kairouan Leather Craft",
    moq: "50 pcs"
  },
  {
    id: "prod-3",
    name: "High-Capacity Olive Oil Pressing Machine",
    price: "18,500.000",
    image: "/images/product-machinery.png",
    supplier: "Tunis Metalworks & Machining",
    moq: "1 unit"
  }
]

const LIVE_STREAMS = [
  {
    id: "live-1",
    storeName: "Carthage Olive Oil Co.",
    city: "Sfax",
    product: "Live cold-pressing organic olive oil demonstration",
    viewerCount: "1,240",
    thumbnail: "/images/product-oliveoil.png",
    avatar: "CO",
    avatarColor: "bg-green-600"
  },
  {
    id: "live-2",
    storeName: "Sahel Textile Factory",
    city: "Monastir",
    product: "Inside the automated circular knitting loom room",
    viewerCount: "845",
    thumbnail: "/images/product-textiles.png",
    avatar: "ST",
    avatarColor: "bg-blue-600"
  },
  {
    id: "live-3",
    storeName: "Atlas Ceramic Artisans",
    city: "Nabeul",
    product: "Master potter shaping traditional ceramic vases live",
    viewerCount: "1,110",
    thumbnail: "/images/product-ceramics.png",
    avatar: "AC",
    avatarColor: "bg-indigo-600"
  }
]

function HomepageContent() {
  const { lang, setLang, dir } = useLanguage()
  const router = useRouter()
  const [langOpen, setLangOpen] = useState(false)
  const [query, setQuery] = useState("")

  const t = LOCAL_TRANS[lang] || LOCAL_TRANS.en

  const currentLang = LANGS.find((l) => l.code === lang) || LANGS[0]

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push("/search")
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 selection:bg-primary/10 selection:text-primary pb-16 md:pb-0" dir={dir}>
      {/* 1. STICKY HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-1.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground">
              A
            </span>
            <span className="text-lg font-bold tracking-tight text-foreground">
              AL<span className="text-primary">SOUK</span>
            </span>
          </Link>

          {/* Header Controls */}
          <div className="flex items-center gap-3">
            {/* Lang switcher dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Globe className="size-3.5 text-primary" />
                <span>{currentLang.native}</span>
                <ChevronDown className={`size-3 transition-transform ${langOpen ? "rotate-180" : ""}`} />
              </button>

              {langOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-50 w-32 rounded-xl border border-slate-100 bg-white p-1 shadow-lg">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code)
                        setLangOpen(false)
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <span>{l.native}</span>
                      {l.code === lang && <Check className="size-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification bell */}
            <button className="relative flex size-8 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all">
              <Bell className="size-[18px]" />
              <span className="absolute top-1 right-1 flex size-1.5 rounded-full bg-red-500" />
            </button>

            {/* Menu button */}
            <button className="flex size-8 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all md:hidden">
              <Menu className="size-[18px]" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 space-y-4 px-3 py-3 mx-auto w-full max-w-7xl">
        {/* 2. PROMINENT SEARCH BAR */}
        <section className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full h-11 pl-10 pr-4 rounded-full border border-slate-200 bg-slate-50 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-primary focus:bg-white transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="h-11 shrink-0 rounded-full bg-primary px-5 text-sm font-bold text-white shadow-sm hover:bg-primary/95 transition-all flex items-center justify-center gap-1"
            >
              <Search className="size-4" />
              <span className="hidden sm:inline">{t.searchBtn}</span>
            </button>
          </form>
        </section>

        {/* 3. 🔥 TODAY'S OPPORTUNITIES */}
        <section className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="flex size-[26px] items-center justify-center rounded-lg bg-red-50 text-red-500">
                <Flame className="size-4 fill-red-500" />
              </span>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{t.todayOpportunities}</h2>
            </div>
            <Link href="/products" className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline">
              <span>{t.viewAll}</span>
              <ChevronRight className="size-3" />
            </Link>
          </div>

          <p className="text-xs text-slate-500 -mt-2 mb-4 leading-relaxed">{t.todayOpportunitiesSub}</p>

          {/* Horizontally scrolling row */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
            {OPPORTUNITIES.map((opp) => (
              <div
                key={opp.id}
                className="w-48 shrink-0 snap-start rounded-2xl border border-slate-100 bg-white p-2.5 shadow-sm hover:border-slate-200 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image container with fixed ratio & Badge */}
                  <div className="relative aspect-square w-full rounded-xl bg-slate-100 overflow-hidden mb-2">
                    <Image
                      src={opp.image}
                      alt={opp.name}
                      fill
                      sizes="192px"
                      className="object-cover"
                    />
                    <span className={`absolute top-1.5 left-1.5 rounded-full px-2 py-0.5 text-[9px] font-extrabold tracking-wider uppercase shadow-sm ${opp.badgeColor}`}>
                      {opp.badge}
                    </span>
                  </div>

                  <h3 className="text-xs font-extrabold text-slate-800 line-clamp-2 leading-snug mb-1">
                    {opp.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mb-1">{t.moq}: {opp.moq}</p>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-50">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{t.tnd}</span>
                    <span className="text-sm font-black text-primary">{opp.price}</span>
                  </div>
                  <Link href="/rfq" className="block w-full">
                    <button className="w-full rounded-lg bg-primary py-1.5 text-[10px] font-extrabold text-white shadow-sm hover:bg-primary/95 active:scale-98 transition-all">
                      {t.requestQuote}
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. CATEGORIES */}
        <section className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="flex size-[26px] items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Grid className="size-4" />
              </span>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{t.categoriesTitle}</h2>
            </div>
            <Link href="/categories" className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline">
              <span>{t.viewAll}</span>
              <ChevronRight className="size-3" />
            </Link>
          </div>

          <p className="text-xs text-slate-500 -mt-2 mb-4 leading-relaxed">{t.categoriesSub}</p>

          {/* Horizontally scrolling rounded icon buttons */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
            {CATEGORIES.map((cat) => {
              const IconComp = cat.icon
              return (
                <Link
                  key={cat.name}
                  href={`/categories`}
                  className="flex flex-col items-center gap-1.5 w-[72px] shrink-0 snap-start text-center group"
                >
                  <span className={`flex size-11 items-center justify-center rounded-2xl border ${cat.color} transition-transform group-hover:scale-105 shadow-sm`}>
                    <IconComp className="size-5" />
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-700 tracking-tight truncate w-full">
                    {cat.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* 5. FEATURED SUPPLIERS */}
        <section className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="flex size-[26px] items-center justify-center rounded-lg bg-green-50 text-green-600">
                <ShieldCheck className="size-4 fill-green-50" />
              </span>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{t.featuredSuppliers}</h2>
            </div>
            <Link href="/suppliers" className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline">
              <span>{t.viewAll}</span>
              <ChevronRight className="size-3" />
            </Link>
          </div>

          <p className="text-xs text-slate-500 -mt-2 mb-4 leading-relaxed">{t.featuredSuppliersSub}</p>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {SUPPLIERS.map((sup) => (
              <div
                key={sup.id}
                className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-3 shadow-sm hover:border-slate-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  {/* Monogram or Logo wrapper */}
                  <div className="relative flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 font-bold border border-slate-100 shadow-sm overflow-hidden text-slate-700">
                    {sup.logoUrl ? (
                      <Image
                        src={sup.logoUrl}
                        alt={sup.name}
                        fill
                        sizes="44px"
                        className="object-cover opacity-80"
                      />
                    ) : (
                      sup.monogram
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1">
                      <h3 className="text-xs font-extrabold text-slate-800 line-clamp-1">
                        {sup.name}
                      </h3>
                      {sup.verified && (
                        <span className="flex size-3.5 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Check className="size-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5 mt-0.5">
                      <MapPin className="size-3 text-slate-400" />
                      <span>{sup.city}, Tunisia</span>
                    </p>
                    <div className="flex items-center gap-0.5 mt-1">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-extrabold text-slate-700">{sup.rating}</span>
                    </div>
                  </div>
                </div>

                <Link href={`/suppliers/${sup.id}`}>
                  <button className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[10px] font-extrabold text-primary hover:bg-primary hover:text-white transition-all whitespace-nowrap">
                    {t.visitStore}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* 6. FEATURED PRODUCTS */}
        <section className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="flex size-[26px] items-center justify-center rounded-lg bg-blue-50 text-primary">
                <Box className="size-4" />
              </span>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{t.featuredProducts}</h2>
            </div>
            <Link href="/products" className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline">
              <span>{t.viewAll}</span>
              <ChevronRight className="size-3" />
            </Link>
          </div>

          <p className="text-xs text-slate-500 -mt-2 mb-4 leading-relaxed">{t.featuredProductsSub}</p>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((prod) => (
              <div
                key={prod.id}
                className="group rounded-2xl border border-slate-100 bg-white p-3 shadow-sm hover:border-slate-200 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full rounded-xl bg-slate-100 overflow-hidden mb-3">
                    <Image
                      src={prod.image}
                      alt={prod.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-800 line-clamp-1 leading-snug">
                    {prod.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1 flex items-center gap-1">
                    <span className="size-1 rounded-full bg-slate-300" />
                    <span>{prod.supplier}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                    <span className="size-1 rounded-full bg-slate-300" />
                    <span>{t.moq}: {prod.moq}</span>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase leading-none mb-0.5">{t.tnd}</span>
                    <span className="text-base font-black text-primary">{prod.price}</span>
                  </div>
                  <Link href="/rfq">
                    <button className="rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-primary/95 active:scale-98 transition-all flex items-center gap-1">
                      <span>{t.requestQuote}</span>
                      <ArrowUpRight className="size-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. LIVE MARKETPLACE */}
        <section className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="flex size-[26px] items-center justify-center rounded-lg bg-red-50 text-red-500">
                <Tv2 className="size-4" />
              </span>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{t.liveMarketplace}</h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-600 uppercase tracking-wider animate-pulse">
              {t.liveBadge}
            </span>
          </div>

          <p className="text-xs text-slate-500 -mt-2 mb-4 leading-relaxed">{t.liveMarketplaceSub}</p>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
            {LIVE_STREAMS.map((live) => (
              <div
                key={live.id}
                className="w-64 shrink-0 snap-start rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm hover:border-slate-200 transition-all flex flex-col justify-between"
              >
                {/* Media frame */}
                <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                  <Image
                    src={live.thumbnail}
                    alt={live.storeName}
                    fill
                    sizes="256px"
                    className="object-cover opacity-60"
                  />
                  {/* LIVE Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="rounded-md bg-red-600 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-white uppercase animate-pulse">
                      {t.liveBadge}
                    </span>
                    <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-extrabold text-white backdrop-blur-sm flex items-center gap-1">
                      <Users className="size-2.5" />
                      <span>{live.viewerCount}</span>
                    </span>
                  </div>
                </div>

                {/* Stream info */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`flex size-5 items-center justify-center rounded-full text-[9px] font-bold text-white uppercase ${live.avatarColor}`}>
                        {live.avatar}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-800 line-clamp-1">{live.storeName}</span>
                        <span className="text-[9px] text-slate-400 font-semibold">{live.city}, Tunisia</span>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-slate-700 line-clamp-2 leading-relaxed mb-2">
                      {live.product}
                    </p>
                  </div>

                  <button className="w-full rounded-xl bg-red-600 py-1.5 text-xs font-extrabold text-white shadow-sm hover:bg-red-700 transition-all flex items-center justify-center gap-1">
                    <Tv2 className="size-3.5" />
                    <span>{t.openLive}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. RFQ BANNER */}
        <section className="relative overflow-hidden rounded-3xl bg-primary px-6 py-8 text-white shadow-lg border border-primary/20">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-radial-[circle_at_right] from-white/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[10px] font-extrabold tracking-wider uppercase mb-3">
                <FileText className="size-3" />
                <span>RFQ Sourcing</span>
              </span>
              <h2 className="text-lg md:text-xl font-extrabold leading-snug tracking-tight">
                {t.rfqTitle}
              </h2>
            </div>
            <Link href="/rfq" className="shrink-0">
              <button className="rounded-xl bg-white px-6 py-3.5 text-sm font-black text-primary hover:bg-slate-50 transition-all shadow-md active:scale-98 flex items-center gap-1.5">
                <span>{t.rfqBtn}</span>
                <Send className="size-4 rotate-45" />
              </button>
            </Link>
          </div>
        </section>
      </main>

      {/* 9. BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-1.5 shadow-lg md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Link href="/" className="flex flex-col items-center gap-0.5 text-primary">
            <Home className="size-[22px]" />
            <span className="text-[9px] font-bold">{t.bottomHome}</span>
          </Link>

          <Link href="/categories" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600">
            <Grid className="size-[22px]" />
            <span className="text-[9px] font-bold">{t.bottomCat}</span>
          </Link>

          <Link href="/rfq" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600">
            <FileText className="size-[22px]" />
            <span className="text-[9px] font-bold">{t.bottomRfq}</span>
          </Link>

          <button className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 relative">
            <MessageSquare className="size-[22px]" />
            <span className="text-[9px] font-bold">{t.bottomMsg}</span>
            <span className="absolute top-0 right-1 flex size-2 rounded-full bg-primary" />
          </button>

          <button className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600">
            <User className="size-[22px]" />
            <span className="text-[9px] font-bold">{t.bottomAcc}</span>
          </button>
        </div>
      </nav>

      {/* Pluggable AI Assistant Widget */}
      <AssistantWidget />
    </div>
  )
}

export default function HomePage() {
  return (
    <LanguageProvider>
      <HomepageContent />
    </LanguageProvider>
  )
}
