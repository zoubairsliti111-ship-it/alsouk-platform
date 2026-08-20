"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, MapPin, Trophy, ArrowRight, Sparkles } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { getExhibitions } from "@/lib/services/exhibitions-service"
import type { Exhibition } from "@/lib/domains/exhibition/types"
import { directoryT } from "@/lib/directory-i18n"

export function UpcomingExhibitionsSection() {
  const { t, lang, dir } = useLanguage()
  const exT = t.exhibitions
  const dirT = directoryT[lang] || directoryT.en

  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])

  useEffect(() => {
    let active = true
    getExhibitions().then((data) => {
      if (active) {
        setExhibitions(data.slice(0, 3)) // Take top 3 for the homepage
      }
    })
    return () => {
      active = false
    }
  }, [])

  if (exhibitions.length === 0) return null

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-12 lg:py-16" dir={dir}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-black text-primary uppercase tracking-wider mb-2">
            <Sparkles className="size-3" />
            <span>{t.ui.virtualTradeShows}</span>
          </span>
          <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {lang === "en" ? "Upcoming B2B Exhibitions" : lang === "fr" ? "Prochains Salons B2B" : "المعارض التجارية القادمة B2B"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "en"
              ? "Step inside immersive regional showcases, discover exhibits, and schedule B2B meetings."
              : lang === "fr"
                ? "Entrez dans des vitrines régionales immersives, découvrez les pièces exposées et planifiez des réunions B2B."
                : "ادخل إلى معارض إقليمية غامرة، واكتشف المعروضات، وجدول اجتماعات B2B."}
          </p>
        </div>

        <Link
          href="/exhibitions"
          className="inline-flex items-center gap-1 text-xs font-extrabold text-primary hover:underline shrink-0"
        >
          <span>{t.home.viewAll}</span>
          <ArrowRight className="size-4 rtl:rotate-180" />
        </Link>
      </div>

      {/* Horizontal scrolling rail for mobile viewports, responsive grid for desktop */}
      <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 -mx-4 px-4 md:mx-0 md:px-0">
        {exhibitions.map((ex) => {
          const startStr = new Date(ex.startDate).toLocaleDateString(
            lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : "ar-TN",
            { month: "short", day: "numeric" }
          )
          const endStr = new Date(ex.endDate).toLocaleDateString(
            lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : "ar-TN",
            { month: "short", day: "numeric", year: "numeric" }
          )
          const cityLoc = dirT.cities[ex.city] || ex.city
          const isTunisia = ex.country === "TN"

          return (
            <div
              key={ex.id}
              className="w-[280px] sm:w-[320px] md:w-full shrink-0 snap-start group rounded-[20px] border border-border bg-card overflow-hidden flex flex-col justify-between transition-all hover:border-primary/40 hover:shadow-md"
            >
              {/* Cover Photo */}
              <div className="relative h-36 w-full overflow-hidden bg-secondary shrink-0">
                {ex.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ex.coverUrl}
                    alt={ex.name}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-103"
                  />
                ) : (
                  <div className="size-full bg-gradient-to-br from-primary to-blue-900 opacity-20" />
                )}
                {/* Location overlay */}
                <div className="absolute bottom-3 start-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white flex items-center gap-1 capitalize">
                  <MapPin className="size-3 text-primary" />
                  <span>{cityLoc}, {isTunisia ? "TN 🇹🇳" : ex.country}</span>
                </div>
              </div>

              {/* Body details */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {ex.categories.slice(0, 1).map((cat) => (
                      <span key={cat} className="text-[9px] font-black uppercase text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                        {cat}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {ex.name}
                  </h3>

                  <div className="space-y-1 text-[11px] font-semibold text-muted-foreground">
                    <p className="flex items-center gap-1.5 truncate">
                      <Trophy className="size-3.5 text-primary shrink-0" />
                      <span>{ex.organizer}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-primary shrink-0" />
                      <span>{startStr} – {endStr}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/40">
                  <Link
                    href={`/exhibitions/${ex.slug}`}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-secondary hover:bg-primary/10 hover:text-primary px-3 py-2 text-xs font-black text-foreground transition-all"
                  >
                    <span>{lang === "en" ? "Enter Exhibition" : lang === "fr" ? "Entrer dans le salon" : "دخول المعرض"}</span>
                    <ArrowRight className="size-3.5 rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
