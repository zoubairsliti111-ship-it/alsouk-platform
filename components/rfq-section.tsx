"use client"

import { useState } from "react"
import { CheckCircle2, FileText, MessagesSquare, PackageCheck, Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumBadge } from "@/components/ui/premium-badge"

export function RfqSection() {
  const { t, lang } = useLanguage()
  const [submitted, setSubmitted] = useState(false)

  const steps = [
    { icon: FileText, title: t.rfq.step1, desc: t.rfq.step1desc },
    { icon: MessagesSquare, title: t.rfq.step2, desc: t.rfq.step2desc },
    { icon: PackageCheck, title: t.rfq.step3, desc: t.rfq.step3desc },
  ]

  return (
    <section id="rfq" className="relative overflow-hidden bg-primary py-20 text-primary-foreground">
      {/* Decorative background highlights */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2">
        {/* Left column info */}
        <div className="flex flex-col items-start">
          <PremiumBadge variant="glass" className="mb-4">
            <Sparkles className="size-3.5 text-white" />
            {t.rfq.badge}
          </PremiumBadge>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl leading-tight">{t.rfq.title}</h2>
          <p className="mt-4 max-w-lg text-pretty text-primary-foreground/80 text-base leading-relaxed">{t.rfq.subtitle}</p>

          <div className="mt-10 space-y-6 w-full">
            {steps.map((s, i) => (
              <div key={s.title} className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                  <s.icon className="size-5 text-white" />
                </span>
                <div>
                  <p className="font-bold text-base text-white">
                    <span className="me-2 text-white/50">{i + 1}.</span>
                    {s.title}
                  </p>
                  <p className="text-sm text-primary-foreground/75 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column form card */}
        <PremiumCard hoverEffect="none" className="bg-background border-border/80 p-6 text-foreground shadow-2xl sm:p-8 rounded-[32px]">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
              <span className="flex size-16 items-center justify-center rounded-full bg-accent/15 text-accent">
                <CheckCircle2 className="size-9" />
              </span>
              <p className="mt-5 text-xl font-bold text-foreground">{t.rfq.submit}</p>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">{t.rfq.note}</p>
              <Button variant="outline" className="mt-8 rounded-xl px-6" onClick={() => setSubmitted(false)}>
                {t.rfq.formTitle}
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setSubmitted(true)
              }}
              className="space-y-5"
            >
              <div>
                <h3 className="text-xl font-extrabold text-foreground">{t.rfq.formTitle}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === "ar" ? "احصل على عروض مخصصة من عدة مصانع" : lang === "fr" ? "Recevez des offres personnalisées de plusieurs usines" : "Get custom quotes direct from multiple factories"}
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="mb-2 block text-xs font-bold text-foreground uppercase tracking-wider">{t.rfq.productLabel}</label>
                  <input
                    required
                    type="text"
                    placeholder={t.rfq.productPlaceholder}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold text-foreground uppercase tracking-wider">{t.rfq.quantityLabel}</label>
                  <input
                    required
                    type="text"
                    placeholder={t.rfq.quantityPlaceholder}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold text-foreground uppercase tracking-wider">{t.rfq.detailsLabel}</label>
                  <textarea
                    rows={3}
                    placeholder={t.rfq.detailsPlaceholder}
                    className="w-full resize-none rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl h-12 font-bold shadow-lg shadow-accent/25">
                  <Send className="size-4 rtl:rotate-180" />
                  {t.rfq.submit}
                </Button>
                <p className="mt-3.5 text-center text-[11px] font-medium text-muted-foreground">{t.rfq.note}</p>
              </div>
            </form>
          )}
        </PremiumCard>
      </div>
    </section>
  )
}
