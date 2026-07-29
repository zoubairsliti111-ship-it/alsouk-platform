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
    <section id="rfq" className="relative overflow-hidden bg-primary py-10 text-primary-foreground lg:py-16">
      <div aria-hidden className="pointer-events-none absolute -end-16 -top-16 size-64 rounded-full bg-primary-foreground/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -start-16 bottom-0 size-64 rounded-full bg-accent/20 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 lg:grid-cols-2 lg:gap-12">
        {/* Left */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold">
            {t.rfq.badge}
          </span>
          <h2 className="mt-4 text-balance text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{t.rfq.title}</h2>
          <p className="mt-3 max-w-lg text-pretty text-sm text-primary-foreground/80 sm:text-base">{t.rfq.subtitle}</p>

          <div className="mt-6 space-y-4 lg:mt-8 lg:space-y-5">
            {steps.map((s, i) => (
              <div key={s.title} className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15">
                  <s.icon className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">
                    <span className="me-1.5 text-primary-foreground/60">{i + 1}.</span>
                    {s.title}
                  </p>
                  <p className="text-sm text-primary-foreground/75">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-3xl bg-background p-5 text-foreground shadow-2xl sm:p-8">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-accent/10 text-accent">
                <CheckCircle2 className="size-8" />
              </span>
              <p className="mt-4 text-lg font-semibold text-foreground">{t.rfq.submit}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t.rfq.note}</p>
              <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
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
              <h3 className="text-xl font-bold text-foreground">{t.rfq.formTitle}</h3>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">{t.rfq.productLabel}</label>
                  <input
                    required
                    type="text"
                    placeholder={t.rfq.productPlaceholder}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">{t.rfq.quantityLabel}</label>
                  <input
                    required
                    type="text"
                    placeholder={t.rfq.quantityPlaceholder}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">{t.rfq.detailsLabel}</label>
                  <textarea
                    rows={3}
                    placeholder={t.rfq.detailsPlaceholder}
                    className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="mt-5 w-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Send className="size-4 rtl:rotate-180" />
                {t.rfq.submit}
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">{t.rfq.note}</p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
