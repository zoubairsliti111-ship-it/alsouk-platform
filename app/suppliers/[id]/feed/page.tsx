"use client"

import { useEffect, useRef, useState, use } from "react"
import Link from "next/link"
import { ArrowLeft, Building2, Heart, ImagePlus, Eye, MessageCircle, X, Send } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { fetchSupplierById } from "@/lib/supabase/suppliers-service"
import { useAuth } from "@/components/auth-provider"

type MediaRow = {
  id: string
  media_type: "factory_photo" | "product_gallery" | "video" | "certificate"
  url: string
  caption: string | null
  created_at: string
  view_count: number
  like_count: number
}

type CommentRow = {
  id: string
  body: string
  created_at: string
  user_id: string
  authorName: string
  authorAvatar: string | null
}

export default function SupplierFeedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const [companyName, setCompanyName] = useState<string>("")
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [media, setMedia] = useState<MediaRow[]>([])
  const [loading, setLoading] = useState(true)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({})
  const [openCommentsFor, setOpenCommentsFor] = useState<string | null>(null)
  const [comments, setComments] = useState<CommentRow[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [postingComment, setPostingComment] = useState(false)
  const viewedIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    let active = true
    async function load() {
      const [supplierRes] = await Promise.all([fetchSupplierById(id)])
      if (!active) return
      if (supplierRes.supplier) {
        setCompanyName(supplierRes.supplier.name)
        setLogoUrl(supplierRes.supplier.logoUrl)
      }
      const supabase = createClient()
      const { data, error } = await supabase
        .from("company_media")
        .select("id,media_type,url,caption,created_at,view_count,like_count")
        .eq("company_id", id)
        .in("media_type", ["product_gallery", "video", "factory_photo"])
        .order("created_at", { ascending: false })
      if (!active) return
      if (!error && data) {
        setMedia(data as MediaRow[])
        const ids = (data as MediaRow[]).map((m) => m.id)
        if (ids.length > 0) {
          const { data: commentRows } = await supabase
            .from("company_media_comments")
            .select("media_id")
            .in("media_id", ids)
          if (active && commentRows) {
            const counts: Record<string, number> = {}
            for (const row of commentRows as { media_id: string }[]) {
              counts[row.media_id] = (counts[row.media_id] ?? 0) + 1
            }
            setCommentCounts(counts)
          }
        }
      }
      setLoading(false)
      supabase.rpc("increment_profile_view", { target_company_id: id }).then(({ error }: { error: unknown }) => {
        if (error) console.error("increment_profile_view failed:", error)
      })
    }
    load()
    return () => {
      active = false
    }
  }, [id])

  const registerView = (mediaId: string) => {
    if (viewedIds.current.has(mediaId)) return
    viewedIds.current.add(mediaId)
    const supabase = createClient()
    supabase.rpc("increment_media_view", { media_id: mediaId }).then(({ error }: { error: unknown }) => {
      if (error) console.error("increment_media_view failed:", error)
    })
    setMedia((prev) => prev.map((m) => (m.id === mediaId ? { ...m, view_count: m.view_count + 1 } : m)))
  }

  const handleLike = (mediaId: string) => {
    if (likedIds.has(mediaId)) return
    setLikedIds((prev) => new Set(prev).add(mediaId))
    setMedia((prev) => prev.map((m) => (m.id === mediaId ? { ...m, like_count: m.like_count + 1 } : m)))
    const supabase = createClient()
    supabase.rpc("increment_media_like", { media_id: mediaId }).then(({ error }: { error: unknown }) => {
      if (error) console.error("increment_media_like failed:", error)
    })
  }

  const openComments = async (mediaId: string) => {
    setOpenCommentsFor(mediaId)
    setLoadingComments(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("company_media_comments")
      .select("id,body,created_at,user_id")
      .eq("media_id", mediaId)
      .order("created_at", { ascending: true })
    if (error || !data) {
      setComments([])
      setLoadingComments(false)
      return
    }
    const userIds = Array.from(new Set(data.map((c: { user_id: string }) => c.user_id)))
    let profileMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {}
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("public_profiles_view")
        .select("id,full_name,avatar_url")
        .in("id", userIds)
      if (profiles) {
        for (const p of profiles as { id: string; full_name: string | null; avatar_url: string | null }[]) {
          profileMap[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url }
        }
      }
    }
    setComments(
      data.map((c: { id: string; body: string; created_at: string; user_id: string }) => ({
        id: c.id,
        body: c.body,
        created_at: c.created_at,
        user_id: c.user_id,
        authorName: profileMap[c.user_id]?.full_name || "Buyer",
        authorAvatar: profileMap[c.user_id]?.avatar_url || null,
      })),
    )
    setLoadingComments(false)
  }

  const closeComments = () => {
    setOpenCommentsFor(null)
    setComments([])
    setNewComment("")
  }

  const submitComment = async () => {
    if (!user || !openCommentsFor || !newComment.trim()) return
    setPostingComment(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("company_media_comments")
      .insert({ media_id: openCommentsFor, user_id: user.id, body: newComment.trim() })
      .select()
      .single()
    if (!error && data) {
      setComments((prev) => [
        ...prev,
        {
          id: data.id,
          body: data.body,
          created_at: data.created_at,
          user_id: user.id,
          authorName: "You",
          authorAvatar: null,
        },
      ])
      setCommentCounts((prev) => ({ ...prev, [openCommentsFor]: (prev[openCommentsFor] ?? 0) + 1 }))
      setNewComment("")
    }
    setPostingComment(false)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="size-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <div className="absolute inset-x-0 top-0 z-20 flex items-center gap-3 bg-gradient-to-b from-black/70 to-transparent px-4 pb-8 pt-4">
        <Link
          href={`/suppliers/${id}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/30 bg-white/10">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={companyName} className="size-full object-cover" />
            ) : (
              <Building2 className="size-4 text-white" />
            )}
          </div>
          <p className="truncate text-sm font-black text-white">{companyName}</p>
        </div>
      </div>

      {media.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
          <ImagePlus className="size-10 text-white/40" />
          <p className="text-sm text-white/70">This supplier hasn&apos;t shared any photos or videos yet.</p>
        </div>
      ) : (
        <div className="h-full snap-y snap-mandatory overflow-y-scroll">
          {media.map((m) => (
            <FeedItem
              key={m.id}
              item={m}
              companyName={companyName}
              liked={likedIds.has(m.id)}
              commentCount={commentCounts[m.id] ?? 0}
              onLike={() => handleLike(m.id)}
              onView={() => registerView(m.id)}
              onOpenComments={() => openComments(m.id)}
            />
          ))}
        </div>
      )}

      {openCommentsFor && (
        <div className="absolute inset-x-0 bottom-0 z-30 max-h-[70vh] rounded-t-3xl bg-white flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-sm font-black text-foreground">Comments</h3>
            <button type="button" onClick={closeComments} className="text-muted-foreground">
              <X className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loadingComments ? (
              <p className="text-xs text-muted-foreground text-center py-6">Loading...</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No comments yet. Be the first!</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-black text-foreground overflow-hidden">
                    {c.authorAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.authorAvatar} alt={c.authorName} className="size-full object-cover" />
                    ) : (
                      c.authorName.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground">{c.authorName}</p>
                    <p className="text-xs text-foreground mt-0.5">{c.body}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-3 border-t border-border">
            {user ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={submitComment}
                  disabled={postingComment || !newComment.trim()}
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-50"
                >
                  <Send className="size-4" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">
                Sign in to leave a comment.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function FeedItem({
  item,
  companyName,
  liked,
  commentCount,
  onLike,
  onView,
  onOpenComments,
}: {
  item: MediaRow
  companyName: string
  liked: boolean
  commentCount: number
  onLike: () => void
  onView: () => void
  onOpenComments: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onView()
          if (item.media_type === "video") videoRef.current?.play().catch(() => {})
        } else {
          if (item.media_type === "video") videoRef.current?.pause()
        }
      },
      { threshold: 0.6 },
    )
    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={containerRef} className="relative flex h-screen w-full snap-start items-center justify-center">
      {item.media_type === "video" ? (
        <video
          ref={videoRef}
          src={item.url}
          muted
          loop
          playsInline
          controls
          className="h-full w-full object-contain"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.url} alt={item.caption ?? companyName} className="h-full w-full object-contain" />
      )}

      <div className="absolute end-3 bottom-24 z-10 flex flex-col items-center gap-4">
        <button type="button" onClick={onLike} className="flex flex-col items-center gap-1">
          <span className={`flex size-11 items-center justify-center rounded-full backdrop-blur ${liked ? "bg-red-500" : "bg-white/15"}`}>
            <Heart className={`size-5 text-white ${liked ? "fill-white" : ""}`} />
          </span>
          <span className="text-[11px] font-bold text-white">{item.like_count}</span>
        </button>
        <button type="button" onClick={onOpenComments} className="flex flex-col items-center gap-1">
          <span className="flex size-11 items-center justify-center rounded-full bg-white/15 backdrop-blur">
            <MessageCircle className="size-5 text-white" />
          </span>
          <span className="text-[11px] font-bold text-white">{commentCount}</span>
        </button>
        <div className="flex flex-col items-center gap-1">
          <span className="flex size-11 items-center justify-center rounded-full bg-white/15 backdrop-blur">
            <Eye className="size-5 text-white" />
          </span>
          <span className="text-[11px] font-bold text-white">{item.view_count}</span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pb-10">
        <p className="text-sm font-bold text-white">{companyName}</p>
        {item.caption && <p className="mt-1 text-xs text-white/85">{item.caption}</p>}
      </div>
    </div>
  )
}
