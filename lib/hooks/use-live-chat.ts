"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"

export type LiveChatMessage = {
  id: string
  senderId: string
  message: string
  createdAt: string
  authorName: string
  authorAvatar: string | null
}

type ProfileInfo = { full_name: string | null; avatar_url: string | null }
type MessageRow = { id: string; sender_id: string; message: string; created_at: string }

const MESSAGE_MAX_LENGTH = 500
const HISTORY_LIMIT = 50

/**
 * Live chat for a broadcast session — chronological only, no moderation, no
 * reactions, no threading. History loads once; new messages arrive purely
 * via Supabase Realtime postgres_changes (no polling). Sender names/avatars
 * are resolved lazily and cached per session, not joined server-side, since
 * postgres_changes payloads only carry the raw row.
 */
export function useLiveChat(sessionId: string | null) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<LiveChatMessage[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const profileCache = useRef<Record<string, ProfileInfo>>({})

  const resolveAuthor = useCallback(async (supabase: ReturnType<typeof createClient>, senderId: string): Promise<ProfileInfo> => {
    if (profileCache.current[senderId]) return profileCache.current[senderId]
    const { data } = await supabase.from("public_profiles_view").select("full_name,avatar_url").eq("id", senderId).maybeSingle()
    const info: ProfileInfo = { full_name: data?.full_name ?? null, avatar_url: data?.avatar_url ?? null }
    profileCache.current[senderId] = info
    return info
  }, [])

  const toChatMessage = useCallback(
    (row: MessageRow, author: ProfileInfo): LiveChatMessage => ({
      id: row.id,
      senderId: row.sender_id,
      message: row.message,
      createdAt: row.created_at,
      authorName: row.sender_id === user?.id ? "You" : author.full_name || "Viewer",
      authorAvatar: author.avatar_url,
    }),
    [user?.id],
  )

  useEffect(() => {
    if (!sessionId) return
    let active = true
    const supabase = createClient()

    async function loadHistory() {
      const { data } = await supabase
        .from("live_session_messages")
        .select("id,sender_id,message,created_at")
        .eq("session_id", sessionId as string)
        .order("created_at", { ascending: true })
        .limit(HISTORY_LIMIT)
      if (!active || !data) return
      const rows = data as MessageRow[]
      const senderIds = Array.from(new Set(rows.map((m) => m.sender_id)))
      await Promise.all(senderIds.map((id) => resolveAuthor(supabase, id)))
      if (!active) return
      setMessages(rows.map((row) => toChatMessage(row, profileCache.current[row.sender_id] ?? { full_name: null, avatar_url: null })))
    }
    loadHistory()

    const channel = supabase
      .channel(`live-chat-${sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_session_messages", filter: `session_id=eq.${sessionId}` },
        async (payload: { new: MessageRow }) => {
          if (!active) return
          const row = payload.new
          const author = await resolveAuthor(supabase, row.sender_id)
          if (!active) return
          setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, toChatMessage(row, author)]))
        },
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [sessionId, resolveAuthor, toChatMessage])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!sessionId || !user || !trimmed) return
      if (trimmed.length > MESSAGE_MAX_LENGTH) {
        setError(`Message is too long (max ${MESSAGE_MAX_LENGTH} characters).`)
        return
      }
      setSending(true)
      setError(null)
      const supabase = createClient()
      const { error: insertError } = await supabase
        .from("live_session_messages")
        .insert({ session_id: sessionId, sender_id: user.id, message: trimmed })
      if (insertError) setError(insertError.message)
      setSending(false)
    },
    [sessionId, user],
  )

  return { messages, sendMessage, sending, error }
}
