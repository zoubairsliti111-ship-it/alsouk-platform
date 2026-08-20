"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react"
import { type Lang, LANGS, translations } from "@/lib/i18n"

type LanguageContextValue = {
  lang: Lang
  dir: "rtl" | "ltr"
  setLang: (lang: Lang) => void
  t: (typeof translations)[Lang]
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export const LANG_STORAGE_KEY = "alsouk.lang"
export const LANG_COOKIE = "alsouk_lang"
const LANG_CHANGE_EVENT = "alsouk:langchange"

function isLang(value: string | null | undefined): value is Lang {
  return !!value && LANGS.some((l) => l.code === value)
}

/** Read the persisted language from cookie first, then localStorage. Client-only. */
export function readStoredLang(): Lang | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(/(?:^|;\s*)alsouk_lang=([^;]+)/)
  const fromCookie = match ? decodeURIComponent(match[1]) : null
  if (isLang(fromCookie)) return fromCookie
  try {
    const fromLs = window.localStorage.getItem(LANG_STORAGE_KEY)
    if (isLang(fromLs)) return fromLs
  } catch {
    /* localStorage may be unavailable */
  }
  return null
}

function persistLang(lang: Lang) {
  if (typeof document === "undefined") return
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang)
  } catch {
    /* ignore */
  }
  // 1 year, site-wide; SameSite=Lax so it survives navigation and refresh.
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`
}

function dirFor(lang: Lang): "rtl" | "ltr" {
  return LANGS.find((l) => l.code === lang)?.dir ?? "ltr"
}

// Subscribe to language changes made by any provider instance in this tab
// (custom event) or by another tab (storage event).
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback)
  window.addEventListener(LANG_CHANGE_EVENT, callback)
  return () => {
    window.removeEventListener("storage", callback)
    window.removeEventListener(LANG_CHANGE_EVENT, callback)
  }
}

function getSnapshot(): Lang {
  return readStoredLang() ?? "en"
}

function getServerSnapshot(): Lang {
  return "en"
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Read the persisted language from the external store (cookie/localStorage).
  // Using an external store keeps every provider instance (each page/shell
  // mounts its own) in sync within the tab and across tabs without effects.
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const dir = dirFor(lang)

  useEffect(() => {
    const el = document.documentElement
    el.setAttribute("lang", lang)
    el.setAttribute("dir", dir)
  }, [lang, dir])

  const setLang = useCallback((next: Lang) => {
    persistLang(next)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(LANG_CHANGE_EVENT))
    }
  }, [])

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, dir, setLang, t: translations[lang] }),
    [lang, dir, setLang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}
