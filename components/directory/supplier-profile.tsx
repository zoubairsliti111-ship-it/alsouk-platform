"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Boxes,
  Building2,
  CalendarClock,
  ImageIcon,
  Layers,
  MapPin,
  MessageSquare,
  Package,
  ShieldCheck,
  Star,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { directoryT } from "@/lib/directory-i18n"
import { fetchSupplierById } from "@/lib/supabase/suppliers-service"
import type { Supplier } from "@/lib/directory-data"

type Status = "loading" | "loaded" | "notFound" | "error"

export function SupplierProfile({ id }: { id: string }) {
  const { lang } = useLanguage()
  const t = directoryT[lang]
  const p = t.profile

  const [state, setState] = useState<{ id: string; status: Status; supplier: Supplier | null }>({
    id,
    status: "loading",
    supplier: null,
  })

  useEffect(() => {
    let active = true
    fetchSupplierById(id).then((res) => {
      if (!active) return
      if (res.error) setState({ id, status: "error", supplier: null })
      else if (res.notFound || !res.supplier) setState({ id, status: "notFound", supplier: null })
      else setState({ id, status: "loaded", supplier: res.supplier })
    })
    return () => {
      active = false
    }
  }, [id])

  // While a newly-requested id is still resolving, show the loading state
  // rather than the previously-loaded supplier.
  const status: Status = state.id === id ? state.status : "loading"
  const supplier = state.id === id ? state.supplier : null

  const backLink = (
    <Link
      href="/suppliers"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4 rtl:rotate-180" />
      {p.backToDirectory}
    </Link>
  )

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-6 h-48 animate-pulse rounded-3xl bg-muted" />
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="h-96 animate-pulse rounded-2xl bg-muted lg:col-span-2" />
          <div className="h-96 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    )
  }

  if (status !== "loaded" || !supplier) {
    const title = status === "error" ? p.errorTitle : p.notFoundTitle
    const subtitle = status === "error" ? p.errorSubtitle : p.notFoundSubtitle
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
          <Building2 className="size-7" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 text-muted-foreground">{subtitle}</p>
        <div className="mt-6">
          <Button render={<Link href="/suppliers" />}>
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {p.backToDirectory}
          </Button>
        </div>
      </div>
    )
  }

  const s = supplier
  const logoClasses =
    s.logoColor === "green"
      ? "bg-brand-green text-brand-green-foreground"
      : "bg-brand-blue text-brand-blue-foreground"

  const requestQuoteButton = (
    <Button
      size="lg"
      className="w-full gap-2 bg-primary text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
    >
      <MessageSquare className="size-4" />
      {p.requestQuote}
    </Button>
  )

  return (
    <div className="pb-24 lg:pb-8">
      {/* Breadcrumb / back */}
      <div className="border-b border-border bg-secondary/30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {backLink}
        </div>
      </div>

      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div
              className={`flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-2xl font-bold shadow-sm ${logoClasses}`}
            >
              {s.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.logoUrl} alt={s.name} className="size-full object-cover" />
              ) : (
                s.monogram
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {s.name}
                </h1>
                {s.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                    <BadgeCheck className="size-3.5" />
                    {p.verified}
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 text-primary" />
                  {t.cities[s.cityKey]}, {t.countries[s.country]}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="size-4 fill-amber-500 text-amber-500" />
                  <span className="font-semibold text-foreground">{s.rating.toFixed(1)}</span>(
                  {s.reviews} {p.reviews})
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {s.businessTypes.map((bt) => (
                  <span
                    key={bt}
                    className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {t.businessTypes[bt]}
                  </span>
                ))}
              </div>
            </div>

            <div className="hidden w-56 shrink-0 lg:block">{requestQuoteButton}</div>
          </div>

          {/* Quick stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={<Package className="size-4 text-primary" />} value={String(s.products)} label={p.products} />
            <Stat
              icon={<TrendingUp className="size-4 text-accent" />}
              value={`${s.responseRate}%`}
              label={p.responseRate}
            />
            <Stat
              icon={<CalendarClock className="size-4 text-primary" />}
              value={String(s.years)}
              label={p.yearsInBusiness}
            />
            <Stat
              icon={<Boxes className="size-4 text-accent" />}
              value={s.minMoq.toLocaleString()}
              label={p.moq}
            />
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* About */}
          <Card title={p.about} icon={<Building2 className="size-4" />}>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {s.description ?? p.aboutEmpty}
            </p>
          </Card>

          {/* Gallery */}
          <Card title={p.gallery} icon={<ImageIcon className="size-4" />}>
            {s.logoUrl ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.logoUrl}
                  alt={s.name}
                  className="aspect-video w-full rounded-lg border border-border object-cover"
                />
              </div>
            ) : (
              <EmptyState icon={<ImageIcon className="size-5" />} text={p.galleryEmpty} />
            )}
          </Card>

          {/* Categories */}
          <Card title={p.categories} icon={<Layers className="size-4" />}>
            <div className="flex flex-wrap gap-2">
              {s.categories.map((cat) => (
                <span
                  key={cat}
                  className="rounded-full border border-border px-3 py-1 text-sm font-medium text-foreground"
                >
                  {t.categories[cat]}
                </span>
              ))}
            </div>
          </Card>

          {/* Products */}
          <Card title={p.products} icon={<Package className="size-4" />}>
            <p className="text-sm font-semibold text-foreground">{p.productsCount(s.products)}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.productsEmpty}</p>
          </Card>

          {/* Certifications */}
          <Card title={p.certifications} icon={<Award className="size-4" />}>
            <EmptyState icon={<ShieldCheck className="size-5" />} text={p.certificationsEmpty} />
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <Card title={p.commercialTerms} icon={<Boxes className="size-4" />}>
            <dl className="divide-y divide-border text-sm">
              <Row label={p.moq} value={`${s.minMoq.toLocaleString()} ${p.moqUnit}`} />
              <Row label={p.responseRate} value={`${s.responseRate}%`} />
              <Row label={p.rating} value={`${s.rating.toFixed(1)} / 5`} />
              <Row label={p.businessType} value={s.businessTypes.map((bt) => t.businessTypes[bt]).join(", ")} />
              <Row label={p.yearsInBusiness} value={String(s.years)} />
            </dl>
          </Card>

          <Card title={p.location} icon={<MapPin className="size-4" />}>
            <dl className="divide-y divide-border text-sm">
              <Row label={t.filters.country} value={t.countries[s.country]} />
              <Row label={p.location} value={t.cities[s.cityKey]} />
              <Row label={p.region} value={t.regions[s.region]} />
            </dl>
          </Card>

          <div className="hidden lg:block">{requestQuoteButton}</div>
        </aside>
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto max-w-6xl">{requestQuoteButton}</div>
      </div>
    </div>
  )
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-secondary/40 px-3 py-4 text-center">
      {icon}
      <span className="text-lg font-bold text-foreground">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  )
}

function Card({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground">
        <span className="text-primary">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-end font-medium text-foreground">{value}</dd>
    </div>
  )
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-secondary/30 px-4 py-8 text-center">
      <span className="text-muted-foreground">{icon}</span>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}
