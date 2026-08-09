"use client"

import { useState } from "react"
import { MessageSquareText, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import {
  EMPTY_RFQ,
  validateRfq,
  submitRfq,
  type RfqInput,
  type RfqField,
} from "@/lib/supabase/rfq-service"

const LOCAL_I18N = {
  en: {
    cta: "Request Quote",
    title: "Request a quote from",
    desc: "Send your requirements directly to this supplier.",
    companyName: "Your Company Name",
    contactPerson: "Contact Person",
    email: "Email",
    phone: "Phone",
    country: "Country",
    deliveryDestination: "Delivery Destination",
    productRequested: "Product Requested",
    quantity: "Quantity",
    targetPrice: "Target Price (optional)",
    message: "Message *",
    send: "Send Request",
    sending: "Sending...",
    success: "Request submitted successfully!",
    successDesc: "The supplier will review your request and reply shortly.",
    close: "Close",
    errRequired: "This field is required.",
    errEmail: "Enter a valid email address.",
    errPhone: "Enter a valid phone number.",
    errMessage: "Please provide at least 10 characters.",
    errGeneric: "Something went wrong. Please try again.",
  },
  fr: {
    cta: "Demander un devis",
    title: "Demander un devis à",
    desc: "Envoyez vos besoins directement à ce fournisseur.",
    companyName: "Nom de votre entreprise",
    contactPerson: "Personne à contacter",
    email: "E-mail",
    phone: "Téléphone",
    country: "Pays",
    deliveryDestination: "Destination de livraison",
    productRequested: "Produit demandé",
    quantity: "Quantité",
    targetPrice: "Prix cible (optionnel)",
    message: "Message *",
    send: "Envoyer la demande",
    sending: "Envoi...",
    success: "Demande envoyée avec succès !",
    successDesc: "Le fournisseur examinera votre demande et répondra sous peu.",
    close: "Fermer",
    errRequired: "Ce champ est requis.",
    errEmail: "Entrez une adresse e-mail valide.",
    errPhone: "Entrez un numéro de téléphone valide.",
    errMessage: "Veuillez fournir au moins 10 caractères.",
    errGeneric: "Une erreur s'est produite. Réessayez.",
  },
  ar: {
    cta: "طلب عرض سعر",
    title: "طلب عرض سعر من",
    desc: "أرسل متطلباتك مباشرة إلى هذا المورد.",
    companyName: "اسم شركتك",
    contactPerson: "الشخص المسؤول",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    country: "البلد",
    deliveryDestination: "وجهة التسليم",
    productRequested: "المنتج المطلوب",
    quantity: "الكمية",
    targetPrice: "السعر المستهدف (اختياري)",
    message: "الرسالة *",
    send: "إرسال الطلب",
    sending: "جارٍ الإرسال...",
    success: "تم إرسال الطلب بنجاح!",
    successDesc: "سيقوم المورد بمراجعة طلبك والرد عليك قريباً.",
    close: "إغلاق",
    errRequired: "هذا الحقل مطلوب.",
    errEmail: "أدخل بريدًا إلكترونيًا صالحًا.",
    errPhone: "أدخل رقم هاتف صالحًا.",
    errMessage: "يرجى إدخال 10 أحرف على الأقل.",
    errGeneric: "حدث خطأ. حاول مرة أخرى.",
  },
} as const

export function StoreRfqButton({ companyId, companyName }: { companyId: string; companyName: string }) {
  const { lang, dir } = useLanguage()
  const dict = LOCAL_I18N[lang as keyof typeof LOCAL_I18N] || LOCAL_I18N.en

  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<RfqInput>(EMPTY_RFQ)
  const [errors, setErrors] = useState<Partial<Record<RfqField, "required" | "email" | "phone" | "message">>>({})
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<"form" | "success" | "error">("form")

  const errText = (field: RfqField) => {
    const t = errors[field]
    if (t === "required") return dict.errRequired
    if (t === "email") return dict.errEmail
    if (t === "phone") return dict.errPhone
    if (t === "message") return dict.errMessage
    return null
  }

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border ${hasError ? "border-destructive" : "border-border"} bg-secondary/15 px-3.5 py-2.5 text-xs font-medium text-foreground outline-none focus:border-primary focus:bg-card transition-all`

  const reset = () => {
    setValues(EMPTY_RFQ)
    setErrors({})
    setStatus("form")
  }

  const handleClose = () => {
    setOpen(false)
    reset()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const found = validateRfq(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    setSubmitting(true)
    const res = await submitRfq(companyId, values)
    setSubmitting(false)
    setStatus(res.ok ? "success" : "error")
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-black text-white bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 rounded-xl px-4 py-2.5 transition-all shadow-md shadow-primary/15 cursor-pointer"
      >
        <MessageSquareText className="size-4" />
        <span>{dict.cta}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={handleClose}
        >
          <div
            dir={dir}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[20px] bg-card border border-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
              <h3 className="text-sm font-black text-foreground">
                {dict.title} {companyName}
              </h3>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            {status === "success" ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle2 className="size-12 text-emerald-500 mx-auto" />
                <div>
                  <h4 className="text-sm font-black text-foreground">{dict.success}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{dict.successDesc}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="mt-2 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-xs font-bold text-white hover:opacity-90 transition-all cursor-pointer"
                >
                  {dict.close}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-3">
                <p className="text-xs text-muted-foreground">{dict.desc}</p>

                {status === "error" && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-[11px] font-bold text-destructive">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{dict.errGeneric}</span>
                  </div>
                )}

                <div>
                  <input
                    placeholder={dict.companyName}
                    value={values.companyName}
                    onChange={(e) => setValues({ ...values, companyName: e.target.value })}
                    className={inputClass(Boolean(errors.companyName))}
                  />
                  {errText("companyName") && <span className="text-[10px] text-destructive block font-bold mt-1">{errText("companyName")}</span>}
                </div>

                <div>
                  <input
                    placeholder={dict.contactPerson}
                    value={values.contactPerson}
                    onChange={(e) => setValues({ ...values, contactPerson: e.target.value })}
                    className={inputClass(Boolean(errors.contactPerson))}
                  />
                  {errText("contactPerson") && <span className="text-[10px] text-destructive block font-bold mt-1">{errText("contactPerson")}</span>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      placeholder={dict.email}
                      value={values.email}
                      onChange={(e) => setValues({ ...values, email: e.target.value })}
                      className={inputClass(Boolean(errors.email))}
                    />
                    {errText("email") && <span className="text-[10px] text-destructive block font-bold mt-1">{errText("email")}</span>}
                  </div>
                  <div>
                    <input
                      placeholder={dict.phone}
                      value={values.phone}
                      onChange={(e) => setValues({ ...values, phone: e.target.value })}
                      className={inputClass(Boolean(errors.phone))}
                    />
                    {errText("phone") && <span className="text-[10px] text-destructive block font-bold mt-1">{errText("phone")}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      placeholder={dict.country}
                      value={values.country}
                      onChange={(e) => setValues({ ...values, country: e.target.value })}
                      className={inputClass(Boolean(errors.country))}
                    />
                    {errText("country") && <span className="text-[10px] text-destructive block font-bold mt-1">{errText("country")}</span>}
                  </div>
                  <div>
                    <input
                      placeholder={dict.deliveryDestination}
                      value={values.deliveryDestination}
                      onChange={(e) => setValues({ ...values, deliveryDestination: e.target.value })}
                      className={inputClass(Boolean(errors.deliveryDestination))}
                    />
                    {errText("deliveryDestination") && <span className="text-[10px] text-destructive block font-bold mt-1">{errText("deliveryDestination")}</span>}
                  </div>
                </div>

                <div>
                  <input
                    placeholder={dict.productRequested}
                    value={values.productRequested}
                    onChange={(e) => setValues({ ...values, productRequested: e.target.value })}
                    className={inputClass(Boolean(errors.productRequested))}
                  />
                  {errText("productRequested") && <span className="text-[10px] text-destructive block font-bold mt-1">{errText("productRequested")}</span>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      placeholder={dict.quantity}
                      value={values.quantity}
                      onChange={(e) => setValues({ ...values, quantity: e.target.value })}
                      className={inputClass(Boolean(errors.quantity))}
                    />
                    {errText("quantity") && <span className="text-[10px] text-destructive block font-bold mt-1">{errText("quantity")}</span>}
                  </div>
                  <input
                    placeholder={dict.targetPrice}
                    value={values.targetPrice}
                    onChange={(e) => setValues({ ...values, targetPrice: e.target.value })}
                    className={inputClass(false)}
                  />
                </div>

                <div>
                  <textarea
                    placeholder={dict.message}
                    value={values.message}
                    onChange={(e) => setValues({ ...values, message: e.target.value })}
                    rows={3}
                    className={`${inputClass(Boolean(errors.message))} resize-none`}
                  />
                  {errText("message") && <span className="text-[10px] text-destructive block font-bold mt-1">{errText("message")}</span>}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-xs font-black text-white hover:opacity-90 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>{dict.sending}</span>
                    </>
                  ) : (
                    <span>{dict.send}</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
