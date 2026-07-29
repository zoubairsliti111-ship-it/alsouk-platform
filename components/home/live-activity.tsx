"use client"

import { Activity } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function LiveActivity() {
  const { t } = useLanguage()

  const items = [
    { text: `${t.products.items[0].supplier} ${t.home.listed}`, place: t.home.locations[0] },
    { text: `${t.home.buyerIn} ${t.home.locations[1]} ${t.home.sourcing} ${t.products.items[3].name}`, place: t.home.locations[1] },
    { text: `${t.products.items[1].supplier} ${t.home.joined}`, place: t.home.locations[2] },
    { text: `${t.home.buyerIn} ${t.home.locations[3]} ${t.home.sourcing} ${t.products.items[2].name}`, place: t.home.locations[3] },
    { text: `${t.products.items[5].supplier} ${t.home.requested}`, place: t.home.locations[4] },
  ]

  // Duplicate for a seamless marquee loop.
  const loop = [...items, ...items]

  return (
    <section aria-label={t.home.activityTitle} className="border-y border-border/60 bg-secondary/30">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3.5">
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent/8 px-3 py-1.5 text-xs font-bold text-accent shadow-sm border border-accent/10">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-accent" />
          </span>
          {t.home.liveTag}
        </span>

        <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <ul className="flex w-max items-center gap-10 whitespace-nowrap will-change-transform animate-[alsouk-marquee_40s_linear_infinite] motion-reduce:animate-none">
            {loop.map((it, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm font-semibold text-foreground/80 hover:text-primary transition-colors">
                <Activity className="size-4 shrink-0 text-primary/80" />
                {it.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
