"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Boxes,
  Building2,
  CalendarClock,
  FileText,
  Heart,
  Layers,
  MapPin,
  MessageSquare,
  Package,
  Play,
  ShieldCheck,
  Star,
  TrendingUp,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { directoryT } from "@/lib/directory-i18n"
import { fetchSupplierById } from "@/lib/supabase/suppliers-service"
import { createClient } from "@/lib/supabase/client"
import type { Supplier } from "@/lib/directory-data"
import { RfqDialog } from "@/components/rfq/rfq-dialog"

type Status = "loading" | "loaded" | "notFound" | "error"

const COVER_IMAGE = "/images/supplier-factory.png"

type MediaRow = {
  id: string
  media_type: "factory_photo" | "product_gallery" | "video" | "certificate"
  url: string
  caption: string | null
}

export function SupplierProfile({ id }: { id: string }) {
  const { lang } = useLanguage()
  const t = directoryT[lang]
  const p = t.profile

  const [state, setState] = useState<{ id: string; status: Status; supplier: Supplier | null }>({
    id,
    status: "loading",
    supplier: null,
  })
  const [media, setMedia] = useState<MediaRow[]>([])
  const [rfqOpen, setRfqOpen] = useState(false)
  const [following, setFollowing] = useState(false)
  const closeRfq = useCallback(() => setRfqOpen(false), [])

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

  // Real uploaded photos/videos/certificates for this company. company_media
  // is publicly readable, so this can be fetched straight from the client.
  useEffect(() => {
    let active = true
    const supabase = createClient()
    supabase
      .from("company_media")
      .select("id,media_type,url,caption")
      .eq("company_id", id)
      .then((result: { data: MediaRow[] | null; error: unknown }) => {
        const { data, error } = result
        if (!active) return
        if (!error && data) setMedia(data as MediaRow[])
      })
    return () => {
      active = false
    }
  }, [id])

  const status: Status = state.id === id ? state.status : "loading"
  const supplier = state.id === id ? state.supplier : null

  if (status === "loading") {
    return (
      <div>
        <div className="h-40 animate-pulse bg-muted sm:h-56" />
        <div className="mx-auto max-w-6xl px-4">
          <div className="-mt-10 size-24 animate-pulse rounded-2xl bg-muted" />
          <div className="mt-4 h-6 w-56 animate-pulse rounded bg-muted" />
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
          <div className="mt-6 h-64 animate-pulse rounded-2xl bg-muted" />
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

  const photos = media.filter((m) => m.media_type === "factory_photo")
  const videos = media.filter((m) => m.media_type === "video")
  const certificates = media.filter((m) => m.media_type === "certificate")
  const coverUrl = photos[0]?.url || COVER_IMAGE

  const followButton = (
    <button
      type="button"
      onClick={() => setFollowing((f) => !f)}
      aria-pressed={following}
      className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors active:scale-95 ${
        following
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-foreground hover:bg-secondary"
      }`}
    >
      <Heart className={`size-4 ${following ? "fill-primary" : ""}`} />
      {following ? p.following : p.follow}
    </button>
  )

  const requestQuoteButton = (
    <Button
      size="lg"
      onClick={() => setRfqOpen(true)}
      className="w-full gap-2 bg-primary text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
    >
      <MessageSquare className="size-4" />
      {p.requestQuote}
    </Button>
  )

  return (
    <div className="pb-32 lg:pb-8">
      {/* Cover */}
      <section className="relative">
        <div className="relative h-40 w-full overflow-hidden sm:h-56">
          {photos[0]?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt={s.name} className="absolute inset-0 size-full object-cover" />
          ) : (
            <Image src={coverUrl} alt={s.name} fill priority sizes="100vw" className="object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 top-0 p-4">
            <Link
              href="/suppliers"
              className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-black/60"
            >
              <ArrowLeft className="size-4 rtl:rotate-180" />
              {p.backToDirectory}
            </Link>
          </div>
        </div>

        {/* Identity */}
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div
              className={`-mt-12 flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-background text-3xl font-bold shadow-lg ${logoClasses}`}
            >
              {s.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.logoUrl} alt={s.name} className="size-full object-cover" />
              ) : (
                s.monogram
              )}
            </div>

            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{s.name}</h1>
                {s.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600">
                    <Award className="size-3.5" />
                    {p.storeBadge}
                  </span>
                )}
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
                  {t.cities[s.cityKey] ?? s.cityKey}, {t.countries[s.country] ?? s.country}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="size-4 fill-amber-500 text-amber-500" />
                  <span className="font-semibold text-foreground">{s.rating.toFixed(1)}</span>({s.reviews}{" "}
                  {p.reviews})
                </span>
              </div>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              {followButton}
              <div className="w-52">{requestQuoteButton}</div>
            </div>
          </div>

          {/* Business types */}
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

          {/* Quick stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={<Package className="size-4 text-primary" />} value={String(s.products)} label={p.products} />
            <Stat icon={<TrendingUp className="size-4 text-accent" />} value={`${s.responseRate}%`} label={p.responseRate} />
            <Stat icon={<CalendarClock className="size-4 text-primary" />} value={String(s.years)} label={p.yearsInBusiness} />
            <Stat icon={<Boxes className="size-4 text-accent" />} value={s.minMoq.toLocaleString()} label={p.moq} />
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title={p.overview} icon={<Building2 className="size-4" />}>
            <p className="text-sm leading-relaxed text-muted-foreground">{s.description ?? p.aboutEmpty}</p>
          </Card>

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

          <Card title={p.products} icon={<Package className="size-4" />}>
            <p className="text-sm font-semibold text-foreground">{p.productsCount(s.products)}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.productsEmpty}</p>
            <Link href="/products" className={buttonVariants({ variant: "outline", size: "sm", className: "mt-4" })}>
              <Package className="size-4" />
              {p.products}
            </Link>
          </Card>

          <Link href={`/suppliers/${s.id}/feed`} className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-5 py-3.5 text-sm font-black text-white shadow-lg active:scale-95">
            <Play className="size-4" />
            Watch Photos & Videos
          </Link>

          <Card title={p.factory} icon={<Building2 className="size-4" />}>
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((ph) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={ph.id}
                    src={ph.url}
                    alt={ph.caption ?? s.name}
                    className="aspect-square w-full rounded-xl border border-border object-cover"
                  />
                ))}
              </div>
            ) : (
              <EmptyState icon={<Building2 className="size-5" />} text={p.factoryEmpty} />
            )}
          </Card>

          <Card title={p.videos} icon={<Play className="size-4" />}>
            {videos.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {videos.map((v) => (
                  <video key={v.id} src={v.url} controls className="w-full rounded-xl border border-border aspect-video" />
                ))}
              </div>
            ) : (
              <EmptyState icon={<Play className="size-5" />} text={p.videosEmpty} />
            )}
          </Card>

          <Card title={p.catalogs} icon={<FileText className="size-4" />}>
            <EmptyState icon={<FileText className="size-5" />} text={p.catalogsEmpty} />
          </Card>

          <Card title={p.certifications} icon={<Award className="size-4" />}>
            {certificates.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {certificates.map((c) => (
                  <a
                    key={c.id}
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-border bg-secondary/20 p-3 text-sm font-medium text-foreground hover:bg-secondary/40"
                  >
                    <ShieldCheck className="size-5 shrink-0 text-primary" />
                    <span className="truncate">{c.caption || p.certifications}</span>
                  </a>
                ))}
              </div>
            ) : (
              <EmptyState icon={<ShieldCheck className="size-5" />} text={p.certificationsEmpty} />
            )}
          </Card>

          <Card title={p.reviewsTitle} icon={<Star className="size-4" />}>
            <div className="flex items-center gap-4 rounded-xl bg-secondary/40 p-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{s.rating.toFixed(1)}</p>
                <div className="mt-1 flex items-center justify-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${
                        i < Math.round(s.rating) ? "fill-amber-500 text-amber-500" : "text-muted-foreground/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{p.reviewsSummary(s.reviews)}</p>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{p.reviewsEmpty}</p>
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
              <Row label={t.filters.country} value={t.countries[s.country] ?? s.country} />
              <Row label={p.location} value={t.cities[s.cityKey] ?? s.cityKey} />
              <Row label={p.region} value={t.regions[s.region]} />
            </dl>
          </Card>
        </aside>
      </div>

      {/* Sticky mobile CTA — sits above the bottom nav */}
      <div className="fixed inset-x-0 bottom-14 z-30 flex items-center gap-3 border-t border-border bg-card/95 p-3 backdrop-blur lg:hidden">
        {followButton}
        <div className="flex-1">{requestQuoteButton}</div>
      </div>

      {rfqOpen && <RfqDialog supplierId={s.id} supplierName={s.name} onClose={closeRfq} />}
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
