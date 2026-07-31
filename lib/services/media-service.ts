import { createClient } from "@/lib/supabase/client"
import { type PlatformMedia, type PlatformMediaType } from "@/lib/domains/media/types"

// File limits configuration
export const FILE_LIMITS = {
  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]
  },
  video: {
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: ["video/mp4", "video/quicktime", "video/webm"]
  },
  document: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"]
  }
}

/**
 * Validates a file before upload based on its target classification.
 */
export function validateFile(file: File, mediaType: PlatformMediaType): string | null {
  let config = FILE_LIMITS.image

  if (mediaType === "video") {
    config = FILE_LIMITS.video
  } else if (mediaType === "certificate" || mediaType === "document") {
    config = FILE_LIMITS.document
  }

  // Size validation
  if (file.size > config.maxSize) {
    const sizeInMB = Math.round(config.maxSize / (1024 * 1024))
    return `File exceeds maximum allowed size of ${sizeInMB}MB.`
  }

  // MIME type validation
  if (!config.allowedTypes.includes(file.type)) {
    return "Unsupported file format. Please upload an accepted file type."
  }

  return null
}

/**
 * Client-side helper to extract image dimensions (width/height).
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve({ width: 0, height: 0 })
      return
    }
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      resolve({ width: 0, height: 0 })
    }
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Client-side helper to extract video duration.
 */
export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("video/")) {
      resolve(0)
      return
    }
    const video = document.createElement("video")
    video.preload = "metadata"
    video.onloadedmetadata = () => {
      resolve(video.duration || 0)
    }
    video.onerror = () => {
      resolve(0)
    }
    video.src = URL.createObjectURL(file)
  })
}

/**
 * Maps DB row to PlatformMedia domain model.
 */
export function mapMediaRow(row: any): PlatformMedia {
  return {
    id: row.id,
    companyId: row.company_id,
    mediaType: row.media_type as PlatformMediaType,
    mimeType: row.mime_type,
    fileSize: row.file_size,
    width: row.width,
    height: row.height,
    duration: row.duration ? Number(row.duration) : null,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    publicUrl: row.public_url,
    altText: row.alt_text,
    caption: row.caption,
    position: row.position || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at
  }
}

/**
 * Uploads a file to Supabase Storage under a clean entity folder and registers it in the DB.
 */
export async function uploadPlatformMedia(
  file: File,
  companyId: string,
  mediaType: PlatformMediaType,
  onProgress?: (percent: number) => void
): Promise<{ success: boolean; data: PlatformMedia | null; error: string | null }> {
  const validationError = validateFile(file, mediaType)
  if (validationError) {
    return { success: false, data: null, error: validationError }
  }

  const supabase = createClient()

  // 1. Client-side metadata extraction
  let width = null
  let height = null
  let duration = null

  if (file.type.startsWith("image/")) {
    const dims = await getImageDimensions(file)
    width = dims.width || null
    height = dims.height || null
  } else if (file.type.startsWith("video/")) {
    duration = await getVideoDuration(file)
  }

  // 2. Determine storage directory folder based on media type
  let entityFolder = "documents"
  if (mediaType === "logo" || mediaType === "cover") {
    entityFolder = "companies"
  } else if (mediaType === "product") {
    entityFolder = "products"
  } else if (mediaType === "post") {
    entityFolder = "posts"
  } else if (mediaType === "video") {
    entityFolder = "videos"
  } else if (mediaType === "certificate") {
    entityFolder = "certificates"
  } else if (mediaType === "future") {
    entityFolder = "future"
  }

  const fileExt = file.name.split(".").pop() || "png"
  const uniqueName = `${mediaType}-${Math.random().toString(36).substring(2, 9)}-${Date.now()}.${fileExt}`
  const storagePath = `${companyId}/${entityFolder}/${uniqueName}`

  try {
    // 3. Upload file (simulate simple progress if callback is provided)
    if (onProgress) {
      onProgress(30)
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("platform-media")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false
      })

    if (uploadError) {
      throw new Error(uploadError.message)
    }

    if (onProgress) {
      onProgress(70)
    }

    // 4. Retrieve Public URL
    const { data: publicUrlData } = supabase.storage
      .from("platform-media")
      .getPublicUrl(storagePath)

    if (!publicUrlData?.publicUrl) {
      throw new Error("Failed to retrieve uploaded file public URL.")
    }

    if (onProgress) {
      onProgress(90)
    }

    // 5. Register in DB
    const { data: dbRow, error: dbError } = await supabase
      .from("platform_media")
      .insert({
        company_id: companyId,
        media_type: mediaType,
        mime_type: file.type,
        file_size: file.size,
        width,
        height,
        duration,
        storage_bucket: "platform-media",
        storage_path: storagePath,
        public_url: publicUrlData.publicUrl,
        alt_text: file.name
      })
      .select()
      .single()

    if (dbError) {
      throw new Error(dbError.message)
    }

    if (onProgress) {
      onProgress(100)
    }

    return { success: true, data: mapMediaRow(dbRow), error: null }
  } catch (err: any) {
    console.error("Unified upload error:", err)
    return { success: false, data: null, error: err.message || "Failed to upload file." }
  }
}

/**
 * Soft deletes media both from database.
 */
export async function deletePlatformMedia(
  mediaId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from("platform_media")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", mediaId)

  if (error) {
    console.error("Error soft-deleting platform media:", error)
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}
