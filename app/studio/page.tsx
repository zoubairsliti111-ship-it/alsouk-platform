"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Building2, Eye, Film, Heart, ImagePlus, MessageCircle, Radio, Send, Settings, Video as VideoIcon, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { LiveBroadcastSheet } from "@/components/live/live-broadcast-sheet"
import { LiveRecordingsSheet } from "@/components/live/live-recordings-sheet"

type Company = {
  id: string
  name: string
  logo_url: string | null
}

type MediaRow = {
  id: string
  media_type: "factory_photo" | "product_gallery" | "video" | "certificate" | "recording"
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

export default function StudioPage() {
  const { user, isLoading: authLoading } = useAuth()

  const [company, setCompany] = useState<Company | null>(null)
  const [storeId, setStoreId] = useState<string | null>(null)
  const [loadingCompany, setLoadingCompany] = useState(true)
  const [media, setMedia] = useState<MediaRow[]>([])
  const [showLiveSheet, setShowLiveSheet] = useState(false)
  const [showRecordingsSheet, setShowRecordingsSheet] = useState(false)
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({})
  const [productByUrl, setProductByUrl] = useState<Record<string, { name: string; price: number | null }>>({})
  const [openCommentsFor, setOpenCommentsFor] = useState<string | null>(null)
  const [comments, setComments] = useState<CommentRow[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [postingComment, setPostingComment] = useState(false)

  // Compose flow: pick a photo/video, then attach a name + optional price,
  // and post it as both a media item AND a real product in one step.
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null)
  const [pendingType, setPendingType] = useState<"photo" | "video" | null>(null)
  const [postName, setPostName] = useState("")
  const [postPrice, setPostPrice] = useState("")
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    let active = true
    if (authLoading) return
    if (!user) {
      setLoadingCompany(false)
      return
    }
    const supabase = createClient()
    async function loadCompany() {
      const { data: owned } = await supabase
        .from("companies")
        .select("id,name,logo_url")
        .eq("owner_id", user!.id)
        .maybeSingle()
      let resolvedCompany: Company | null = null
      if (owned) {
        resolvedCompany = owned as Company
      } else {
        const { data: membership } = await supabase
          .from("company_members")
          .select("company_id")
          .eq("user_id", user!.id)
          .limit(1)
          .maybeSingle()
        if (membership?.company_id) {
          const { data: viaMembership } = await supabase
            .from("companies")
            .select("id,name,logo_url")
            .eq("id", membership.company_id)
            .maybeSingle()
          resolvedCompany = (viaMembership as Company) ?? null
        }
      }
      if (!active) return
      console.log("[studio-debug] resolved company", {
        userId: user!.id,
        resolvedCompanyId: resolvedCompany?.id ?? null,
        via: owned ? "owner_id" : "company_members",
      })
      setCompany(resolvedCompany)
      if (resolvedCompany) {
        const { data: store } = await supabase
          .from("stores")
          .select("id")
          .eq("company_id", resolvedCompany.id)
          .maybeSingle()
        if (active) setStoreId(store?.id ?? null)
      }
      if (active) setLoadingCompany(false)
    }
    loadCompany()
    return () => {
      active = false
    }
  }, [user, authLoading])

  const loadMedia = useCallback(async (companyId: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("company_media")
      .select("id,media_type,url,caption,created_at,view_count,like_count")
      .eq("company_id", companyId)
      .in("media_type", ["product_gallery", "video", "factory_photo"])
      .order("created_at", { ascending: false })
    console.log("[studio-debug] company_media query", {
      companyId,
      filters: { media_type: ["product_gallery", "video", "factory_photo"] },
      count: data?.length ?? 0,
      error,
    })
    if (!error && data) {
      // Recorded lives join the same feed as regular videos — one grid,
      // sorted together by date, instead of a separate recordings-only view.
      const { data: recordingRows, error: recordingsError } = await supabase
        .from("live_sessions")
        .select("id,title,ended_at,replay_url")
        .eq("company_id", companyId)
        .eq("status", "ended")
        .not("replay_url", "is", null)
      console.log("[studio-debug] live_sessions recordings query", {
        companyId,
        filters: { status: "ended", replay_url: "not null" },
        count: recordingRows?.length ?? 0,
        error: recordingsError,
        rows: recordingRows,
      })
      const recordings: MediaRow[] = (recordingRows ?? []).map(
        (r: { id: string; title: string; ended_at: string | null; replay_url: string }) => ({
          id: r.id,
          media_type: "recording",
          url: r.replay_url,
          caption: r.title,
          created_at: r.ended_at ?? new Date(0).toISOString(),
          view_count: 0,
          like_count: 0,
        }),
      )
      const combined = [...(data as MediaRow[]), ...recordings].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      setMedia(combined)
      const { data: prodRows } = await supabase
        .from("products")
        .select("name,price,product_images(url)")
        .eq("company_id", companyId)
      if (prodRows) {
        const map: Record<string, { name: string; price: number | null }> = {}
        for (const p of prodRows as any[]) {
          const imgs = p.product_images ?? []
          for (const img of imgs) {
            if (img.url) map[img.url] = { name: p.name, price: p.price === null ? null : Number(p.price) }
          }
        }
        setProductByUrl(map)
      }
      const ids = (data as MediaRow[]).map((m) => m.id)
      if (ids.length > 0) {
        const { data: commentRows } = await supabase
          .from("company_media_comments")
          .select("media_id")
          .in("media_id", ids)
        if (commentRows) {
          const counts: Record<string, number> = {}
          for (const row of commentRows as { media_id: string }[]) {
            counts[row.media_id] = (counts[row.media_id] ?? 0) + 1
          }
          setCommentCounts(counts)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (company?.id) loadMedia(company.id)
  }, [company?.id, loadMedia])

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
        .from("profiles")
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
        authorName: c.user_id === user?.id ? "You" : profileMap[c.user_id]?.full_name || "Buyer",
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

  const submitReply = async () => {
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
        { id: data.id, body: data.body, created_at: data.created_at, user_id: user.id, authorName: "You", authorAvatar: null },
      ])
      setCommentCounts((prev) => ({ ...prev, [openCommentsFor]: (prev[openCommentsFor] ?? 0) + 1 }))
      setNewComment("")
    }
    setPostingComment(false)
  }

  const pickFile = (file: File, type: "photo" | "video") => {
    setPendingFile(file)
    setPendingPreviewUrl(URL.createObjectURL(file))
    setPendingType(type)
    setPostName("")
    setPostPrice("")
  }

  const cancelCompose = () => {
    setPendingFile(null)
    setPendingPreviewUrl(null)
    setPendingType(null)
    setPostName("")
    setPostPrice("")
  }

  const submitPost = async () => {
    if (!company || !pendingFile || !pendingType) return
    setPosting(true)
    try {
      const supabase = createClient()
      const bucket = pendingType === "photo" ? "company-photos" : "company-videos"
      const ext = pendingFile.name.split(".").pop() || (pendingType === "photo" ? "jpg" : "mp4")
      const path = `${company.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, pendingFile, { cacheControl: "3600", upsert: false })
      if (uploadError) {
        console.error("Error uploading:", uploadError)
        return
      }
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
      const mediaType = pendingType === "photo" ? "product_gallery" : "video"
      const caption = postName.trim() || null

      await supabase.from("company_media").insert({
        company_id: company.id,
        media_type: mediaType,
        storage_bucket: bucket,
        storage_path: path,
        url: urlData.publicUrl,
        caption,
        position: media.length,
      })

      // Also list it as a real product when the merchant gave it a name,
      // so the same post shows up in Featured Products / search too.
      if (postName.trim() && storeId) {
        const slugBase = postName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
        const slug = `${slugBase}-${Date.now().toString(36)}`
        const { data: newProduct } = await supabase
          .from("products")
          .insert({
            store_id: storeId,
            company_id: company.id,
            name: postName.trim(),
            slug,
            price: postPrice ? Number(postPrice) : null,
            currency: "TND",
            min_order_quantity: 1,
            is_active: true,
          })
          .select()
          .single()
        if (newProduct && pendingType === "photo") {
          await supabase.from("product_images").insert({
            product_id: newProduct.id,
            url: urlData.publicUrl,
            storage_bucket: bucket,
            storage_path: path,
            is_primary: true,
            position: 0,
          })
        }
      }

      await loadMedia(company.id)
      cancelCompose()
    } catch (err) {
      console.error("Error posting:", err)
    } finally {
      setPosting(false)
    }
  }

  if (authLoading || loadingCompany) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="size-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    )
  }

  if (!user || !company) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-black px-6 text-center text-white">
        <Building2 className="size-10 text-white/60" />
        <p className="text-sm text-white/80">
          {!user ? "Please sign in to access your studio." : "No company found for this account yet."}
        </p>
        <Link href="/account" className="mt-2 rounded-full bg-white px-5 py-2 text-sm font-bold text-black">
          Go to Account
        </Link>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 bg-gradient-to-b from-black/70 to-transparent px-4 pb-8 pt-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-white/30 bg-white/10">
            {company.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo_url} alt={company.name} className="size-full object-cover" />
            ) : (
              <Building2 className="size-5 text-white" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">{company.name}</p>
            <p className="text-[11px] text-white/70">Welcome back</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRecordingsSheet(true)}
            className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
            title="Recordings"
          >
            <Film className="size-4" />
          </button>
          <Link
            href="/account"
            className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
            title="Settings"
          >
            <Settings className="size-4" />
          </Link>
        </div>
      </div>

      <div className="absolute inset-x-0 top-20 z-20 flex items-center justify-center gap-3 px-4">
        <input
          type="file"
          accept="image/*"
          id="studio-photo-input"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) pickFile(f, "photo")
            e.target.value = ""
          }}
        />
        <label
          htmlFor="studio-photo-input"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white/15 px-3 py-2.5 text-xs font-bold text-white backdrop-blur cursor-pointer active:scale-95"
        >
          <ImagePlus className="size-4" />
          Photo
        </label>

        <input
          type="file"
          accept="video/*"
          id="studio-video-input"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) pickFile(f, "video")
            e.target.value = ""
          }}
        />
        <label
          htmlFor="studio-video-input"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white/15 px-3 py-2.5 text-xs font-bold text-white backdrop-blur cursor-pointer active:scale-95"
        >
          <VideoIcon className="size-4" />
          Video
        </label>

        <button
          type="button"
          onClick={() => setShowLiveSheet(true)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-red-500/90 px-3 py-2.5 text-xs font-bold text-white backdrop-blur active:scale-95"
        >
          <Radio className="size-4" />
          Live
        </button>
      </div>

      {media.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
          <ImagePlus className="size-10 text-white/40" />
          <p className="text-sm text-white/70">No posts yet — tap Photo or Video above to add your first one.</p>
        </div>
      ) : (
        <div className="h-full snap-y snap-mandatory overflow-y-scroll">
          {media.map((m) => (
            <FeedItem
              key={m.id}
              item={m}
              companyName={company.name}
              commentCount={commentCounts[m.id] ?? 0}
              onOpenComments={() => openComments(m.id)}
              product={productByUrl[m.url]}
            />
          ))}
        </div>
      )}

      {showLiveSheet && (
        <LiveBroadcastSheet company={{ id: company.id, name: company.name }} onClose={() => setShowLiveSheet(false)} />
      )}

      {showRecordingsSheet && (
        <LiveRecordingsSheet company={{ id: company.id, name: company.name }} onClose={() => setShowRecordingsSheet(false)} />
      )}

      {/* Compose sheet: shown right after picking a photo/video */}
      {pendingFile && (
        <div className="absolute inset-0 z-40 flex flex-col bg-black">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <button type="button" onClick={cancelCompose} className="text-white text-sm font-bold">
              Cancel
            </button>
            <p className="text-sm font-black text-white">New Post</p>
            <button
              type="button"
              onClick={submitPost}
              disabled={posting}
              className="text-sm font-black text-primary disabled:opacity-50"
            >
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-hidden bg-neutral-900">
            {pendingType === "photo" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pendingPreviewUrl ?? ""} alt="preview" className="max-h-full max-w-full object-contain" />
            ) : (
              <video src={pendingPreviewUrl ?? ""} controls className="max-h-full max-w-full object-contain" />
            )}
          </div>
          <div className="bg-white p-4 space-y-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground">Product name (optional)</label>
              <input
                type="text"
                value={postName}
                onChange={(e) => setPostName(e.target.value)}
                placeholder="e.g. Organic Olive Oil 1L"
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-border text-sm"
              />
            </div>
            {postName.trim() && (
              <div>
                <label className="text-xs font-bold text-muted-foreground">Price in TND (optional)</label>
                <input
                  type="number"
                  value={postPrice}
                  onChange={(e) => setPostPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-border text-sm"
                />
              </div>
            )}
            <p className="text-[10px] text-muted-foreground">
              Add a name to also list this as a product buyers can request a quote for.
            </p>
          </div>
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
              <p className="text-xs text-muted-foreground text-center py-6">No comments yet.</p>
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
                    <p className="text-xs font-bold text-foreground">
                      {c.authorName}
                      {c.user_id === user?.id && (
                        <span className="ms-1.5 text-[9px] font-bold text-primary uppercase">Merchant</span>
                      )}
                    </p>
                    <p className="text-xs text-foreground mt-0.5">{c.body}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Reply to your customers..."
                className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={submitReply}
                disabled={postingComment || !newComment.trim()}
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-50"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FeedItem({
  item,
  companyName,
  commentCount,
  onOpenComments,
  product,
}: {
  item: MediaRow
  companyName: string
  commentCount: number
  onOpenComments: () => void
  product?: { name: string; price: number | null }
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {})
        } else {
          el.pause()
        }
      },
      { threshold: 0.6 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative flex h-screen w-full snap-start items-center justify-center">
      {item.media_type === "video" || item.media_type === "recording" ? (
        <video ref={videoRef} src={item.url} muted loop playsInline controls className="h-full w-full object-contain" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.url} alt={item.caption ?? companyName} className="h-full w-full object-contain" />
      )}

      {product && (
        <div className="absolute top-4 start-4 z-10 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-lg max-w-[75%]">
          <span className="text-xs font-black text-foreground truncate">{product.name}</span>
          {product.price !== null && (
            <span className="text-xs font-black text-primary shrink-0">{product.price} TND</span>
          )}
        </div>
      )}

      <div className="absolute end-3 bottom-24 z-10 flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <span className="flex size-11 items-center justify-center rounded-full bg-white/15 backdrop-blur">
            <Heart className="size-5 text-white" />
          </span>
          <span className="text-[11px] font-bold text-white">{item.like_count}</span>
        </div>
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
