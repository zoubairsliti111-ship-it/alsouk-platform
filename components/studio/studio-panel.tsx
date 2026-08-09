"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Eye, Heart, ImagePlus, MessageCircle, Play, Radio, Send, Video as VideoIcon, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { ExternalStoreSync } from "@/components/studio/external-store-sync"

type Company = {
  id: string
  name: string
  logo_url: string | null
}

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

export function StudioPanel({ company }: { company: Company }) {
  const { user } = useAuth()

  const [storeId, setStoreId] = useState<string | null>(null)
  const [media, setMedia] = useState<MediaRow[]>([])
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({})
  const [productByUrl, setProductByUrl] = useState<Record<string, { name: string; price: number | null }>>({})
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [showLiveNote, setShowLiveNote] = useState(false)
  const [openCommentsFor, setOpenCommentsFor] = useState<string | null>(null)
  const [comments, setComments] = useState<CommentRow[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [postingComment, setPostingComment] = useState(false)

  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null)
  const [pendingType, setPendingType] = useState<"photo" | "video" | null>(null)
  const [postName, setPostName] = useState("")
  const [postPrice, setPostPrice] = useState("")
  const [posting, setPosting] = useState(false)

  const feedContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    const supabase = createClient()
    supabase
      .from("stores")
      .select("id")
      .eq("company_id", company.id)
      .maybeSingle()
      .then(({ data }: { data: { id: string } | null }) => {
        if (active) setStoreId(data?.id ?? null)
      })
    return () => {
      active = false
    }
  }, [company.id])

  const loadMedia = useCallback(async (companyId: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("company_media")
      .select("id,media_type,url,caption,created_at,view_count,like_count")
      .eq("company_id", companyId)
      .in("media_type", ["product_gallery", "video", "factory_photo"])
      .order("created_at", { ascending: false })
    if (!error && data) {
      setMedia(data as MediaRow[])
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
    }
  }, [])

  useEffect(() => {
    if (company.id) loadMedia(company.id)
  }, [company.id, loadMedia])

  useEffect(() => {
    if (openIndex !== null && feedContainerRef.current) {
      const h = feedContainerRef.current.clientHeight
      feedContainerRef.current.scrollTop = openIndex * h
    }
  }, [openIndex])

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
    if (!pendingFile || !pendingType) return
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

  return (
    <div>
      <ExternalStoreSync companyId={company.id} />

      <div className="flex items-center gap-2.5 mb-4">
        <input
          type="file"
          accept="image/*"
          id="panel-photo-input"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) pickFile(f, "photo")
            e.target.value = ""
          }}
        />
        <label
          htmlFor="panel-photo-input"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-secondary px-3 py-2.5 text-xs font-bold text-foreground cursor-pointer active:scale-95"
        >
          <ImagePlus className="size-4" />
          Photo
        </label>

        <input
          type="file"
          accept="video/*"
          id="panel-video-input"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) pickFile(f, "video")
            e.target.value = ""
          }}
        />
        <label
          htmlFor="panel-video-input"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-secondary px-3 py-2.5 text-xs font-bold text-foreground cursor-pointer active:scale-95"
        >
          <VideoIcon className="size-4" />
          Video
        </label>

        <button
          type="button"
          onClick={() => setShowLiveNote(true)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-500/90 px-3 py-2.5 text-xs font-bold text-white active:scale-95"
        >
          <Radio className="size-4" />
          Live
        </button>
      </div>

      {media.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <ImagePlus className="size-8 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">No posts yet — tap Photo or Video above to add your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {media.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setOpenIndex(i)}
              className="relative aspect-square overflow-hidden bg-secondary"
            >
              {m.media_type === "video" ? (
                <>
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video src={m.url} className="size-full object-cover" muted />
                  <span className="absolute top-1.5 end-1.5 flex size-5 items-center justify-center rounded-full bg-black/50">
                    <Play className="size-2.5 text-white" fill="white" />
                  </span>
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt={m.caption ?? company.name} className="size-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}

      {showLiveNote && (
        <div className="fixed inset-x-4 bottom-20 z-40 flex items-center justify-between gap-3 rounded-2xl bg-card border border-border p-4 shadow-2xl">
          <p className="text-xs font-semibold text-foreground">
            Live streaming isn&apos;t available yet — we&apos;re building it. Stay tuned!
          </p>
          <button type="button" onClick={() => setShowLiveNote(false)} className="shrink-0 rounded-full bg-secondary p-1.5">
            <X className="size-4 text-foreground" />
          </button>
        </div>
      )}

      {pendingFile && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <button type="button" onClick={cancelCompose} className="text-white text-sm font-bold">
              Cancel
            </button>
            <p className="text-sm font-black text-white">New Post</p>
            <button type="button" onClick={submitPost} disabled={posting} className="text-sm font-black text-primary disabled:opacity-50">
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

      {openIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black">
          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            className="absolute top-4 start-4 z-30 flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
          >
            <X className="size-4" />
          </button>
          <div ref={feedContainerRef} className="h-full snap-y snap-mandatory overflow-y-scroll">
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
        </div>
      )}

      {openCommentsFor && (
        <div className="fixed inset-x-0 bottom-0 z-[60] max-h-[70vh] rounded-t-3xl bg-white flex flex-col">
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
                      {c.user_id === user?.id && <span className="ms-1.5 text-[9px] font-bold text-primary uppercase">Merchant</span>}
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
      {item.media_type === "video" ? (
        <video ref={videoRef} src={item.url} muted loop playsInline controls className="h-full w-full object-contain" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.url} alt={item.caption ?? companyName} className="h-full w-full object-contain" />
      )}

      {product && (
        <div className="absolute top-4 start-16 z-10 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-lg max-w-[65%]">
          <span className="text-xs font-black text-foreground truncate">{product.name}</span>
          {product.price !== null && <span className="text-xs font-black text-primary shrink-0">{product.price} TND</span>}
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
