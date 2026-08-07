"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Building2, ImagePlus, Radio, Settings, Video as VideoIcon, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"

type Company = {
  id: string
  name: string
  logo_url: string | null
}

type MediaRow = {
  id: string
  media_type: "factory_photo" | "product_gallery" | "video" | "certificate"
  url: string
  caption: string | null
  created_at: string
}

export default function StudioPage() {
  const { user, isLoading: authLoading } = useAuth()

  const [company, setCompany] = useState<Company | null>(null)
  const [loadingCompany, setLoadingCompany] = useState(true)
  const [media, setMedia] = useState<MediaRow[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [showLiveNote, setShowLiveNote] = useState(false)

  useEffect(() => {
    let active = true
    if (authLoading) return
    if (!user) {
      setLoadingCompany(false)
      return
    }
    const supabase = createClient()
    async function loadCompany() {
      const { data: owned } = await supabase
        .from("companies")
        .select("id,name,logo_url")
        .eq("owner_id", user!.id)
        .maybeSingle()
      if (!active) return
      if (owned) {
        setCompany(owned as Company)
        setLoadingCompany(false)
        return
      }
      const { data: membership } = await supabase
        .from("company_members")
        .select("company_id")
        .eq("user_id", user!.id)
        .limit(1)
        .maybeSingle()
      if (!active) return
      if (membership?.company_id) {
        const { data: viaMembership } = await supabase
          .from("companies")
          .select("id,name,logo_url")
          .eq("id", membership.company_id)
          .maybeSingle()
        if (active) setCompany((viaMembership as Company) ?? null)
      }
      if (active) setLoadingCompany(false)
    }
    loadCompany()
    return () => {
      active = false
    }
  }, [user, authLoading])

  const loadMedia = useCallback(async (companyId: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("company_media")
      .select("id,media_type,url,caption,created_at")
      .eq("company_id", companyId)
      .in("media_type", ["product_gallery", "video", "factory_photo"])
      .order("created_at", { ascending: false })
    if (!error && data) setMedia(data as MediaRow[])
  }, [])

  useEffect(() => {
    if (company?.id) loadMedia(company.id)
  }, [company?.id, loadMedia])

  const handleUploadPhoto = async (file: File) => {
    if (!company) return
    setUploadingPhoto(true)
    try {
      const supabase = createClient()
      const ext = file.name.split(".").pop() || "jpg"
      const path = `${company.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from("company-photos")
        .upload(path, file, { cacheControl: "3600", upsert: false })
      if (uploadError) {
        console.error("Error uploading photo:", uploadError)
        return
      }
      const { data: urlData } = supabase.storage.from("company-photos").getPublicUrl(path)
      const { error: insertError } = await supabase.from("company_media").insert({
        company_id: company.id,
        media_type: "product_gallery",
        storage_bucket: "company-photos",
        storage_path: path,
        url: urlData.publicUrl,
        caption: null,
        position: media.length,
      })
      if (!insertError) await loadMedia(company.id)
    } catch (err) {
      console.error("Error uploading photo:", err)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleUploadVideo = async (file: File) => {
    if (!company) return
    setUploadingVideo(true)
    try {
      const supabase = createClient()
      const ext = file.name.split(".").pop() || "mp4"
      const path = `${company.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from("company-videos")
        .upload(path, file, { cacheControl: "3600", upsert: false })
      if (uploadError) {
        console.error("Error uploading video:", uploadError)
        return
      }
      const { data: urlData } = supabase.storage.from("company-videos").getPublicUrl(path)
      const { error: insertError } = await supabase.from("company_media").insert({
        company_id: company.id,
        media_type: "video",
        storage_bucket: "company-videos",
        storage_path: path,
        url: urlData.publicUrl,
        caption: null,
        position: media.length,
      })
      if (!insertError) await loadMedia(company.id)
    } catch (err) {
      console.error("Error uploading video:", err)
    } finally {
      setUploadingVideo(false)
    }
  }

  if (authLoading || loadingCompany) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="size-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    )
  }

  if (!user || !company) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-black px-6 text-center text-white">
        <Building2 className="size-10 text-white/60" />
        <p className="text-sm text-white/80">
          {!user ? "Please sign in to access your studio." : "No company found for this account yet."}
        </p>
        <Link href="/account" className="mt-2 rounded-full bg-white px-5 py-2 text-sm font-bold text-black">
          Go to Account
        </Link>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 bg-gradient-to-b from-black/70 to-transparent px-4 pb-8 pt-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-white/30 bg-white/10">
            {company.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo_url} alt={company.name} className="size-full object-cover" />
            ) : (
              <Building2 className="size-5 text-white" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">{company.name}</p>
            <p className="text-[11px] text-white/70">Welcome back</p>
          </div>
        </div>
        <Link
          href="/account"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
          title="Settings"
        >
          <Settings className="size-4" />
        </Link>
      </div>

      <div className="absolute inset-x-0 top-20 z-20 flex items-center justify-center gap-3 px-4">
        <input
          type="file"
          accept="image/*"
          id="studio-photo-input"
          className="hidden"
          disabled={uploadingPhoto}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleUploadPhoto(f)
            e.target.value = ""
          }}
        />
        <label
          htmlFor="studio-photo-input"
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white/15 px-3 py-2.5 text-xs font-bold text-white backdrop-blur ${
            uploadingPhoto ? "opacity-50" : "cursor-pointer active:scale-95"
          }`}
        >
          <ImagePlus className="size-4" />
          {uploadingPhoto ? "..." : "Photo"}
        </label>

        <input
          type="file"
          accept="video/*"
          id="studio-video-input"
          className="hidden"
          disabled={uploadingVideo}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleUploadVideo(f)
            e.target.value = ""
          }}
        />
        <label
          htmlFor="studio-video-input"
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white/15 px-3 py-2.5 text-xs font-bold text-white backdrop-blur ${
            uploadingVideo ? "opacity-50" : "cursor-pointer active:scale-95"
          }`}
        >
          <VideoIcon className="size-4" />
          {uploadingVideo ? "..." : "Video"}
        </label>

        <button
          type="button"
          onClick={() => setShowLiveNote(true)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-red-500/90 px-3 py-2.5 text-xs font-bold text-white backdrop-blur active:scale-95"
        >
          <Radio className="size-4" />
          Live
        </button>
      </div>

      {media.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
          <ImagePlus className="size-10 text-white/40" />
          <p className="text-sm text-white/70">No photos or videos yet — tap Photo or Video above to add your first one.</p>
        </div>
      ) : (
        <div className="h-full snap-y snap-mandatory overflow-y-scroll">
          {media.map((m) => (
            <FeedItem key={m.id} item={m} companyName={company.name} />
          ))}
        </div>
      )}

      {showLiveNote && (
        <div className="absolute inset-x-4 bottom-6 z-30 flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-2xl">
          <p className="text-xs font-semibold text-foreground">
            Live streaming isn&apos;t available yet — we&apos;re building it. Stay tuned!
          </p>
          <button
            type="button"
            onClick={() => setShowLiveNote(false)}
            className="shrink-0 rounded-full bg-secondary p-1.5"
          >
            <X className="size-4 text-foreground" />
          </button>
        </div>
      )}
    </div>
  )
}

function FeedItem({ item, companyName }: { item: MediaRow; companyName: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {})
        } else {
          el.pause()
        }
      },
      { threshold: 0.6 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative flex h-screen w-full snap-start items-center justify-center">
      {item.media_type === "video" ? (
        <video
          ref={videoRef}
          src={item.url}
          muted
          loop
          playsInline
          controls
          className="h-full w-full object-contain"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.url} alt={item.caption ?? companyName} className="h-full w-full object-contain" />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pb-10">
        <p className="text-sm font-bold text-white">{companyName}</p>
        {item.caption && <p className="mt-1 text-xs text-white/85">{item.caption}</p>}
      </div>
    </div>
  )
}
