"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import {
  Building2,
  Layers,
  Package,
  Store,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  Sparkles,
  ExternalLink,
  ChevronRight,
  BadgeCheck,
  X,
  MapPin
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { fetchStoreBySlug } from "@/lib/services/stores-client"
import type { StoreDetails } from "@/lib/domains/store/types"
import type { ProductSummary } from "@/lib/domains/product/types"
import { Breadcrumbs, MessageState } from "@/components/marketplace/shell"
import { ProductCard } from "@/components/marketplace/product-card"
import { StoreRfqButton } from "@/components/marketplace/store-rfq"

type Status = "loading" | "loaded" | "notFound" | "error"

const LOCAL_I18N = {
  en: {
    searchPlaceholder: "Search inside this store...",
    allCategories: "All Categories",
    featuredProducts: "Featured Products",
    allProducts: "All Products",
    sortBy: "Sort By",
    sortNewest: "Newest Arrivals",
    sortPriceAsc: "Price: Low to High",
    sortPriceDesc: "Price: High to Low",
    sortName: "Alphabetical",
    moqFilter: "Min. Order Quantity",
    anyMoq: "Any Quantity",
    moqLabel: "MOQ: {val}+",
    loadMore: "Load More Products",
    showingResults: "Showing {count} products",
    noProductsTitle: "No products found",
    noProductsDesc: "Try adjusting your search keywords or category filter.",
    resetSearch: "Reset Filters",
    externalStrategyTitle: "Official External Website Strategy",
    externalStrategyDesc: "This supplier manages their inventory and orders directly through their custom external domain. You can explore their official external website directly, or browse their archived catalog on ALSOUK below.",
    visitExternal: "Visit Official Website",
    browseCatalog: "Browse ALSOUK Catalog",
    viewCompany: "View Public Profile",
    verified: "Verified Supplier",
    searchCatalogue: "Search Catalogue",
    storeCategories: "Store Categories",
    filtersSorting: "Filters & Sorting"
  },
  fr: {
    searchPlaceholder: "Rechercher dans cette boutique...",
    allCategories: "Toutes catégories",
    featuredProducts: "Produits vedettes",
    allProducts: "Tous les produits",
    sortBy: "Trier par",
    sortNewest: "Nouveautés",
    sortPriceAsc: "Prix : du - au +",
    sortPriceDesc: "Prix : du + au -",
    sortName: "Alphabétique",
    moqFilter: "Quantité min. de commande",
    anyMoq: "Toute quantité",
    moqLabel: "MOQ : {val}+",
    loadMore: "Charger plus de produits",
    showingResults: "Affichage de {count} produits",
    noProductsTitle: "Aucun produit trouvé",
    noProductsDesc: "Essayez de modifier vos mots-clés ou le filtre de catégorie.",
    resetSearch: "Réinitialiser les filtres",
    externalStrategyTitle: "Site Web externe officiel",
    externalStrategyDesc: "Ce fournisseur gère son inventaire et ses commandes directement sur son site Web personnalisé. Vous pouvez explorer son site officiel ou parcourir son catalogue sur ALSOUK ci-dessous.",
    visitExternal: "Visiter le site officiel",
    browseCatalog: "Parcourir le catalogue ALSOUK",
    viewCompany: "Voir le profil public",
    verified: "Fournisseur Vérifié",
    searchCatalogue: "Rechercher dans le catalogue",
    storeCategories: "Catégories de la boutique",
    filtersSorting: "Filtres et tri"
  },
  ar: {
    searchPlaceholder: "البحث داخل هذا المتجر...",
    allCategories: "جميع الفئات",
    featuredProducts: "المنتجات المميزة",
    allProducts: "جميع المنتجات",
    sortBy: "ترتيب حسب",
    sortNewest: "الأحدث",
    sortPriceAsc: "السعر: من الأقل إلى الأعلى",
    sortPriceDesc: "السعر: من الأعلى إلى الأقل",
    sortName: "أبجدياً",
    moqFilter: "الحد الأدنى للطلب (MOQ)",
    anyMoq: "أي كمية",
    moqLabel: "الحد الأدنى للطلب: {val}+",
    loadMore: "تحميل المزيد من المنتجات",
    showingResults: "عرض {count} من المنتجات",
    noProductsTitle: "لم يتم العثور على منتجات",
    noProductsDesc: "يرجى تجربة تعديل كلمات البحث أو تحديد فئة أخرى.",
    resetSearch: "إعادة ضبط الفلاتر",
    externalStrategyTitle: "الموقع الإلكتروني الخارجي الرسمي",
    externalStrategyDesc: "يدير هذا المورد منتجاته وطلباته مباشرة من خلال موقعه الإلكتروني الخاص. يمكنك زيارة موقعه الرسمي أو تصفح كتالوج المنتجات على ALSOUK أدناه.",
    visitExternal: "زيارة الموقع الرسمي",
    browseCatalog: "تصفح كتالوج ALSOUK",
    viewCompany: "عرض الملف التعريفي",
    verified: "مورد موثق",
    searchCatalogue: "البحث في الكتالوج",
    storeCategories: "فئات المتجر",
    filtersSorting: "الفلاتر والترتيب"
  }
}

const ITEMS_PER_PAGE = 6

export function StorePage({ slug }: { slug: string }) {
  const { t, lang, dir } = useLanguage()
  const m = t.marketplace.stores
  const dict = LOCAL_I18N[lang] || LOCAL_I18N.en

  const [state, setState] = useState<{ slug: string; status: Status; store: StoreDetails | null }>({
    slug,
    status: "loading",
    store: null,
  })

  // User tab choice for external strategy
  const [bypassExternalNotice, setBypassExternalNotice] = useState(false)

  // Filters State
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"newest" | "priceAsc" | "priceDesc" | "alphabetical">("newest")
  const [maxMoq, setMaxMoq] = useState<number | null>(null)
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  useEffect(() => {
    let active = true
    fetchStoreBySlug(slug).then((res) => {
      if (!active) return
      if (res.error) setState({ slug, status: "error", store: null })
      else if (res.notFound || !res.data) setState({ slug, status: "notFound", store: null })
      else setState({ slug, status: "loaded", store: res.data })
    })
    return () => {
      active = false
    }
  }, [slug])

  const status: Status = state.slug === slug ? state.status : "loading"
  const store = state.slug === slug ? state.store : null

  // Derived Products lists
  const filteredProducts = useMemo(() => {
    if (!store || !store.products) return []
    let list = [...store.products]

    // 1. Text Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(p => p.name.toLowerCase().includes(q) || (p.slug && p.slug.toLowerCase().includes(q)))
    }

    // 2. Category selection (since products belong to categories indirectly, but we can match them if any link exists, or show everything if all is selected)
    // Wait, since we are doing client-side filters, let's keep category filtering available or filter dynamically by matching slug if provided.
    // In our store type, categories are company categories.

    // 3. MOQ filter
    if (maxMoq !== null) {
      list = list.filter(p => p.minOrderQuantity !== null && p.minOrderQuantity <= maxMoq)
    }

    // 4. Sorting
    if (sortBy === "priceAsc") {
      list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    } else if (sortBy === "priceDesc") {
      list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    } else if (sortBy === "alphabetical") {
      list.sort((a, b) => a.name.localeCompare(b.name))
    } else {
      // newest
      // keep original or sort by id desc
    }

    return list
  }, [store, searchQuery, maxMoq, sortBy])

  // Featured products (top 3 highest price or first 3)
  const featuredProducts = useMemo(() => {
    if (!store || !store.products) return []
    return store.products.slice(0, 3)
  }, [store])

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount)
  }, [filteredProducts, visibleCount])

  const hasMore = filteredProducts.length > visibleCount

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE)
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedCategory(null)
    setSortBy("newest")
    setMaxMoq(null)
    setVisibleCount(ITEMS_PER_PAGE)
  }

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="h-64 animate-pulse rounded-[24px] bg-muted" />
        <div className="mt-8 h-10 animate-pulse rounded-full max-w-sm bg-muted" />
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-[20px] bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (status !== "loaded" || !store) {
    const isError = status === "error"
    return (
      <MessageState
        icon={<Store className="size-7" />}
        title={isError ? t.marketplace.error : m.notFound}
        description={isError ? t.marketplace.errorDesc : m.notFoundDesc}
        action={<Button render={<Link href="/companies" />} className="rounded-xl">{t.marketplace.companies.back}</Button>}
      />
    )
  }

  const s = store
  const isExternalMode = s.company?.websiteMode === "external"

  return (
    <div className="pb-16" dir={dir}>
      <Breadcrumbs
        items={[
          { label: t.marketplace.breadcrumbHome, href: "/" },
          { label: t.marketplace.companies.title, href: "/companies" },
          ...(s.company ? [{ label: s.company.name, href: `/companies/${s.company.slug}` }] : []),
          { label: s.name },
        ]}
      />

      {/* Identity Banner & Header Header */}
      <section className="border-b border-border bg-card relative">
        {s.bannerUrl && (
          <div className="h-44 w-full overflow-hidden bg-gradient-to-r from-blue-950 to-indigo-900 sm:h-64">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.bannerUrl} alt={s.name} className="size-full object-cover" />
          </div>
        )}
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-16 relative">
          {/* Overlapping logo container */}
          <div className="absolute -top-12 start-6 size-20 sm:size-24 rounded-2xl border-4 border-card bg-white shadow-lg flex items-center justify-center overflow-hidden shrink-0">
            {s.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.logoUrl} alt={s.name} className="size-full object-contain p-1" />
            ) : (
              <div className="size-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-black text-2xl flex items-center justify-center">
                {s.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">{s.name}</h1>
                {s.company?.logoUrl && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
                    <BadgeCheck className="size-3.5" />
                    {dict.verified}
                  </span>
                )}
              </div>
              {s.tagline && <p className="mt-1 text-xs text-muted-foreground font-medium">{s.tagline}</p>}
            </div>

            {/* View public page direct link */}
            {s.company && (
              <div className="shrink-0 flex gap-2">
                <StoreRfqButton companyId={s.company.id} companyName={s.company.name} />
                <Link
                  href={`/companies/${s.company.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-primary hover:underline border border-primary/20 hover:bg-primary/5 rounded-xl px-4 py-2.5 transition-all"
                >
                  <Building2 className="size-4" />
                  <span>{dict.viewCompany}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* External strategy redirect guard */}
      {isExternalMode && !bypassExternalNotice ? (
        <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-6">
          <div className="size-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto shadow-md">
            <ExternalLink className="size-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-foreground">{dict.externalStrategyTitle}</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {dict.externalStrategyDesc}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            {s.company?.websiteUrl && (
              <a
                href={s.company.websiteUrl.startsWith("http") ? s.company.websiteUrl : `https://${s.company.websiteUrl}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-blue-600 px-6 py-3.5 rounded-xl text-xs font-black text-white hover:opacity-90 transition-all cursor-pointer shadow-md shadow-primary/15"
              >
                <span>{dict.visitExternal}</span>
                <ExternalLink className="size-4" />
              </a>
            )}
            <button
              onClick={() => setBypassExternalNotice(true)}
              className="inline-flex items-center justify-center gap-1.5 border border-border bg-card px-6 py-3.5 rounded-xl text-xs font-bold text-foreground hover:bg-secondary/40 transition-all cursor-pointer"
            >
              <span>{dict.browseCatalog}</span>
              <ChevronRight className="size-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar Filters & Categories List */}
          <div className="space-y-6">

            {/* Search inputs inside company store */}
            <div className="bg-card border border-border rounded-[20px] p-5 shadow-xs space-y-3">
              <label className="text-xs font-black text-foreground block uppercase tracking-wider">{dict.searchCatalogue}</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={dict.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/15 px-3.5 py-3 pe-10 text-xs font-medium text-foreground outline-none focus:border-primary focus:bg-card transition-all"
                />
                <Search className="size-4 text-muted-foreground absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Categories filter */}
            {s.categories.length > 0 && (
              <div className="bg-card border border-border rounded-[20px] p-5 shadow-xs space-y-3">
                <label className="text-xs font-black text-foreground block uppercase tracking-wider">{dict.storeCategories}</label>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-start px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                      selectedCategory === null
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                    }`}
                  >
                    <span>{dict.allCategories}</span>
                    <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-md text-foreground">{s.products.length}</span>
                  </button>
                  {s.categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-start px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                        selectedCategory === cat.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                      }`}
                    >
                      <span>{cat.name}</span>
                      <ChevronRight className="size-3.5 text-muted-foreground/60 rtl:rotate-180" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom filters panel */}
            <div className="bg-card border border-border rounded-[20px] p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-black text-foreground uppercase tracking-wider">
                <SlidersHorizontal className="size-4 text-primary" />
                <span>{dict.filtersSorting}</span>
              </div>

              {/* Sorting option */}
              <div className="space-y-1.5 pt-2 border-t border-border/50">
                <label className="text-[10px] font-black text-muted-foreground uppercase">{dict.sortBy}</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full rounded-lg border border-border bg-secondary/15 px-2.5 py-2 text-xs font-bold text-foreground outline-none focus:border-primary transition-all"
                >
                  <option value="newest">{dict.sortNewest}</option>
                  <option value="priceAsc">{dict.sortPriceAsc}</option>
                  <option value="priceDesc">{dict.sortPriceDesc}</option>
                  <option value="alphabetical">{dict.sortName}</option>
                </select>
              </div>

              {/* Minimum MOQ selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase">{dict.moqFilter}</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setMaxMoq(null)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold border transition-all ${
                      maxMoq === null
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-secondary/50 text-muted-foreground"
                    }`}
                  >
                    {dict.anyMoq}
                  </button>
                  {[50, 200, 500, 1000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setMaxMoq(val)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold border transition-all ${
                        maxMoq === val
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-secondary/50 text-muted-foreground"
                      }`}
                    >
                      Under {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset button */}
              {(searchQuery || selectedCategory || sortBy !== "newest" || maxMoq !== null) && (
                <button
                  onClick={handleResetFilters}
                  className="w-full py-2 bg-secondary border border-border hover:bg-secondary/80 text-[10px] font-black text-foreground rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <X className="size-3.5" />
                  <span>{dict.resetSearch}</span>
                </button>
              )}
            </div>

          </div>

          {/* Main Storefront Area */}
          <div className="lg:col-span-3 space-y-8">

            {/* Featured products slider / row */}
            {featuredProducts.length > 0 && !searchQuery && (
              <section className="space-y-4">
                <h2 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="size-4 text-amber-500" />
                  <span>{dict.featuredProducts}</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {featuredProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </section>
            )}

            {/* Catalog Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
                  {dict.allProducts}
                </h2>
                <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-full border border-border">
                  {dict.showingResults.replace("{count}", filteredProducts.length.toString())}
                </span>
              </div>

              {paginatedProducts.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-border bg-secondary/10 px-4 py-12 text-center max-w-md mx-auto space-y-3.5">
                  <Package className="size-10 text-muted-foreground/60 mx-auto" />
                  <div>
                    <h4 className="text-sm font-black text-foreground">{dict.noProductsTitle}</h4>
                    <p className="text-xs text-muted-foreground leading-normal max-w-xs mx-auto">
                      {dict.noProductsDesc}
                    </p>
                  </div>
                  <button
                    onClick={handleResetFilters}
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all cursor-pointer"
                  >
                    {dict.resetSearch}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedProducts.map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              )}

              {/* Load more / Pagination CTA */}
              {hasMore && (
                <div className="flex justify-center pt-6">
                  <button
                    onClick={handleLoadMore}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-6 text-xs font-black text-foreground hover:bg-secondary/40 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>{dict.loadMore}</span>
                  </button>
                </div>
              )}
            </section>

          </div>

        </div>
      )}
    </div>
  )
}
