"use client"

import { BadgeCheck, ShieldCheck, Globe2, Zap, Languages, Truck } from "lucide-react"
import { SectionHeading } from "@/components/section-heading"
import { useLanguage } from "@/components/language-provider"
import { cycle } from "@/lib/ui"

const ICONS = [BadgeCheck, ShieldCheck, Globe2, Zap, Languages, Truck]

export function WhyChoose() {
  const { t } = useLanguage()

  return (
    <section id="why" className="mx-auto max-w-7xl px-4 py-16">
      <SectionHeading align="center" title={t.why.title} subtitle={t.why.subtitle} />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {t.why.items.map((item, i) => {
          const Icon = cycle(ICONS, i)
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
