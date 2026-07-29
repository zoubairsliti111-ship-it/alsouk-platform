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
    <section className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-accent p-6 text-primary-foreground shadow-xl sm:p-10">
        <div aria-hidden className="pointer-events-none absolute -end-10 -top-10 size-52 rounded-full bg-white/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -start-10 -bottom-10 size-52 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              <Sparkles className="size-3.5" />
              {t.home.aiCtaTag}
            </span>
            <h2 className="mt-3 text-balance text-2xl font-bold tracking-tight sm:text-3xl">{t.home.aiCtaTitle}</h2>
            <p className="mt-2 text-pretty text-sm text-primary-foreground/85 sm:text-base">{t.home.aiCtaSubtitle}</p>
          </div>

          <button
            type="button"
            onClick={openAssistant}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-background px-6 py-3.5 text-sm font-semibold text-primary shadow-lg transition-transform hover:scale-[1.02] active:scale-95 sm:w-auto"
          >
            <Bot className="size-5" />
            {t.home.aiCtaButton}
          </button>
        </div>
      </div>
    </section>
  )
}
