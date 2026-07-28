"use client"

import { Globe, Anchor, Scale, Award } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

const EXPORT_ICONS = [Globe, Scale, Award, Anchor]

export function ExportTunisia() {
  const { t } = useLanguage()

  return (
    <section id="export" className="relative overflow-hidden py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-background via-secondary/20 to-background">
      {/* Decorative radial background overlay */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 opacity-60 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Title Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Globe className="size-3.5 text-primary" />
            Global Trade Hub
          </span>
          <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t.export.title}
          </h2>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            {t.export.subtitle}
          </p>
        </div>

        {/* Premium Grid layout for Export Advantages */}
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {t.export.items.map((item, index) => {
            const Icon = EXPORT_ICONS[index % EXPORT_ICONS.length]
            return (
              <div
                key={item.title}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-xl"
              >
                <div>
                  {/* Dynamic Metric Stat Value Badge */}
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-5" />
                    </span>
                    <span className="text-xl font-extrabold text-primary">{item.stat}</span>
                  </div>

                  <h3 className="mt-6 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>

                {/* Stat label indicator footer */}
                <div className="mt-6 border-t border-border pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {item.statLabel}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
