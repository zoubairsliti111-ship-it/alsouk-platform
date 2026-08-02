"use client"

import { Sparkles, Bot } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function AiCta() {
  const { t } = useLanguage()

  function openAssistant() {
    // The floating assistant widget listens for this event to open.
    window.dispatchEvent(new CustomEvent("alsouk:open-assistant"))
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:py-16">
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-primary via-blue-600 to-accent p-6 text-primary-foreground shadow-xl sm:p-12">
        {/* Soft glowing spheres */}
        <div aria-hidden className="pointer-events-none absolute -end-20 -top-20 size-64 rounded-full bg-white/10 blur-[80px]" />
        <div aria-hidden className="pointer-events-none absolute -start-20 -bottom-20 size-64 rounded-full bg-white/10 blur-[80px]" />

        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold tracking-wide backdrop-blur-sm">
              <Sparkles className="size-3.5 animate-pulse text-white" />
              {t.home.aiCtaTag}
            </span>
            <h2 className="mt-4 text-balance text-2xl font-extrabold tracking-tight sm:text-3xl">{t.home.aiCtaTitle}</h2>
            <p className="mt-3 text-pretty text-base leading-relaxed text-primary-foreground/85">{t.home.aiCtaSubtitle}</p>
          </div>

          <button
            type="button"
            onClick={openAssistant}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-background px-6 py-4 text-sm font-semibold text-primary shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5 active:scale-98 sm:w-auto"
          >
            <Bot className="size-5 text-primary" />
            {t.home.aiCtaButton}
          </button>
        </div>
      </div>
    </section>
  )
}
