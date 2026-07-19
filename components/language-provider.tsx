"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { type Lang, LANGS, translations } from "@/lib/i18n"

type LanguageContextValue = {
  lang: Lang
  dir: "rtl" | "ltr"
  setLang: (lang: Lang) => void
  t: (typeof translations)[Lang]
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en")

  const dir = useMemo(() => LANGS.find((l) => l.code === lang)?.dir ?? "ltr", [lang])

  useEffect(() => {
    const el = document.documentElement
    el.setAttribute("lang", lang)
    el.setAttribute("dir", dir)
  }, [lang, dir])

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, dir, setLang, t: translations[lang] }),
    [lang, dir],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}
