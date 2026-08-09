import { type Company } from "@/lib/domains/company/types"

export type CommercialPostStatus = "draft" | "published"

export interface CommercialPost {
  id: string
  companyId: string
  authorId: string | null
  status: CommercialPostStatus
  visibility: string
  content: string
  images: string[]
  attachments: Record<string, any>[]
  viewCount: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  company?: Partial<Company>
  media?: CommercialPostMedia[]
  likes?: CommercialPostLike[]
  comments?: CommercialPostComment[]
  bookmarks?: CommercialPostBookmark[]
  views?: CommercialPostView[]
}

export interface CommercialPostMedia {
  id: string
  postId: string
  storageBucket: string
  storagePath: string
  url: string
  mediaType: "image" | "video"
  position: number
  createdAt: string
}

export interface CommercialPostLike {
  id: string
  postId: string
  userId: string
  createdAt: string
}

export interface CommercialPostComment {
  id: string
  postId: string
  userId: string
  body: string
  createdAt: string
  updatedAt: string
}

export interface CommercialPostBookmark {
  id: string
  postId: string
  userId: string
  createdAt: string
}

export interface CommercialPostView {
  id: string
  postId: string
  userId: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}
