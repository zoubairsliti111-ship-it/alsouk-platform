import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type {
  CompanyStats,
  LiveSession,
  LiveStatus,
  Post,
  PostComment,
  PostMedia,
  ViewerState,
} from "@/lib/domains/social/types"

// ---------------------------------------------------------------------------
// Row shapes (snake_case) + mappers.
// ---------------------------------------------------------------------------
type PostMediaRow = {
  id: string
  post_id: string
  url: string | null
  storage_bucket: string
  storage_path: string
  media_type: "image" | "video"
  position: number
}

type PostRow = {
  id: string
  company_id: string
  author_id: string | null
  body: string
  pinned: boolean
  like_count: number
  comment_count: number
  created_at: string
  post_media?: PostMediaRow[]
}

type CommentRow = {
  id: string
  post_id: string
  user_id: string
  body: string
  created_at: string
}

type LiveRow = {
  id: string
  company_id: string
  title: string
  status: LiveStatus
  scheduled_at: string | null
  started_at: string | null
  ended_at: string | null
  viewer_count: number
  replay_url: string | null
  created_at: string
}

function mapMedia(r: PostMediaRow): PostMedia {
  return {
    id: r.id,
    postId: r.post_id,
    url: r.url,
    storageBucket: r.storage_bucket,
    storagePath: r.storage_path,
    mediaType: r.media_type,
    position: r.position,
  }
}

function mapPost(r: PostRow): Post {
  const media = (r.post_media ?? []).map(mapMedia).sort((a, b) => a.position - b.position)
  return {
    id: r.id,
    companyId: r.company_id,
    authorId: r.author_id,
    body: r.body,
    pinned: r.pinned,
    likeCount: r.like_count,
    commentCount: r.comment_count,
    createdAt: r.created_at,
    media,
  }
}

function mapComment(r: CommentRow): PostComment {
  return { id: r.id, postId: r.post_id, userId: r.user_id, body: r.body, createdAt: r.created_at }
}

function mapLive(r: LiveRow): LiveSession {
  return {
    id: r.id,
    companyId: r.company_id,
    title: r.title,
    status: r.status,
    scheduledAt: r.scheduled_at,
    startedAt: r.started_at,
    endedAt: r.ended_at,
    viewerCount: r.viewer_count,
    replayUrl: r.replay_url,
    createdAt: r.created_at,
  }
}

function fail(message: string, error: { message: string } | null): never {
  throw new Error(`${message}: ${error?.message ?? "unknown error"}`)
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------
export async function getCompanyStats(companyId: string): Promise<CompanyStats> {
  const sb = getSupabaseBrowserClient()
  const [followers, posts, videos, products] = await Promise.all([
    sb.from("company_follows").select("id", { count: "exact", head: true }).eq("company_id", companyId),
    sb.from("posts").select("id", { count: "exact", head: true }).eq("company_id", companyId),
    sb
      .from("post_media")
      .select("id,posts!inner(company_id)", { count: "exact", head: true })
      .eq("media_type", "video")
      .eq("posts.company_id", companyId),
    sb.from("products").select("id", { count: "exact", head: true }).eq("company_id", companyId).eq("is_active", true),
  ])
  return {
    followers: followers.count ?? 0,
    posts: posts.count ?? 0,
    videos: videos.count ?? 0,
    products: products.count ?? 0,
  }
}

export async function getViewerState(companyId: string): Promise<ViewerState> {
  const sb = getSupabaseBrowserClient()
  const { data: userData } = await sb.auth.getUser()
  const userId = userData.user?.id ?? null
  if (!userId) return { userId: null, isMember: false, isFollowing: false }

  const [member, follow] = await Promise.all([
    sb.rpc("is_company_member", { cid: companyId }),
    sb.from("company_follows").select("id").eq("company_id", companyId).eq("user_id", userId).maybeSingle(),
  ])
  return {
    userId,
    isMember: member.data === true,
    isFollowing: Boolean(follow.data),
  }
}

export async function listPosts(companyId: string): Promise<Post[]> {
  const sb = getSupabaseBrowserClient()
  const { data, error } = await sb
    .from("posts")
    .select("*,post_media(*)")
    .eq("company_id", companyId)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
  if (error) fail("Failed to load posts", error)
  return (data as PostRow[]).map(mapPost)
}

export async function listVideoMedia(companyId: string): Promise<PostMedia[]> {
  const sb = getSupabaseBrowserClient()
  const { data, error } = await sb
    .from("post_media")
    .select("*,posts!inner(company_id,created_at)")
    .eq("media_type", "video")
    .eq("posts.company_id", companyId)
    .order("created_at", { ascending: false, referencedTable: "posts" })
  if (error) fail("Failed to load videos", error)
  return (data as PostMediaRow[]).map(mapMedia)
}

export async function getLikedPostIds(companyId: string): Promise<Set<string>> {
  const sb = getSupabaseBrowserClient()
  const { data: userData } = await sb.auth.getUser()
  const userId = userData.user?.id
  if (!userId) return new Set()
  const { data, error } = await sb
    .from("post_likes")
    .select("post_id,posts!inner(company_id)")
    .eq("user_id", userId)
    .eq("posts.company_id", companyId)
  if (error) return new Set()
  return new Set((data as { post_id: string }[]).map((r) => r.post_id))
}

export async function listComments(postId: string): Promise<PostComment[]> {
  const sb = getSupabaseBrowserClient()
  const { data, error } = await sb
    .from("post_comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
  if (error) fail("Failed to load comments", error)
  return (data as CommentRow[]).map(mapComment)
}

export async function listLiveSessions(companyId: string): Promise<LiveSession[]> {
  const sb = getSupabaseBrowserClient()
  const { data, error } = await sb
    .from("live_sessions")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
  if (error) fail("Failed to load live sessions", error)
  return (data as LiveRow[]).map(mapLive)
}

// ---------------------------------------------------------------------------
// Follows (any authenticated user)
// ---------------------------------------------------------------------------
export async function follow(companyId: string): Promise<void> {
  const sb = getSupabaseBrowserClient()
  const { data: userData } = await sb.auth.getUser()
  const userId = userData.user?.id
  if (!userId) throw new Error("Not signed in")
  const { error } = await sb.from("company_follows").insert({ company_id: companyId, user_id: userId })
  if (error && error.code !== "23505") fail("Failed to follow", error)
}

export async function unfollow(companyId: string): Promise<void> {
  const sb = getSupabaseBrowserClient()
  const { data: userData } = await sb.auth.getUser()
  const userId = userData.user?.id
  if (!userId) throw new Error("Not signed in")
  const { error } = await sb.from("company_follows").delete().eq("company_id", companyId).eq("user_id", userId)
  if (error) fail("Failed to unfollow", error)
}

// ---------------------------------------------------------------------------
// Likes (any authenticated user)
// ---------------------------------------------------------------------------
export async function likePost(postId: string): Promise<void> {
  const sb = getSupabaseBrowserClient()
  const { data: userData } = await sb.auth.getUser()
  const userId = userData.user?.id
  if (!userId) throw new Error("Not signed in")
  const { error } = await sb.from("post_likes").insert({ post_id: postId, user_id: userId })
  if (error && error.code !== "23505") fail("Failed to like", error)
}

export async function unlikePost(postId: string): Promise<void> {
  const sb = getSupabaseBrowserClient()
  const { data: userData } = await sb.auth.getUser()
  const userId = userData.user?.id
  if (!userId) throw new Error("Not signed in")
  const { error } = await sb.from("post_likes").delete().eq("post_id", postId).eq("user_id", userId)
  if (error) fail("Failed to unlike", error)
}

// ---------------------------------------------------------------------------
// Comments (any authenticated user; company members can moderate)
// ---------------------------------------------------------------------------
export async function addComment(postId: string, body: string): Promise<PostComment> {
  const sb = getSupabaseBrowserClient()
  const { data: userData } = await sb.auth.getUser()
  const userId = userData.user?.id
  if (!userId) throw new Error("Not signed in")
  const { data, error } = await sb
    .from("post_comments")
    .insert({ post_id: postId, user_id: userId, body: body.trim() })
    .select("*")
    .single()
  if (error) fail("Failed to comment", error)
  return mapComment(data as CommentRow)
}

export async function deleteComment(id: string): Promise<void> {
  const sb = getSupabaseBrowserClient()
  const { error } = await sb.from("post_comments").delete().eq("id", id)
  if (error) fail("Failed to delete comment", error)
}

// ---------------------------------------------------------------------------
// Posts CRUD + pin (company members only, enforced by RLS)
// ---------------------------------------------------------------------------
export async function createPost(companyId: string, body: string): Promise<Post> {
  const sb = getSupabaseBrowserClient()
  const { data: userData } = await sb.auth.getUser()
  const userId = userData.user?.id
  if (!userId) throw new Error("Not signed in")
  const { data, error } = await sb
    .from("posts")
    .insert({ company_id: companyId, author_id: userId, body: body.trim() })
    .select("*,post_media(*)")
    .single()
  if (error) fail("Failed to create post", error)
  return mapPost(data as PostRow)
}

export async function updatePost(id: string, body: string): Promise<void> {
  const sb = getSupabaseBrowserClient()
  const { error } = await sb.from("posts").update({ body: body.trim() }).eq("id", id)
  if (error) fail("Failed to update post", error)
}

export async function deletePost(id: string): Promise<void> {
  const sb = getSupabaseBrowserClient()
  const { error } = await sb.from("posts").delete().eq("id", id)
  if (error) fail("Failed to delete post", error)
}

export async function setPostPinned(id: string, pinned: boolean): Promise<void> {
  const sb = getSupabaseBrowserClient()
  const { error } = await sb.from("posts").update({ pinned }).eq("id", id)
  if (error) fail("Failed to pin post", error)
}

// ---------------------------------------------------------------------------
// Media uploads to Supabase Storage. Object paths are namespaced by company id
// ("{companyId}/{file}") so the Storage RLS policy can resolve ownership.
// ---------------------------------------------------------------------------
function sanitizeName(name: string): string {
  const dot = name.lastIndexOf(".")
  const ext = dot >= 0 ? name.slice(dot).toLowerCase().replace(/[^a-z0-9.]/g, "") : ""
  return `${crypto.randomUUID()}${ext}`
}

export async function uploadPostMedia(
  companyId: string,
  postId: string,
  file: File,
  mediaType: "image" | "video",
  position: number,
): Promise<PostMedia> {
  const sb = getSupabaseBrowserClient()
  const bucket = mediaType === "video" ? "company-videos" : "post-media"
  const path = `${companyId}/${sanitizeName(file.name)}`

  const { error: upErr } = await sb.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  })
  if (upErr) fail("Failed to upload media", upErr)

  const { data: pub } = sb.storage.from(bucket).getPublicUrl(path)
  const { data, error } = await sb
    .from("post_media")
    .insert({
      post_id: postId,
      storage_bucket: bucket,
      storage_path: path,
      url: pub.publicUrl,
      media_type: mediaType,
      position,
    })
    .select("*")
    .single()
  if (error) fail("Failed to save media", error)
  return mapMedia(data as PostMediaRow)
}

// ---------------------------------------------------------------------------
// Live sessions (company members only, enforced by RLS)
// ---------------------------------------------------------------------------
export async function createLiveSession(
  companyId: string,
  input: { title: string; status: LiveStatus; scheduledAt: string | null },
): Promise<LiveSession> {
  const sb = getSupabaseBrowserClient()
  const { data: userData } = await sb.auth.getUser()
  const userId = userData.user?.id
  if (!userId) throw new Error("Not signed in")
  const { data, error } = await sb
    .from("live_sessions")
    .insert({
      company_id: companyId,
      created_by: userId,
      title: input.title.trim(),
      status: input.status,
      scheduled_at: input.scheduledAt,
      started_at: input.status === "live" ? new Date().toISOString() : null,
    })
    .select("*")
    .single()
  if (error) fail("Failed to create live session", error)
  return mapLive(data as LiveRow)
}

export async function updateLiveStatus(id: string, status: LiveStatus): Promise<void> {
  const sb = getSupabaseBrowserClient()
  const patch: Record<string, string | null> = { status }
  if (status === "live") patch.started_at = new Date().toISOString()
  if (status === "ended") patch.ended_at = new Date().toISOString()
  const { error } = await sb.from("live_sessions").update(patch).eq("id", id)
  if (error) fail("Failed to update live session", error)
}

export async function deleteLiveSession(id: string): Promise<void> {
  const sb = getSupabaseBrowserClient()
  const { error } = await sb.from("live_sessions").delete().eq("id", id)
  if (error) fail("Failed to delete live session", error)
}
