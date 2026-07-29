"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, ChevronDown, Globe, Heart, Menu, Search, Bell, ShoppingCart, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { LANGS } from "@/lib/i18n"

export function SiteHeader() {
  const { t, lang, setLang } = useLanguage()
  const router = useRouter()
  const [langOpen, setLangOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState("")
  const langRef = useRef<HTMLDivElement>(null)

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    setMobileOpen(false)
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search")
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  const navLinks = [
    { label: t.marketplace.companies.title, href: "/companies" },
    { label: t.nav.suppliers, href: "/suppliers" },
    { label: t.nav.categories, href: "/categories" },
    { label: t.nav.products, href: "/products" },
    { label: t.nav.rfq, href: "/rfq" },
    { label: t.nav.about, href: "/#why" },
  ]

  const current = LANGS.find((l) => l.code === lang)!

  const LangSwitcher = (
    <div className="relative" ref={langRef}>
      <button
        type="button"
        onClick={() => setLangOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary hover:border-primary/30 transition-all shadow-sm"
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
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs text-popover-foreground transition-colors hover:bg-secondary/80"
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-lg transition-all duration-300">
      {/* Premium Top Strip */}
      <div className="hidden border-b border-border/20 bg-secondary/15 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5 text-[11px] font-medium text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {t.hero.trusted}
          </p>
          <div className="flex items-center gap-5">
            <Link href="/suppliers" className="transition-colors hover:text-primary">{t.nav.forSuppliers}</Link>
            <span className="text-border/40">|</span>
            <Link href="/products" className="transition-colors hover:text-primary">{t.nav.forBuyers}</Link>
            <span className="text-border/40">|</span>
            <a href="#" className="transition-colors hover:text-primary">{t.nav.help}</a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left Side: Logo and Desktop Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group transition-transform duration-200">
            <span className="flex size-9.5 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-blue-600 font-black text-sm text-primary-foreground shadow-md shadow-primary/20 group-hover:scale-105 transition-all">
              A
            </span>
            <span className="text-lg font-black tracking-tight text-foreground">
              AL<span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">SOUK</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-3.5 py-2 text-xs font-bold text-foreground/80 hover:text-primary hover:bg-secondary/50 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Side: Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Search Box in header */}
          <form onSubmit={submitSearch} role="search" className="relative hidden max-w-xs xl:block">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/80" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.search.placeholder}
              aria-label={t.search.title}
              className="w-52 rounded-full border border-border/60 bg-secondary/20 py-2 ps-9 pe-4 text-xs font-semibold text-foreground outline-none transition-all focus:w-60 focus:border-primary/50 focus:bg-card focus:shadow-sm"
            />
          </form>

          {/* Language Switcher */}
          <div className="hidden md:block">{LangSwitcher}</div>

          {/* Notification Button */}
          <button
            className="relative inline-flex size-9.5 items-center justify-center rounded-full border border-border/50 bg-card/50 text-foreground/80 hover:bg-secondary hover:text-primary transition-all hover:scale-105 active:scale-95 shadow-sm"
            aria-label="Notifications"
          >
            <Bell className="size-4" strokeWidth={2.2} />
            <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-primary ring-2 ring-background" />
          </button>

          {/* Favorites Button */}
          <button
            className="hidden size-9.5 items-center justify-center rounded-full border border-border/50 bg-card/50 text-foreground/80 hover:bg-secondary hover:text-primary transition-all hover:scale-105 active:scale-95 shadow-sm sm:inline-flex"
            aria-label="Favorites"
          >
            <Heart className="size-4" strokeWidth={2.2} />
          </button>

          {/* Cart Button */}
          <button
            className="hidden size-9.5 items-center justify-center rounded-full border border-border/50 bg-card/50 text-foreground/80 hover:bg-secondary hover:text-primary transition-all hover:scale-105 active:scale-95 shadow-sm sm:inline-flex"
            aria-label="Cart"
          >
            <ShoppingCart className="size-4" strokeWidth={2.2} />
          </button>

          {/* Desktop Auth Actions */}
          <span className="hidden h-5 w-px bg-border/40 lg:block" />

          <Button variant="ghost" className="hidden text-xs font-bold lg:inline-flex hover:bg-secondary/60 rounded-xl" asChild>
            <Link href="/account">
              <User className="size-3.5 me-1.5" />
              {t.nav.signIn}
            </Link>
          </Button>
          <Button className="hidden rounded-xl bg-gradient-to-r from-primary to-blue-600 text-xs font-bold hover:opacity-95 shadow-md shadow-primary/10 transition-all sm:inline-flex" asChild>
            <Link href="/rfq">
              {t.nav.joinFree}
            </Link>
          </Button>

          {/* Mobile Menu Toggle Button */}
          <button
            className="inline-flex size-9.5 items-center justify-center rounded-xl border border-border/50 bg-card/50 text-foreground transition-all hover:bg-secondary hover:scale-105 active:scale-95 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="border-t border-border/30 bg-background/95 backdrop-blur-lg lg:hidden shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1.5 p-4">
            <form onSubmit={submitSearch} role="search" className="relative mb-2.5">
              <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/80" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.search.placeholder}
                aria-label={t.search.title}
                className="w-full rounded-xl border border-border/60 bg-secondary/30 py-3 ps-10 pe-4 text-xs font-semibold text-foreground outline-none focus:border-primary/50 focus:bg-card"
              />
            </form>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-xs font-bold text-foreground transition-all hover:bg-secondary/60"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-border/20 pt-4">
              {LangSwitcher}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold h-9 px-4 hover:bg-secondary" asChild>
                  <Link href="/account" onClick={() => setMobileOpen(false)}>
                    <User className="size-3.5 me-1.5" />
                    {t.nav.signIn}
                  </Link>
                </Button>
                <Button size="sm" className="rounded-xl text-xs font-bold h-9 px-4 bg-gradient-to-r from-primary to-blue-600" asChild>
                  <Link href="/rfq" onClick={() => setMobileOpen(false)}>
                    {t.nav.joinFree}
                  </Link>
                </Button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
