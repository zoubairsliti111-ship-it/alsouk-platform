"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Heart,
  ImagePlus,
  LayoutGrid,
  List,
  Loader2,
  MessageCircle,
  Pencil,
  Pin,
  PinOff,
  Send,
  Share2,
  Trash2,
  Video as VideoIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { socialT } from "@/lib/social-i18n"
import type { Post, PostComment, ViewerState } from "@/lib/domains/social/types"
// TECH-DEBT FIX: was `import * as social from "@/lib/services/social-service"`
// (public.posts table). Now uses commercial_posts — the same table the
// merchant "create post" dashboard already writes to — so a post created
// from /account now actually appears here instead of silently going to a
// different table. See lib/services/posts-service.ts header comment.
import {
  listCompanyPosts,
  getLikedCommercialPostIds,
  listPostComments,
  likeCommercialPost,
  unlikeCommercialPost,
  addPostComment,
  deletePostComment,
  createSimplePost,
  updateSimplePost,
  deleteSimplePost,
  setSimplePostPinned,
  uploadSimplePostMedia,
} from "@/lib/services/posts-service"

type View = "grid" | "list"

export function PostsFeed({
  companyId,
  posts,
  setPosts,
  likedIds,
  setLikedIds,
  viewer,
  requireAuth,
}: {
  companyId: string
  posts: Post[]
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>
  likedIds: Set<string>
  setLikedIds: React.Dispatch<React.SetStateAction<Set<string>>>
  viewer: ViewerState
  requireAuth: () => boolean
}) {
  const { lang, dir } = useLanguage()
  const s = socialT[lang]
  const [view, setView] = useState<View>("list")
  const [composerOpen, setComposerOpen] = useState(false)

  function replacePost(next: Post) {
    setPosts((prev) => sortPosts(prev.map((p) => (p.id === next.id ? next : p))))
  }

  return (
    <div dir={dir} className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-xl border border-border p-0.5">
          <button
            type="button"
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${view === "list" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
          >
            <List className="size-4" /> {s.listView}
          </button>
          <button
            type="button"
            onClick={() => setView("grid")}
            aria-pressed={view === "grid"}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${view === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
          >
            <LayoutGrid className="size-4" /> {s.gridView}
          </button>
        </div>
        {viewer.isMember && (
          <Button size="sm" onClick={() => setComposerOpen((v) => !v)}>
            <Pencil className="size-4" /> {s.createPost}
          </Button>
        )}
      </div>

      {composerOpen && viewer.isMember && (
        <Composer
          companyId={companyId}
          onCreated={(post) => {
            setPosts((prev) => sortPosts([post, ...prev]))
            setComposerOpen(false)
          }}
        />
      )}

      {posts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {viewer.isMember ? s.postsEmptyMember : s.postsEmpty}
        </p>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {posts.map((p) => (
            <GridTile key={p.id} post={p} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              liked={likedIds.has(p.id)}
              viewer={viewer}
              requireAuth={requireAuth}
              onChange={replacePost}
              onDeleted={() => setPosts((prev) => prev.filter((x) => x.id !== p.id))}
              onLikeToggle={(liked) => {
                setLikedIds((prev) => {
                  const next = new Set(prev)
                  if (liked) next.add(p.id)
                  else next.delete(p.id)
                  return next
                })
                setPosts((prev) =>
                  prev.map((x) =>
                    x.id === p.id ? { ...x, likeCount: Math.max(0, x.likeCount + (liked ? 1 : -1)) } : x,
                  ),
                )
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function sortPosts(list: Post[]): Post[] {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return b.createdAt.localeCompare(a.createdAt)
  })
}

function GridTile({ post }: { post: Post }) {
  const cover = post.media.find((m) => m.mediaType === "image") ?? post.media[0]
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
      {cover?.url ? (
        <Image src={cover.url} alt="" fill className="object-cover" sizes="33vw" unoptimized />
      ) : (
        <div className="flex size-full items-center justify-center p-3 text-center text-xs text-muted-foreground">
          {post.body.slice(0, 80)}
        </div>
      )}
    </div>
  )
}

function Composer({
  companyId,
  onCreated,
}: {
  companyId: string
  onCreated: (post: Post) => void
}) {
  const { lang } = useLanguage()
  const s = socialT[lang]
  const [body, setBody] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [videos, setVideos] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function publish() {
    if (!body.trim() && images.length === 0 && videos.length === 0) return
    setBusy(true)
    setError(null)
    try {
      const post = await createSimplePost(companyId, body)
      let position = 0
      const media = [...post.media]
      for (const file of images) {
        media.push(await uploadSimplePostMedia(companyId, post.id, file, "image", position++))
      }
      for (const file of videos) {
        media.push(await uploadSimplePostMedia(companyId, post.id, file, "video", position++))
      }
      onCreated({ ...post, media })
      setBody("")
      setImages([])
      setVideos([])
    } catch (e) {
      setError(e instanceof Error ? e.message : s.authError)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder={s.postPlaceholder}
        className="w-full resize-none rounded-xl border border-input bg-background p-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
      />
      {(images.length > 0 || videos.length > 0) && (
        <p className="mt-2 text-xs text-muted-foreground">
          {images.length + videos.length} file(s) selected
        </p>
      )}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
          <ImagePlus className="size-4" /> {s.addPhoto}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => setImages(Array.from(e.target.files ?? []))}
          />
        </label>
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
          <VideoIcon className="size-4" /> {s.addVideo}
          <input
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={(e) => setVideos(Array.from(e.target.files ?? []))}
          />
        </label>
        <Button className="ms-auto" size="sm" onClick={publish} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          {busy ? s.uploading : s.publish}
        </Button>
      </div>
    </div>
  )
}

function PostCard({
  post,
  liked,
  viewer,
  requireAuth,
  onChange,
  onDeleted,
  onLikeToggle,
}: {
  post: Post
  liked: boolean
  viewer: ViewerState
  requireAuth: () => boolean
  onChange: (post: Post) => void
  onDeleted: () => void
  onLikeToggle: (liked: boolean) => void
}) {
  const { lang } = useLanguage()
  const s = socialT[lang]
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(post.body)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [comments, setComments] = useState<PostComment[] | null>(null)
  const [commentText, setCommentText] = useState("")
  const [busy, setBusy] = useState(false)

  async function toggleLike() {
    if (!requireAuth()) return
    const next = !liked
    onLikeToggle(next)
    try {
      if (next) await likeCommercialPost(post.id)
      else await unlikeCommercialPost(post.id)
    } catch {
      onLikeToggle(!next)
    }
  }

  async function openComments() {
    const willOpen = !commentsOpen
    setCommentsOpen(willOpen)
    if (willOpen && comments === null) {
      try {
        setComments(await listPostComments(post.id))
      } catch {
        setComments([])
      }
    }
  }

  async function submitComment() {
    if (!requireAuth()) return
    const text = commentText.trim()
    if (!text) return
    setBusy(true)
    try {
      const c = await addPostComment(post.id, text)
      setComments((prev) => [...(prev ?? []), c])
      setCommentText("")
      onChange({ ...post, commentCount: post.commentCount + 1 })
    } finally {
      setBusy(false)
    }
  }

  async function removeComment(id: string) {
    await deletePostComment(id)
    setComments((prev) => (prev ?? []).filter((c) => c.id !== id))
    onChange({ ...post, commentCount: Math.max(0, post.commentCount - 1) })
  }

  async function saveEdit() {
    setBusy(true)
    try {
      await updateSimplePost(post.id, draft)
      onChange({ ...post, body: draft.trim() })
      setEditing(false)
    } finally {
      setBusy(false)
    }
  }

  async function togglePin() {
    const next = !post.pinned
    await setSimplePostPinned(post.id, next)
    onChange({ ...post, pinned: next })
  }

  async function del() {
    if (!window.confirm(s.confirmDelete)) return
    await deleteSimplePost(post.id)
    onDeleted()
  }

  function share() {
    const url = typeof window !== "undefined" ? window.location.href : ""
    if (navigator.share) navigator.share({ url }).catch(() => {})
    else if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {})
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-center gap-2">
          {post.pinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              <Pin className="size-3" /> {s.pinned}
            </span>
          )}
          <time className="text-xs text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString()}
          </time>
        </div>
        {viewer.isMember && (
          <div className="flex items-center gap-1">
            <button onClick={togglePin} aria-label={post.pinned ? s.unpin : s.pin} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
              {post.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
            </button>
            <button onClick={() => setEditing((v) => !v)} aria-label={s.edit} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
              <Pencil className="size-4" />
            </button>
            <button onClick={del} aria-label={s.delete} className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10">
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="px-4 pb-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          />
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={saveEdit} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              {s.save}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setDraft(post.body); setEditing(false) }}>
              {s.cancel}
            </Button>
          </div>
        </div>
      ) : (
        post.body && <p className="whitespace-pre-wrap px-4 pb-3 text-sm text-foreground">{post.body}</p>
      )}

      {post.media.length > 0 && (
        <div className={`grid gap-0.5 ${post.media.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {post.media.map((m) =>
            m.mediaType === "video" ? (
              <video key={m.id} src={m.url ?? undefined} controls playsInline className="max-h-[70vh] w-full bg-black object-contain" />
            ) : (
              <div key={m.id} className="relative aspect-square bg-secondary">
                {m.url && <Image src={m.url} alt="" fill className="object-cover" sizes="50vw" unoptimized />}
              </div>
            ),
          )}
        </div>
      )}

      <div className="flex items-center gap-1 p-2">
        <button onClick={toggleLike} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary ${liked ? "text-primary" : "text-muted-foreground"}`}>
          <Heart className={`size-4 ${liked ? "fill-primary" : ""}`} /> {post.likeCount}
        </button>
        <button onClick={openComments} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary">
          <MessageCircle className="size-4" /> {post.commentCount}
        </button>
        <button onClick={share} aria-label={s.share} className="ms-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary">
          <Share2 className="size-4" />
        </button>
      </div>

      {commentsOpen && (
        <div className="border-t border-border p-4">
          <div className="flex flex-col gap-3">
            {comments === null ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">—</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex items-start justify-between gap-3 text-sm">
                  <p className="text-foreground">{c.body}</p>
                  {(c.userId === viewer.userId || viewer.isMember) && (
                    <button onClick={() => removeComment(c.id)} aria-label={s.delete} className="shrink-0 text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
              placeholder={s.writeComment}
              className="h-10 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
            />
            <Button size="icon" onClick={submitComment} disabled={busy} aria-label={s.send}>
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </article>
  )
}
