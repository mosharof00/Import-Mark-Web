import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { User } from "@supabase/supabase-js"

import type { Database } from "@/types/database.types"

/**
 * Refreshes the Supabase auth session on every request and returns:
 *  - `response`: a NextResponse carrying any refreshed auth cookies. The root
 *    middleware MUST return this (or copy its cookies onto a redirect) so the
 *    browser receives the updated session.
 *  - `user`: the validated current user (or null), used for route protection.
 *
 * IMPORTANT: do not run any other logic between creating the client and calling
 * `getUser()`, otherwise sessions can intermittently fail to refresh.
 */
export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse
  user: User | null
}> {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { response, user }
}
