"use client"

import { useState } from "react"
import { CheckCircle2, FileText, Loader2, MessagesSquare, PackageCheck, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { directoryT } from "@/lib/directory-i18n"
import { Breadcrumbs } from "@/components/marketplace/shell"
import {
  EMPTY_RFQ,
  submitRfq,
  validateRfq,
  type RfqField,
  type RfqInput,
} from "@/lib/supabase/rfq-service"

type Errors = Partial<Record<RfqField, "required" | "email" | "phone" | "message">>

/** Full-page, supplier-agnostic quote request (posts a general RFQ). */
export function RfqRequestPage() {
  const { t, lang, dir } = useLanguage()
  const r = directoryT[lang].rfq

  const [values, setValues] = useState<RfqInput>(EMPTY_RFQ)
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<"form" | "success" | "error">("form")
  const [formError, setFormError] = useState<string | null>(null)

  const errorText: Record<NonNullable<Errors[RfqField]>, string> = {
    required: r.errRequired,
    email: r.errEmail,
    phone: r.errPhone,
    message: r.errMessage,
  }

  const steps = [
    { icon: FileText, title: t.rfq.step1, desc: t.rfq.step1desc },
    { icon: MessagesSquare, title: t.rfq.step2, desc: t.rfq.step2desc },
    { icon: PackageCheck, title: t.rfq.step3, desc: t.rfq.step3desc },
  ]

  function update(field: RfqField, value: string) {
    setValues((v) => ({ ...v, [field]: value }))
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const found = validateRfq(values)
    if (Object.keys(found).length > 0) {
      setErrors(found)
      return
    }
    setSubmitting(true)
    setFormError(null)
    // Empty supplierId => general marketplace RFQ.
    const res = await submitRfq("", values)
    setSubmitting(false)
    if (res.ok) {
      setStatus("success")
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    if (res.reason === "validation") {
      setErrors(validateRfq(values))
      return
    }
    setFormError(r.errorBody)
    setStatus("error")
  }

  return (
    <>
      <Breadcrumbs items={[{ label: t.marketplace.breadcrumbHome, href: "/" }, { label: t.rfq.formTitle }]} />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 lg:grid-cols-[0.9fr_1.1fr]" dir={dir}>
        {/* Intro / steps */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {t.rfq.badge}
          </span>
          <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t.rfq.title}
          </h1>
          <p className="mt-3 max-w-lg text-muted-foreground">{t.rfq.subtitle}</p>
          <div className="mt-8 space-y-5">
            {steps.map((s, i) => (
              <div key={s.title} className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                  <s.icon className="size-5" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">
                    <span className="me-1.5 text-muted-foreground">{i + 1}.</span>
                    {s.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          {status === "success" ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-accent/10 text-accent">
                <CheckCircle2 className="size-8" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{r.successTitle}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{r.successBody}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setValues(EMPTY_RFQ)
                  setErrors({})
                  setStatus("form")
                }}
              >
                {r.sendAnother}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Send className="size-5 text-primary" />
                {t.rfq.formTitle}
              </h2>

              {formError && (
                <p
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {formError}
                </p>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={r.companyName} error={errors.companyName && errorText[errors.companyName]}>
                  <input
                    value={values.companyName}
                    onChange={(e) => update("companyName", e.target.value)}
                    className={inputClass(Boolean(errors.companyName))}
                    autoComplete="organization"
                  />
                </Field>
                <Field label={r.contactPerson} error={errors.contactPerson && errorText[errors.contactPerson]}>
                  <input
                    value={values.contactPerson}
                    onChange={(e) => update("contactPerson", e.target.value)}
                    className={inputClass(Boolean(errors.contactPerson))}
                    autoComplete="name"
                  />
                </Field>
                <Field label={r.email} error={errors.email && errorText[errors.email]}>
                  <input
                    type="email"
                    value={values.email}
                    onChange={(e) => update("email", e.target.value)}
                    className={inputClass(Boolean(errors.email))}
                    autoComplete="email"
                  />
                </Field>
                <Field label={r.phone} error={errors.phone && errorText[errors.phone]}>
                  <input
                    type="tel"
                    value={values.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className={inputClass(Boolean(errors.phone))}
                    autoComplete="tel"
                  />
                </Field>
                <Field label={r.country} error={errors.country && errorText[errors.country]}>
                  <input
                    value={values.country}
                    onChange={(e) => update("country", e.target.value)}
                    className={inputClass(Boolean(errors.country))}
                    autoComplete="country-name"
                  />
                </Field>
                <Field
                  label={r.deliveryDestination}
                  error={errors.deliveryDestination && errorText[errors.deliveryDestination]}
                >
                  <input
                    value={values.deliveryDestination}
                    onChange={(e) => update("deliveryDestination", e.target.value)}
                    className={inputClass(Boolean(errors.deliveryDestination))}
                  />
                </Field>
                <Field
                  label={r.productRequested}
                  error={errors.productRequested && errorText[errors.productRequested]}
                >
                  <input
                    value={values.productRequested}
                    onChange={(e) => update("productRequested", e.target.value)}
                    className={inputClass(Boolean(errors.productRequested))}
                  />
                </Field>
                <Field label={r.quantity} error={errors.quantity && errorText[errors.quantity]}>
                  <input
                    value={values.quantity}
                    onChange={(e) => update("quantity", e.target.value)}
                    className={inputClass(Boolean(errors.quantity))}
                    inputMode="numeric"
                  />
                </Field>
              </div>

              <Field label={`${r.targetPrice} (${r.optional})`}>
                <input
                  value={values.targetPrice}
                  onChange={(e) => update("targetPrice", e.target.value)}
                  className={inputClass(false)}
                />
              </Field>

              <Field label={r.message} error={errors.message && errorText[errors.message]}>
                <textarea
                  value={values.message}
                  onChange={(e) => update("message", e.target.value)}
                  rows={4}
                  placeholder={r.messagePlaceholder}
                  className={`${inputClass(Boolean(errors.message))} resize-y`}
                />
              </Field>

              <Button type="submit" disabled={submitting} className="w-full gap-2 sm:w-auto">
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {submitting ? r.submitting : r.submit}
              </Button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}

function inputClass(hasError: boolean): string {
  return `w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 ${
    hasError ? "border-destructive" : "border-border"
  }`
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string | null
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  )
}
