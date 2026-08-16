import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { KEY_VARS, URL_VARS, SERVICE_KEY_VARS, firstDefined } from "@/lib/supabase/env"

/**
 * Checks `admin_users` directly via PostgREST using the service-role key.
 * The table has zero RLS policies, so this is the only way to read it —
 * Edge-safe since it's a plain fetch, mirroring lib/supabase/rest.ts.
 */
async function isAdmin(userId: string): Promise<boolean> {
  const url = firstDefined(URL_VARS).value
  const key = firstDefined(SERVICE_KEY_VARS).value
  if (!url || !key) return false

  try {
    const res = await fetch(
      `${url}/rest/v1/admin_users?select=id&id=eq.${encodeURIComponent(userId)}&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" },
    )
    if (!res.ok) return false
    const rows = await res.json()
    return Array.isArray(rows) && rows.length > 0
  } catch {
    return false
  }
}

/**
 * Restores and refreshes the Supabase Auth session for incoming requests.
 * Uses middleware-friendly cookies from Request/Response.
 */
export async function updateSession(request: NextRequest) {
  // TEMPORARY diagnostic for the /admin "Access denied" investigation —
  // reveals only booleans/lengths, never secret values. Removed once the
  // root cause is confirmed.
  if (request.nextUrl.pathname === "/api/_diag/edge-env") {
    const serviceKeyVar = firstDefined(SERVICE_KEY_VARS)
    const urlVar = firstDefined(URL_VARS)
    const diag: Record<string, unknown> = {
      hasUrl: Boolean(urlVar.value),
      urlVarName: urlVar.name || null,
      hasServiceKey: Boolean(serviceKeyVar.value),
      serviceKeyVarName: serviceKeyVar.name || null,
      serviceKeyLength: serviceKeyVar.value?.length || 0,
    }
    if (urlVar.value && serviceKeyVar.value) {
      try {
        const res = await fetch(
          `${urlVar.value}/rest/v1/admin_users?select=id&id=eq.72e7437b-6251-4fa9-83ec-9afac9b5890d&limit=1`,
          { headers: { apikey: serviceKeyVar.value, Authorization: `Bearer ${serviceKeyVar.value}` }, cache: "no-store" },
        )
        diag.probeStatus = res.status
        diag.probeOk = res.ok
        diag.probeBody = await res.text()
      } catch (e: any) {
        diag.probeError = String(e?.message || e)
      }
    }
    return NextResponse.json(diag)
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const url = firstDefined(URL_VARS).value
  const key = firstDefined(KEY_VARS).value

  if (!url || !key) {
    // If not configured, proceed transparently
    return response
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  // IMPORTANT: DO NOT remove/change other headers.
  // Refresh the session by calling getUser().
  const { data } = await supabase.auth.getUser()
  const user = data?.user

  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (!(await isAdmin(user.id))) {
      return new NextResponse("Access denied.", { status: 403 })
    }
  }

  return response
}
