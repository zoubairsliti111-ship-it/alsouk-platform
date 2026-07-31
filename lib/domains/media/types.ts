export type PlatformMediaType =
  | "logo"
  | "cover"
  | "product"
  | "post"
  | "video"
  | "certificate"
  | "document"
  | "future"

export interface PlatformMedia {
  id: string
  companyId: string
  mediaType: PlatformMediaType
  mimeType: string
  fileSize: number
  width?: number | null
  height?: number | null
  duration?: number | null
  storageBucket: string
  storagePath: string
  publicUrl: string
  altText?: string | null
  caption?: string | null
  position: number
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}
