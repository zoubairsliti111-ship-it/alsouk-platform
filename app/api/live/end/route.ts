import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { endLiveSession } from "@/lib/services/live-service"

export const dynamic = "force-dynamic"

/** Ends a company's live broadcast. Body: { sessionId } */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { sessionId?: unknown }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  if (typeof body.sessionId !== "string") {
    return NextResponse.json({ error: "validation" }, { status: 400 })
  }

  const result = await endLiveSession(supabase, user.id, body.sessionId)
  if (!result.ok) {
    const status = result.reason === "not_member" ? 403 : result.reason === "not_found" ? 404 : 500
    return NextResponse.json({ error: result.reason }, { status })
  }

  return NextResponse.json({ success: true })
}
