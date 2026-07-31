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

    const queryProxyHandler: any = {
      get: (target: any, prop: string) => {
        if (prop === "then") {
          return (cb: any) => Promise.resolve(cb({ data: [], error: null }))
        }
        if (prop === "catch") {
          return () => Promise.resolve()
        }
        if (prop === "single" || prop === "maybeSingle") {
          return async () => ({ data: null, error: null })
        }
        return () => new Proxy({}, queryProxyHandler)
      }
    }

    const mockFrom = {
      select: () => new Proxy({}, queryProxyHandler),
      insert: () => new Proxy({}, queryProxyHandler),
      update: () => new Proxy({}, queryProxyHandler),
      delete: () => new Proxy({}, queryProxyHandler)
    }

    return {
      auth: {
        getSession: async () => ({ data: { session: null } }),
        getUser: async () => ({ data: { user: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => {},
        updateUser: async () => ({ data: { user: null }, error: null })
      },
      storage: {
        from: () => ({
          upload: async () => ({ data: { path: "mock-path" }, error: null }),
          getPublicUrl: () => ({ data: { publicUrl: "/images/placeholder.png" } })
        })
      },
      from: () => mockFrom
    } as any
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
