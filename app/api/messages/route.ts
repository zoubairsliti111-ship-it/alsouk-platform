import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { fetchConversations, resolveParticipant, sendMessage } from "@/lib/services/messages-service"
import { notifyMessage } from "@/lib/services/notifications-service"

export const dynamic = "force-dynamic"

/** Lists the current user's conversations, most recent first. */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const conversations = await fetchConversations(supabase, user.id)
  return NextResponse.json({ success: true, data: conversations })
}

/** Sends a new message. Body: { receiverId, message, rfqId? } */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { receiverId?: unknown; message?: unknown; rfqId?: unknown }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  if (typeof body.receiverId !== "string" || typeof body.message !== "string") {
    return NextResponse.json({ error: "validation" }, { status: 400 })
  }

  const rfqId = typeof body.rfqId === "string" ? body.rfqId : null

  const result = await sendMessage(supabase, user.id, body.receiverId, body.message, rfqId)
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: result.reason === "validation" ? 400 : 500 })
  }

  // Notify the receiver. Best-effort and non-blocking: a failure here must
  // never turn a successfully-sent message into an error response.
  try {
    const sender = await resolveParticipant(supabase, user.id)
    await notifyMessage(supabase, body.receiverId, sender.name, result.data.message, `/messages/${user.id}`, result.data.id)
  } catch (err) {
    console.error("[api/messages] Failed to send message notification:", err)
  }

  return NextResponse.json({ success: true, data: result.data })
}
