import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { startLiveSession } from "@/lib/services/live-service"

export const dynamic = "force-dynamic"

/** Starts a company's live broadcast. Body: { companyId, title } */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { companyId?: unknown; title?: unknown }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  if (typeof body.companyId !== "string" || typeof body.title !== "string") {
    return NextResponse.json({ error: "validation" }, { status: 400 })
  }

  const result = await startLiveSession(supabase, user.id, body.companyId, body.title)
  if (!result.ok) {
    const status = result.reason === "not_member" ? 403 : result.reason === "validation" ? 400 : result.reason === "not_configured" ? 503 : 500
    return NextResponse.json({ error: result.reason }, { status })
  }

  return NextResponse.json({
    success: true,
    session: result.session,
    appId: result.appId,
    token: result.token,
    uid: result.uid,
    channelName: result.session.agora_channel_name,
  })
}
