"use client"

import { useEffect, useRef, useState } from "react"
import { Eye, Radio, Video, X } from "lucide-react"
import type { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng"
import { createClient } from "@/lib/supabase/client"
import { useLivePresence } from "@/lib/hooks/use-live-presence"

type Company = { id: string; name: string }

type Phase = "setup" | "starting" | "live" | "ending" | "error"

/**
 * Real broadcast flow, launched from Studio only: request camera/mic, show a
 * local preview, start the session server-side (which mints an Agora host
 * token), then publish. No mock viewers, no simulated state — every number
 * shown here is either what the browser reports or what the API returns.
 */
export function LiveBroadcastSheet({ company, onClose }: { company: Company; onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>("setup")
  const [title, setTitle] = useState(`${company.name} Live`)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [previewReady, setPreviewReady] = useState(false)

  const previewRef = useRef<HTMLDivElement>(null)
  const camTrackRef = useRef<ICameraVideoTrack | null>(null)
  const micTrackRef = useRef<IMicrophoneAudioTrack | null>(null)
  const clientRef = useRef<IAgoraRTCClient | null>(null)
  const lastCountWriteRef = useRef(0)

  const viewerCount = useLivePresence(phase === "live" ? sessionId : null, "host")

  // Sync the real presence count back to the row so the home page can show
  // it too, throttled so we don't hammer the DB on every viewer join/leave.
  useEffect(() => {
    if (phase !== "live" || !sessionId) return
    const now = Date.now()
    if (now - lastCountWriteRef.current < 5000) return
    lastCountWriteRef.current = now
    const supabase = createClient()
    supabase.from("live_sessions").update({ viewer_count: viewerCount }).eq("id", sessionId).then(() => {})
  }, [viewerCount, phase, sessionId])

  // Best-effort: if the host closes the tab mid-broadcast instead of tapping
  // "End Live", tell the server so the row doesn't stay marked live forever
  // with nobody actually streaming.
  useEffect(() => {
    if (phase !== "live" || !sessionId) return
    const endBeacon = () => {
      navigator.sendBeacon?.("/api/live/end", new Blob([JSON.stringify({ sessionId })], { type: "application/json" }))
    }
    window.addEventListener("pagehide", endBeacon)
    return () => window.removeEventListener("pagehide", endBeacon)
  }, [phase, sessionId])

  useEffect(() => {
    let active = true
    async function setupPreview() {
      try {
        const { default: AgoraRTC } = await import("agora-rtc-sdk-ng")
        const camTrack = await AgoraRTC.createCameraVideoTrack()
        if (!active) {
          camTrack.close()
          return
        }
        camTrackRef.current = camTrack
        if (previewRef.current) camTrack.play(previewRef.current)
        setPreviewReady(true)
      } catch (err) {
        console.error("[live] Camera preview failed:", err)
        if (active) {
          setErrorMessage("Couldn't access your camera. Check your browser's camera/microphone permissions and try again.")
          setPhase("error")
        }
      }
    }
    setupPreview()
    return () => {
      active = false
    }
  }, [])

  const cleanupMedia = async () => {
    try {
      await clientRef.current?.leave()
    } catch {}
    camTrackRef.current?.close()
    micTrackRef.current?.close()
    camTrackRef.current = null
    micTrackRef.current = null
    clientRef.current = null
  }

  const handleClose = async () => {
    await cleanupMedia()
    onClose()
  }

  const startLive = async () => {
    if (!camTrackRef.current || !title.trim()) return
    setPhase("starting")
    setErrorMessage(null)
    let createdSessionId: string | null = null
    try {
      const res = await fetch("/api/live/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ companyId: company.id, title: title.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMessage(
          data.error === "not_configured"
            ? "Live streaming isn't configured on this deployment yet. Ask an admin to set AGORA_APP_ID / AGORA_APP_CERTIFICATE."
            : data.error === "not_member"
              ? "You don't have permission to broadcast for this company."
              : "Couldn't start the broadcast. Please try again.",
        )
        setPhase("error")
        return
      }
      // The row is already marked "live" server-side at this point — if
      // anything below throws, the catch block must end it so we never leave
      // a live_sessions row claiming to be live with no one actually broadcasting.
      createdSessionId = data.session.id

      const { default: AgoraRTC } = await import("agora-rtc-sdk-ng")
      const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" })
      await client.setClientRole("host")
      await client.join(data.appId, data.channelName, data.token, data.uid)

      const micTrack = await AgoraRTC.createMicrophoneAudioTrack()
      micTrackRef.current = micTrack

      await client.publish([camTrackRef.current, micTrack])
      clientRef.current = client
      setSessionId(createdSessionId)
      setPhase("live")
    } catch (err) {
      console.error("[live] Failed to start broadcast:", err)
      if (createdSessionId) {
        fetch("/api/live/end", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sessionId: createdSessionId }),
        }).catch(() => {})
      }
      setErrorMessage("Couldn't start the broadcast. Please try again.")
      setPhase("error")
    }
  }

  const endLive = async () => {
    if (!sessionId) return
    setPhase("ending")
    try {
      await fetch("/api/live/end", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
    } catch (err) {
      console.error("[live] Failed to end broadcast cleanly:", err)
    }
    await cleanupMedia()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="relative flex-1 overflow-hidden bg-neutral-900">
        <div ref={previewRef} className="size-full [&>div]:!size-full" />

        {phase === "live" && (
          <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 bg-gradient-to-b from-black/70 to-transparent p-4">
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

        {(phase === "setup" || phase === "error") && (
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 start-4 z-10 flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
          >
            <X className="size-4" />
          </button>
        )}

        {phase === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-8 text-center">
            <p className="text-sm font-semibold text-white">{errorMessage}</p>
            <button type="button" onClick={handleClose} className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black">
              Close
            </button>
          </div>
        )}

        {(phase === "starting" || phase === "ending") && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="size-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        )}
      </div>

      <div className="bg-white p-4 pb-6">
        {phase === "live" ? (
          <button
            type="button"
            onClick={endLive}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-black text-white active:scale-[0.99]"
          >
            End Live
          </button>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground">Broadcast title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Factory tour: new olive oil batch"
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-border text-sm"
                disabled={phase !== "setup"}
              />
            </div>
            <button
              type="button"
              onClick={startLive}
              disabled={phase !== "setup" || !previewReady || !title.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-black text-white disabled:opacity-50 active:scale-[0.99]"
            >
              <Video className="size-4" />
              {phase === "starting" ? "Starting..." : "Start Live"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
