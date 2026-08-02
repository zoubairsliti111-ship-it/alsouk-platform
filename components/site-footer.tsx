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
    <footer className="border-t border-border/60 bg-card">

      {/* High-End Premium Newsletter banner */}
      <div className="border-b border-border/60 bg-secondary/20">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
          <div className="flex flex-col items-start justify-between gap-8 rounded-[20px] border border-border bg-background p-6 shadow-sm md:flex-row md:items-center md:p-10">
            <div className="max-w-md">
              <h3 className="text-xl font-extrabold text-foreground tracking-tight sm:text-2xl">{t.footer.newsletter}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{t.footer.newsletterDesc}</p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex w-full max-w-md gap-3"
            >
              <input
                type="email"
                required
                placeholder={t.footer.emailPlaceholder}
                className="w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              <Button type="submit" className="shrink-0 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/95 hover:shadow-lg active:scale-98">
                <Send className="size-4 mr-1.5 rtl:ml-1.5 rtl:rotate-180" />
                {t.footer.subscribe}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer layout */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.8fr_repeat(4,1fr)]">

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
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground max-w-xs font-medium">{t.footer.tagline}</p>

            <div className="mt-6 flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-2 text-xs font-bold text-muted-foreground shadow-sm">
              <MapPin className="size-4 text-primary" />
              <span>{t.footer.country}</span>
            </div>

            {/* Social handles */}
            <div className="mt-6 flex gap-3">
              {[Share2, AtSign, MessageCircle, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-foreground/75 shadow-sm transition-all duration-300 hover:scale-105 hover:border-primary hover:text-primary hover:shadow-md"
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
              <ul className="mt-5 space-y-3.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-primary">
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
      <div className="border-t border-border/60 bg-secondary/20">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
            <p className="text-center font-medium">© {new Date().getFullYear()} ALSOUK. {t.footer.rights}</p>
            <div className="flex gap-6 font-bold">
              <a href="#" className="transition-colors hover:text-primary">{t.footer.terms}</a>
              <a href="#" className="transition-colors hover:text-primary">{t.footer.privacy}</a>
            </div>
          </div>
        </div>
      </div>

    </footer>
  )
}
