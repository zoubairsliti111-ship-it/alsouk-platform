"use client"

import { useEffect, useState, useCallback } from "react"
import { MediaUploader } from "@/components/ui/media-uploader"
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Eye,
  Loader2,
  X,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Globe,
  Lock,
  ExternalLink
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  type CommercialPost,
  type CommercialPostStatus
} from "@/lib/domains/post/types"
import {
  createPost,
  updatePost,
  deletePost,
  fetchCompanyPosts,
  publishPost,
  unpublishPost
} from "@/lib/services/posts-service"

interface MerchantPostsProps {
  companyId: string
  lang: string
}

export function MerchantPosts({ companyId, lang }: MerchantPostsProps) {
  const [posts, setPosts] = useState<CommercialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Modal States
  const [showModal, setShowModal] = useState(false)
  const [editingPost, setEditingPost] = useState<CommercialPost | null>(null)

  // Form Fields
  const [content, setContent] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [status, setStatus] = useState<CommercialPostStatus>("draft")
  const [visibility, setVisibility] = useState("public")

  // Form Actions Loading states
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const loadPosts = useCallback(async () => {
    await Promise.resolve()
    setLoading(true)
    setError(null)
    const res = await fetchCompanyPosts(companyId)
    if (res.success) {
      setPosts(res.data)
    } else {
      setError(res.error || "Failed to load posts.")
    }
    setLoading(false)
  }, [companyId])

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    loadPosts()
  }, [loadPosts])

  // Open modal for creation
  const handleOpenCreate = () => {
    setEditingPost(null)
    setContent("")
    setImages([])
    setStatus("draft")
    setVisibility("public")
    setFormError(null)
    setShowModal(true)
  }

  // Open modal for editing
  const handleOpenEdit = (post: CommercialPost) => {
    setEditingPost(post)
    setContent(post.content)
    setImages(post.images)
    setStatus(post.status)
    setVisibility(post.visibility)
    setFormError(null)
    setShowModal(true)
  }

  // Removes a thumbnail from the current post form
  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  // Handles full save action (creation or update)
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!content.trim()) {
      setFormError("Post content or caption is required.")
      return
    }

    setSaving(true)

    try {
      if (editingPost) {
        const res = await updatePost(editingPost.id, {
          content,
          images,
          status,
          visibility
        })

        if (res.success && res.data) {
          setSuccess("Post updated successfully!")
          setShowModal(false)
          loadPosts()
          setTimeout(() => setSuccess(null), 3000)
        } else {
          setFormError(res.error || "Failed to update post.")
        }
      } else {
        const res = await createPost({
          companyId,
          content,
          images,
          status,
          visibility
        })

        if (res.success && res.data) {
          setSuccess("New post created successfully!")
          setShowModal(false)
          loadPosts()
          setTimeout(() => setSuccess(null), 3000)
        } else {
          setFormError(res.error || "Failed to create post.")
        }
      }
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred while saving.")
    } finally {
      setSaving(false)
    }
  }

  // Toggles publication status of a post directly from the list
  const handleToggleStatus = async (post: CommercialPost) => {
    setSuccess(null)
    const isCurrentlyPublished = post.status === "published"
    const toggleFunc = isCurrentlyPublished ? unpublishPost : publishPost

    const res = await toggleFunc(post.id)
    if (res.success) {
      setSuccess(
        isCurrentlyPublished
          ? "Post unpublished successfully."
          : "Post published to feed successfully!"
      )
      loadPosts()
      setTimeout(() => setSuccess(null), 3000)
    } else {
      setError(res.error || "Failed to change post status.")
      setTimeout(() => setError(null), 3000)
    }
  }

  // Deletes a post with soft-delete
  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return
    }

    setSuccess(null)
    const res = await deletePost(postId)
    if (res.success) {
      setSuccess("Post deleted successfully.")
      loadPosts()
      setTimeout(() => setSuccess(null), 3000)
    } else {
      setError(res.error || "Failed to delete post.")
      setTimeout(() => setError(null), 3000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab Header with Create button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h4 className="text-base font-black text-foreground tracking-tight flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            <span>Commercial Feed Posts</span>
          </h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-md">
            Broadcast stock updates, arrivals, promotions, or behind-the-scenes videos to Tunisian and regional B2B buyers.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-blue-600 px-4 py-2.5 text-xs font-black text-white hover:opacity-95 shadow-md shadow-primary/10 transition-all cursor-pointer active:scale-98"
        >
          <Plus className="size-4" />
          <span>New Update Post</span>
        </button>
      </div>

      {/* Success / Error Banners */}
      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2 animate-scale-up">
          <CheckCircle className="size-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold rounded-xl flex items-center gap-2 animate-scale-up">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Posts list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-border bg-secondary/10 px-6 py-12 text-center max-w-lg mx-auto space-y-4">
          <div className="size-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
            <FileText className="size-6" />
          </div>
          <div>
            <h5 className="text-sm font-black text-foreground">No updates published yet</h5>
            <p className="text-xs text-muted-foreground mt-1 leading-normal">
              Commercial updates keep your business visible on the regional Discover Feed. Start by writing your first update or promotional post today!
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="rounded-xl border border-primary text-primary hover:bg-primary/5 px-4 py-2 text-xs font-bold transition-all cursor-pointer"
          >
            Create First Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {posts.map((post) => {
            const hasImages = post.images && post.images.length > 0
            const timestampStr = new Date(post.createdAt).toLocaleDateString(
              lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : "ar-TN",
              { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
            )

            return (
              <div
                key={post.id}
                className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col sm:flex-row justify-between gap-4 items-start"
              >
                <div className="space-y-3 min-w-0 flex-1">
                  {/* Status Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    {post.status === "published" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                        <Globe className="size-3" />
                        <span>Published</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase">
                        <Lock className="size-3" />
                        <span>Draft</span>
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {timestampStr}
                    </span>
                  </div>

                  {/* Caption */}
                  <p className="text-xs font-semibold text-foreground leading-relaxed whitespace-pre-wrap break-words">
                    {post.content}
                  </p>

                  {/* Images Carousel/Rail */}
                  {hasImages && (
                    <div className="flex gap-2 py-1 overflow-x-auto no-scrollbar">
                      {post.images.map((imgUrl, imgIdx) => (
                        <div
                          key={imgIdx}
                          className="relative size-16 rounded-xl overflow-hidden border border-border/60 bg-secondary shrink-0"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgUrl}
                            alt="Attached file"
                            className="size-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* View count */}
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                    <Eye className="size-3.5" />
                    <span>{post.viewCount} views</span>
                  </div>
                </div>

                {/* Operations */}
                <div className="flex sm:flex-col gap-2 w-full sm:w-auto pt-2 sm:pt-0 shrink-0 border-t sm:border-t-0 border-border/40">
                  <button
                    onClick={() => handleToggleStatus(post)}
                    className={`flex-1 sm:flex-initial text-center rounded-lg px-3 py-2 text-[10px] font-black transition-all cursor-pointer ${
                      post.status === "published"
                        ? "bg-secondary text-foreground hover:bg-secondary/80"
                        : "bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20"
                    }`}
                  >
                    {post.status === "published" ? "Unpublish" : "Publish"}
                  </button>

                  <div className="flex gap-2 flex-1 sm:flex-initial">
                    <button
                      onClick={() => handleOpenEdit(post)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 rounded-lg border border-border bg-card hover:bg-secondary/40 text-[10px] font-bold text-foreground py-2 px-3 transition-all cursor-pointer"
                      title="Edit Post"
                    >
                      <Edit className="size-3 text-muted-foreground" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-[10px] font-bold text-destructive py-2 px-3 transition-all cursor-pointer"
                      title="Delete Post"
                    >
                      <Trash2 className="size-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Creation & Editing Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h4 className="text-base font-black text-foreground flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                <span>{editingPost ? "Edit Commercial Post" : "Create Commercial Post"}</span>
              </h4>
              <button
                onClick={() => setShowModal(false)}
                className="size-8 rounded-xl border border-border hover:bg-secondary/40 flex items-center justify-center text-muted-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Rich Text / Content field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Post Update content *</label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's new? Describe your new arrivals, bulk packages, factory updates, or wholesale discounts..."
                  className="w-full rounded-xl border border-border bg-secondary/10 px-3.5 py-2.5 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 resize-none"
                />
              </div>

              {/* Status Selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-secondary/10 px-3 py-2.5 text-xs text-foreground focus:border-primary"
                  >
                    <option value="draft">Save as Draft (Private)</option>
                    <option value="published">Publish to Public Feed</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Visibility</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-full rounded-xl border border-border bg-secondary/10 px-3 py-2.5 text-xs text-foreground focus:border-primary"
                  >
                    <option value="public">Publicly Discoverable</option>
                  </select>
                </div>
              </div>

              {/* Image Upload section */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <ImageIcon className="size-4 text-primary" />
                  <span>Post Media Attachments</span>
                </label>

                {/* Thumbnail Previews with delete buttons */}
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 py-1.5">
                    {images.map((imgUrl, imgIdx) => (
                      <div
                        key={imgIdx}
                        className="relative size-20 rounded-xl overflow-hidden border border-border bg-secondary aspect-square group animate-scale-up"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt="Thumbnail"
                          className="size-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(imgIdx)}
                          className="absolute top-1 end-1 size-5 rounded-lg bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-all cursor-pointer"
                          title="Remove image"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button wrapper using Unified MediaUploader */}
                <div className="pt-2">
                  <MediaUploader
                    companyId={companyId}
                    mediaType="post"
                    onUploadSuccess={(media) => {
                      setImages((prev) => [...prev, media.publicUrl])
                    }}
                    acceptLabel="PNG, JPG or WEBP under 5MB (Max 10 images)"
                  />
                </div>
              </div>

              {/* Save & Cancel buttons */}
              <div className="flex gap-3 pt-4 border-t border-border/50">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 py-3.5 text-xs font-black text-white hover:opacity-95 shadow-md shadow-primary/15 transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  <span>{editingPost ? "Save Changes" : "Publish Update"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-border px-5 py-3.5 hover:bg-secondary/40 text-xs font-bold text-foreground transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
