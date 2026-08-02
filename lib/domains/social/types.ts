/** Media attached to a post (Supabase Storage backed). */
export interface PostMedia {
  id: string
  postId: string
  url: string | null
  storageBucket: string
  storagePath: string
  mediaType: "image" | "video"
  position: number
}

/** A commercial post published by a company. */
export interface Post {
  id: string
  companyId: string
  authorId: string | null
  body: string
  pinned: boolean
  likeCount: number
  commentCount: number
  createdAt: string
  media: PostMedia[]
}

/** A comment on a post. */
export interface PostComment {
  id: string
  postId: string
  userId: string
  body: string
  createdAt: string
}

export type LiveStatus = "upcoming" | "live" | "ended"

/** A live session belonging to a company. */
export interface LiveSession {
  id: string
  companyId: string
  title: string
  status: LiveStatus
  scheduledAt: string | null
  startedAt: string | null
  endedAt: string | null
  viewerCount: number
  replayUrl: string | null
  createdAt: string
}

/** Aggregate counts shown in the profile header. */
export interface CompanyStats {
  followers: number
  posts: number
  videos: number
  products: number
}

/** The current viewer's relationship to a company. */
export interface ViewerState {
  userId: string | null
  isMember: boolean
  isFollowing: boolean
}
