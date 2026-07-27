"use client"

import Link from "next/link"
import { BadgeCheck, Building2, MapPin } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import type { Company } from "@/lib/domains/company/types"

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase()
}

export function CompanyCard({ company }: { company: Company }) {
  const { t } = useLanguage()
  const location = [company.city, company.country].filter(Boolean).join(", ")

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
      <Link
        href={`/companies/${company.slug}`}
        aria-label={company.name}
        className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      />
      <div className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-blue text-lg font-bold text-brand-blue-foreground">
          {company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logoUrl} alt={company.name} className="size-full object-cover" />
          ) : (
            initials(company.name) || <Building2 className="size-6" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-bold text-card-foreground">{company.name}</h3>
            {company.verified && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                <BadgeCheck className="size-3.5" />
                {t.marketplace.companies.verified}
              </span>
            )}
          </div>
          {location && (
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0 text-primary" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
      </div>

      {company.description && (
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {company.description}
        </p>
      )}

      <span className="relative z-10 mt-4 inline-flex w-fit items-center gap-1 text-sm font-semibold text-primary">
        {t.marketplace.companies.viewStore}
      </span>
    </article>
  )
}
