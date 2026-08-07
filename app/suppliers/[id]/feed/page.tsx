"use client"

import { useEffect, useRef, useState, use } from "react"
import Link from "next/link"
import { ArrowLeft, Building2, ImagePlus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { fetchSupplierById } from "@/lib/supabase/suppliers-service"

type MediaRow = {
  id: string
  media_type: "factory_photo" | "product_gallery" | "video" | "certificate"
  url: string
  caption: string | null
  created_at: string
}

export default function SupplierFeedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [companyName, setCompanyName] = useState<string>("")
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [media, setMedia] = useState<MediaRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      const [supplierRes] = await Promise.all([fetchSupplierById(id)])
      if (!active) return
      if (supplierRes.supplier) {
        setCompanyName(supplierRes.supplier.name)
        setLogoUrl(supplierRes.supplier.logoUrl)
      }
      const supabase = createClient()
      const { data, error } = await supabase
        .from("company_media")
        .select("id,media_type,url,caption,created_at")
        .eq("company_id", id)
        .in("media_type", ["product_gallery", "video", "factory_photo"])
        .order("created_at", { ascending: false })
      if (!active) return
      if (!error && data) setMedia(data as MediaRow[])
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="size-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <div className="absolute inset-x-0 top-0 z-20 flex items-center gap-3 bg-gradient-to-b from-black/70 to-transparent px-4 pb-8 pt-4">
        <Link
          href={`/suppliers/${id}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/30 bg-white/10">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={companyName} className="size-full object-cover" />
            ) : (
              <Building2 className="size-4 text-white" />
            )}
          </div>
          <p className="truncate text-sm font-black text-white">{companyName}</p>
        </div>
      </div>

      {media.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
          <ImagePlus className="size-10 text-white/40" />
          <p className="text-sm text-white/70">This supplier hasn&apos;t shared any photos or videos yet.</p>
        </div>
      ) : (
        <div className="h-full snap-y snap-mandatory overflow-y-scroll">
          {media.map((m) => (
            <FeedItem key={m.id} item={m} companyName={companyName} />
          ))}
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
