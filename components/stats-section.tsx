"use client"

import { useLanguage } from "@/components/language-provider"

export function StatsSection() {
  const { t } = useLanguage()

  return (
    <section className="bg-accent py-14 text-accent-foreground">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-balance text-center text-2xl font-bold tracking-tight sm:text-3xl">{t.stats.title}</h2>
        <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {t.stats.items.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-bold tracking-tight sm:text-5xl">{s.value}</p>
              <p className="mt-2 text-sm font-medium text-accent-foreground/85">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
