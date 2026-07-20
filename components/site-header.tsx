"use client"

import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown, Globe, Heart, Menu, ShoppingCart, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BrandLogo } from "@/components/brand-logo"
import { useLanguage } from "@/components/language-provider"
import { LANGS } from "@/lib/i18n"

export function SiteHeader() {
  const { t, lang, setLang } = useLanguage()
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

  const navLinks = [
    { label: t.nav.categories, href: "#categories" },
    { label: t.nav.suppliers, href: "/suppliers" },
    { label: t.nav.products, href: "#products" },
    { label: t.nav.rfq, href: "#rfq" },
    { label: t.nav.about, href: "#why" },
  ]

  const current = LANGS.find((l) => l.code === lang)!

  const LangSwitcher = (
    <div className="relative" ref={langRef}>
      <button
        type="button"
        onClick={() => setLangOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        aria-haspopup="listbox"
        aria-expanded={langOpen}
      >
        <Globe className="size-4 text-primary" />
        <span>{current.native}</span>
        <ChevronDown className={`size-3.5 transition-transform ${langOpen ? "rotate-180" : ""}`} />
      </button>
      {langOpen && (
        <div
          role="listbox"
          className="absolute end-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg"
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
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-popover-foreground transition-colors hover:bg-secondary"
            >
              <span className="flex flex-col items-start">
                <span className="font-medium">{l.native}</span>
                <span className="text-xs text-muted-foreground">{l.label}</span>
              </span>
              {l.code === lang && <Check className="size-4 text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md">
      {/* Top strip */}
      <div className="hidden border-b border-border bg-secondary/60 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs text-muted-foreground">
          <p>{t.hero.trusted}</p>
          <div className="flex items-center gap-4">
            <a href="#suppliers" className="transition-colors hover:text-primary">{t.nav.forSuppliers}</a>
            <a href="#products" className="transition-colors hover:text-primary">{t.nav.forBuyers}</a>
            <a href="#" className="transition-colors hover:text-primary">{t.nav.help}</a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        {/* Logo */}
        <BrandLogo />

        {/* Desktop nav */}
        <nav className="ms-4 hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <div className="hidden md:block">{LangSwitcher}</div>

          <button className="hidden rounded-full p-2 text-foreground/70 transition-colors hover:bg-secondary hover:text-primary sm:inline-flex" aria-label="Wishlist">
            <Heart className="size-5" />
          </button>
          <button className="hidden rounded-full p-2 text-foreground/70 transition-colors hover:bg-secondary hover:text-primary sm:inline-flex" aria-label="Cart">
            <ShoppingCart className="size-5" />
          </button>

          <Button variant="ghost" className="hidden lg:inline-flex">
            <User className="size-4" />
            {t.nav.signIn}
          </Button>
          <Button className="hidden bg-primary text-primary-foreground hover:bg-primary/90 sm:inline-flex">
            {t.nav.joinFree}
          </Button>

          <button
            className="rounded-lg p-2 text-foreground lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-3">
              {LangSwitcher}
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <User className="size-4" />
                  {t.nav.signIn}
                </Button>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {t.nav.joinFree}
                </Button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
