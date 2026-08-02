"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  AtSign,
  Building2,
  CheckCircle2,
  Globe,
  Loader2,
  MapPin,
  MessageSquare,
  Music2,
  Phone,
  Play,
  Plus,
  Radio,
  Search,
  Share2,
  ShieldCheck,
  Store,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { MessageState } from "@/components/marketplace/shell"
import { ProductCard } from "@/components/marketplace/product-card"
import { RfqDialog } from "@/components/rfq/rfq-dialog"
import { useLanguage } from "@/components/language-provider"
import { useAuth } from "@/components/auth-provider"
import { isSupabaseConfigured } from "@/lib/supabase/browser"
import { socialT } from "@/lib/social-i18n"
import { fetchCompanyBySlug } from "@/lib/services/companies-client"
import { fetchProducts } from "@/lib/services/products-client"
import * as social from "@/lib/services/social-service"
import type { CompanyDetails } from "@/lib/domains/company/types"
import type { ProductSummary } from "@/lib/domains/product/types"
import type {
  CompanyStats,
  LiveSession,
  LiveStatus,
  Post,
  PostMedia,
  ViewerState,
} from "@/lib/domains/social/types"
import { PostsFeed } from "@/components/marketplace/posts-feed"

type Tab = "posts" | "products" | "videos" | "live" | "about"
type Status = "loading" | "loaded" | "notFound" | "error"

const EMPTY_STATS: CompanyStats = { followers: 0, posts: 0, videos: 0, products: 0 }
const EMPTY_VIEWER: ViewerState = { userId: null, isMember: false, isFollowing: false }

export function CompanyProfile({ slug }: { slug: string }) {
  const { lang, dir } = useLanguage()
  const s = socialT[lang]
  const router = useRouter()
  const { user } = useAuth()
  const configured = isSupabaseConfigured()

  const [status, setStatus] = useState<Status>("loading")
  const [resultSlug, setResultSlug] = useState<string | null>(null)
  const [company, setCompany] = useState<CompanyDetails | null>(null)
  const [stats, setStats] = useState<CompanyStats>(EMPTY_STATS)
  const [viewer, setViewer] = useState<ViewerState>(EMPTY_VIEWER)
  const [tab, setTab] = useState<Tab>("posts")
  const [rfqOpen, setRfqOpen] = useState(false)
  const [shareMsg, setShareMsg] = useState(false)

  const [posts, setPosts] = useState<Post[]>([])
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [videos, setVideos] = useState<PostMedia[]>([])
  const [lives, setLives] = useState<LiveSession[]>([])

  const requireAuth = useCallback(() => {
    if (user) return true
    router.push(`/login?redirect=${encodeURIComponent(`/companies/${slug}`)}`)
    return false
  }, [user, router, slug])

  // Load company + all social data once the company id is known. State is
  // stamped with the slug it belongs to so a slug change reads as "loading"
  // (derived below) without a synchronous setState in the effect body.
  useEffect(() => {
    let active = true
    fetchCompanyBySlug(slug).then(async (res) => {
      if (!active) return
      if (res.error) {
        setResultSlug(slug)
        return setStatus("error")
      }
      if (res.notFound || !res.data) {
        setResultSlug(slug)
        return setStatus("notFound")
      }
      const c = res.data
      setCompany(c)
      setResultSlug(slug)
      setStatus("loaded")

      const [statsRes, viewerRes, postsRes, likedRes, productsRes, videosRes, livesRes] =
        await Promise.allSettled([
          social.getCompanyStats(c.id),
          configured ? social.getViewerState(c.id) : Promise.resolve(EMPTY_VIEWER),
          social.listPosts(c.id),
          configured ? social.getLikedPostIds(c.id) : Promise.resolve(new Set<string>()),
          fetchProducts({ companyId: c.id, limit: 48 }),
          social.listVideoMedia(c.id),
          social.listLiveSessions(c.id),
        ])
      if (!active) return
      if (statsRes.status === "fulfilled") setStats(statsRes.value)
      if (viewerRes.status === "fulfilled") setViewer(viewerRes.value)
      if (postsRes.status === "fulfilled") setPosts(postsRes.value)
      if (likedRes.status === "fulfilled") setLikedIds(likedRes.value)
      if (productsRes.status === "fulfilled") setProducts(productsRes.value)
      if (videosRes.status === "fulfilled") setVideos(videosRes.value)
      if (livesRes.status === "fulfilled") setLives(livesRes.value)
    })
    return () => {
      active = false
    }
  }, [slug, configured, user])

  const tabs = useMemo(() => {
    const list: { id: Tab; label: string; show: boolean }[] = [
      { id: "posts", label: s.tabPosts, show: true },
      { id: "products", label: s.tabProducts, show: products.length > 0 || viewer.isMember },
      { id: "videos", label: s.tabVideos, show: videos.length > 0 || viewer.isMember },
      { id: "live", label: s.tabLive, show: lives.length > 0 || viewer.isMember },
      { id: "about", label: s.tabAbout, show: true },
    ]
    return list.filter((t) => t.show)
  }, [s, products.length, videos.length, lives.length, viewer.isMember])

  async function toggleFollow() {
    if (!requireAuth()) return
    const next = !viewer.isFollowing
    setViewer((v) => ({ ...v, isFollowing: next }))
    setStats((st) => ({ ...st, followers: Math.max(0, st.followers + (next ? 1 : -1)) }))
    try {
      if (next) await social.follow(company!.id)
      else await social.unfollow(company!.id)
    } catch {
      setViewer((v) => ({ ...v, isFollowing: !next }))
      setStats((st) => ({ ...st, followers: Math.max(0, st.followers + (next ? -1 : 1)) }))
    }
  }

  function share() {
    const url = typeof window !== "undefined" ? window.location.href : ""
    if (navigator.share) navigator.share({ url }).catch(() => {})
    else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setShareMsg(true)
        setTimeout(() => setShareMsg(false), 1800)
      }).catch(() => {})
    }
  }

  const effectiveStatus: Status = resultSlug === slug ? status : "loading"

  if (effectiveStatus === "loading") return <ProfileSkeleton />
  if (effectiveStatus === "notFound")
    return (
      <MessageState
        icon={<Building2 className="size-6" />}
        title={s.notFoundTitle}
        description={s.notFoundSubtitle}
        action={
          <Link href="/companies" className={buttonVariants({ size: "lg" })}>
            {s.backToCompanies}
          </Link>
        }
      />
    )
  if (effectiveStatus === "error" || !company)
    return <MessageState icon={<Building2 className="size-6" />} title={s.errorTitle} description={s.errorSubtitle} />

  const c = company

  return (
    <div dir={dir} className="pb-10">
      {/* Cover */}
      <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 sm:h-52">
        {c.bannerUrl && <Image src={c.bannerUrl} alt="" fill className="object-cover" sizes="100vw" unoptimized priority />}
      </div>

      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="-mt-10 flex flex-col gap-4 sm:-mt-12">
          <div className="flex items-end gap-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl border-4 border-background bg-secondary sm:size-24">
              {c.logoUrl ? (
                <Image src={c.logoUrl} alt={c.name} fill className="object-cover" sizes="96px" unoptimized />
              ) : (
                <div className="flex size-full items-center justify-center text-2xl font-bold text-muted-foreground">
                  {c.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">{c.name}</h1>
                {c.verified && <CheckCircle2 className="size-5 shrink-0 text-primary" aria-label="Verified" />}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                {c.businessType && (
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="size-3.5" /> {c.businessType}
                  </span>
                )}
                {(c.city || c.country) && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" /> {[c.city, c.country].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 rounded-2xl border border-border bg-card p-3 text-center">
            <Stat label={s.followers} value={stats.followers} />
            <Stat label={s.posts} value={stats.posts} />
            <Stat label={s.videos} value={stats.videos} />
            <Stat label={s.products} value={stats.products} />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={toggleFollow} variant={viewer.isFollowing ? "outline" : "default"} className="flex-1 sm:flex-none">
              {viewer.isFollowing ? s.unfollow : s.follow}
            </Button>
            <Button variant="outline" render={<Link href="/messages" />} className="flex-1 sm:flex-none">
              <MessageSquare className="size-4" /> {s.message}
            </Button>
            <Button variant="secondary" onClick={() => setRfqOpen(true)} className="flex-1 sm:flex-none">
              {s.requestQuote}
            </Button>
            <Button variant="ghost" size="icon" onClick={share} aria-label={s.share}>
              <Share2 className="size-4" />
            </Button>
            {viewer.isMember && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                <ShieldCheck className="size-3.5" /> {s.myCompany}
              </span>
            )}
            {shareMsg && <span className="text-xs text-muted-foreground">{s.shareCopied}</span>}
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-14 z-20 mt-4 -mx-4 border-b border-border bg-background/95 px-4 backdrop-blur">
          <div className="no-scrollbar flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id}
                className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="mt-5">
          {tab === "posts" && (
            <PostsFeed
              companyId={c.id}
              posts={posts}
              setPosts={setPosts}
              likedIds={likedIds}
              setLikedIds={setLikedIds}
              viewer={viewer}
              requireAuth={requireAuth}
            />
          )}
          {tab === "products" && <ProductsTab companyId={c.id} products={products} />}
          {tab === "videos" && <VideosTab videos={videos} isMember={viewer.isMember} />}
          {tab === "live" && (
            <LiveTab companyId={c.id} lives={lives} setLives={setLives} isMember={viewer.isMember} />
          )}
          {tab === "about" && <AboutTab company={c} />}
        </div>
      </div>

      {rfqOpen && <RfqDialog supplierId="" supplierName={c.name} onClose={() => setRfqOpen(false)} />}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <span className="text-lg font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Products tab — reuses ProductCard, with in-store search.
// ---------------------------------------------------------------------------
function ProductsTab({ companyId, products }: { companyId: string; products: ProductSummary[] }) {
  const { lang, dir } = useLanguage()
  const s = socialT[lang]
  const [q, setQ] = useState("")
  void companyId
  const filtered = q.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(q.trim().toLowerCase()))
    : products

  return (
    <div dir={dir} className="flex flex-col gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={s.searchInStore}
          className="h-11 w-full rounded-full border border-input bg-background ps-9 pe-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {s.productsEmpty}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Videos tab — vertical commercial video cards.
// ---------------------------------------------------------------------------
function VideosTab({ videos, isMember }: { videos: PostMedia[]; isMember: boolean }) {
  const { lang, dir } = useLanguage()
  const s = socialT[lang]
  if (videos.length === 0)
    return (
      <p dir={dir} className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        {isMember ? s.videosEmptyMember : s.videosEmpty}
      </p>
    )
  return (
    <div dir={dir} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {videos.map((v) => (
        <div key={v.id} className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-black">
          <video src={v.url ?? undefined} controls muted playsInline preload="metadata" className="size-full object-cover" />
          <span className="pointer-events-none absolute bottom-2 start-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
            <Play className="size-3 fill-white" />
          </span>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Live tab — upcoming / live now / previous, with member creation.
// ---------------------------------------------------------------------------
function LiveTab({
  companyId,
  lives,
  setLives,
  isMember,
}: {
  companyId: string
  lives: LiveSession[]
  setLives: React.Dispatch<React.SetStateAction<LiveSession[]>>
  isMember: boolean
}) {
  const { lang, dir } = useLanguage()
  const s = socialT[lang]
  const [title, setTitle] = useState("")
  const [busy, setBusy] = useState(false)

  const now = lives.filter((l) => l.status === "live")
  const upcoming = lives.filter((l) => l.status === "upcoming")
  const previous = lives.filter((l) => l.status === "ended")

  async function create(startNow: boolean) {
    if (!title.trim()) return
    setBusy(true)
    try {
      const session = await social.createLiveSession(companyId, {
        title,
        status: startNow ? "live" : "upcoming",
        scheduledAt: startNow ? null : new Date(Date.now() + 86400000).toISOString(),
      })
      setLives((prev) => [session, ...prev])
      setTitle("")
    } finally {
      setBusy(false)
    }
  }

  async function setStatus(id: string, status: LiveStatus) {
    await social.updateLiveStatus(id, status)
    setLives((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
  }

  return (
    <div dir={dir} className="flex flex-col gap-5">
      {isMember && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={s.liveTitle}
            className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => create(true)} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Radio className="size-4" />}
              {s.goLiveNow}
            </Button>
            <Button size="sm" variant="outline" onClick={() => create(false)} disabled={busy}>
              <Plus className="size-4" /> {s.scheduleForLater}
            </Button>
          </div>
        </div>
      )}

      {now.length > 0 && (
        <section>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
            <span className="inline-flex size-2 animate-pulse rounded-full bg-destructive" /> {s.liveNow}
          </h3>
          <div className="flex flex-col gap-2">
            {now.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
                <div>
                  <p className="font-semibold text-foreground">{l.title}</p>
                  <p className="text-xs text-muted-foreground">{l.viewerCount} watching</p>
                </div>
                {isMember ? (
                  <Button size="sm" variant="destructive" onClick={() => setStatus(l.id, "ended")}>{s.endLive}</Button>
                ) : (
                  <Button size="sm">{s.joinLive}</Button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-bold text-foreground">{s.liveUpcoming}</h3>
          <div className="flex flex-col gap-2">
            {upcoming.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
                <div>
                  <p className="font-semibold text-foreground">{l.title}</p>
                  {l.scheduledAt && <p className="text-xs text-muted-foreground">{new Date(l.scheduledAt).toLocaleString()}</p>}
                </div>
                {isMember && (
                  <Button size="sm" onClick={() => setStatus(l.id, "live")}>{s.startLive}</Button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {previous.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-bold text-foreground">{s.livePrevious}</h3>
          <div className="flex flex-col gap-2">
            {previous.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
                <p className="font-semibold text-foreground">{l.title}</p>
                {l.replayUrl && (
                  <a href={l.replayUrl} className={buttonVariants({ size: "sm", variant: "outline" })}>{s.watchReplay}</a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {lives.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {isMember ? s.liveEmptyMember : s.liveEmpty}
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// About tab — description, contact channels, storefronts.
// ---------------------------------------------------------------------------
function AboutTab({ company }: { company: CompanyDetails }) {
  const { lang, dir } = useLanguage()
  const s = socialT[lang]
  const channels = [
    company.whatsappNumber && { icon: <Phone className="size-4" />, label: "WhatsApp", href: `https://wa.me/${company.whatsappNumber.replace(/[^0-9]/g, "")}` },
    company.phoneNumber && { icon: <Phone className="size-4" />, label: company.phoneNumber, href: `tel:${company.phoneNumber}` },
    company.facebookUrl && { icon: <AtSign className="size-4" />, label: "Facebook", href: company.facebookUrl },
    company.tiktokUrl && { icon: <Music2 className="size-4" />, label: "TikTok", href: company.tiktokUrl },
    company.website && { icon: <Globe className="size-4" />, label: s.website, href: company.website },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; href: string }[]

  return (
    <div dir={dir} className="flex flex-col gap-6">
      <section>
        <h3 className="mb-2 text-sm font-bold text-foreground">{s.about}</h3>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {company.description || s.noDescription}
        </p>
      </section>

      {channels.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-bold text-foreground">{s.contactChannels}</h3>
          <div className="flex flex-wrap gap-2">
            {channels.map((ch) => (
              <a
                key={ch.label}
                href={ch.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-secondary"
              >
                {ch.icon} {ch.label}
              </a>
            ))}
          </div>
        </section>
      )}

      {(company.city || company.country) && (
        <section>
          <h3 className="mb-2 text-sm font-bold text-foreground">{s.location}</h3>
          <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" /> {[company.city, company.country].filter(Boolean).join(", ")}
          </p>
        </section>
      )}

      {company.stores.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-bold text-foreground">{s.tabProducts}</h3>
          <div className="flex flex-col gap-2">
            {company.stores.map((store) => (
              <Link
                key={store.id}
                href={`/stores/${store.slug}`}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-secondary"
              >
                <Store className="size-4 text-primary" /> {store.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-2 text-sm font-bold text-foreground">{s.businessHours}</h3>
        <p className="text-sm text-muted-foreground">{s.businessHoursSoon}</p>
      </section>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="pb-10">
      <div className="h-36 w-full animate-pulse bg-muted sm:h-52" />
      <div className="mx-auto max-w-4xl px-4">
        <div className="-mt-10 flex items-end gap-4 sm:-mt-12">
          <div className="size-20 animate-pulse rounded-2xl border-4 border-background bg-muted sm:size-24" />
          <div className="flex-1 space-y-2 pb-2">
            <div className="h-6 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-56 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="mt-4 h-16 animate-pulse rounded-2xl bg-muted" />
        <div className="mt-4 h-10 animate-pulse rounded-xl bg-muted" />
        <div className="mt-6 grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  )
}
