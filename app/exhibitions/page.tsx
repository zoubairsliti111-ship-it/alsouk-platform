"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, MapPin, Building2, Trophy, ArrowRight, Loader2, Info } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { fetchExhibitions } from "@/lib/services/exhibitions-client"
import type { Exhibition } from "@/lib/domains/exhibition/types"
import { MarketplaceShell, Breadcrumbs, ListingHeader, MessageState } from "@/components/marketplace/shell"
import { directoryT } from "@/lib/directory-i18n"

export default function ExhibitionsPage() {
  return (
    <MarketplaceShell>
      <ExhibitionsListContent />
    </MarketplaceShell>
  )
}

function ExhibitionsListContent() {
  const { t, lang, dir } = useLanguage()
  const exT = t.exhibitions
  const dirT = directoryT[lang] || directoryT.en

  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchExhibitions().then((data) => {
      if (!active) return
      setExhibitions(data)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="pb-16" dir={dir}>
      <Breadcrumbs items={[{ label: t.marketplace.breadcrumbHome, href: "/" }, { label: exT.title }]} />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <ListingHeader title={exT.title} subtitle={exT.subtitle} />

        {/* Feature badge about the Exhibition Concept */}
        <div className="mb-8 p-4 rounded-[20px] bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-foreground flex gap-3 items-start leading-relaxed">
          <Info className="size-5 shrink-0 text-primary mt-0.5" />
          <div className="space-y-1">
            <span className="font-black text-primary uppercase tracking-wide">ALSOUK Virtual Exhibition Pavilion</span>
            <p className="text-muted-foreground">
              A company&apos;s exhibition booth is isolated from its regular marketplace store. Everything showcased inside a booth (Exhibits) belongs only to that specific event, maintaining an archive of elite trade showcases even after physical shows conclude.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-xs font-bold text-muted-foreground">{t.marketplace.loading}</span>
          </div>
        ) : exhibitions.length === 0 ? (
          <MessageState icon={<Building2 className="size-7" />} title={exT.empty} />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {exhibitions.map((ex) => {
              const startStr = new Date(ex.startDate).toLocaleDateString(
                lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : "ar-TN",
                { year: "numeric", month: "long", day: "numeric" }
              )
              const endStr = new Date(ex.endDate).toLocaleDateString(
                lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : "ar-TN",
                { year: "numeric", month: "long", day: "numeric" }
              )
              const cityLoc = dirT.cities[ex.city] || ex.city
              const isTunisia = ex.country === "TN"

              return (
                <div
                  key={ex.id}
                  className="group relative flex flex-col overflow-hidden rounded-[20px] border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  {/* Cover Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-secondary">
                    {ex.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ex.coverUrl}
                        alt={ex.name}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="size-full bg-gradient-to-br from-primary to-blue-900 opacity-20" />
                    )}
                    {/* Floating status tag */}
                    <div className="absolute top-4 start-4 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white">
                      <span className="relative flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                      </span>
                      <span>B2B Event</span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        {ex.categories.slice(0, 2).map((cat) => (
                          <span
                            key={cat}
                            className="inline-block rounded-lg bg-secondary px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>

                      <h3 className="text-xl font-black tracking-tight text-foreground line-clamp-1">
                        {ex.name}
                      </h3>

                      <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2">
                        {ex.description}
                      </p>

                      <div className="pt-2 space-y-2 text-xs font-semibold text-muted-foreground border-t border-border/50">
                        <div className="flex items-center gap-2">
                          <Trophy className="size-4 text-primary shrink-0" />
                          <span>
                            <span className="text-foreground font-extrabold">{exT.organizer}:</span> {ex.organizer}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="size-4 text-primary shrink-0" />
                          <span>
                            {startStr} – {endStr}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="size-4 text-primary shrink-0" />
                          <span className="capitalize">
                            {cityLoc}, {isTunisia ? "Tunisia 🇹🇳" : ex.country}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/40">
                      <Link
                        href={`/exhibitions/${ex.slug}`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-secondary hover:bg-primary/10 hover:text-primary px-4 py-3 text-xs font-black text-foreground transition-all"
                      >
                        <span>{exT.exploreExhibitions}</span>
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
