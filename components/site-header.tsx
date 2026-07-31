"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Check, ChevronDown, Globe, Menu, X } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { LANGS } from "@/lib/i18n"
import { NotificationBell } from "@/components/marketplace/notification-bell"

export function SiteHeader() {
  const { lang, setLang } = useLanguage()
  const [langOpen, setLangOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  const current = LANGS.find((l) => l.code === lang)!

  const LangSwitcher = (
    <div className="relative" ref={langRef}>
      <button
        type="button"
        onClick={() => setLangOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary hover:border-primary/30 transition-all shadow-sm"
        aria-haspopup="listbox"
        aria-expanded={langOpen}
      >
        <Globe className="size-3.5 text-primary/80" />
        <span>{current.native}</span>
        <ChevronDown className={`size-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
      </button>
      {langOpen && (
        <div
          role="listbox"
          className="absolute end-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md p-1 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {LANGS.map((l) => (
            <button
              key={l.code}
              role="option"
              aria-selected={l.code === lang}
              onClick={() => {
                setLang(l.code)
                setLangOpen(false)
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-popover-foreground transition-colors hover:bg-secondary/80"
            >
              <span className="flex flex-col items-start text-start">
                <span className="font-semibold">{l.native}</span>
                <span className="text-[10px] text-muted-foreground">{l.label}</span>
              </span>
              {l.code === lang && <Check className="size-3.5 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <header className="sticky top-0 z-50 w-full h-16 border-b border-border/40 bg-background/70 backdrop-blur-lg flex items-center">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 flex items-center justify-between">
        {/* ALSOUK Logo */}
        <Link href="/" className="flex items-center gap-2 group transition-transform duration-200">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-blue-600 font-black text-sm text-primary-foreground shadow-md shadow-primary/20 group-hover:scale-105 transition-all">
            A
          </span>
          <span className="text-lg font-black tracking-tight text-foreground">
            AL<span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">SOUK</span>
          </span>
        </Link>

        {/* Right Side: Lang, Notification, Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {LangSwitcher}

          {/* Notification Dropdown Bell */}
          <NotificationBell />

          {/* Menu Button */}
          <button
            className="inline-flex size-9 items-center justify-center rounded-xl border border-border/50 bg-card/50 text-foreground transition-all hover:bg-secondary hover:scale-105 active:scale-95"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Simple Mobile Navigation / Menu Overlay */}
      {mobileOpen && (
        <div className="absolute top-16 left-0 right-0 border-b border-border/30 bg-background/95 backdrop-blur-lg shadow-lg animate-in slide-in-from-top-2 duration-200 p-4">
          <nav className="flex flex-col gap-2">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-4 py-3 text-xs font-bold text-foreground transition-all hover:bg-secondary/60"
            >
              Home
            </Link>
            <Link
              href="/categories"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-4 py-3 text-xs font-bold text-foreground transition-all hover:bg-secondary/60"
            >
              Categories
            </Link>
            <Link
              href="/rfq"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-4 py-3 text-xs font-bold text-foreground transition-all hover:bg-secondary/60"
            >
              Request Quote
            </Link>
            <Link
              href="/suppliers"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-4 py-3 text-xs font-bold text-foreground transition-all hover:bg-secondary/60"
            >
              Suppliers
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
