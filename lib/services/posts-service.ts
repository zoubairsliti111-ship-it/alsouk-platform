import { createClient } from "@/lib/supabase/client"
import { type CommercialPost, type CommercialPostStatus } from "@/lib/domains/post/types"
import type { Post, PostComment, PostMedia } from "@/lib/domains/social/types"

// =============================================================================
// TECH-DEBT CONSOLIDATION (see project notes): ALSOUK used to have two
// parallel, conflicting post systems — this file (commercial_posts, used by
// the merchant "create post" flow in components/marketplace/merchant-posts.tsx)
// and lib/services/social-service.ts (public.posts, used by the public
// company-profile post feed). Because the two wrote to different tables, a
// post created from the merchant dashboard never appeared on the company's
// own public profile.
//
// Fix: commercial_posts is kept as the single source of truth (it's the one
// the "create post" UI already writes to). The functions below give
// components/marketplace/posts-feed.tsx (and the two posts-related calls in
// company-profile.tsx) a commercial_posts-backed implementation with the
// exact same Post/PostComment/PostMedia shapes social-service.ts used, so the
// UI components needed only their import + call sites updated — not a
// rewrite. social-service.ts itself is UNCHANGED and still used for
// follows/live-sessions/stats, which never conflicted with anything.
// =============================================================================

type CommercialPostMediaRow = {
  id: string
  post_id: string
  url: string | null
  storage_bucket: string
  storage_path: string
  media_type: "image" | "video"
  position: number
}

type CommercialPostCommentRow = {
  id: string
  post_id: string
  user_id: string
  body: string
  created_at: string
}

type CommercialPostAsPostRow = {
  id: string
  company_id: string
  author_id: string | null
  content: string
  pinned: boolean
  like_count: number
  comment_count: number
  created_at: string
  commercial_post_media?: CommercialPostMediaRow[]
}

function mapCommercialMedia(r: CommercialPostMediaRow): PostMedia {
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

function mapCommercialComment(r: CommercialPostCommentRow): PostComment {
  return { id: r.id, postId: r.post_id, userId: r.user_id, body: r.body, createdAt: r.created_at }
}

function mapCommercialAsPost(r: CommercialPostAsPostRow): Post {
  return {
    id: r.id,
    companyId: r.company_id,
    authorId: r.author_id,
    body: r.content,
    pinned: r.pinned,
    likeCount: r.like_count,
    commentCount: r.comment_count,
    createdAt: r.created_at,
    media: (r.commercial_post_media ?? []).map(mapCommercialMedia),
  }
}

/** Lists a company's posts (public feed shape). Replaces social.listPosts. */
export async function listCompanyPosts(companyId: string): Promise<Post[]> {
  const sb = createClient()
  const { data, error } = await sb
    .from("commercial_posts")
    .select("*,commercial_post_media(*)")
    .eq("company_id", companyId)
    .is("deleted_at", null)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
  if (error) throw new Error("Failed to load posts: " + error.message)
  return (data as CommercialPostAsPostRow[]).map(mapCommercialAsPost)
}

/** Replaces social.getLikedPostIds. */
export async function getLikedCommercialPostIds(companyId: string): Promise<Set<string>> {
  const sb = createClient()
  const { data: userData } = await sb.auth.getUser()
  const userId = userData.user?.id
  if (!userId) return new Set()
  const { data, error } = await sb
    .from("commercial_post_likes")
    .select("post_id,commercial_posts!inner(company_id)")
    .eq("user_id", userId)
    .eq("commercial_posts.company_id", companyId)
  if (error) return new Set()
  return new Set((data as { post_id: string }[]).map((r) => r.post_id))
}

/** Replaces social.listComments. */
export async function listPostComments(postId: string): Promise<PostComment[]> {
  const sb = createClient()
  const { data, error } = await sb
    .from("commercial_post_comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
  if (error) throw new Error("Failed to load comments: " + error.message)
  return (data as CommercialPostCommentRow[]).map(mapCommercialComment)
}

/** Replaces social.likePost. */
export async function likeCommercialPost(postId: string): Promise<void> {
  const sb = createClient()
  const { data: userData } = await sb.auth.getUser()
  const userId = userData.user?.id
  if (!userId) throw new Error("Not signed in")
  const { error } = await sb.from("commercial_post_likes").insert({ post_id: postId, user_id: userId })
  if (error && error.code !== "23505") throw new Error("Failed to like: " + error.message)
}

/** Replaces social.unlikePost. */
export async function unlikeCommercialPost(postId: string): Promise<void> {
  const sb = createClient()
  const { data: userData } = await sb.auth.getUser()
  const userId = userData.user?.id
  if (!userId) throw new Error("Not signed in")
  const { error } = await sb.from("commercial_post_likes").delete().eq("post_id", postId).eq("user_id", userId)
  if (error) throw new Error("Failed to unlike: " + error.message)
}

/** Replaces social.addComment. */
export async function addPostComment(postId: string, body: string): Promise<PostComment> {
  const sb = createClient()
  const { data: userData } = await sb.auth.getUser()
  const userId = userData.user?.id
  if (!userId) throw new Error("Not signed in")
  const { data, error } = await sb
    .from("commercial_post_comments")
    .insert({ post_id: postId, user_id: userId, body: body.trim() })
    .select("*")
    .single()
  if (error) throw new Error("Failed to comment: " + error.message)
  return mapCommercialComment(data as CommercialPostCommentRow)
}

/** Replaces social.deleteComment. */
export async function deletePostComment(id: string): Promise<void> {
  const sb = createClient()
  const { error } = await sb.from("commercial_post_comments").delete().eq("id", id)
  if (error) throw new Error("Failed to delete comment: " + error.message)
}

/** Replaces social.createPost(companyId, body) — publishes immediately
 *  (the public feed composer has no draft workflow, unlike the merchant
 *  dashboard composer which uses createPost() above with status:"draft"). */
export async function createSimplePost(companyId: string, body: string): Promise<Post> {
  const sb = createClient()
  const { data: userData } = await sb.auth.getUser()
  const userId = userData.user?.id
  if (!userId) throw new Error("Not signed in")
  const { data, error } = await sb
    .from("commercial_posts")
    .insert({ company_id: companyId, author_id: userId, content: body.trim(), status: "published" })
    .select("*,commercial_post_media(*)")
    .single()
  if (error) throw new Error("Failed to create post: " + error.message)
  return mapCommercialAsPost(data as CommercialPostAsPostRow)
}

/** Replaces social.updatePost(id, body). */
export async function updateSimplePost(id: string, body: string): Promise<void> {
  const sb = createClient()
  const { error } = await sb.from("commercial_posts").update({ content: body.trim() }).eq("id", id)
  if (error) throw new Error("Failed to update post: " + error.message)
}

/** Replaces social.deletePost(id). Soft-delete (consistent with the rest of
 *  commercial_posts) — already-filtered out of every SELECT via deleted_at. */
export async function deleteSimplePost(id: string): Promise<void> {
  const sb = createClient()
  const { error } = await sb.from("commercial_posts").update({ deleted_at: new Date().toISOString() }).eq("id", id)
  if (error) throw new Error("Failed to delete post: " + error.message)
}

/** Replaces social.setPostPinned. */
export async function setSimplePostPinned(id: string, pinned: boolean): Promise<void> {
  const sb = createClient()
  const { error } = await sb.from("commercial_posts").update({ pinned }).eq("id", id)
  if (error) throw new Error("Failed to pin post: " + error.message)
}

function sanitizeMediaName(name: string): string {
  const dot = name.lastIndexOf(".")
  const ext = dot >= 0 ? name.slice(dot).toLowerCase().replace(/[^a-z0-9.]/g, "") : ""
  return `${crypto.randomUUID()}${ext}`
}

/** Replaces social.uploadPostMedia. Uploads to the real company's own
 *  folder (companyId comes from the authenticated user's actual company —
 *  never a hardcoded placeholder). */
export async function uploadSimplePostMedia(
  companyId: string,
  postId: string,
  file: File,
  mediaType: "image" | "video",
  position: number,
): Promise<PostMedia> {
  const sb = createClient()
  const bucket = "commercial-posts"
  const path = `${companyId}/${sanitizeMediaName(file.name)}`

  const { error: upErr } = await sb.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  })
  if (upErr) throw new Error("Failed to upload media: " + upErr.message)

  const { data: pub } = sb.storage.from(bucket).getPublicUrl(path)
  const { data, error } = await sb
    .from("commercial_post_media")
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
  if (error) throw new Error("Failed to save media: " + error.message)
  return mapCommercialMedia(data as CommercialPostMediaRow)
}

export type DBCommercialPostRow = {
  id: string
  company_id: string
  author_id: string | null
  status: "draft" | "published"
  visibility: string
  content: string
  images: string[]
  attachments: any
  view_count: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  companies?: {
    name: string
    slug: string
    logo_url: string | null
    verification_tier: string | null
    verified: boolean
  } | null
}

export function mapPostRow(row: DBCommercialPostRow): CommercialPost {
  if (!row) {
    return {
      id: "mock-post-" + Math.random().toString(36).substring(2, 9),
      companyId: "mock-company-id",
      authorId: "mock-user-123",
      status: "draft",
      visibility: "public",
      content: "",
      images: [],
      attachments: [],
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null
    }
  }
  return {
    id: row.id,
    companyId: row.company_id,
    authorId: row.author_id,
    status: row.status,
    visibility: row.visibility,
    content: row.content,
    images: row.images || [],
    attachments: row.attachments || [],
    viewCount: row.view_count || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    company: row.companies ? {
      name: row.companies.name,
      slug: row.companies.slug,
      logoUrl: row.companies.logo_url || null,
      verificationTier: row.companies.verification_tier as any || "basic",
      verified: Boolean(row.companies.verified)
    } : undefined
  }
}

/**
 * Validates post input fields.
 */
export function validatePostInput(content: string, images?: string[]): string | null {
  if (!content || !content.trim()) {
    return "Post content/caption cannot be empty."
  }
  if (content.length > 5000) {
    return "Post content is too long. Maximum allowed is 5000 characters."
  }
  if (images && images.length > 10) {
    return "A post can have at most 10 images attached."
  }
  return null
}

/**
 * Creates a commercial post in the database.
 * Enforces ownership/membership checks implicitly through database-level RLS policies,
 * but also includes a defensive check on the client.
 */
export async function createPost(postInput: {
  companyId: string
  content: string
  images?: string[]
  status?: CommercialPostStatus
  visibility?: string
}): Promise<{ success: boolean; data: CommercialPost | null; error: string | null }> {
  const validationError = validatePostInput(postInput.content, postInput.images)
  if (validationError) {
    return { success: false, data: null, error: validationError }
  }

  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { success: false, data: null, error: "Authentication required to create posts." }
  }

  const insertData = {
    company_id: postInput.companyId,
    author_id: session.user.id,
    content: postInput.content.trim(),
    images: postInput.images || [],
    status: postInput.status || "draft",
    visibility: postInput.visibility || "public",
    attachments: []
  }

  const { data, error } = await supabase
    .from("commercial_posts")
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error("Error creating post:", error)
    return { success: false, data: null, error: error.message }
  }

  return { success: true, data: mapPostRow(data as any), error: null }
}

/**
 * Updates a commercial post in the database.
 */
export async function updatePost(
  postId: string,
  postInput: {
    content?: string
    images?: string[]
    status?: CommercialPostStatus
    visibility?: string
  }
): Promise<{ success: boolean; data: CommercialPost | null; error: string | null }> {
  if (postInput.content !== undefined) {
    const validationError = validatePostInput(postInput.content, postInput.images)
    if (validationError) {
      return { success: false, data: null, error: validationError }
    }
  }

  const supabase = createClient()
  const updateData: Record<string, any> = {}
  if (postInput.content !== undefined) updateData.content = postInput.content.trim()
  if (postInput.images !== undefined) updateData.images = postInput.images
  if (postInput.status !== undefined) updateData.status = postInput.status
  if (postInput.visibility !== undefined) updateData.visibility = postInput.visibility

  const { data, error } = await supabase
    .from("commercial_posts")
    .update(updateData)
    .eq("id", postId)
    .select()
    .single()

  if (error) {
    console.error("Error updating post:", error)
    return { success: false, data: null, error: error.message }
  }

  return { success: true, data: mapPostRow(data as any), error: null }
}

/**
 * Soft deletes a commercial post.
 */
export async function deletePost(postId: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from("commercial_posts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", postId)

  if (error) {
    console.error("Error deleting post:", error)
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}

/**
 * Publishes a commercial post.
 */
export async function publishPost(postId: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from("commercial_posts")
    .update({ status: "published" })
    .eq("id", postId)

  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true, error: null }
}

/**
 * Unpublishes a commercial post.
 */
export async function unpublishPost(postId: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from("commercial_posts")
    .update({ status: "draft" })
    .eq("id", postId)

  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true, error: null }
}

/**
 * Fetches all non-deleted posts of a specific company (both draft and published).
 */
export async function fetchCompanyPosts(
  companyId: string,
  limit = 20,
  offset = 0
): Promise<{ success: boolean; data: CommercialPost[]; error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("commercial_posts")
    .select("*")
    .eq("company_id", companyId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Error fetching company posts:", error)
    return { success: false, data: [], error: error.message }
  }

  return { success: true, data: (data as any[]).map(mapPostRow), error: null }
}

/**
 * Fetches published posts from all companies (for feed viewing).
 */
export async function fetchFeedPosts(
  limit = 10,
  offset = 0,
  filterCompanyId?: string
): Promise<{ success: boolean; data: CommercialPost[]; error: string | null }> {
  const supabase = createClient()

  let query = supabase
    .from("commercial_posts")
    .select(`
      *,
      companies (
        name,
        slug,
        logo_url,
        verification_tier,
        verified
      )
    `)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })

  if (filterCompanyId) {
    query = query.eq("company_id", filterCompanyId)
  }

  const { data, error } = await query.range(offset, offset + limit - 1)

  if (error) {
    console.error("Error fetching feed posts:", error)
    return { success: false, data: [], error: error.message }
  }

  return { success: true, data: (data as any[]).map(mapPostRow), error: null }
}
