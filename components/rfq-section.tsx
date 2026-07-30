"use client"

import Link from "next/link"
import { useLanguage } from "@/components/language-provider"

export function RfqSection() {
  const { lang } = useLanguage()

  const bannerTitle: Record<string, string> = {
    en: "Send one RFQ and receive quotations from multiple suppliers.",
    fr: "Envoyez une seule demande de devis et recevez des offres de plusieurs fournisseurs.",
    ar: "أرسل طلب عرض سعر واحد واحصل على عروض أسعار من موردين متعددين."
  }

  const ctaText: Record<string, string> = {
    en: "Create RFQ",
    fr: "Créer une demande de devis",
    ar: "إنشاء طلب عرض سعر"
  }

  const titleStr = bannerTitle[lang] || bannerTitle["en"]
  const ctaStr = ctaText[lang] || ctaText["en"]

  return (
    <section id="rfq" className="py-8 bg-background px-6">
      <div className="mx-auto max-w-7xl rounded-[20px] overflow-hidden bg-gradient-to-r from-[#2563EB] to-blue-700 p-6 sm:p-10 text-white shadow-lg relative">
        {/* Soft background visual accent circles */}
        <div aria-hidden className="pointer-events-none absolute -end-16 -top-16 size-48 rounded-full bg-white/10 blur-xl" />
        <div aria-hidden className="pointer-events-none absolute -start-16 -bottom-16 size-48 rounded-full bg-black/10 blur-xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 z-10">
          <div className="max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-bold leading-snug">
              {titleStr}
            </h2>
          </div>
          <div className="shrink-0">
            <Link
              href="/rfq"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-[#2563EB] hover:bg-slate-50 transition-all shadow-md active:scale-95"
            >
              {ctaStr}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
