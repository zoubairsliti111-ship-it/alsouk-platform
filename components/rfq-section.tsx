"use client"

import { useState } from "react"
import { CheckCircle2, FileText, MessagesSquare, PackageCheck, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

export function RfqSection() {
  const { t } = useLanguage()
  const [submitted, setSubmitted] = useState(false)

  const steps = [
    { icon: FileText, title: t.rfq.step1, desc: t.rfq.step1desc },
    { icon: MessagesSquare, title: t.rfq.step2, desc: t.rfq.step2desc },
    { icon: PackageCheck, title: t.rfq.step3, desc: t.rfq.step3desc },
  ]

  return (
    <section id="rfq" className="relative overflow-hidden bg-primary py-12 text-primary-foreground lg:py-20">
      {/* Ambient glassmorphic glowing gradients */}
      <div aria-hidden className="pointer-events-none absolute -end-20 -top-20 size-80 rounded-full bg-primary-foreground/10 blur-[100px]" />
      <div aria-hidden className="pointer-events-none absolute -start-20 bottom-0 size-80 rounded-full bg-accent/20 blur-[100px]" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16">
        {/* Left column */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3.5 py-1.5 text-xs font-bold tracking-wide backdrop-blur-sm">
            {t.rfq.badge}
          </span>
          <h2 className="mt-5 text-balance text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl">{t.rfq.title}</h2>
          <p className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-primary-foreground/80">{t.rfq.subtitle}</p>

          <div className="mt-8 space-y-5 lg:mt-10">
            {steps.map((s, i) => (
              <div key={s.title} className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-primary-foreground/15 shadow-sm">
                  <s.icon className="size-5.5 text-primary-foreground" />
                </span>
                <div>
                  <p className="text-base font-extrabold">
                    <span className="me-2 text-primary-foreground/60">{i + 1}.</span>
                    {s.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-primary-foreground/75">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-[20px] border border-white/10 bg-background p-6 text-foreground shadow-2xl sm:p-10">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-accent/10 text-accent">
                <CheckCircle2 className="size-10" />
              </span>
              <p className="mt-5 text-xl font-extrabold text-foreground">{t.rfq.submit}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t.rfq.note}</p>
              <Button variant="outline" className="mt-8 rounded-xl px-6 font-semibold" onClick={() => setSubmitted(false)}>
                {t.rfq.formTitle}
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setSubmitted(true)
              }}
            >
              <h3 className="text-2xl font-extrabold text-foreground tracking-tight">{t.rfq.formTitle}</h3>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-muted-foreground">{t.rfq.productLabel}</label>
                  <input
                    required
                    type="text"
                    placeholder={t.rfq.productPlaceholder}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3.5 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-muted-foreground">{t.rfq.quantityLabel}</label>
                  <input
                    required
                    type="text"
                    placeholder={t.rfq.quantityPlaceholder}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3.5 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-muted-foreground">{t.rfq.detailsLabel}</label>
                  <textarea
                    rows={3}
                    placeholder={t.rfq.detailsPlaceholder}
                    className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3.5 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              <Button type="submit" className="mt-6 w-full rounded-xl bg-accent py-6 text-sm font-semibold text-accent-foreground shadow-md transition-all duration-300 hover:bg-accent/90 active:scale-98">
                <Send className="size-4 mr-1.5 rtl:ml-1.5 rtl:rotate-180" />
                {t.rfq.submit}
              </Button>
              <p className="mt-3.5 text-center text-xs font-medium text-muted-foreground">{t.rfq.note}</p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
