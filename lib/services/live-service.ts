// Server-side live-session logic. Functions take an already-authenticated
// Supabase server client (see lib/supabase/server.ts) so RLS on
// `live_sessions` / `companies` / `company_members` enforces access — the
// same pattern as lib/services/messages-service.ts.

import { AGORA_HOST_UID, buildHostToken, buildViewerToken, isAgoraConfigured } from "@/lib/services/agora-service"

export type LiveSessionRow = {
  id: string
  company_id: string
  title: string
  status: "upcoming" | "live" | "ended"
  agora_channel_name: string | null
  started_at: string | null
  ended_at: string | null
  viewer_count: number
}

/** True when `userId` owns or is a member of `companyId`. Mirrors public.is_company_member(). */
export async function isCompanyMember(supabase: any, companyId: string, userId: string): Promise<boolean> {
  const { data: owned } = await supabase
    .from("companies")
    .select("id")
    .eq("id", companyId)
    .eq("owner_id", userId)
    .maybeSingle()
  if (owned) return true

  const { data: member } = await supabase
    .from("company_members")
    .select("id")
    .eq("company_id", companyId)
    .eq("user_id", userId)
    .maybeSingle()
  return Boolean(member)
}

function randomChannelName(companyId: string): string {
  return `live-${companyId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export type StartLiveResult =
  | { ok: true; session: LiveSessionRow; appId: string; token: string; uid: number }
  | { ok: false; reason: "validation" | "not_member" | "not_configured" | "error" }

/** Starts (or resumes) a company's live broadcast. Idempotent: re-calling while already live returns the same channel/token. */
export async function startLiveSession(
  supabase: any,
  userId: string,
  companyId: string,
  title: string,
): Promise<StartLiveResult> {
  const trimmedTitle = title?.trim()
  if (!companyId || !trimmedTitle) return { ok: false, reason: "validation" }

  if (!(await isCompanyMember(supabase, companyId, userId))) {
    return { ok: false, reason: "not_member" }
  }

  if (!isAgoraConfigured()) {
    console.error("[live-service] AGORA_APP_ID / AGORA_APP_CERTIFICATE not configured.")
    return { ok: false, reason: "not_configured" }
  }

  const { data: existing } = await supabase
    .from("live_sessions")
    .select("id,company_id,title,status,agora_channel_name,started_at,ended_at,viewer_count")
    .eq("company_id", companyId)
    .eq("status", "live")
    .maybeSingle()

  let session: LiveSessionRow

  if (existing?.agora_channel_name) {
    session = existing as LiveSessionRow
  } else {
    const { data, error } = await supabase
      .from("live_sessions")
      .insert({
        company_id: companyId,
        created_by: userId,
        title: trimmedTitle,
        status: "live",
        agora_channel_name: randomChannelName(companyId),
        started_at: new Date().toISOString(),
      })
      .select("id,company_id,title,status,agora_channel_name,started_at,ended_at,viewer_count")
      .single()

    if (error || !data) {
      console.error("[live-service] Failed to create live session:", error)
      return { ok: false, reason: "error" }
    }
    session = data as LiveSessionRow
  }

  const hostToken = buildHostToken(session.agora_channel_name as string)
  if (!hostToken) return { ok: false, reason: "not_configured" }

  return { ok: true, session, appId: hostToken.appId, token: hostToken.token, uid: hostToken.uid }
}

export type EndLiveResult = { ok: true } | { ok: false; reason: "not_found" | "not_member" | "error" }

/** Ends a company's live broadcast. Idempotent: ending an already-ended session succeeds without a write. */
export async function endLiveSession(supabase: any, userId: string, sessionId: string): Promise<EndLiveResult> {
  const { data: session } = await supabase
    .from("live_sessions")
    .select("id,company_id,status")
    .eq("id", sessionId)
    .maybeSingle()

  if (!session) return { ok: false, reason: "not_found" }
  if (!(await isCompanyMember(supabase, session.company_id, userId))) {
    return { ok: false, reason: "not_member" }
  }
  if (session.status !== "live") return { ok: true }

  const { error } = await supabase
    .from("live_sessions")
    .update({ status: "ended", ended_at: new Date().toISOString() })
    .eq("id", sessionId)

  if (error) {
    console.error("[live-service] Failed to end live session:", error)
    return { ok: false, reason: "error" }
  }
  return { ok: true }
}

export type ViewerTokenResult =
  | { ok: true; session: LiveSessionRow; appId: string; token: string; uid: number }
  | { ok: false; reason: "not_found" | "not_live" | "not_configured" }

/** Issues a subscribe-only Agora token for a session that must currently be live. */
export async function getViewerToken(supabase: any, sessionId: string): Promise<ViewerTokenResult> {
  const { data: session } = await supabase
    .from("live_sessions")
    .select("id,company_id,title,status,agora_channel_name,started_at,ended_at,viewer_count")
    .eq("id", sessionId)
    .maybeSingle()

  if (!session) return { ok: false, reason: "not_found" }
  if (session.status !== "live" || !session.agora_channel_name) return { ok: false, reason: "not_live" }

  const viewerToken = buildViewerToken(session.agora_channel_name)
  if (!viewerToken) return { ok: false, reason: "not_configured" }

  return { ok: true, session: session as LiveSessionRow, appId: viewerToken.appId, token: viewerToken.token, uid: viewerToken.uid }
}

export { AGORA_HOST_UID }
