"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type PresenceMeta = { role: "host" | "viewer" }

/**
 * Real viewer count for a live session via Supabase Realtime Presence — no
 * fake numbers, no polling. Every tab watching (or hosting) the session
 * tracks itself in the same presence channel; the count is however many
 * distinct "viewer" keys are currently present, synced instantly to everyone
 * in the channel.
 */
export function useLivePresence(sessionId: string | null, role: "host" | "viewer") {
  const [viewerCount, setViewerCount] = useState(0)

  useEffect(() => {
    if (!sessionId) return
    let active = true
    const supabase = createClient()
    const presenceKey = `${role}-${Math.random().toString(36).slice(2)}`
    const channel = supabase.channel(`live-presence-${sessionId}`, {
      config: { presence: { key: presenceKey } },
    })

    channel
      .on("presence", { event: "sync" }, () => {
        if (!active) return
        const state = channel.presenceState() as Record<string, PresenceMeta[]>
        let count = 0
        for (const presences of Object.values(state)) {
          for (const p of presences) {
            if (p.role === "viewer") count += 1
          }
        }
        setViewerCount(count)
      })
      .subscribe(async (status: string) => {
        if (status === "SUBSCRIBED" && active) {
          await channel.track({ role } satisfies PresenceMeta)
        }
      })

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [sessionId, role])

  return viewerCount
}
