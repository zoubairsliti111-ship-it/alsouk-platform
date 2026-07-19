"use client"

import { BadgeCheck, ShieldCheck, Globe2, Zap, Languages, Truck } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

const ICONS = [BadgeCheck, ShieldCheck, Globe2, Zap, Languages, Truck]

export function WhyChoose() {
  const { t } = useLanguage()

  return (
    <section id="why" className="mx-auto max-w-7xl px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t.why.title}</h2>
        <p className="mt-2 text-muted-foreground">{t.why.subtitle}</p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {t.why.items.map((item, i) => {
          const Icon = ICONS[i % ICONS.length]
          const accent = i % 2 === 1
          return (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span
                className={`flex size-12 items-center justify-center rounded-xl ${
                  accent ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                }`}
              >
                <Icon className="size-6" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
