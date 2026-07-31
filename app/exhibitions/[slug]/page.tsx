"use client"

import { use, useEffect, useState } from "react"
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
  Shield
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="size-8 text-primary animate-spin" />
        <span className="text-xs font-bold text-muted-foreground">{t.marketplace.loading}</span>
      </div>
    )
  }

  if (error || !exhibition) {
    return (
      <MessageState
        icon={<Building2 className="size-7" />}
        title={t.marketplace.error}
        description="We couldn't load this virtual exhibition event."
        action={<Link href="/exhibitions" className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white">Back to Exhibitions</Link>}
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

  // Filter booths by search query
  const filteredBooths = booths.filter((booth) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    const compName = booth.company?.name.toLowerCase() || ""
    const compTagline = booth.company?.tagline?.toLowerCase() || ""
    const boothDesc = booth.description.toLowerCase()
    const industry = booth.company?.primaryIndustry?.toLowerCase() || ""
    return (
      compName.includes(query) ||
      compTagline.includes(query) ||
      boothDesc.includes(query) ||
      industry.includes(query)
    )
  })

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
      <section className="relative bg-card border-b border-border">
        <div className="h-48 w-full overflow-hidden bg-gradient-to-r from-slate-900 via-[#1E3A8A] to-blue-950 sm:h-72 relative">
          {exhibition.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={exhibition.coverUrl} alt={exhibition.name} className="size-full object-cover opacity-85" />
          ) : (
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          )}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Info panel overlay */}
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-6 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                {exhibition.categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/25 px-3 py-1 text-[10px] font-bold text-primary uppercase"
                  >
                    <Tag className="size-3" />
                    <span>{cat}</span>
                  </span>
                ))}
              </div>

              <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                {exhibition.name}
              </h1>

              <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
                {exhibition.description}
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-muted-foreground border-t border-border/40 pt-4">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Trophy className="size-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground">{exT.organizer}</p>
                    <p className="text-foreground font-extrabold">{exhibition.organizer}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Calendar className="size-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Exhibition Duration</p>
                    <p className="text-foreground font-extrabold">{startStr} – {endStr}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <MapPin className="size-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Location</p>
                    <p className="text-foreground font-extrabold capitalize">{cityLoc}, {isTunisia ? "Tunisia 🇹🇳" : exhibition.country}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick stats counter */}
            <div className="bg-secondary/40 border border-border p-4 rounded-2xl flex items-center gap-4 shrink-0">
              <div className="size-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-md">
                <Users className="size-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground">{exT.exhibitors}</p>
                <p className="text-xl font-black text-foreground">{booths.length} {booths.length === 1 ? "Booth" : "Booths"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exhibitor Search & Booth List Grid */}
      <section className="mx-auto max-w-6xl px-4 py-8">

        {/* Live Search and stats */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute top-1/2 start-3.5 -translate-y-1/2 size-4.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={exT.searchPlaceholder}
              className="w-full rounded-xl border border-border bg-card py-3 ps-10 pe-4 text-xs font-semibold text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <p className="text-xs font-bold text-muted-foreground">
            Showing <span className="text-foreground font-black">{filteredBooths.length}</span> matching exhibitors
          </p>
        </div>

        {filteredBooths.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-border rounded-3xl bg-secondary/10">
            <Building2 className="size-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-base font-bold text-foreground">No exhibitors matched your search query</p>
            <p className="text-xs text-muted-foreground mt-1">Try checking your spelling or using wider search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBooths.map((booth) => {
              const comp = booth.company
              if (!comp) return null
              const compLoc = [comp.city ? (dirT.cities[comp.city] || comp.city) : null, comp.country ? (dirT.countries[comp.country as keyof typeof dirT.countries] || comp.country) : null].filter(Boolean).join(", ")

              return (
                <div
                  key={booth.id}
                  className="group rounded-[20px] border border-border bg-card p-6 shadow-xs flex flex-col justify-between transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div className="space-y-4">
                    {/* Header: Company logo & brand details */}
                    <div className="flex items-start gap-4">
                      <div className="size-14 rounded-2xl border border-border bg-white flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                        {comp.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={comp.logoUrl} alt={comp.name} className="size-full object-contain" />
                        ) : (
                          <div className="size-full bg-primary/10 text-primary font-black text-xl flex items-center justify-center">
                            {comp.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors truncate">
                            {comp.name}
                          </h3>
                          {comp.verified && (
                            <Shield className="size-4 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        {comp.tagline && (
                          <p className="text-[11px] font-bold text-muted-foreground line-clamp-1 mt-0.5">
                            {comp.tagline}
                          </p>
                        )}
                        <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="size-3 text-primary" />
                          <span>{compLoc}</span>
                        </p>
                      </div>
                    </div>

                    {/* Custom Booth Description (NOT generic company description) */}
                    <p className="text-xs font-semibold text-muted-foreground leading-relaxed line-clamp-3">
                      {booth.description}
                    </p>
                  </div>

                  {/* Booth Actions */}
                  <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between gap-4">
                    <span className="text-[10px] font-extrabold uppercase text-emerald-600 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
                      Active pavilion
                    </span>

                    <Link
                      href={`/exhibitions/${slug}/booths/${booth.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary hover:opacity-90 px-4 py-2.5 text-xs font-black text-white transition-all shadow-md shadow-primary/10"
                    >
                      <span>{exT.viewBooth}</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
