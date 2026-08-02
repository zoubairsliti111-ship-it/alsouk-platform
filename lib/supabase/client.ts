import { createBrowserClient } from "@supabase/ssr"

let browserClient: any = null

/**
 * Creates a client-side Supabase client for use in Client Components.
 * Resolves Next.js prefixed environment variables at runtime.
 * Memoizes the client instance in the browser to share auth state and subscriptions.
 */
export function createClient() {
  if (typeof window !== "undefined" && browserClient) {
    return browserClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ""

  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY). Please configure these environment variables in your production environment."
      )
    }

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

    const mockClient = {
      auth: {
        signUp: async () => ({ data: { user: null, session: null }, error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
        signOut: async () => ({ error: null }),
        getUser: async () => ({ data: { user: { id: "mock-user-123", created_at: "2026-01-01T00:00:00Z", email: "export@medinaolive.tn", user_metadata: { full_name: "Sfax Olive Export", account_type: "supplier", country: "tn", city: "sfax" } } }, error: null }),
        getSession: async () => ({ data: { session: { user: { id: "mock-user-123", created_at: "2026-01-01T00:00:00Z", email: "export@medinaolive.tn", user_metadata: { full_name: "Sfax Olive Export", account_type: "supplier", country: "tn", city: "sfax" } } } }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        resetPasswordForEmail: async () => ({ error: null }),
        updateUser: async () => ({ data: { user: { id: "mock-user-123", created_at: "2026-01-01T00:00:00Z", email: "export@medinaolive.tn", user_metadata: { full_name: "Sfax Olive Export", account_type: "supplier", country: "tn", city: "sfax" } } }, error: null })
      },
      storage: {
        from: () => ({
          upload: async () => ({ data: { path: "mock-path" }, error: null }),
          getPublicUrl: () => ({ data: { publicUrl: "/images/placeholder.png" } })
        })
      },
      from: () => mockFrom
    } as any

    return mockClient
  }

  const client = createBrowserClient(supabaseUrl, supabaseAnonKey)

  if (typeof window !== "undefined") {
    browserClient = client
  }

  return client
}

/**
 * True when the public Supabase env vars are present (client can be built).
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  )
}

/**
 * Browser-side Supabase client used for authenticated reads/writes.
 * Re-exported for backward compatibility and a single source of truth.
 */
export function getSupabaseBrowserClient() {
  return createClient()
}
