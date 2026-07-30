import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { KEY_VARS, URL_VARS, firstDefined } from "@/lib/supabase/env"

/**
 * Creates a server-side Supabase client for use in Server Components,
 * Route Handlers, and Server Actions. Correctly awaits next/headers cookies.
 */
export async function createClient() {
  const cookieStore = await cookies()

  const url = firstDefined(URL_VARS).value || ""
  const key = firstDefined(KEY_VARS).value || ""

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
