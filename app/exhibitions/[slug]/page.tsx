"use client"

import { use, useEffect, useState, useMemo } from "react"
import Link from "next/link"
import {
  Calendar,
  MapPin,
  Trophy,
  Search,
  Building2,
  Users,
  ArrowRight,
  Loader2,
  Tag,
  Shield,
  Star,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronDown,
  Info
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { fetchExhibitionBySlug, fetchBoothsByExhibition } from "@/lib/services/exhibitions-client"
import type { Exhibition, ExhibitionBooth } from "@/lib/domains/exhibition/types"
import { MarketplaceShell, Breadcrumbs, MessageState } from "@/components/marketplace/shell"
import { directoryT } from "@/lib/directory-i18n"

export default function ExhibitionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return (
    <MarketplaceShell>
      <ExhibitionDetailContent slug={slug} />
    </MarketplaceShell>
  )
}

function ExhibitionDetailContent({ slug }: { slug: string }) {
  const { t, lang, dir } = useLanguage()
  const exT = t.exhibitions
  const dirT = directoryT[lang] || directoryT.en

  const [exhibition, setExhibition] = useState<Exhibition | null>(null)
  const [booths, setBooths] = useState<ExhibitionBooth[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [sortBy, setSortBy] = useState<"featured" | "alphabetical" | "boothNumber">("featured")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [visibleCount, setVisibleCount] = useState(8)

  useEffect(() => {
    let active = true

    Promise.all([
      fetchExhibitionBySlug(slug),
      fetchBoothsByExhibition(slug)
    ]).then(([exRes, boothsData]) => {
      if (!active) return
      if (exRes.error || !exRes.data) {
        setError(true)
        setLoading(false)
        return
      }
      setExhibition(exRes.data)
      setBooths(boothsData)
      setLoading(false)
    }).catch(() => {
      if (active) {
        setError(true)
        setLoading(false)
      }
    })

    return () => {
      active = false
    }
  }, [slug])

  // Get unique categories from all loaded booths
  const categoriesList = useMemo(() => {
    const cats = new Set<string>()
    booths.forEach((b) => {
      if (b.category) {
        cats.add(b.category)
      }
    })
    return ["All", ...Array.from(cats)]
  }, [booths])

  // Split booths into Featured and Regular lists based on filter & search query
  const { featuredBooths, filteredAllBooths } = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    // Filter booths
    const filtered = booths.filter((booth) => {
      // Category filter
      if (selectedCategory !== "All" && booth.category !== selectedCategory) {
        return false
      }

      // Search filter
      if (query) {
        const compName = booth.company?.name.toLowerCase() || ""
        const compTagline = booth.company?.tagline?.toLowerCase() || ""
        const boothDesc = booth.description.toLowerCase()
        const bNum = booth.boothNumber?.toLowerCase() || ""
        const bCat = booth.category?.toLowerCase() || ""

        return (
          compName.includes(query) ||
          compTagline.includes(query) ||
          boothDesc.includes(query) ||
          bNum.includes(query) ||
          bCat.includes(query)
        );
      }
      return true
    })

    // Sort booths
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "alphabetical") {
        const nameA = a.company?.name || ""
        const nameB = b.company?.name || ""
        return nameA.localeCompare(nameB, lang)
      }
      if (sortBy === "boothNumber") {
        const numA = a.boothNumber || ""
        const numB = b.boothNumber || ""
        return numA.localeCompare(numB, undefined, { numeric: true, sensitivity: "base" })
      }
      // "featured" sorting: featured first, then fallback to alphabetical
      const featA = a.isFeatured ? 1 : 0
      const featB = b.isFeatured ? 1 : 0
      if (featA !== featB) return featB - featA

      const nameA = a.company?.name || ""
      const nameB = b.company?.name || ""
      return nameA.localeCompare(nameB, lang)
    })

    const featured = sorted.filter((b) => b.isFeatured)

    return {
      featuredBooths: featured,
      filteredAllBooths: sorted,
    }
  }, [booths, searchQuery, selectedCategory, sortBy, lang])

  // Premium, fully animated loading skeleton view
  if (loading) {
    return (
      <div className="pb-16" dir={dir}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="h-4 w-48 bg-secondary/40 rounded-sm animate-pulse mb-6" />
        </div>

        {/* Banner Skeleton */}
        <div className="w-full h-48 sm:h-72 bg-secondary/20 relative animate-pulse flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 via-secondary/25 to-secondary/10 animate-[shimmer_2s_infinite]" />
          <Building2 className="size-16 text-muted-foreground/30" />
        </div>

        {/* Info Area Skeleton */}
        <div className="max-w-6xl mx-auto px-4 pb-8 pt-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="h-5 w-24 bg-primary/10 border border-primary/25 rounded-full animate-pulse" />
              <div className="h-10 w-2/3 bg-secondary/35 rounded-xl animate-pulse" />
              <div className="h-4 w-full bg-secondary/25 rounded-md animate-pulse" />
              <div className="h-4 w-4/5 bg-secondary/25 rounded-md animate-pulse" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border/40 pt-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-secondary/35 animate-pulse shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 w-16 bg-secondary/35 rounded-xs" />
                      <div className="h-4 w-28 bg-secondary/25 rounded-xs" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-20 w-48 bg-secondary/35 rounded-2xl animate-pulse shrink-0" />
          </div>

          {/* Search/Filter Bar Skeleton */}
          <div className="border border-border p-6 rounded-[20px] bg-card space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="h-12 flex-1 bg-secondary/25 rounded-xl" />
              <div className="h-12 w-40 bg-secondary/25 rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-32 bg-secondary/25 rounded-xs" />
              <div className="flex gap-2 overflow-x-hidden">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-8 w-24 bg-secondary/25 rounded-lg shrink-0" />
                ))}
              </div>
            </div>
          </div>

          {/* Directory Grid Skeleton */}
          <div className="space-y-6">
            <div className="h-6 w-36 bg-secondary/35 rounded-md" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="rounded-[20px] border border-border bg-card p-5 space-y-4 animate-pulse">
                  <div className="flex justify-between items-start">
                    <div className="size-12 rounded-xl bg-secondary/35" />
                    <div className="space-y-1.5 flex flex-col items-end">
                      <div className="h-4.5 w-16 bg-secondary/35 rounded-full" />
                      <div className="h-3.5 w-20 bg-secondary/25 rounded-xs" />
                    </div>
                  </div>
                  <div className="h-5 w-32 bg-secondary/35 rounded-md" />
                  <div className="space-y-2 pt-2">
                    <div className="h-3 w-full bg-secondary/25 rounded-xs" />
                    <div className="h-3 w-5/6 bg-secondary/25 rounded-xs" />
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-border/40">
                    <div className="h-4 w-12 bg-secondary/25 rounded-xs" />
                    <div className="h-9 w-24 bg-secondary/35 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !exhibition) {
    return (
      <MessageState
        icon={<Building2 className="size-7 animate-bounce text-muted-foreground" />}
        title={t.marketplace.error}
        description="We couldn't load this virtual exhibition event."
        action={<Link href="/exhibitions" className="rounded-[20px] bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition-all">Back to Exhibitions</Link>}
      />
    )
  }

  const startStr = new Date(exhibition.startDate).toLocaleDateString(
    lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : "ar-TN",
    { year: "numeric", month: "long", day: "numeric" }
  )
  const endStr = new Date(exhibition.endDate).toLocaleDateString(
    lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : "ar-TN",
    { year: "numeric", month: "long", day: "numeric" }
  )
  const cityLoc = dirT.cities[exhibition.city] || exhibition.city
  const isTunisia = exhibition.country === "TN"

  // Sliced booths for progressive rendering
  const visibleBooths = filteredAllBooths.slice(0, visibleCount)

  return (
    <div className="pb-16" dir={dir}>
      <Breadcrumbs
        items={[
          { label: t.marketplace.breadcrumbHome, href: "/" },
          { label: exT.title, href: "/exhibitions" },
          { label: exhibition.name },
        ]}
      />

      {/* Hero Header Cover banner */}
      <section className="relative bg-card border-b border-border overflow-hidden">
        <div className="h-48 w-full overflow-hidden bg-gradient-to-r from-slate-900 via-[#1E3A8A] to-blue-950 sm:h-72 relative">
          {exhibition.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={exhibition.coverUrl} alt={exhibition.name} className="size-full object-cover opacity-85 transition-transform duration-700 hover:scale-105" />
          ) : (
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          )}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Info panel overlay */}
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-6 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex flex-wrap gap-2">
                {exhibition.categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] font-extrabold text-primary uppercase tracking-wider shadow-2xs"
                  >
                    <Tag className="size-3" />
                    <span>{cat}</span>
                  </span>
                ))}
              </div>

              <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl leading-tight">
                {exhibition.name}
              </h1>

              <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                {exhibition.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-muted-foreground border-t border-border/40 pt-4">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-2xs">
                    <Trophy className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground/80 tracking-wider">{exT.organizer}</p>
                    <p className="text-foreground font-extrabold">{exhibition.organizer}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-2xs">
                    <Calendar className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground/80 tracking-wider">Exhibition Duration</p>
                    <p className="text-foreground font-extrabold">{startStr} – {endStr}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-2xs">
                    <MapPin className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground/80 tracking-wider">Location</p>
                    <p className="text-foreground font-extrabold capitalize">{cityLoc}, {isTunisia ? "Tunisia 🇹🇳" : exhibition.country}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick stats counter */}
            <div className="bg-secondary/35 border border-border/80 p-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-2xs">
              <div className="size-12 rounded-xl bg-gradient-to-tr from-primary to-blue-600 text-white flex items-center justify-center shadow-sm">
                <Users className="size-5.5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground/85 tracking-wider">{exT.exhibitors}</p>
                <p className="text-lg font-black text-foreground">{booths.length} {booths.length === 1 ? "Booth" : "Booths"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Concept/Help banner */}
      <section className="mx-auto max-w-6xl px-4 pt-8">
        <div className="p-4 rounded-[20px] bg-blue-500/5 border border-blue-500/15 text-xs font-semibold text-foreground flex gap-3.5 items-start leading-relaxed shadow-3xs">
          <Info className="size-5 shrink-0 text-primary mt-0.5" />
          <div className="space-y-1">
            <span className="font-black text-primary uppercase tracking-wide">Exhibition Pavilion Walkthrough</span>
            <p className="text-muted-foreground">
              These digital booths host exclusive prototypes, regional technologies, and private B2B catalogues. No standard retail products are shown here. Click any pavilion booth card below to view detailed demos, PDFs, and schedule virtual private meetings.
            </p>
          </div>
        </div>
      </section>

      {/* Exhibitor Search, Filter Chips & Sorting Control Panel */}
      <section className="mx-auto max-w-6xl px-4 py-8">

        {/* Search, Sort and Category Filters */}
        <div className="space-y-6 mb-8 bg-card border border-border p-5 rounded-[20px] shadow-xs">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Live Search */}
            <div className="relative flex-1">
              <Search className="absolute top-1/2 start-3.5 -translate-y-1/2 size-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setVisibleCount(8) // Reset progressive load count
                }}
                placeholder={exT.searchPlaceholder}
                className="w-full rounded-xl border border-border bg-secondary/10 py-3.5 ps-11 pe-4 text-xs font-bold text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative shrink-0 flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground whitespace-nowrap flex items-center gap-1">
                <ArrowUpDown className="size-3.5" />
                Sort:
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any)
                    setVisibleCount(8) // Reset progressive load count
                  }}
                  className="appearance-none rounded-xl border border-border bg-secondary/10 py-3.5 ps-4 pe-10 text-xs font-black text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 cursor-pointer pr-10"
                >
                  <option value="featured">Featured First</option>
                  <option value="alphabetical">Alphabetical (A-Z)</option>
                  <option value="boothNumber">Booth Number</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Interactive Horizontal Category Filter Rail */}
          <div className="border-t border-border/50 pt-5">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <SlidersHorizontal className="size-3.5 text-primary" />
              Filter by Pavilion Category
            </h3>
            <div className="flex flex-nowrap overflow-x-auto gap-2.5 pb-2.5 scrollbar-none snap-x snap-mandatory">
              {categoriesList.map((cat) => {
                const isActive = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat)
                      setVisibleCount(8) // Reset progressive load count
                    }}
                    className={`snap-center rounded-xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap border cursor-pointer active:scale-95 duration-150 ${
                      isActive
                        ? "bg-primary text-white border-primary shadow-sm hover:opacity-95"
                        : "bg-secondary/10 hover:bg-secondary/25 text-muted-foreground border-border"
                    }`}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Featured Showcase Section (Rendered prominent if there are featured booths) */}
        {featuredBooths.length > 0 && searchQuery === "" && selectedCategory === "All" && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="size-5 fill-amber-500 text-amber-500 animate-spin-slow" />
              <h2 className="text-xl font-black text-foreground tracking-tight">
                Featured Event Pavilions
              </h2>
              <span className="text-[9px] font-black uppercase bg-amber-500/10 border border-amber-500/20 text-amber-600 px-2 py-0.5 rounded-full tracking-wider">
                Elite Vetted
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredBooths.map((booth) => {
                const comp = booth.company
                if (!comp) return null

                return (
                  <div
                    key={`featured-${booth.id}`}
                    className="group relative rounded-[20px] border-2 border-amber-500/25 bg-gradient-to-br from-amber-500/[0.03] via-card to-amber-500/[0.01] p-6 shadow-sm flex flex-col justify-between transition-all duration-300 hover:border-amber-500/50 hover:shadow-md"
                  >
                    {/* Top right badges */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      {booth.boothNumber && (
                        <span className="text-[9px] font-black text-amber-800 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Booth {booth.boothNumber}
                        </span>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* Brand details */}
                      <div className="flex items-start gap-4">
                        <div className="size-14 rounded-2xl border-2 border-amber-500/20 bg-white flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-2xs group-hover:scale-105 transition-transform">
                          {comp.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={comp.logoUrl} alt={comp.name} className="size-full object-contain" />
                          ) : (
                            <div className="size-full bg-amber-500/10 text-amber-600 font-black text-xl flex items-center justify-center">
                              {comp.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 pe-16">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors truncate">
                              {comp.name}
                            </h3>
                            {comp.verified && (
                              <Shield className="size-4.5 text-emerald-500 shrink-0" />
                            )}
                          </div>
                          {booth.category && (
                            <span className="inline-block text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider mt-0.5">
                              {booth.category}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs font-semibold text-muted-foreground leading-relaxed line-clamp-3">
                        {booth.description}
                      </p>
                    </div>

                    {/* Booth Actions */}
                    <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between gap-4">
                      <span className="text-[10px] font-extrabold uppercase text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Star className="size-3 fill-amber-500 text-amber-500" />
                        Featured Pavilion
                      </span>

                      <Link
                        href={`/exhibitions/${slug}/booths/${booth.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary hover:opacity-95 px-4.5 py-2.5 text-xs font-black text-white transition-all shadow-md shadow-primary/10 hover:shadow-lg active:scale-95 cursor-pointer"
                      >
                        <span>{exT.viewBooth}</span>
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Booth Directory Heading */}
        <div className="border-t border-border/40 pt-8 mt-4">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight">
                Virtual Booth Directory
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Showing <span className="text-foreground font-black">{filteredAllBooths.length}</span> matching pavilions
              </p>
            </div>
          </div>

          {filteredAllBooths.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-border rounded-3xl bg-secondary/10">
              <Building2 className="size-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
              <p className="text-base font-bold text-foreground">No exhibitors matched your search query</p>
              <p className="text-xs text-muted-foreground mt-1">Try checking your spelling or selecting another category.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Main responsive grid of booth cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleBooths.map((booth) => {
                  const comp = booth.company
                  if (!comp) return null

                  return (
                    <div
                      key={booth.id}
                      className="group rounded-[20px] border border-border bg-card p-5 shadow-xs flex flex-col justify-between transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="space-y-4">
                        {/* Card header with Logo & Category/Booth tags */}
                        <div className="flex items-start justify-between gap-3">
                          {/* Company Logo */}
                          <div className="size-12 rounded-xl border border-border bg-white flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-3xs group-hover:scale-105 transition-transform duration-200">
                            {comp.logoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={comp.logoUrl} alt={comp.name} className="size-full object-contain" />
                            ) : (
                              <div className="size-full bg-primary/10 text-primary font-black text-lg flex items-center justify-center">
                                {comp.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>

                          {/* Booth Number & Category tags */}
                          <div className="flex flex-col items-end gap-1 min-w-0">
                            {booth.boothNumber && (
                              <span className="text-[9px] font-black tracking-wider text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full uppercase">
                                Booth #{booth.boothNumber}
                              </span>
                            )}
                            {booth.category && (
                              <span className="text-[9px] font-extrabold text-muted-foreground uppercase truncate max-w-[120px] tracking-wide mt-0.5">
                                {booth.category}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Company Details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-sm font-black text-foreground group-hover:text-primary transition-colors truncate">
                              {comp.name}
                            </h3>
                            {comp.verified && (
                              <Shield className="size-4 text-emerald-500 shrink-0" />
                            )}
                            {booth.isFeatured && (
                              <Star className="size-3.5 fill-amber-500 text-amber-500 shrink-0" />
                            )}
                          </div>
                        </div>

                        {/* Short Booth Description */}
                        <p className="text-xs font-semibold text-muted-foreground leading-relaxed line-clamp-3">
                          {booth.description}
                        </p>
                      </div>

                      {/* Booth Actions */}
                      <div className="mt-5 pt-4 border-t border-border/45 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1 min-w-0">
                          {booth.isFeatured ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full tracking-wide">
                              <Star className="size-2.5 fill-amber-500 text-amber-500" />
                              VETTED
                            </span>
                          ) : (
                            <span className="text-[9px] font-black text-muted-foreground bg-secondary/55 border border-border px-2 py-0.5 rounded-full tracking-wide">
                              ACTIVE
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/exhibitions/${slug}/booths/${booth.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary/95 px-4 py-2.5 text-xs font-black text-white transition-all shadow-xs shrink-0 active:scale-95 cursor-pointer"
                        >
                          <span>{exT.viewBooth}</span>
                          <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Lazy Loading progressive Show More trigger */}
              {visibleCount < filteredAllBooths.length && (
                <div className="flex justify-center pt-6">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 8)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-secondary/40 px-6 py-4 text-xs font-black text-foreground transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <Loader2 className="size-4 text-primary animate-spin" />
                    <span>Load More Exhibitors</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
