"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, Heart, MessageCircle, Package, Play, Send, Store, Loader2, Info } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { type CommercialPost } from "@/lib/domains/post/types"
import { fetchFeedPosts } from "@/lib/services/posts-service"

const FALLBACK_THUMBS = [
  "/images/product-oliveoil.png",
  "/images/product-textiles.png",
  "/images/product-dates.png",
  "/images/product-ceramics.png",
  "/images/product-leather.png",
  "/images/product-machinery.png",
]

function openAssistant() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("alsouk:open-assistant"))
  }
}

export function DiscoverFeed() {
  const { t, dir, lang } = useLanguage()
  const d = t.discover
  const [posts, setPosts] = useState<CommercialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  // Pagination states
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [fetchingMore, setFetchingMore] = useState(false)

  useEffect(() => {
    loadFeed(0)
  }, [])

  async function loadFeed(pageNum: number) {
    if (pageNum === 0) {
      setLoading(true)
    } else {
      setFetchingMore(true)
    }

    try {
      const limit = 6
      const res = await fetchFeedPosts(limit, pageNum * limit)
      if (res.success && res.data) {
        if (res.data.length < limit) {
          setHasMore(false)
        }
        if (pageNum === 0) {
          setPosts(res.data)
        } else {
          setPosts((prev) => [...prev, ...res.data])
        }
        setPage(pageNum)
      }
    } catch (err) {
      console.error("Failed to load feed posts:", err)
    } finally {
      setLoading(false)
      setFetchingMore(false)
    }
  }

  const handleLoadMore = () => {
    if (!fetchingMore && hasMore) {
      loadFeed(page + 1)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div dir={dir} className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <div className="size-16 bg-primary/10 text-primary flex items-center justify-center rounded-3xl mx-auto">
          <Store className="size-8" />
        </div>
        <div>
          <h3 className="text-lg font-black text-foreground">No Commercial Updates Yet</h3>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            Suppliers haven&apos;t published any updates to the Discover Feed today. Are you a merchant? Go to Account to publish your first commercial post!
          </p>
        </div>
        <Link
          href="/account"
          className="inline-flex rounded-xl bg-primary text-white font-bold text-xs py-2.5 px-5 hover:opacity-90"
        >
          Go to Account Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div dir={dir} className="bg-background">
      <div className="mx-auto max-w-md px-0 sm:px-4 sm:py-4">
        <div className="no-scrollbar h-[calc(100dvh-3.5rem-3.5rem)] snap-y snap-mandatory overflow-y-auto sm:h-[calc(100dvh-8rem)] sm:rounded-3xl">
          {posts.map((post, i) => {
            const isSaved = !!saved[post.id]
            // Choose image: if none in post, use a high quality fallback based on post index
            const imgUrl = (post.images && post.images.length > 0)
              ? post.images[0]
              : FALLBACK_THUMBS[i % FALLBACK_THUMBS.length]

            const companyName = post.company?.name || "Verified Supplier"
            const companySlug = post.company?.slug || ""

            return (
              <section
                key={post.id}
                className="relative flex h-full w-full snap-start items-end overflow-hidden sm:rounded-3xl"
              >
                <Image
                  src={imgUrl || "/placeholder.svg"}
                  alt={companyName}
                  fill
                  sizes="(max-width: 640px) 100vw, 28rem"
                  className="object-cover"
                  priority={i === 0}
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/45" />

                {/* Play affordance */}
                <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
                  <span className="flex size-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <Play className="size-7 fill-white text-white" />
                  </span>
                </span>

                {/* Header chip */}
                <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                  <Eye className="size-3" />
                  {post.viewCount} views
                </span>

                {/* Right action rail */}
                <div className="absolute bottom-28 end-3 z-10 flex flex-col items-center gap-4">
                  <RailButton
                    onClick={() => setSaved((s) => ({ ...s, [post.id]: !s[post.id] }))}
                    label={isSaved ? d.saved : d.save}
                    active={isSaved}
                  >
                    <Heart className={`size-6 ${isSaved ? "fill-red-500 text-red-500" : "text-white"}`} />
                  </RailButton>
                  <RailButton onClick={openAssistant} label={d.contact}>
                    <MessageCircle className="size-6 text-white" />
                  </RailButton>
                  <RailLink href={companySlug ? `/rfq?company=${companySlug}` : "/rfq"} label={d.sendRfq}>
                    <Send className="size-6 text-white" />
                  </RailLink>
                </div>

                {/* Bottom info + primary actions */}
                <div className="relative z-10 w-full p-5 pb-6 text-white space-y-4">
                  <div>
                    <p className="pe-16 text-sm font-semibold leading-relaxed text-white/95 line-clamp-4 break-words">
                      {post.content}
                    </p>
                    <p className="mt-2.5 flex items-center gap-1.5 text-xs font-black text-primary-foreground bg-primary/20 border border-primary/30 py-1.5 px-3 rounded-xl w-fit">
                      <Store className="size-4 text-primary-foreground" />
                      <span>{companyName}</span>
                    </p>
                  </div>

                  <div className="flex gap-2.5 pe-16">
                    {companySlug ? (
                      <Link
                        href={`/companies/${companySlug}`}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-3 text-xs font-black text-neutral-900 transition-transform active:scale-95 shadow-md"
                      >
                        <Info className="size-4" />
                        <span>View Company</span>
                      </Link>
                    ) : (
                      <Link
                        href="/products"
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-3 text-xs font-black text-neutral-900 transition-transform active:scale-95 shadow-md"
                      >
                        <Package className="size-4" />
                        {d.viewProduct}
                      </Link>
                    )}

                    {companySlug ? (
                      <Link
                        href={`/stores/${companySlug}`}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/40 bg-white/10 px-4 py-3 text-xs font-black text-white backdrop-blur transition-transform active:scale-95"
                      >
                        <Store className="size-4" />
                        <span>Visit Store</span>
                      </Link>
                    ) : (
                      <Link
                        href="/suppliers"
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/40 bg-white/10 px-4 py-3 text-xs font-black text-white backdrop-blur transition-transform active:scale-95"
                      >
                        <Store className="size-4" />
                        {d.visitSupplier}
                      </Link>
                    )}
                  </div>
                </div>
              </section>
            )
          })}

          {/* Paginated "Load More" indicator inside the snapping container */}
          {hasMore && (
            <section className="relative flex h-full w-full snap-start items-center justify-center bg-secondary/20 sm:rounded-3xl p-6">
              <div className="text-center space-y-3">
                <p className="text-sm font-black text-muted-foreground">You&apos;re caught up with today&apos;s updates!</p>
                <button
                  onClick={handleLoadMore}
                  disabled={fetchingMore}
                  className="rounded-xl bg-primary text-white font-black text-xs py-2.5 px-6 shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {fetchingMore ? "Loading..." : "Load Older Updates"}
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function RailButton({
  onClick,
  label,
  active,
  children,
}: {
  onClick: () => void
  label: string
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="flex flex-col items-center gap-1 active:scale-90"
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-black/45 backdrop-blur">
        {children}
      </span>
      <span className="text-[10px] font-medium text-white drop-shadow">{label}</span>
    </button>
  )
}

function RailLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 active:scale-90">
      <span className="flex size-11 items-center justify-center rounded-full bg-black/45 backdrop-blur">
        {children}
      </span>
      <span className="text-[10px] font-medium text-white drop-shadow">{label}</span>
    </Link>
  )
}
