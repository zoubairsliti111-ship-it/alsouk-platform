import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Reads a required public Supabase environment variable.
 *
 * `NEXT_PUBLIC_*` variables are statically inlined by Next.js, so each variable
 * must be referenced by its literal name rather than looked up dynamically.
 * When a variable is missing we throw a descriptive error instead of silently
 * passing `undefined` into `createClient`, which otherwise fails later with an
 * opaque message (or leaves a broken client that swallows every request).
 */
function requirePublicEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". ` +
        "Set it in your environment (e.g. .env.local) before using the Supabase client.",
    );
  }
  return value;
}

let client: SupabaseClient | null = null;

/**
 * Returns a lazily-initialized Supabase client.
 *
 * Initialization is deferred until first use so that a misconfigured
 * environment surfaces a clear error at the call site (and does not break
 * static builds where the client is never actually invoked).
 */
export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    const url = requirePublicEnv(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    );
    const key = requirePublicEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    );
    client = createClient(url, key);
  }
  return client;
}
