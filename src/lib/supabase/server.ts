import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import type { Database } from "@/types/database.types"

/**
 * Supabase client for use in Server Components, Server Actions, and Route
 * Handlers.
 *
 * It reads the auth session from the request cookies (via next/headers) and
 * can refresh those cookies during Server Actions / Route Handlers. When called
 * from a Server Component, writing cookies is not allowed, so `setAll` is
 * wrapped in a try/catch — the middleware is responsible for refreshing the
 * session in that case.
 *
 * Always call `supabase.auth.getUser()` (not `getSession()`) on the server:
 * `getUser()` revalidates the token with the Supabase Auth server.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
            // Called from a Server Component, where cookies cannot be set.
            // Safe to ignore because middleware refreshes the session.
          }
        },
      },
    }
  )
}
