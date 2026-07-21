"use client"

import { useEffect, useRef, useState } from "react"
import { CheckCircle2, Loader2, MessageSquare, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { directoryT } from "@/lib/directory-i18n"
import {
  EMPTY_RFQ,
  submitRfq,
  validateRfq,
  type RfqField,
  type RfqInput,
} from "@/lib/supabase/rfq-service"

type Props = {
  supplierId: string
  supplierName: string
  /** Called to close the dialog. The parent unmounts it, resetting form state. */
  onClose: () => void
}

type Errors = Partial<Record<RfqField, "required" | "email" | "phone" | "message">>

export function RfqDialog({ supplierId, supplierName, onClose }: Props) {
  const { lang } = useLanguage()
  const r = directoryT[lang].rfq

  const [values, setValues] = useState<RfqInput>(EMPTY_RFQ)
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<"form" | "success" | "error">("form")
  const [formError, setFormError] = useState<string | null>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  // Focus the first field and lock body scroll while mounted; close on Escape.
  useEffect(() => {
    const timer = setTimeout(() => firstFieldRef.current?.focus(), 50)
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      clearTimeout(timer)
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  const errorText: Record<NonNullable<Errors[RfqField]>, string> = {
    required: r.errRequired,
    email: r.errEmail,
    phone: r.errPhone,
    message: r.errMessage,
  }

  function update(field: RfqField, value: string) {
    setValues((v) => ({ ...v, [field]: value }))
    // Clear a field's error as the user edits it.
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
    const res = await submitRfq(supplierId, values)
    setSubmitting(false)
    if (res.ok) {
      setStatus("success")
      return
    }
    if (res.reason === "validation") {
      setErrors(validateRfq(values))
      return
    }
    setFormError(res.reason === "notFound" ? r.notFoundBody : r.errorBody)
    setStatus("error")
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={r.title}
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-card shadow-xl sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <MessageSquare className="size-5 text-primary" />
              {r.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{r.subtitle(supplierName)}</p>
          </div>
          <button
            type="button"
            onClick={() => onClose()}
            aria-label={r.close}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {status === "success" ? (
          <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-accent/10 text-accent">
              <CheckCircle2 className="size-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{r.successTitle}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{r.successBody}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStatus("form")}>
                {r.sendAnother}
              </Button>
              <Button onClick={() => onClose()}>{r.close}</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto p-5" noValidate>
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
                  ref={firstFieldRef}
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

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => onClose()}>
                {r.cancel}
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {submitting ? r.submitting : r.submit}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
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
