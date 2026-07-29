"use client"

import { useLanguage } from "@/components/language-provider"

export function StatsSection() {
  const { t } = useLanguage()

  return (
    <section className="relative overflow-hidden bg-accent py-16 text-accent-foreground lg:py-20">
      <div aria-hidden className="pointer-events-none absolute -end-24 -top-24 size-96 rounded-full bg-white/10 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -start-24 -bottom-24 size-96 rounded-full bg-black/10 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-balance text-center text-3xl font-extrabold tracking-tight sm:text-4xl">{t.stats.title}</h2>
        <div className="mt-12 grid grid-cols-2 gap-8 lg:grid-cols-4">
          {t.stats.items.map((s) => (
            <div key={s.label} className="group relative rounded-[20px] bg-white/5 p-6 text-center border border-white/5 shadow-sm transition-all duration-300 hover:border-white/15 hover:bg-white/8">
              <p className="text-4xl font-black tracking-tight sm:text-5xl">{s.value}</p>
              <p className="mt-3 text-sm font-bold tracking-wide text-accent-foreground/80 uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
