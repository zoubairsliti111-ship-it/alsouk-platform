"use client"

import { AtSign, Mail, MapPin, MessageCircle, Share2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

export function SiteFooter() {
  const { t } = useLanguage()

  const columns = [
    { title: t.footer.colBuy, links: t.footer.buy },
    { title: t.footer.colSell, links: t.footer.sell },
    { title: t.footer.colCompany, links: t.footer.company },
    { title: t.footer.colSupport, links: t.footer.support },
  ]

  return (
    <footer className="border-t border-border bg-card">

      {/* High-End Premium Newsletter banner */}
      <div className="border-b border-border bg-secondary/15">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-8 rounded-3xl border border-border bg-background p-6 shadow-sm md:flex-row md:items-center md:p-10">
            <div className="max-w-md">
              <h3 className="text-xl font-extrabold text-foreground tracking-tight sm:text-2xl">{t.footer.newsletter}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t.footer.newsletterDesc}</p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex w-full max-w-md gap-3"
            >
              <input
                type="email"
                required
                placeholder={t.footer.emailPlaceholder}
                className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              <Button type="submit" className="shrink-0 bg-primary px-6 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/95">
                <Send className="size-4 mr-1.5 rtl:ml-1.5 rtl:rotate-180" />
                {t.footer.subscribe}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer layout */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_repeat(4,1fr)]">

          {/* Brand Col */}
          <div className="flex flex-col items-start">
            <a href="#" className="flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground shadow">
                A
              </span>
              <span className="text-2xl font-extrabold tracking-tight text-foreground">
                AL<span className="text-primary">SOUK</span>
              </span>
            </a>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground max-w-xs">{t.footer.tagline}</p>

            <div className="mt-6 flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground">
              <MapPin className="size-4 text-primary" />
              <span>{t.footer.country}</span>
            </div>

            {/* Social handles */}
            <div className="mt-6 flex gap-2.5">
              {[Share2, AtSign, MessageCircle, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-foreground/75 transition-all duration-300 hover:scale-105 hover:border-primary hover:text-primary hover:shadow-sm"
                  aria-label="Social Link"
                >
                  <Icon className="size-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">{col.title}</h4>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground transition-colors duration-300 hover:text-primary">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>
      </div>

      {/* Bottom Legal Subfooter bar */}
      <div className="border-t border-border bg-secondary/20">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
            <p className="text-center font-medium">© {new Date().getFullYear()} ALSOUK. {t.footer.rights}</p>
            <div className="flex gap-6 font-semibold">
              <a href="#" className="transition-colors hover:text-primary">{t.footer.terms}</a>
              <a href="#" className="transition-colors hover:text-primary">{t.footer.privacy}</a>
            </div>
          </div>
        </div>
      </div>

    </footer>
  )
}
