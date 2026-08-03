import { NextResponse, type NextRequest } from "next/server"
import type { EmailOtpType } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"

function safeNextPath(next: string | null, fallback: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback
  }
  return next
}

/**
 * Handles links from Supabase auth emails (invite, confirm, recovery).
 * Supports:
 *  - PKCE `code` → exchangeCodeForSession
 *  - `token_hash` + `type` → verifyOtp
 *
 * Invite Accept button should link here with:
 *   /auth/confirm?token_hash=...&type=invite&next=/set-password
 *
 * Must stay reachable without a session (see middleware `/auth` allowlist).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const code = searchParams.get("code")

  const defaultNext =
    type === "invite" || type === "signup" ? "/set-password" : "/"
  const next = safeNextPath(searchParams.get("next"), defaultNext)

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  } else if (tokenHash && type) {
    let { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    })

    // Invites occasionally verify under signup depending on project settings.
    if (error && type === "invite") {
      ;({ error } = await supabase.auth.verifyOtp({
        type: "signup",
        token_hash: tokenHash,
      }))
    }

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    if (type === "invite") {
      return NextResponse.redirect(`${origin}/login?error=invite_invalid`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
