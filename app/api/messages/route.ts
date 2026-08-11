import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { fetchConversations, sendMessage } from "@/lib/services/messages-service"

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
  return NextResponse.json({ success: true, data: result.data })
}
