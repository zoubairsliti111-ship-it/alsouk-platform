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
import { LANGS } from "@/lib/i18n"

// --- LOCALIZED DICTIONARY ---
const LOCAL_TRANS = {
  en: {
    searchPlaceholder: "Search products, suppliers or factories...",
    searchBtn: "Search",
    todayOpportunities: "Today's Opportunities",
    categoriesTitle: "Sourcing Categories",
    featuredSuppliers: "Featured Suppliers",
    featuredProducts: "Featured Products",
    liveMarketplace: "Live Marketplace",
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
    bottomAcc: "Account",
    verified: "Verified",
    // Categories
    cat_food: "Food",
    cat_textile: "Textile",
    cat_construction: "Construction",
    cat_machinery: "Machinery",
    cat_packaging: "Packaging",
    cat_agriculture: "Agriculture",
    cat_furniture: "Furniture",
    cat_electronics: "Electronics",
    cat_chemicals: "Chemicals",
    cat_more: "More"
  },
  fr: {
    searchPlaceholder: "Rechercher des produits, fournisseurs ou usines...",
    searchBtn: "Rechercher",
    todayOpportunities: "Opportunités du jour",
    categoriesTitle: "Catégories",
    featuredSuppliers: "Fournisseurs vedettes",
    featuredProducts: "Produits vedettes",
    liveMarketplace: "Marché en direct",
    rfqTitle: "Envoyez un RFQ et recevez des devis de plusieurs fournisseurs.",
    rfqBtn: "Créer un RFQ",
    viewAll: "Voir tout",
    visitStore: "Visiter boutique",
    requestQuote: "Demander devis",
    openLive: "Ouvrir direct",
    viewerCount: "spectateurs",
    liveBadge: "DIRECT",
    tnd: "د.ت",
    moq: "MOQ",
    bottomHome: "Accueil",
    bottomCat: "Catégories",
    bottomRfq: "RFQ",
    bottomMsg: "Messages",
    bottomAcc: "Compte",
    verified: "Vérifié",
    // Categories
    cat_food: "Alimentation",
    cat_textile: "Textiles",
    cat_construction: "Construction",
    cat_machinery: "Machines",
    cat_packaging: "Emballage",
    cat_agriculture: "Agriculture",
    cat_furniture: "Meubles",
    cat_electronics: "Électronique",
    cat_chemicals: "Chimie",
    cat_more: "Plus"
  },
  ar: {
    searchPlaceholder: "ابحث عن منتجات، موردين أو مصانع...",
    searchBtn: "بحث",
    todayOpportunities: "فرص اليوم",
    categoriesTitle: "الفئات",
    featuredSuppliers: "الموردون المميزون",
    featuredProducts: "المنتجات المميزة",
    liveMarketplace: "السوق المباشر",
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
    bottomAcc: "حسابي",
    verified: "موثق",
    // Categories
    cat_food: "أغذية",
    cat_textile: "نسيج",
    cat_construction: "بناء",
    cat_machinery: "آلات",
    cat_packaging: "تعبئة",
    cat_agriculture: "زراعة",
    cat_furniture: "أثاث",
    cat_electronics: "إلكترونيات",
    cat_chemicals: "كيميائيات",
    cat_more: "المزيد"
  }
}

// Data structures mapping to high-quality Tunisian images
const OPPORTUNITIES = [
  {
    id: "opp-1",
    name_en: "Extra Virgin Olive Oil Bulk",
    name_fr: "Huile d'olive extra vierge en vrac",
    name_ar: "زيت زيتون بكر ممتاز سائب",
    price: "15.950",
    image: "/images/product-oliveoil.png",
    badge: "LIVE",
    moq: "2,000 L",
    badgeColor: "bg-[#EF4444] text-white animate-pulse"
  },
  {
    id: "opp-2",
    name_en: "Premium Cotton Fabric Yarn Rolls",
    name_fr: "Rouleau de fil de coton premium",
    name_ar: "رول خيوط قطنية فاخرة",
    price: "7.200",
    image: "/images/product-textiles.png",
    badge: "35% OFF",
    moq: "500 m",
    badgeColor: "bg-amber-500 text-white"
  },
  {
    id: "opp-3",
    name_en: "Handcrafted Tunisian Ceramic Set",
    name_fr: "Service de table en céramique artisanale",
    name_ar: "طقم مائدة خزفي يدوي الصنع",
    price: "34.500",
    image: "/images/product-ceramics.png",
    badge: "READY TO SHIP",
    moq: "100 sets",
    badgeColor: "bg-[#16A34A] text-white"
  },
  {
    id: "opp-4",
    name_en: "Deglet Nour Organic Dates Pallets",
    name_fr: "Palette de dattes Deglet Nour biologiques",
    name_ar: "تمور دقلة النور الفاخرة العضوية",
    price: "11.200",
    image: "/images/product-dates.png",
    badge: "TOP DEAL",
    moq: "1,000 kg",
    badgeColor: "bg-[#2563EB] text-white"
  },
  {
    id: "opp-5",
    name_en: "Industrial Packaging Kraft Boxes",
    name_fr: "Boîtes kraft d'emballage industriel",
    name_ar: "صناديق كرافت للتعبئة الصناعية",
    price: "1.850",
    image: "/images/product-machinery.png",
    badge: "EXPORT READY",
    moq: "5,000 pcs",
    badgeColor: "bg-purple-600 text-white"
  }
]

const CATEGORY_ITEMS = [
  { key: "cat_food", icon: Coffee, color: "bg-orange-50 text-orange-600 border-orange-100" },
  { key: "cat_textile", icon: Shirt, color: "bg-blue-50 text-blue-600 border-blue-100" },
  { key: "cat_construction", icon: HardHat, color: "bg-yellow-50 text-yellow-600 border-yellow-100" },
  { key: "cat_machinery", icon: Cpu, color: "bg-purple-50 text-purple-600 border-purple-100" },
  { key: "cat_packaging", icon: Box, color: "bg-teal-50 text-teal-600 border-teal-100" },
  { key: "cat_agriculture", icon: Sprout, color: "bg-green-50 text-green-600 border-green-100" },
  { key: "cat_furniture", icon: Sofa, color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  { key: "cat_electronics", icon: Tv, color: "bg-red-50 text-red-600 border-red-100" },
  { key: "cat_chemicals", icon: FlaskConical, color: "bg-pink-50 text-pink-600 border-pink-100" },
  { key: "cat_more", icon: MoreHorizontal, color: "bg-gray-50 text-gray-600 border-gray-100" }
]

const SUPPLIERS = [
  {
    id: "sup-1",
    name: "Carthage Olive Oil Co.",
    city: "Sfax",
    rating: 4.9,
    verified: true,
    logoUrl: "/images/product-oliveoil.png"
  },
  {
    id: "sup-2",
    name: "Sahel Textile Factory",
    city: "Monastir",
    rating: 4.8,
    verified: true,
    logoUrl: "/images/product-textiles.png"
  },
  {
    id: "sup-3",
    name: "Atlas Ceramic Artisans",
    city: "Nabeul",
    rating: 4.7,
    verified: true,
    logoUrl: "/images/product-ceramics.png"
  },
  {
    id: "sup-4",
    name: "Sahara Gold Dates Export",
    city: "Tozeur",
    rating: 4.9,
    verified: true,
    logoUrl: "/images/product-dates.png"
  }
]

const PRODUCTS = [
  {
    id: "prod-1",
    name_en: "Premium Handpainted Ceramic Wall Tiles",
    name_fr: "Carreaux muraux artisanaux peints à la main",
    name_ar: "بلاط حائط خزفي ملون يدويًا بالكامل",
    price: "45.000",
    image: "/images/product-ceramics.png",
    supplier: "Atlas Ceramic Artisans",
    moq: "200 pcs"
  },
  {
    id: "prod-2",
    name_en: "Genuine Leather Handbags & Accessories",
    name_fr: "Sacs à main et accessoires en cuir véritable",
    name_ar: "حقائب يد وإكسسوارات من الجلد الطبيعي",
    price: "85.000",
    image: "/images/product-leather.png",
    supplier: "Kairouan Leather Craft",
    moq: "50 pcs"
  },
  {
    id: "prod-3",
    name_en: "High-Capacity Olive Oil Pressing Machine",
    name_fr: "Presse à huile d'olive haute capacité",
    name_ar: "آلة كبس زيت الزيتون عالية القدرة",
    price: "18500.000",
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
    product_en: "Live cold-pressing organic olive oil demonstration",
    product_fr: "Démonstration de pressage à froid d'huile d'olive",
    product_ar: "عرض حي لعصر زيت الزيتون البكر الممتاز",
    viewerCount: "1,240",
    thumbnail: "/images/product-oliveoil.png",
    avatarColor: "bg-[#16A34A]"
  },
  {
    id: "live-2",
    storeName: "Sahel Textile Factory",
    city: "Monastir",
    product_en: "Inside the automated circular knitting loom room",
    product_fr: "Visite de l'atelier de tricotage circulaire automatisé",
    product_ar: "جولة في مصنع الغزل والنسيج الدائري المؤتمت",
    viewerCount: "845",
    thumbnail: "/images/product-textiles.png",
    avatarColor: "bg-[#2563EB]"
  },
  {
    id: "live-3",
    storeName: "Atlas Ceramic Artisans",
    city: "Nabeul",
    product_en: "Master potter shaping traditional ceramic vases live",
    product_fr: "Maître potier façonnant des vases traditionnels",
    product_ar: "تشكيل وتلوين الخزف الفخاري يدوياً على الهواء",
    viewerCount: "1,110",
    thumbnail: "/images/product-ceramics.png",
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

  // Helper to get localized names
  const getName = (item: any, field: string) => {
    return item[`${field}_${lang}`] || item[`${field}_en`] || item[field]
  }

  // Format currency dynamically to follow strict TN millimes standard
  const formatTND = (priceStr: string) => {
    const num = parseFloat(priceStr.replace(/,/g, ""))
    if (isNaN(num)) return priceStr
    const formatted = num.toFixed(3)
    return lang === "ar" ? `${formatted} د.ت` : `${formatted} DT`
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] selection:bg-[#2563EB]/10 selection:text-[#2563EB] pb-[70px]" dir={dir}>

      {/* 1. STICKY HEADER */}
      <header className="sticky top-0 z-50 w-full h-[64px] border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto h-full flex items-center justify-between px-6">

          {/* ALSOUK Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#2563EB] text-lg font-bold text-white shadow-sm">
              A
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              AL<span className="text-[#2563EB]">SOUK</span>
            </span>
          </Link>

          {/* Controls */}
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

            {/* Notification */}
            <button className="relative flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Bell className="size-[18px]" />
              <span className="absolute top-2 right-2 flex size-2 rounded-full bg-[#EF4444]" />
            </button>

            {/* Menu */}
            <button className="flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Menu className="size-[18px]" />
            </button>

          </div>
        </div>
      </header>

      {/* Main Sections */}
      <main className="flex-1 space-y-6 px-6 py-6 mx-auto w-full max-w-7xl">

        {/* 2. SEARCH */}
        <section className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100">
          <form onSubmit={handleSearchSubmit} className="flex gap-4">
            <div className="relative flex-1">
              <Search className={`absolute ${dir === "rtl" ? "right-4" : "left-4"} top-1/2 size-5 -translate-y-1/2 text-slate-400 pointer-events-none`} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className={`w-full h-12 ${dir === "rtl" ? "pr-12 pl-4" : "pl-12 pr-4"} rounded-full border border-slate-200 bg-slate-50 text-sm font-normal text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white transition-all shadow-inner`}
              />
            </div>
            <button
              type="submit"
              className="h-12 shrink-0 rounded-full bg-[#2563EB] px-6 text-sm font-semibold text-white shadow-sm hover:bg-[#2563EB]/95 transition-all flex items-center justify-center gap-2"
            >
              <Search className="size-4" />
              <span>{t.searchBtn}</span>
            </button>
          </form>
        </section>

        {/* 3. TODAY'S OPPORTUNITIES */}
        <section className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-red-50 text-[#EF4444]">
                <Flame className="size-4 fill-[#EF4444]" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">{t.todayOpportunities}</h2>
            </div>
            <Link href="/products" className="text-xs font-semibold text-[#2563EB] flex items-center gap-0.5 hover:underline">
              <span>{t.viewAll}</span>
              <ChevronRight className="size-3" />
            </Link>
          </div>

          {/* Horizontal scrolling row */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
            {OPPORTUNITIES.map((opp) => (
              <div
                key={opp.id}
                className="w-56 shrink-0 snap-start rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm hover:border-slate-200 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image container */}
                  <div className="relative aspect-square w-full rounded-xl bg-slate-50 overflow-hidden mb-3 border border-slate-100">
                    <Image
                      src={opp.image}
                      alt={getName(opp, "name")}
                      fill
                      sizes="224px"
                      className="object-cover"
                    />
                    <span className={`absolute top-2 left-2 rounded-full px-2 py-1 text-[9px] font-bold tracking-wider uppercase shadow-sm ${opp.badgeColor}`}>
                      {opp.badge}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug mb-1">
                    {getName(opp, "name")}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-normal mb-1">{t.moq}: {opp.moq}</p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-[9px] font-semibold text-slate-400 uppercase">{t.tnd}</span>
                    <span className="text-sm font-bold text-[#2563EB]">{formatTND(opp.price)}</span>
                  </div>
                  <Link href="/rfq" className="block w-full">
                    <button className="w-full rounded-xl bg-[#2563EB] py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#2563EB]/95 active:scale-95 transition-all">
                      {t.requestQuote}
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. CATEGORIES */}
        <section className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                <Grid className="size-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">{t.categoriesTitle}</h2>
            </div>
            <Link href="/categories" className="text-xs font-semibold text-[#2563EB] flex items-center gap-0.5 hover:underline">
              <span>{t.viewAll}</span>
              <ChevronRight className="size-3" />
            </Link>
          </div>

          {/* Horizontally scrolling rounded icon buttons */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
            {CATEGORY_ITEMS.map((cat) => {
              const IconComp = cat.icon
              return (
                <Link
                  key={cat.key}
                  href="/categories"
                  className="flex flex-col items-center gap-2 w-20 shrink-0 snap-start text-center group"
                >
                  <span className={`flex size-14 items-center justify-center rounded-2xl border ${cat.color} transition-transform group-hover:scale-105 shadow-sm`}>
                    <IconComp className="size-6" />
                  </span>
                  <span className="text-[11px] font-bold text-slate-700 tracking-tight truncate w-full">
                    {t[cat.key as keyof typeof t] || cat.key}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* 5. FEATURED SUPPLIERS */}
        <section className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-green-50 text-[#16A34A]">
                <ShieldCheck className="size-4 fill-green-50" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">{t.featuredSuppliers}</h2>
            </div>
            <Link href="/suppliers" className="text-xs font-semibold text-[#2563EB] flex items-center gap-0.5 hover:underline">
              <span>{t.viewAll}</span>
              <ChevronRight className="size-3" />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
            {SUPPLIERS.map((sup) => (
              <div
                key={sup.id}
                className="w-72 shrink-0 snap-start rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm hover:border-slate-200 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  {/* Logo wrapper */}
                  <div className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 shadow-sm overflow-hidden">
                    <Image
                      src={sup.logoUrl}
                      alt={sup.name}
                      fill
                      sizes="48px"
                      className="object-cover opacity-90"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-800 truncate">
                        {sup.name}
                      </h3>
                      {sup.verified && (
                        <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#2563EB]/10 text-[#2563EB]" title={t.verified}>
                          <Check className="size-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-1">
                      <MapPin className="size-3 text-slate-400" />
                      <span>{sup.city}, Tunisia</span>
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-slate-700">{sup.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Link href={`/suppliers/${sup.id}`} className="block w-full">
                    <button className="w-full rounded-xl border border-[#2563EB]/20 bg-[#2563EB]/5 py-2 text-xs font-semibold text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-all shadow-sm">
                      {t.visitStore}
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. FEATURED PRODUCTS */}
        <section className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                <Box className="size-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">{t.featuredProducts}</h2>
            </div>
            <Link href="/products" className="text-xs font-semibold text-[#2563EB] flex items-center gap-0.5 hover:underline">
              <span>{t.viewAll}</span>
              <ChevronRight className="size-3" />
            </Link>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            {PRODUCTS.map((prod) => (
              <div
                key={prod.id}
                className="group rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm hover:border-slate-200 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full rounded-xl bg-slate-50 overflow-hidden mb-4 border border-slate-100">
                    <Image
                      src={prod.image}
                      alt={getName(prod, "name")}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug">
                    {getName(prod, "name")}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-2 flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-slate-300 shrink-0" />
                    <span className="truncate">{prod.supplier}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1 flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-slate-300 shrink-0" />
                    <span>{t.moq}: {prod.moq}</span>
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-semibold text-slate-400 block uppercase leading-none mb-1">{t.tnd}</span>
                    <span className="text-base font-bold text-[#2563EB]">{formatTND(prod.price)}</span>
                  </div>
                  <Link href="/rfq">
                    <button className="rounded-xl bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#2563EB]/95 active:scale-95 transition-all flex items-center gap-1.5">
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
        <section className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-red-50 text-[#EF4444]">
                <Tv2 className="size-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">{t.liveMarketplace}</h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-[#EF4444] uppercase tracking-wider animate-pulse">
              {t.liveBadge}
            </span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
            {LIVE_STREAMS.map((live) => (
              <div
                key={live.id}
                className="w-72 shrink-0 snap-start rounded-[20px] border border-slate-100 bg-white overflow-hidden shadow-sm hover:border-slate-200 transition-all flex flex-col justify-between"
              >
                {/* Media frame */}
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                  <Image
                    src={live.thumbnail}
                    alt={live.storeName}
                    fill
                    sizes="288px"
                    className="object-cover opacity-70"
                  />
                  {/* LIVE Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="rounded-md bg-[#EF4444] px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase animate-pulse">
                      {t.liveBadge}
                    </span>
                    <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm flex items-center gap-1">
                      <Users className="size-3" />
                      <span>{live.viewerCount} {t.viewerCount}</span>
                    </span>
                  </div>
                </div>

                {/* Stream info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`flex size-6 items-center justify-center rounded-full text-[10px] font-bold text-white uppercase ${live.avatarColor}`}>
                        {live.storeName.substring(0, 2)}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-800 truncate">{live.storeName}</span>
                        <span className="text-[9px] text-slate-400 font-semibold">{live.city}, Tunisia</span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-slate-700 line-clamp-2 leading-relaxed mb-3">
                      {getName(live, "product")}
                    </p>
                  </div>

                  <button className="w-full rounded-xl bg-[#EF4444] py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center gap-1.5">
                    <Tv2 className="size-4" />
                    <span>{t.openLive}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. RFQ BANNER */}
        <section className="relative overflow-hidden rounded-[20px] bg-[#2563EB] px-6 py-8 text-white shadow-lg border border-[#2563EB]/20">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-radial-[circle_at_right] from-white/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold tracking-wider uppercase mb-3">
                <FileText className="size-3" />
                <span>RFQ Sourcing</span>
              </span>
              <h2 className="text-lg md:text-xl font-bold leading-snug tracking-tight">
                {t.rfqTitle}
              </h2>
            </div>
            <Link href="/rfq" className="shrink-0">
              <button className="rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[#2563EB] hover:bg-slate-50 active:scale-95 transition-all shadow-md flex items-center gap-1.5">
                <span>{t.rfqBtn}</span>
                <Send className="size-4 rotate-45" />
              </button>
            </Link>
          </div>
        </section>

      </main>

      {/* 9. BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-[70px] border-t border-slate-200 bg-white/95 backdrop-blur-md px-6 shadow-lg">
        <div className="mx-auto h-full flex items-center justify-between max-w-lg">

          <Link href="/" className="flex flex-col items-center gap-1 text-[#2563EB]">
            <Home className="size-5" />
            <span className="text-[10px] font-semibold">{t.bottomHome}</span>
          </Link>

          <Link href="/categories" className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors">
            <Grid className="size-5" />
            <span className="text-[10px] font-semibold">{t.bottomCat}</span>
          </Link>

          <Link href="/rfq" className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors">
            <FileText className="size-5" />
            <span className="text-[10px] font-semibold">{t.bottomRfq}</span>
          </Link>

          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors relative">
            <MessageSquare className="size-5" />
            <span className="text-[10px] font-semibold">{t.bottomMsg}</span>
            <span className="absolute top-0 right-2 flex size-1.5 rounded-full bg-[#2563EB]" />
          </button>

          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors">
            <User className="size-5" />
            <span className="text-[10px] font-semibold">{t.bottomAcc}</span>
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
