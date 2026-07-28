"use client"

import { BadgeCheck, ShieldCheck, Globe2, Zap, Languages, Truck, Compass } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

const ICONS = [BadgeCheck, ShieldCheck, Globe2, Zap, Languages, Truck]

export function WhyChoose() {
  const { t } = useLanguage()

  return (
    <section id="why" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      {/* Premium Header */}
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
          <Compass className="size-3.5 text-primary" />
          The Trade Standard
        </span>
        <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {t.why.title}
        </h2>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          {t.why.subtitle}
        </p>
      </div>

      {/* Grid structure with custom card aesthetics */}
      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {t.why.items.map((item, i) => {
          const Icon = ICONS[i % ICONS.length]
          const isAccent = i % 3 === 1

          return (
            <div
              key={item.title}
              className="group relative flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md"
            >
              <div>
                {/* Custom Icon Circle wrapper */}
                <span
                  className={`flex size-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 ${
                    isAccent
                      ? "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground"
                      : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                  }`}
                >
                  <Icon className="size-6" />
                </span>

                <h3 className="mt-6 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>

              {/* Bottom decorative brand indicator line */}
              <div className={`mt-6 h-1 w-12 rounded-full transition-all duration-300 group-hover:w-full ${
                isAccent ? "bg-accent" : "bg-primary"
              }`} />
            </div>
          )
        })}
      </div>
    </section>
  )
}
