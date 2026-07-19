"use client"

import { AtSign, Mail, MapPin, MessageCircle, Share2 } from "lucide-react"
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
      {/* Newsletter */}
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-8 md:flex-row md:items-center">
          <div>
            <h3 className="text-lg font-bold text-foreground">{t.footer.newsletter}</h3>
            <p className="text-sm text-muted-foreground">{t.footer.newsletterDesc}</p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-md gap-2"
          >
            <input
              type="email"
              placeholder={t.footer.emailPlaceholder}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <Button type="submit" className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90">
              {t.footer.subscribe}
            </Button>
          </form>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <a href="#" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
              A
            </span>
            <span className="text-xl font-bold tracking-tight text-foreground">
              AL<span className="text-primary">SOUK</span>
            </span>
          </a>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">{t.footer.tagline}</p>
          <p className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4 text-primary" />
            {t.footer.country}
          </p>
          <div className="mt-4 flex gap-2">
            {[Share2, AtSign, MessageCircle, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex size-9 items-center justify-center rounded-full border border-border text-foreground/70 transition-colors hover:border-primary hover:text-primary"
                aria-label="Social link"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} ALSOUK. {t.footer.rights}</p>
          <div className="flex gap-5">
            <a href="#" className="transition-colors hover:text-primary">{t.footer.terms}</a>
            <a href="#" className="transition-colors hover:text-primary">{t.footer.privacy}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
