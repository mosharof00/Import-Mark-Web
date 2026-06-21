import { NextResponse, type NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"

/**
 * Signs the current user out and redirects to the login page. Triggered by the
 * sign-out form (POST) in the top bar so it works without client JavaScript.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  return NextResponse.redirect(new URL("/login", request.url), {
    status: 303,
  })
}
