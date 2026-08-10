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

const STORAGE_KEY = "alsouk-lang"

function isValidLang(value: string | null): value is Lang {
  return value != null && LANGS.some((l) => l.code === value)
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en")

  // Restore the saved language preference once, on mount (client-only —
  // localStorage isn't available during server rendering).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (isValidLang(stored) && stored !== lang) {
        setLangState(stored)
      }
    } catch {
      // localStorage can throw in some privacy modes — fall back to default.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setLang = (next: Lang) => {
    setLangState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Ignore write failures (e.g. storage disabled) — the in-memory
      // selection still works for the current session.
    }
  }

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
