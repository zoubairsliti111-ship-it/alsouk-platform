import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { fetchThread, markThreadRead, resolveParticipant } from "@/lib/services/messages-service"

export const dynamic = "force-dynamic"

/** Loads the full thread with one other participant and marks it as read. */
export async function GET(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId: otherUserId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [messages, participant] = await Promise.all([
    fetchThread(supabase, user.id, otherUserId),
    resolveParticipant(supabase, otherUserId),
  ])

  await markThreadRead(supabase, user.id, otherUserId)

  return NextResponse.json({ success: true, data: { messages, participant } })
}
