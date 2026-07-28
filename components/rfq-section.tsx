"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, FileText, MapPin, MessagesSquare, PackageCheck, Send } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

export function RfqSection() {
  const { t } = useLanguage()
  const [submitted, setSubmitted] = useState(false)

  const steps = [
    { icon: FileText, title: t.rfq.step1, desc: t.rfq.step1desc },
    { icon: MessagesSquare, title: t.rfq.step2, desc: t.rfq.step2desc },
    { icon: PackageCheck, title: t.rfq.step3, desc: t.rfq.step3desc },
  ]

  // "Living marketplace" open buying requests, derived from existing localized data.
  const opportunities = t.products.items.slice(0, 4).map((p, i) => ({
    name: p.name,
    moq: p.moq,
    location: t.home.locations[i % t.home.locations.length],
  }))

  return (
    <>
      {/* Business opportunities — open buying requests */}
      <section id="opportunities" className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
              {t.home.opportunitiesTag}
            </span>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t.home.opportunitiesTitle}
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">{t.home.opportunitiesSubtitle}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {opportunities.map((o) => (
            <div
              key={o.name}
              className="flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg"
            >
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <MapPin className="size-3.5" />
                {t.home.buyerIn} {o.location}
              </p>
              <p className="mt-2 font-semibold text-foreground">{o.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.products.moq}: <span className="font-medium text-foreground">{o.moq}</span>
              </p>
              <Link
                href="/rfq"
                className={buttonVariants({
                  size: "sm",
                  className: "mt-4 w-full bg-accent text-accent-foreground hover:bg-accent/90",
                })}
              >
                {t.home.quoteNow}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* RFQ call to action + quick form */}
      <section id="rfq" className="relative overflow-hidden bg-primary py-16 text-primary-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute -end-16 -top-16 size-72 rounded-full bg-primary-foreground/10 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2">
          {/* Left */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold">
              {t.rfq.badge}
            </span>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">{t.rfq.title}</h2>
            <p className="mt-3 max-w-lg text-pretty text-primary-foreground/80">{t.rfq.subtitle}</p>

            <div className="mt-8 space-y-5">
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

            <Link
              href="/rfq"
              className={buttonVariants({
                size: "lg",
                variant: "outline",
                className:
                  "mt-8 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground",
              })}
            >
              {t.rfq.formTitle}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </div>

          {/* Form card */}
          <div className="rounded-3xl bg-background p-6 text-foreground shadow-2xl sm:p-8">
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
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">{t.rfq.quantityLabel}</label>
                    <input
                      required
                      type="text"
                      placeholder={t.rfq.quantityPlaceholder}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">{t.rfq.detailsLabel}</label>
                    <textarea
                      rows={3}
                      placeholder={t.rfq.detailsPlaceholder}
                      className="w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
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
    </>
  )
}
