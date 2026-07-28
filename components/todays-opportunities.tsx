"use client"

import { Zap, MapPin, UserCheck, Coins, Box, ArrowRight } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"

export function TodaysOpportunities() {
  const { t, dir } = useLanguage()
  const opps = t.opportunities

  function scrollToRfq() {
    const el = document.getElementById("rfq")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="bg-secondary/20 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-4 border-b border-border/65 pb-6 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-accent">
              <Zap className="size-3.5 fill-current animate-pulse text-accent" />
              HOT DEALS & LEADS
            </span>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {opps.title}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{opps.subtitle}</p>
          </div>
          <button
            onClick={scrollToRfq}
            className="group inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
          >
            <span>{opps.viewAll}</span>
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180" />
          </button>
        </div>

        {/* Horizontally Scrollable Opportunities Container */}
        <div className="relative mt-6">
          <div
            className="flex w-full gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent scroll-smooth"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {opps.items.map((item, i) => {
              const isUrgent = item.urgency === "Urgent" || item.urgency === "عاجل"
              return (
                <div
                  key={i}
                  className="w-[280px] shrink-0 snap-start rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md"
                >
                  {/* Card Header Badge Row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                      <UserCheck className="size-3" />
                      {opps.verifiedBuyer}
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        isUrgent
                          ? "bg-red-500/10 text-red-500 animate-pulse"
                          : "bg-emerald-500/10 text-emerald-500"
                      }`}
                    >
                      {item.urgency}
                    </span>
                  </div>

                  {/* Sourcing Requirements Title */}
                  <h3 className="mt-4 line-clamp-2 min-h-[40px] text-sm font-bold text-foreground hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  {/* Detailed Specs list */}
                  <div className="mt-4 space-y-2.5 border-t border-border/60 pt-4 text-xs">
                    {/* Target quantity */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Box className="size-3.5 shrink-0 text-primary" />
                      <span className="truncate">
                        Target: <span className="font-semibold text-foreground">{item.target}</span>
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0 text-primary" />
                      <span className="truncate">{item.location}</span>
                    </div>

                    {/* Target Budget */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Coins className="size-3.5 shrink-0 text-accent" />
                      <span className="truncate">
                        Budget: <span className="font-bold text-primary">{item.budget}</span>
                      </span>
                    </div>
                  </div>

                  {/* Immediate Action Button */}
                  <Button
                    onClick={scrollToRfq}
                    className="mt-5 w-full rounded-xl bg-primary py-4 text-xs font-semibold text-primary-foreground shadow transition-transform hover:bg-primary/95 active:scale-95"
                  >
                    Quote Now
                  </Button>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  )
}
