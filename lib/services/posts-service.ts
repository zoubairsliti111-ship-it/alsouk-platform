import { createClient } from "@/lib/supabase/client"
import { type CommercialPost, type CommercialPostStatus } from "@/lib/domains/post/types"

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
