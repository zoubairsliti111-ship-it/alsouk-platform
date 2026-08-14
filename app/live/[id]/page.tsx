"use client"

import { use, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Building2, Eye, Radio, Send, VideoOff } from "lucide-react"
import type { IAgoraRTCClient, IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { useLivePresence } from "@/lib/hooks/use-live-presence"
import { useLiveChat } from "@/lib/hooks/use-live-chat"

type Company = { name: string; slug: string; logo_url: string | null }

type SessionRow = {
  id: string
  title: string
  status: "upcoming" | "live" | "ended"
  scheduled_at: string | null
  started_at: string | null
  ended_at: string | null
  replay_url: string | null
  agora_channel_name: string | null
  company: Company | Company[] | null
}

type Session = {
  id: string
  title: string
  status: "upcoming" | "live" | "ended"
  scheduledAt: string | null
  replayUrl: string | null
  company: Company
}

export default function LiveViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()

  const [session, setSession] = useState<Session | null | undefined>(undefined) // undefined = loading, null = not found
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)
  const [remoteJoined, setRemoteJoined] = useState(false)
  const [chatInput, setChatInput] = useState("")

  const videoContainerRef = useRef<HTMLDivElement>(null)
  const clientRef = useRef<IAgoraRTCClient | null>(null)
  const chatListRef = useRef<HTMLDivElement>(null)

  const viewerCount = useLivePresence(session?.status === "live" ? session.id : null, "viewer")
  const { messages: chatMessages, sendMessage, sending: sendingMessage, error: chatError } = useLiveChat(session?.status === "live" ? session.id : null)

  useEffect(() => {
    if (chatListRef.current) chatListRef.current.scrollTop = chatListRef.current.scrollHeight
  }, [chatMessages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    const text = chatInput
    if (!text.trim()) return
    setChatInput("")
    sendMessage(text)
  }

  // Load the session row (public read — same as the home page carousels).
  useEffect(() => {
    let active = true
    const supabase = createClient()
    supabase
      .from("live_sessions")
      .select("id,title,status,scheduled_at,started_at,ended_at,replay_url,agora_channel_name,company:companies!inner(name,slug,logo_url)")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }: { data: SessionRow | null; error: unknown }) => {
        if (!active) return
        if (error || !data) {
          setSession(null)
          return
        }
        const company = Array.isArray(data.company) ? data.company[0] : data.company
        if (!company) {
          setSession(null)
          return
        }
        setSession({
          id: data.id,
          title: data.title,
          status: data.status,
          scheduledAt: data.scheduled_at,
          replayUrl: data.replay_url,
          company,
        })
      })
    return () => {
      active = false
    }
  }, [id])

  // Poll for a status change (host ended the stream) while we're watching.
  useEffect(() => {
    if (session?.status !== "live") return
    const supabase = createClient()
    const interval = setInterval(() => {
      supabase
        .from("live_sessions")
        .select("status")
        .eq("id", id)
        .maybeSingle()
        .then(({ data }: { data: { status: "upcoming" | "live" | "ended" } | null }) => {
          if (data && data.status !== "live") {
            setSession((prev) => (prev ? { ...prev, status: data.status } : prev))
          }
        })
    }, 15000)
    return () => clearInterval(interval)
  }, [session?.status, id])

  // Join the Agora channel as an audience member while the session is live.
  useEffect(() => {
    if (session?.status !== "live") return
    let active = true
    let client: IAgoraRTCClient | null = null

    async function connect() {
      setConnecting(true)
      setConnectError(null)
      try {
        const res = await fetch(`/api/live/${id}/token`)
        const data = await res.json()
        if (!res.ok || !active) {
          if (active) {
            if (data.error === "not_live") {
              setSession((prev) => (prev ? { ...prev, status: "ended" } : prev))
            } else {
              setConnectError("Couldn't connect to this broadcast.")
            }
          }
          return
        }

        const { default: AgoraRTC } = await import("agora-rtc-sdk-ng")
        client = AgoraRTC.createClient({ mode: "live", codec: "vp8" })
        clientRef.current = client
        await client.setClientRole("audience")

        client.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
          if (!client) return
          await client.subscribe(user, mediaType)
          if (!active) return
          if (mediaType === "video" && videoContainerRef.current) {
            user.videoTrack?.play(videoContainerRef.current)
            setRemoteJoined(true)
          }
          if (mediaType === "audio") {
            user.audioTrack?.play()
          }
        })

        client.on("user-unpublished", () => {
          if (active) setRemoteJoined(false)
        })

        client.on("user-left", () => {
          if (active) {
            setRemoteJoined(false)
            setSession((prev) => (prev ? { ...prev, status: "ended" } : prev))
          }
        })

        await client.join(data.appId, data.channelName, data.token, data.uid)
      } catch (err) {
        console.error("[live] Failed to join broadcast:", err)
        if (active) setConnectError("Couldn't connect to this broadcast.")
      } finally {
        if (active) setConnecting(false)
      }
    }

    connect()

    return () => {
      active = false
      client?.leave().catch(() => {})
      clientRef.current = null
      setRemoteJoined(false)
    }
  }, [session?.status, id])

  return (
    <div className="relative flex h-screen w-full flex-col bg-black">
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={session?.company ? `/companies/${session.company.slug}` : "/"}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
          >
            <ArrowLeft className="size-4" />
          </Link>
          {session && (
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">{session.company.name}</p>
              <p className="truncate text-[11px] text-white/70">{session.title}</p>
            </div>
          )}
        </div>
        {session?.status === "live" && (
          <div className="flex shrink-0 items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EF4444] px-2.5 py-1 text-[10px] font-black text-white">
              <Radio className="size-3" />
              LIVE
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
              <Eye className="size-3" />
              {viewerCount}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center overflow-hidden">
        {session === undefined ? (
          <div className="size-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : session === null ? (
          <EmptyState icon={<VideoOff className="size-8 text-white/50" />} title="Live session not found" body="This link may be broken or the broadcast may have been removed." />
        ) : session.status === "live" ? (
          <>
            <div ref={videoContainerRef} className="size-full [&>div]:!size-full" />
            {(connecting || !remoteJoined) && !connectError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black">
                <div className="size-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <p className="text-xs text-white/70">Connecting to the broadcast…</p>
              </div>
            )}
            {connectError && (
              <EmptyState icon={<VideoOff className="size-8 text-white/50" />} title="Connection failed" body={connectError} />
            )}
          </>
        ) : session.status === "ended" && session.replayUrl ? (
          <video src={session.replayUrl} controls autoPlay className="max-h-full max-w-full" />
        ) : session.status === "ended" ? (
          <EmptyState
            icon={<VideoOff className="size-8 text-white/50" />}
            title="This broadcast has ended"
            body="There's no replay available for this session yet."
            company={session.company}
          />
        ) : (
          <EmptyState
            icon={<Building2 className="size-8 text-white/50" />}
            title="This broadcast hasn't started yet"
            body={session.scheduledAt ? `Scheduled for ${new Date(session.scheduledAt).toLocaleString()}.` : "Check back soon."}
            company={session.company}
          />
        )}
      </div>

      {session?.status === "live" && (
        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col">
          <div
            ref={chatListRef}
            className="flex max-h-[35vh] flex-col gap-1.5 overflow-y-auto px-4 pb-2 [mask-image:linear-gradient(to_top,black_85%,transparent)]"
          >
            {chatMessages.map((m) => (
              <p key={m.id} className="text-xs text-white drop-shadow-sm">
                <span className="font-bold">{m.authorName}</span>
                <span className="text-white/90">: {m.message}</span>
              </p>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent p-4 pt-2">
            {user ? (
              <>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Say something..."
                  maxLength={500}
                  className="flex-1 rounded-full bg-white/15 px-4 py-2.5 text-sm text-white placeholder:text-white/50 backdrop-blur focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sendingMessage || !chatInput.trim()}
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-black disabled:opacity-50"
                >
                  <Send className="size-4" />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex-1 rounded-full bg-white/15 px-4 py-2.5 text-center text-xs font-bold text-white backdrop-blur"
              >
                Log in to chat
              </Link>
            )}
          </form>
          {chatError && <p className="px-4 pb-2 text-[11px] text-red-400">{chatError}</p>}
        </div>
      )}
    </div>
  )
}

function EmptyState({
  icon,
  title,
  body,
  company,
}: {
  icon: React.ReactNode
  title: string
  body: string
  company?: Company
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-8 text-center">
      {icon}
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="text-xs text-white/60">{body}</p>
      {company && (
        <Link href={`/companies/${company.slug}`} className="mt-2 rounded-full bg-white px-5 py-2 text-sm font-bold text-black">
          Visit {company.name}
        </Link>
      )}
    </div>
  )
}
