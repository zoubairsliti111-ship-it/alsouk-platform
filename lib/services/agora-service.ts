// Server-only Agora RTC token minting. AGORA_APP_ID / AGORA_APP_CERTIFICATE
// are read from process.env at call time (never NEXT_PUBLIC_-prefixed, never
// inlined) so the App Certificate can't leak into the browser bundle. The
// App ID is handed to the client only inside an API response, not baked into
// build output.

import { RtcRole, RtcTokenBuilder } from "agora-token"

const TOKEN_TTL_SECONDS = 60 * 60 // 1 hour; the client re-requests before this lapses.

/** Fixed uid reserved for the company's broadcaster — one host per channel. */
export const AGORA_HOST_UID = 1

type AgoraToken = { appId: string; token: string; uid: number }

function getCredentials(): { appId: string; appCertificate: string } | null {
  const appId = process.env.AGORA_APP_ID?.trim()
  const appCertificate = process.env.AGORA_APP_CERTIFICATE?.trim()
  if (!appId || !appCertificate) return null
  return { appId, appCertificate }
}

/** True when the server has Agora credentials configured. */
export function isAgoraConfigured(): boolean {
  return getCredentials() !== null
}

/** Publisher token for the company running the broadcast. */
export function buildHostToken(channelName: string): AgoraToken | null {
  const creds = getCredentials()
  if (!creds) return null
  const token = RtcTokenBuilder.buildTokenWithUid(
    creds.appId,
    creds.appCertificate,
    channelName,
    AGORA_HOST_UID,
    RtcRole.PUBLISHER,
    TOKEN_TTL_SECONDS,
    TOKEN_TTL_SECONDS,
  )
  return { appId: creds.appId, token, uid: AGORA_HOST_UID }
}

/** Subscribe-only token for a viewer; each request gets a fresh random uid. */
export function buildViewerToken(channelName: string): AgoraToken | null {
  const creds = getCredentials()
  if (!creds) return null
  const uid = Math.floor(Math.random() * 2_000_000_000) + 2 // avoid colliding with AGORA_HOST_UID
  const token = RtcTokenBuilder.buildTokenWithUid(
    creds.appId,
    creds.appCertificate,
    channelName,
    uid,
    RtcRole.SUBSCRIBER,
    TOKEN_TTL_SECONDS,
    TOKEN_TTL_SECONDS,
  )
  return { appId: creds.appId, token, uid }
}
