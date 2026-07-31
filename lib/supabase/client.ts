import { createBrowserClient } from "@supabase/ssr"

/**
 * Creates a client-side Supabase client for use in Client Components.
 * Resolves Next.js prefixed environment variables at runtime.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ""

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy client so the UI doesn't crash fatally on unconfigured local builds
    console.warn("Supabase is not configured. Returning dummy mock client.")
    return {
      auth: {
        getSession: async () => ({ data: { session: null } }),
        getUser: async () => ({ data: { user: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => {},
        updateUser: async () => ({ data: { user: null }, error: null })
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
            order: () => ({
              then: (cb: any) => cb({ data: [], error: null })
            })
          })
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: null })
          })
        })
      })
    } as any
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
