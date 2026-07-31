"use client"

import { useState, useRef, DragEvent } from "react"
import {
  Upload,
  X,
  RefreshCw,
  FileText,
  Video,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { type PlatformMediaType, type PlatformMedia } from "@/lib/domains/media/types"
import { uploadPlatformMedia } from "@/lib/services/media-service"

interface MediaUploaderProps {
  companyId: string
  mediaType: PlatformMediaType
  onUploadSuccess: (media: PlatformMedia) => void
  onDelete?: () => void
  className?: string
  acceptLabel?: string
  currentUrl?: string | null
}

export function MediaUploader({
  companyId,
  mediaType,
  onUploadSuccess,
  onDelete,
  className = "",
  acceptLabel = "PNG, JPG, WEBP, or MP4",
  currentUrl = null
}: MediaUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [localUrl, setLocalUrl] = useState<string | null>(currentUrl)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const uploadTaskRef = useRef<boolean>(true) // flag to support cancellation

  // Drag over handler
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  // Drop handler
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      startUpload(e.dataTransfer.files[0])
    }
  }

  // File Picker Change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      startUpload(e.target.files[0])
    }
  }

  // Trigger input click
  const onButtonClick = () => {
    inputRef.current?.click()
  }

  // Core Upload Logic
  const startUpload = async (file: File) => {
    setUploading(true)
    setProgress(0)
    setError(null)
    setSuccess(false)
    uploadTaskRef.current = true

    try {
      const res = await uploadPlatformMedia(
        file,
        companyId,
        mediaType,
        (percent) => {
          if (uploadTaskRef.current) {
            setProgress(percent)
          }
        }
      )

      if (!uploadTaskRef.current) {
        // Was cancelled
        return
      }

      if (res.success && res.data) {
        setSuccess(true)
        setLocalUrl(res.data.publicUrl)
        onUploadSuccess(res.data)
      } else {
        setError(res.error || "Failed to upload file.")
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during upload.")
    } finally {
      setUploading(false)
    }
  }

  // Cancel handler
  const handleCancel = () => {
    uploadTaskRef.current = false
    setUploading(false)
    setProgress(0)
    setError("Upload cancelled by user.")
  }

  // Delete/Clear handler
  const handleDelete = () => {
    setLocalUrl(null)
    setSuccess(false)
    setProgress(0)
    setError(null)
    if (onDelete) {
      onDelete()
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {localUrl ? (
        /* Preview State with logical absolute corner close actions */
        <div className="relative rounded-2xl overflow-hidden border border-border bg-secondary aspect-video flex items-center justify-center group max-w-sm mx-auto">
          {mediaType === "video" ? (
            <div className="size-full flex flex-col items-center justify-center p-4">
              <Video className="size-12 text-primary animate-pulse" />
              <span className="text-[10px] font-bold mt-2">Video Uploaded Successfully</span>
            </div>
          ) : mediaType === "document" || mediaType === "certificate" ? (
            <div className="size-full flex flex-col items-center justify-center p-4">
              <FileText className="size-12 text-primary" />
              <span className="text-[10px] font-bold mt-2">Document / Certificate Preview</span>
              {localUrl.startsWith("http") && (
                <a
                  href={localUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-primary underline mt-1 font-semibold"
                >
                  View Document
                </a>
              )}
            </div>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={localUrl}
              alt="Uploaded file preview"
              className="size-full object-cover"
            />
          )}

          {/* Operation actions: Replace & Delete overlays on hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onButtonClick}
              className="px-3 py-1.5 bg-white text-black font-bold text-[10px] rounded-lg shadow-sm hover:bg-neutral-100 cursor-pointer"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-1.5 bg-red-600 text-white font-bold text-[10px] rounded-lg shadow-sm hover:bg-red-700 cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        /* Drag & Drop Upload Zone */
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-[20px] p-6 text-center transition-all flex flex-col items-center justify-center min-h-[140px] max-w-sm mx-auto cursor-pointer ${
            dragActive
              ? "border-primary bg-primary/5 ring-4 ring-primary/10"
              : "border-border bg-secondary/10 hover:border-primary/45 hover:bg-secondary/20"
          }`}
          onClick={onButtonClick}
        >
          <Upload className={`size-8 mb-2.5 transition-colors ${dragActive ? "text-primary" : "text-muted-foreground"}`} />
          <p className="text-xs font-black text-foreground">Drag & Drop your file here</p>
          <p className="text-[10px] text-muted-foreground mt-1 font-semibold">Or click to browse from device</p>
          <p className="text-[9px] text-muted-foreground mt-2 bg-secondary px-2.5 py-1 rounded-md border border-border">
            {acceptLabel}
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        accept={
          mediaType === "video"
            ? "video/mp4,video/quicktime,video/webm"
            : mediaType === "certificate" || mediaType === "document"
            ? "application/pdf,image/png,image/jpeg,image/jpg"
            : "image/png,image/jpeg,image/jpg,image/webp,image/gif"
        }
        className="hidden"
      />

      {/* Uploading Progress Block */}
      {uploading && (
        <div className="p-3 bg-secondary/40 border border-border rounded-xl space-y-2 max-w-sm mx-auto animate-scale-up">
          <div className="flex justify-between text-[10px] font-bold">
            <span className="flex items-center gap-1.5">
              <Loader2 className="size-3.5 animate-spin text-primary" />
              <span>Uploading resource...</span>
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleCancel}
              className="text-[9px] font-black text-destructive hover:underline cursor-pointer"
            >
              Cancel Upload
            </button>
          </div>
        </div>
      )}

      {/* Feedback Success / Error badges */}
      {success && (
        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-xl flex items-center gap-1.5 max-w-sm mx-auto animate-scale-up">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>Upload complete! Registered securely.</span>
        </div>
      )}

      {error && (
        <div className="p-2.5 bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-bold rounded-xl flex items-center gap-1.5 max-w-sm mx-auto animate-scale-up">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
