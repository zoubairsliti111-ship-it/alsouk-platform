import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getViewerToken } from "@/lib/services/live-service"

export const dynamic = "force-dynamic"

/**
 * Issues a subscribe-only Agora token for watching a live session. Public —
 * anyone can watch a live broadcast, same as browsing a company profile.
 * Only succeeds while the session is actually live, so a stale link honestly
 * reports "not live" instead of handing out a token to nothing.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const result = await getViewerToken(supabase, id)
  if (!result.ok) {
    const status = result.reason === "not_found" ? 404 : result.reason === "not_configured" ? 503 : 409
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
