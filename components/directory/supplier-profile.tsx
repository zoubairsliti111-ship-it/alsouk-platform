"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Clock,
  Eye,
  AtSign,
  Globe,
  Grid3x3,
  Heart,
  LayoutList,
  MapPin,
  MessageCircle,
  MessageSquare,
  Music2,
  Package,
  Phone,
  Pencil,
  Pin,
  Play,
  Plus,
  Radio,
  Search,
  Share2,
  Trash2,
  Upload,
  Video,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { directoryT } from "@/lib/directory-i18n"
import type { CategoryKey, Supplier } from "@/lib/directory-data"
import { fetchSupplierById } from "@/lib/supabase/suppliers-service"
import { RfqDialog } from "@/components/rfq/rfq-dialog"

type Status = "loading" | "loaded" | "notFound" | "error"
type Tab = "posts" | "products" | "videos" | "live" | "about"

const COVER_IMAGE = "/images/supplier-factory.png"

const CATEGORY_IMAGE: Record<CategoryKey, string> = {
  food: "/images/product-oliveoil.png",
  textiles: "/images/product-textiles.png",
  machinery: "/images/product-machinery.png",
  construction: "/images/supplier-factory.png",
  handicrafts: "/images/product-ceramics.png",
  cosmetics: "/images/product-dates.png",
  leather: "/images/product-leather.png",
  chemicals: "/images/product-machinery.png",
}

function openAssistant() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("alsouk:open-assistant"))
  }
}

function formatCompact(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`
  return String(n)
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

  const status: Status = state.id === id ? state.status : "loading"
  const supplier = state.id === id ? state.supplier : null

  if (status === "loading") {
    return (
      <div>
        <div className="h-40 animate-pulse bg-muted sm:h-56" />
        <div className="mx-auto max-w-4xl px-4">
          <div className="-mt-10 size-24 animate-pulse rounded-2xl bg-muted" />
          <div className="mt-4 h-6 w-56 animate-pulse rounded bg-muted" />
          <div className="mt-6 grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
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
          <Link href="/suppliers" className={buttonVariants({ size: "lg" })}>
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {p.backToDirectory}
          </Link>
        </div>
      </div>
    )
  }

  return <SocialProfile key={supplier.id} supplier={supplier} />
}

type Post = {
  id: string
  image: string
  caption: string
  likes: number
  comments: number
  pinned: boolean
}

type ProductTile = {
  id: string
  name: string
  image: string
  category: CategoryKey
  categoryLabel: string
  pinned: boolean
}

function SocialProfile({ supplier: s }: { supplier: Supplier }) {
  const { lang } = useLanguage()
  const t = directoryT[lang]
  const p = t.profile
  const sc = p.social

  const catImage = (c: CategoryKey) => CATEGORY_IMAGE[c] ?? COVER_IMAGE
  const primaryImage = s.categories[0] ? catImage(s.categories[0]) : COVER_IMAGE

  // Presentational content derived deterministically from the supplier.
  const initialPosts = useMemo<Post[]>(
    () =>
      s.categories.slice(0, 4).map((c, i) => ({
        id: `seed-${i}`,
        image: catImage(c),
        caption: `${s.name} · ${t.categories[c]}`,
        likes: 40 + ((s.reviews * (i + 3)) % 260),
        comments: 3 + ((s.products * (i + 1)) % 24),
        pinned: i === 0,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.id, lang],
  )

  const products = useMemo<ProductTile[]>(() => {
    const list: ProductTile[] = []
    s.categories.forEach((c, ci) => {
      for (let k = 0; k < 2; k++) {
        list.push({
          id: `${c}-${k}`,
          name: `${t.categories[c]} · ${String.fromCharCode(65 + k)}`,
          image: catImage(c),
          category: c,
          categoryLabel: t.categories[c],
          pinned: ci === 0 && k === 0,
        })
      }
    })
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.id, lang])

  const videos = useMemo(
    () =>
      s.categories.slice(0, 4).map((c, i) => ({
        id: `v-${i}`,
        image: catImage(c),
        title: `${t.categories[c]} — ${s.name}`,
        views: `${formatCompact(800 + ((s.reviews * (i + 2)) % 9000))} ${sc.views}`,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.id, lang],
  )

  const live = useMemo(
    () => ({
      now: {
        title: `${t.categories[s.categories[0] ?? "food"]} — ${s.name}`,
        viewers: formatCompact(120 + (s.reviews % 400)),
      },
      upcoming: [{ id: "u1", title: `${s.name} · ${sc.liveUpcoming}`, date: "24 Sep · 15:00" }],
      previous: s.categories.slice(0, 2).map((c, i) => ({
        id: `pv-${i}`,
        title: t.categories[c],
        views: `${formatCompact(2000 + ((s.products * (i + 1)) % 12000))} ${sc.views}`,
        image: catImage(c),
      })),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.id, lang],
  )

  const [rfqOpen, setRfqOpen] = useState(false)
  const [following, setFollowing] = useState(false)
  const [member, setMember] = useState(false)
  const [tab, setTab] = useState<Tab>("posts")
  const [postsView, setPostsView] = useState<"grid" | "list">("list")
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [likes, setLikes] = useState<Record<string, boolean>>({})
  const [composerOpen, setComposerOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState("")
  const [productQuery, setProductQuery] = useState("")
  const [productCat, setProductCat] = useState<CategoryKey | "all">("all")
  const [shareToast, setShareToast] = useState(false)

  const closeRfq = useCallback(() => setRfqOpen(false), [])

  const orderedPosts = useMemo(
    () => [...posts].sort((a, b) => Number(b.pinned) - Number(a.pinned)),
    [posts],
  )

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase()
    return products
      .filter((pr) => (productCat === "all" ? true : pr.category === productCat))
      .filter((pr) => (q ? pr.name.toLowerCase().includes(q) : true))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned))
  }, [products, productQuery, productCat])

  const followers = 1200 + s.reviews * 37
  const followingCount = 80 + s.years * 12

  const publishPost = () => {
    const caption = draft.trim()
    if (!caption) return
    setPosts((prev) => [
      { id: `new-${Date.now()}`, image: primaryImage, caption, likes: 0, comments: 0, pinned: false },
      ...prev,
    ])
    setDraft("")
    setComposerOpen(false)
  }

  const saveEdit = (id: string) => {
    const next = editDraft.trim()
    if (next) setPosts((prev) => prev.map((post) => (post.id === id ? { ...post, caption: next } : post)))
    setEditingId(null)
    setEditDraft("")
  }

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : ""
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: s.name, url })
        return
      }
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url)
      }
    } catch {
      /* user dismissed share sheet */
    }
    setShareToast(true)
    window.setTimeout(() => setShareToast(false), 1800)
  }

  const tabs: { id: Tab; label: string; count: number; show: boolean }[] = [
    { id: "posts", label: sc.tabPosts, count: posts.length, show: posts.length > 0 || member },
    { id: "products", label: sc.tabProducts, count: products.length, show: products.length > 0 },
    { id: "videos", label: sc.tabVideos, count: videos.length, show: videos.length > 0 || member },
    {
      id: "live",
      label: sc.tabLive,
      count: live.previous.length,
      show: Boolean(live.now) || live.upcoming.length > 0 || live.previous.length > 0,
    },
    { id: "about", label: sc.tabAbout, count: 0, show: true },
  ]
  const visibleTabs = tabs.filter((tb) => tb.show)
  const activeTab: Tab = visibleTabs.some((tb) => tb.id === tab) ? tab : "posts"

  const logoClasses =
    s.logoColor === "green"
      ? "bg-brand-green text-brand-green-foreground"
      : "bg-brand-blue text-brand-blue-foreground"

  return (
    <div className="pb-32 lg:pb-10">
      {/* Cover */}
      <section className="relative">
        <div className="relative h-40 w-full overflow-hidden sm:h-56">
          <Image src={COVER_IMAGE} alt={s.name} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <Link
              href="/suppliers"
              className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-black/60"
            >
              <ArrowLeft className="size-4 rtl:rotate-180" />
              {p.backToDirectory}
            </Link>
            {/* View-as preview toggle (no auth yet) */}
            <div className="inline-flex items-center rounded-full bg-black/40 p-0.5 text-xs font-semibold text-white backdrop-blur">
              <button
                type="button"
                onClick={() => setMember(false)}
                aria-pressed={!member}
                className={`rounded-full px-2.5 py-1 ${!member ? "bg-white text-neutral-900" : ""}`}
              >
                {sc.asBuyer}
              </button>
              <button
                type="button"
                onClick={() => setMember(true)}
                aria-pressed={member}
                className={`rounded-full px-2.5 py-1 ${member ? "bg-white text-neutral-900" : ""}`}
              >
                {sc.asMember}
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4">
          {/* Identity */}
          <div className="flex items-end gap-4">
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
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{s.name}</h1>
                {s.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                    <BadgeCheck className="size-3.5" />
                    {p.verified}
                  </span>
                )}
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="size-3.5" />
                  {s.businessTypes.map((bt) => t.businessTypes[bt]).join(" · ")}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5 text-primary" />
                  {t.cities[s.cityKey] ?? s.cityKey}
                </span>
              </p>
            </div>
          </div>

          {/* Social stats */}
          <div className="mt-5 grid grid-cols-5 gap-1 rounded-2xl border border-border bg-card py-3 text-center">
            <CountStat value={formatCompact(followers)} label={sc.followers} />
            <CountStat value={formatCompact(followingCount)} label={sc.following} />
            <CountStat value={formatCompact(s.products)} label={sc.products} />
            <CountStat value={String(posts.length)} label={sc.posts} />
            <CountStat value={String(videos.length)} label={sc.videos} />
          </div>

          {/* Primary actions — always visible, commerce-first */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              size="lg"
              onClick={() => setRfqOpen(true)}
              className="min-w-40 flex-1 gap-2 bg-primary text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <MessageSquare className="size-4" />
              {p.requestQuote}
            </Button>
            <button
              type="button"
              onClick={openAssistant}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <MessageCircle className="size-4" />
              {sc.message}
            </button>
            <button
              type="button"
              onClick={() => setFollowing((f) => !f)}
              aria-pressed={following}
              className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors active:scale-95 ${
                following
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:bg-secondary"
              }`}
            >
              <Heart className={`size-4 ${following ? "fill-primary" : ""}`} />
              {following ? p.following : p.follow}
            </button>
            <button
              type="button"
              onClick={share}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <Share2 className="size-4" />
              <span className="hidden sm:inline">{sc.share}</span>
            </button>
            {member && (
              <>
                <button
                  type="button"
                  onClick={() => setTab("live")}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                >
                  <Radio className="size-4" />
                  {sc.goLive}
                </button>
                <button
                  type="button"
                  onClick={() => setTab("about")}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  <Pencil className="size-4" />
                  <span className="hidden sm:inline">{sc.editProfile}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Sticky tabs */}
      <div className="sticky top-0 z-20 mt-5 border-y border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-2 no-scrollbar">
          {visibleTabs.map((tb) => {
            const active = activeTab === tb.id
            return (
              <button
                key={tb.id}
                type="button"
                onClick={() => setTab(tb.id)}
                aria-pressed={active}
                className={`relative shrink-0 px-4 py-3 text-sm font-semibold transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tb.label}
                {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6">
        {activeTab === "posts" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              {member ? (
                <button
                  type="button"
                  onClick={() => setComposerOpen((o) => !o)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground"
                >
                  <Plus className="size-4" />
                  {sc.createPost}
                </button>
              ) : (
                <span />
              )}
              <div className="inline-flex items-center rounded-full border border-border bg-card p-0.5">
                <button
                  type="button"
                  onClick={() => setPostsView("list")}
                  aria-pressed={postsView === "list"}
                  aria-label={sc.listView}
                  className={`rounded-full p-1.5 ${postsView === "list" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
                >
                  <LayoutList className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPostsView("grid")}
                  aria-pressed={postsView === "grid"}
                  aria-label={sc.gridView}
                  className={`rounded-full p-1.5 ${postsView === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
                >
                  <Grid3x3 className="size-4" />
                </button>
              </div>
            </div>

            {member && composerOpen && (
              <div className="rounded-2xl border border-border bg-card p-3">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={sc.postPlaceholder}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setComposerOpen(false); setDraft("") }}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary"
                  >
                    {sc.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={publishPost}
                    className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                  >
                    {sc.publish}
                  </button>
                </div>
              </div>
            )}

            {orderedPosts.length === 0 ? (
              <EmptyState icon={<Grid3x3 className="size-5" />} text={sc.postsEmpty} />
            ) : postsView === "grid" ? (
              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                {orderedPosts.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => setPostsView("list")}
                    className="group relative aspect-square overflow-hidden rounded-lg"
                  >
                    <Image src={post.image} alt={post.caption} fill sizes="33vw" className="object-cover" />
                    {post.pinned && (
                      <span className="absolute start-1 top-1 rounded-full bg-black/60 p-1 text-white">
                        <Pin className="size-3" />
                      </span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/70 to-transparent p-1.5 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <Heart className="size-3" /> {formatCompact(post.likes)}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {orderedPosts.map((post) => {
                  const liked = !!likes[post.id]
                  return (
                    <article key={post.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                      <div className="flex items-center gap-3 p-3">
                        <span className={`flex size-9 items-center justify-center rounded-full text-sm font-bold ${logoClasses}`}>
                          {s.monogram}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{s.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {t.cities[s.cityKey] ?? s.cityKey}
                          </p>
                        </div>
                        {post.pinned && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                            <Pin className="size-3" />
                            {sc.pinnedBadge}
                          </span>
                        )}
                      </div>
                      <div className="relative aspect-[4/3] w-full">
                        <Image src={post.image} alt={post.caption} fill sizes="(max-width:768px) 100vw, 40rem" className="object-cover" />
                      </div>
                      <div className="p-3">
                        {editingId === post.id ? (
                          <div>
                            <textarea
                              value={editDraft}
                              onChange={(e) => setEditDraft(e.target.value)}
                              rows={2}
                              className="w-full resize-none rounded-xl border border-border bg-background p-2 text-sm outline-none focus:border-primary"
                            />
                            <div className="mt-2 flex justify-end gap-2">
                              <button type="button" onClick={() => setEditingId(null)} className="rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary">
                                {sc.cancel}
                              </button>
                              <button type="button" onClick={() => saveEdit(post.id)} className="rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
                                {sc.save}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-foreground">{post.caption}</p>
                        )}
                        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                          <button
                            type="button"
                            onClick={() => setLikes((l) => ({ ...l, [post.id]: !l[post.id] }))}
                            className="inline-flex items-center gap-1.5 active:scale-95"
                            aria-pressed={liked}
                          >
                            <Heart className={`size-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                            {formatCompact(post.likes + (liked ? 1 : 0))}
                          </button>
                          <span className="inline-flex items-center gap-1.5">
                            <MessageCircle className="size-4" />
                            {formatCompact(post.comments)}
                          </span>
                          <button type="button" onClick={share} className="inline-flex items-center gap-1.5 active:scale-95">
                            <Share2 className="size-4" />
                            {sc.share}
                          </button>
                          {member && (
                            <span className="ms-auto inline-flex items-center gap-1">
                              <IconBtn label={post.pinned ? sc.unpin : sc.pin} onClick={() => setPosts((prev) => prev.map((x) => (x.id === post.id ? { ...x, pinned: !x.pinned } : x)))}>
                                <Pin className={`size-4 ${post.pinned ? "text-primary" : ""}`} />
                              </IconBtn>
                              <IconBtn label={sc.edit} onClick={() => { setEditingId(post.id); setEditDraft(post.caption) }}>
                                <Pencil className="size-4" />
                              </IconBtn>
                              <IconBtn label={sc.delete} onClick={() => setPosts((prev) => prev.filter((x) => x.id !== post.id))}>
                                <Trash2 className="size-4" />
                              </IconBtn>
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                placeholder={sc.searchInStore}
                className="w-full rounded-full border border-border bg-card py-2.5 ps-9 pe-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              <Chip active={productCat === "all"} onClick={() => setProductCat("all")}>
                {sc.allCategories}
              </Chip>
              {s.categories.map((c) => (
                <Chip key={c} active={productCat === c} onClick={() => setProductCat(c)}>
                  {t.categories[c]}
                </Chip>
              ))}
            </div>
            {filteredProducts.length === 0 ? (
              <EmptyState icon={<Package className="size-5" />} text={p.productsEmpty} />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {filteredProducts.map((pr) => (
                  <div key={pr.id} className="group overflow-hidden rounded-2xl border border-border bg-card">
                    <div className="relative aspect-square w-full">
                      <Image src={pr.image} alt={pr.name} fill sizes="(max-width:640px) 50vw, 20rem" className="object-cover transition-transform group-hover:scale-105" />
                      {pr.pinned && (
                        <span className="absolute start-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
                          <Pin className="size-3" />
                          {sc.pinnedBadge}
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="truncate text-sm font-semibold text-foreground">{pr.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {p.moq}: {s.minMoq.toLocaleString()} {p.moqUnit}
                      </p>
                      <button
                        type="button"
                        onClick={() => setRfqOpen(true)}
                        className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                      >
                        <MessageSquare className="size-3.5" />
                        {p.requestQuote}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "videos" && (
          <div className="space-y-4">
            {member && (
              <button
                type="button"
                onClick={openAssistant}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground"
              >
                <Upload className="size-4" />
                {sc.uploadVideo}
              </button>
            )}
            {videos.length === 0 ? (
              <EmptyState icon={<Video className="size-5" />} text={sc.videosEmpty} />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {videos.map((v) => (
                  <Link key={v.id} href="/discover" className="group relative block aspect-[9/16] overflow-hidden rounded-2xl">
                    <Image src={v.image} alt={v.title} fill sizes="(max-width:640px) 50vw, 16rem" className="object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex size-11 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm">
                        <Play className="size-5 fill-white text-white" />
                      </span>
                    </span>
                    <span className="absolute bottom-2 start-2 end-2 text-white">
                      <span className="line-clamp-2 text-xs font-semibold">{v.title}</span>
                      <span className="mt-0.5 flex items-center gap-1 text-[11px] text-white/80">
                        <Eye className="size-3" />
                        {v.views}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "live" && (
          <div className="space-y-6">
            {live.now && (
              <div className="overflow-hidden rounded-2xl border border-red-500/30 bg-card">
                <div className="relative aspect-video w-full">
                  <Image src={primaryImage} alt={live.now.title} fill sizes="(max-width:768px) 100vw, 40rem" className="object-cover" />
                  <div className="absolute inset-0 bg-black/30" />
                  <span className="absolute start-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
                    <span className="size-2 animate-pulse rounded-full bg-white" />
                    {sc.liveNow}
                  </span>
                  <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                    <Eye className="size-3" />
                    {live.now.viewers}
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-foreground">{live.now.title}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={openAssistant}
                      className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      <Radio className="size-4" />
                      {sc.joinLive}
                    </button>
                    {products.slice(0, 2).map((pr) => (
                      <button
                        key={pr.id}
                        type="button"
                        onClick={() => setRfqOpen(true)}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-2 text-xs font-semibold text-foreground"
                      >
                        <Pin className="size-3.5 text-primary" />
                        {pr.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{sc.liveUpcoming}</h3>
              <div className="space-y-2">
                {live.upcoming.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Clock className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{u.title}</p>
                      <p className="text-xs text-muted-foreground">{u.date}</p>
                    </div>
                    <button type="button" onClick={openAssistant} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary">
                      {sc.remindMe}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{sc.livePrevious}</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {live.previous.map((pv) => (
                  <div key={pv.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                    <div className="relative aspect-video w-full">
                      <Image src={pv.image} alt={pv.title} fill sizes="(max-width:640px) 50vw, 16rem" className="object-cover" />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Play className="size-8 fill-white/90 text-white/90" />
                      </span>
                    </div>
                    <div className="p-2.5">
                      <p className="truncate text-xs font-semibold text-foreground">{pv.title}</p>
                      <p className="text-[11px] text-muted-foreground">{pv.views}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "about" && (
          <div className="space-y-5">
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground">
                <Building2 className="size-4 text-primary" />
                {p.overview}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.description ?? p.aboutEmpty}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {s.categories.map((c) => (
                  <span key={c} className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground">
                    {t.categories[c]}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground">
                <Phone className="size-4 text-primary" />
                {sc.contactChannels}
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <ContactChannel icon={<MessageCircle className="size-4" />} label={sc.whatsapp} onClick={openAssistant} />
                <ContactChannel icon={<Phone className="size-4" />} label={sc.phone} onClick={openAssistant} />
                <ContactChannel icon={<Globe className="size-4" />} label={sc.website} onClick={openAssistant} />
                <ContactChannel icon={<AtSign className="size-4" />} label={sc.facebook} onClick={openAssistant} />
                <ContactChannel icon={<Music2 className="size-4" />} label={sc.tiktok} onClick={openAssistant} />
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground">
                <MapPin className="size-4 text-primary" />
                {p.location}
              </h2>
              <dl className="divide-y divide-border text-sm">
                <Row label={t.filters.country} value={t.countries[s.country] ?? s.country} />
                <Row label={p.location} value={t.cities[s.cityKey] ?? s.cityKey} />
                <Row label={p.region} value={t.regions[s.region]} />
                <Row label={p.rating} value={`${s.rating.toFixed(1)} / 5 (${s.reviews} ${p.reviews})`} />
              </dl>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                {sc.businessHoursSoon}
              </p>
            </section>
          </div>
        )}
      </div>

      {/* Sticky mobile CTA — above the bottom nav; Request Quote always one tap away */}
      <div className="fixed inset-x-0 bottom-14 z-30 flex items-center gap-2 border-t border-border bg-card/95 p-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={openAssistant}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground"
          aria-label={sc.message}
        >
          <MessageCircle className="size-5" />
        </button>
        <Button
          size="lg"
          onClick={() => setRfqOpen(true)}
          className="flex-1 gap-2 bg-primary text-base font-semibold text-primary-foreground"
        >
          <MessageSquare className="size-4" />
          {p.requestQuote}
        </Button>
        {member && (
          <button
            type="button"
            onClick={() => setTab("live")}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-red-600 text-white"
            aria-label={sc.goLive}
          >
            <Radio className="size-5" />
          </button>
        )}
      </div>

      {shareToast && (
        <div className="fixed inset-x-0 bottom-28 z-40 flex justify-center lg:bottom-10">
          <span className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg">
            {sc.shareCopied}
          </span>
        </div>
      )}

      {rfqOpen && <RfqDialog supplierId={s.id} supplierName={s.name} onClose={closeRfq} />}
    </div>
  )
}

function CountStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-base font-bold text-foreground">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  )
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      {children}
    </button>
  )
}

function ContactChannel({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
    >
      <span className="text-primary">{icon}</span>
      {label}
    </button>
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
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-secondary/30 px-4 py-12 text-center">
      <span className="text-muted-foreground">{icon}</span>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}
