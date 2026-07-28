"use client"

import { useState } from "react"
import { CheckCircle2, FileText, MessagesSquare, PackageCheck, Send, ClipboardList } from "lucide-react"
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
    <section id="rfq" className="relative overflow-hidden bg-primary py-16 text-primary-foreground sm:py-24 lg:py-32">
      {/* Absolute Decorative Geometric Background Elements */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      <div className="absolute -left-20 top-20 h-96 w-96 rounded-full bg-accent/20 opacity-40 blur-3xl" />
      <div className="absolute -right-20 bottom-10 h-96 w-96 rounded-full bg-blue-400/20 opacity-30 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">

          {/* Left Column: Context & Progress Path */}
          <div className="flex flex-col items-center text-center lg:col-span-6 lg:items-start lg:text-start">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white">
              <ClipboardList className="size-3.5" />
              {t.rfq.badge}
            </span>
            <h2 className="mt-4 text-pretty text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              {t.rfq.title}
            </h2>
            <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
              {t.rfq.subtitle}
            </p>

            {/* Custom high-end visual progress steps */}
            <div className="mt-10 w-full max-w-lg space-y-6">
              {steps.map((s, i) => (
                <div
                  key={s.title}
                  className="group flex items-start gap-5 rounded-2xl bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/10"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-accent group-hover:text-accent-foreground">
                    <s.icon className="size-5" />
                  </span>
                  <div className="text-start">
                    <p className="text-base font-bold text-white">
                      <span className="me-2 text-white/50">{i + 1}.</span>
                      {s.title}
                    </p>
                    <p className="mt-1 text-sm text-primary-foreground/75 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Premium Form Card container */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-background p-6 text-foreground shadow-2xl transition-all duration-300 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] sm:p-10">
              {submitted ? (
                // Elegant Successful Submission state
                <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                  <span className="flex size-16 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <CheckCircle2 className="size-10" />
                  </span>
                  <h3 className="mt-6 text-xl font-extrabold text-foreground">{t.rfq.submit}</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm">{t.rfq.note}</p>

                  <Button
                    variant="outline"
                    className="mt-8 rounded-xl px-6 py-5 font-semibold text-foreground transition-all duration-300 active:scale-95"
                    onClick={() => setSubmitted(false)}
                  >
                    {t.rfq.formTitle}
                  </Button>
                </div>
              ) : (
                // RFQ submission fields
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setSubmitted(true)
                  }}
                  className="space-y-5"
                >
                  <div>
                    <h3 className="text-xl font-bold text-foreground sm:text-2xl">{t.rfq.formTitle}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">Direct pricing matches from verified Tunisians suppliers.</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    {/* Product Name */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-foreground">{t.rfq.productLabel}</label>
                      <input
                        required
                        type="text"
                        placeholder={t.rfq.productPlaceholder}
                        className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-foreground">{t.rfq.quantityLabel}</label>
                      <input
                        required
                        type="text"
                        placeholder={t.rfq.quantityPlaceholder}
                        className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>

                    {/* Details Specification */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-foreground">{t.rfq.detailsLabel}</label>
                      <textarea
                        rows={4}
                        placeholder={t.rfq.detailsPlaceholder}
                        className="w-full resize-none rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                  </div>

                  {/* Submission Action Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="mt-4 w-full rounded-xl bg-accent py-6 font-semibold text-accent-foreground shadow-lg transition-all duration-300 hover:bg-accent/90 active:scale-95"
                  >
                    <Send className="size-4 mr-2 rtl:ml-2 rtl:rotate-180" />
                    {t.rfq.submit}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">{t.rfq.note}</p>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
