"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, ChevronDown, Globe, Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react"
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
            <Link href="/suppliers" className="transition-colors hover:text-primary">{t.nav.forSuppliers}</Link>
            <Link href="/products" className="transition-colors hover:text-primary">{t.nav.forBuyers}</Link>
            <a href="#" className="transition-colors hover:text-primary">{t.nav.help}</a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
            A
          </span>
          <span className="text-xl font-bold tracking-tight text-foreground">
            AL<span className="text-primary">SOUK</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="ms-4 hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop search */}
        <form onSubmit={submitSearch} role="search" className="relative ms-auto hidden max-w-xs flex-1 md:block">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search.placeholder}
            aria-label={t.search.title}
            className="w-full rounded-full border border-border bg-secondary/50 py-2 ps-9 pe-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:bg-card"
          />
        </form>

        <div className="ms-auto flex items-center gap-2 md:ms-2">
          <div className="hidden md:block">{LangSwitcher}</div>

          <button className="inline-flex rounded-full p-2 text-foreground/70 transition-colors hover:bg-secondary hover:text-primary md:hidden" aria-label={t.search.title} onClick={() => router.push("/search")}>
            <Search className="size-5" />
          </button>
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
          <Link href="/register">
            <Button className="hidden bg-primary text-primary-foreground hover:bg-primary/90 sm:inline-flex">
              {t.nav.joinFree}
            </Button>
          </Link>

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
            <form onSubmit={submitSearch} role="search" className="relative mb-2">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.search.placeholder}
                aria-label={t.search.title}
                className="w-full rounded-full border border-border bg-secondary/50 py-2.5 ps-9 pe-3 text-sm text-foreground outline-none focus:border-primary focus:bg-card"
              />
            </form>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-3">
              {LangSwitcher}
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <User className="size-4" />
                  {t.nav.signIn}
                </Button>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {t.nav.joinFree}
                  </Button>
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
