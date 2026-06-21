import { NextResponse, type NextRequest } from "next/server"

import { updateSession } from "@/lib/supabase/middleware"
import { getUserRole, dashboardPathForRole, ROLE_HOME } from "@/lib/auth/roles"

// Public auth pages that an unauthenticated user is allowed to visit.
const AUTH_PATHS = [
  "/login",
  "/signup",
  "/verify-otp",
  "/forgot-password",
  "/reset-password",
  "/set-password",
]

// Already-signed-in users should be bounced away from these to their dashboard.
// (reset-password / set-password are excluded because they need a live session.)
const REDIRECT_IF_AUTHED = ["/login", "/signup"]

// Maps a role to the path prefix that only that role may access.
const ROLE_PREFIXES = Object.entries(ROLE_HOME) // e.g. [["admin","/admin"], ...]

function isPathOrSubpath(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(`${base}/`)
}

/** Builds a redirect response that preserves any refreshed auth cookies. */
function redirectWith(request: NextRequest, to: string, carry: NextResponse) {
  const res = NextResponse.redirect(new URL(to, request.url))
  carry.cookies.getAll().forEach((cookie) => res.cookies.set(cookie))
  return res
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always refresh the session first; `response` carries updated cookies.
  const { response, user } = await updateSession(request)

  const isAuthPath = AUTH_PATHS.some((p) => isPathOrSubpath(pathname, p))
  const role = getUserRole(user)

  // --- Not signed in ---------------------------------------------------------
  if (!user) {
    // Allow auth pages; send everything else to login.
    if (isAuthPath) return response
    return redirectWith(request, "/login", response)
  }

  // --- Signed in -------------------------------------------------------------
  // Bounce away from login/signup to the right dashboard.
  if (REDIRECT_IF_AUTHED.some((p) => isPathOrSubpath(pathname, p))) {
    return redirectWith(request, dashboardPathForRole(role), response)
  }

  // Enforce role-scoped sections (UX guard; RLS is the real boundary).
  for (const [prefixRole, prefix] of ROLE_PREFIXES) {
    if (isPathOrSubpath(pathname, prefix) && role !== prefixRole) {
      const target = role ? dashboardPathForRole(role) : "/login"
      return redirectWith(request, target, response)
    }
  }

  return response
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
