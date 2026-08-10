// Server-side messaging logic. All functions take an already-authenticated
// Supabase server client (see lib/supabase/server.ts) so RLS on `messages`
// enforces access — a user can only ever read/write their own conversations.

import type { ConversationSummary, MessageItem, MessageParticipant } from "@/lib/domains/message/types"

type MessageRow = {
  id: string
  sender_id: string | null
  receiver_id: string | null
  rfq_id: string | null
  message: string
  read: boolean | null
  created_at: string | null
}

function mapMessage(row: MessageRow): MessageItem {
  return {
    id: row.id,
    senderId: row.sender_id || "",
    receiverId: row.receiver_id || "",
    message: row.message,
    read: Boolean(row.read),
    createdAt: row.created_at || new Date().toISOString(),
    rfqId: row.rfq_id,
  }
}

/**
 * Resolves how to display the other side of a conversation. Prefers the
 * company they own (this is a B2B marketplace — most conversations are with
 * a company, not a bare individual), falling back to their profile, and
 * finally to a generic placeholder if neither record exists.
 */
export async function resolveParticipant(supabase: any, userId: string): Promise<MessageParticipant> {
  const { data: company } = await supabase
    .from("companies")
    .select("name, slug, logo_url")
    .eq("owner_id", userId)
    .maybeSingle()

  if (company?.name) {
    return {
      userId,
      name: company.name,
      avatarUrl: company.logo_url || null,
      companySlug: company.slug || null,
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", userId)
    .maybeSingle()

  return {
    userId,
    name: profile?.full_name || "ALSOUK User",
    avatarUrl: profile?.avatar_url || null,
    companySlug: null,
  }
}

/** Lists conversations for a user, most recent first, with unread counts. */
export async function fetchConversations(supabase: any, userId: string): Promise<ConversationSummary[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, sender_id, receiver_id, rfq_id, message, read, created_at")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(500)

  if (error || !data) return []

  const byOther = new Map<string, { last: MessageRow; unread: number }>()
  for (const row of data as MessageRow[]) {
    const otherId = row.sender_id === userId ? row.receiver_id : row.sender_id
    if (!otherId) continue
    const isUnreadForMe = row.receiver_id === userId && !row.read
    const existing = byOther.get(otherId)
    if (!existing) {
      byOther.set(otherId, { last: row, unread: isUnreadForMe ? 1 : 0 })
    } else {
      if (isUnreadForMe) existing.unread += 1
    }
  }

  const entries = Array.from(byOther.entries())
  const participants = await Promise.all(entries.map(([otherId]) => resolveParticipant(supabase, otherId)))

  return entries.map(([, { last, unread }], i) => ({
    participant: participants[i],
    lastMessage: last.message,
    lastMessageAt: last.created_at || new Date().toISOString(),
    unreadCount: unread,
  }))
}

/** Full message thread between the current user and one other participant. */
export async function fetchThread(supabase: any, userId: string, otherUserId: string): Promise<MessageItem[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, sender_id, receiver_id, rfq_id, message, read, created_at")
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`,
    )
    .order("created_at", { ascending: true })
    .limit(500)

  if (error || !data) return []
  return (data as MessageRow[]).map(mapMessage)
}

/** Marks all messages from `otherUserId` to the current user as read. */
export async function markThreadRead(supabase: any, userId: string, otherUserId: string): Promise<void> {
  await supabase
    .from("messages")
    .update({ read: true })
    .eq("receiver_id", userId)
    .eq("sender_id", otherUserId)
    .eq("read", false)
}

export type SendMessageResult = { ok: true; data: MessageItem } | { ok: false; reason: "validation" | "error" }

/** Sends a message. `senderId` must match the authenticated user (RLS enforces this too). */
export async function sendMessage(
  supabase: any,
  senderId: string,
  receiverId: string,
  message: string,
  rfqId?: string | null,
): Promise<SendMessageResult> {
  const trimmed = message.trim()
  if (!trimmed || !receiverId) return { ok: false, reason: "validation" }

  const { data, error } = await supabase
    .from("messages")
    .insert({ sender_id: senderId, receiver_id: receiverId, message: trimmed, rfq_id: rfqId || null })
    .select("id, sender_id, receiver_id, rfq_id, message, read, created_at")
    .single()

  if (error || !data) {
    console.error("[messages] Failed to send:", error)
    return { ok: false, reason: "error" }
  }
  return { ok: true, data: mapMessage(data as MessageRow) }
}
