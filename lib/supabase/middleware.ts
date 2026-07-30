import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { KEY_VARS, URL_VARS, firstDefined } from "@/lib/supabase/env"

/**
 * Restores and refreshes the Supabase Auth session for incoming requests.
 * Uses middleware-friendly cookies from Request/Response.
 */
export async function updateSession(request: NextRequest) {
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
  await supabase.auth.getUser()

  return response
}
