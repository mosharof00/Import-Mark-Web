import { createBrowserClient } from "@supabase/ssr"

import type { Database } from "@/types/database.types"

/**
 * Supabase client for use in Client Components (browser).
 *
 * Reads/writes the auth session from cookies that are kept in sync by the
 * middleware. Only ever uses the public anon/publishable key, so it is safe
 * to run in the browser. Create a fresh client per call.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
