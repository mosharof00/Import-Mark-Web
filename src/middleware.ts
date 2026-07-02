import { NextResponse, type NextRequest } from "next/server"

import { updateSession } from "@/lib/supabase/middleware"
import { getUserRole, dashboardPathForRole, ROLE_HOME } from "@/lib/auth/roles"

const AUTH_PATHS = [
  "/login",
  "/signup",
  "/verify-otp",
  "/forgot-password",
  "/reset-password",
  "/set-password",
]

const PUBLIC_PATHS = ["/", "/products"]

const REDIRECT_IF_AUTHED = ["/login", "/signup"]

const ROLE_PREFIXES = Object.entries(ROLE_HOME)

function isPathOrSubpath(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(`${base}/`)
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => isPathOrSubpath(pathname, p))
}

function redirectWith(request: NextRequest, to: string, carry: NextResponse) {
  const res = NextResponse.redirect(new URL(to, request.url))
  carry.cookies.getAll().forEach((cookie) => res.cookies.set(cookie))
  return res
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { response, user } = await updateSession(request)

  const isAuthPath = AUTH_PATHS.some((p) => isPathOrSubpath(pathname, p))
  const isPublic = isPublicPath(pathname)
  const role = getUserRole(user)

  if (!user) {
    if (isAuthPath || isPublic) return response
    return redirectWith(request, "/login", response)
  }

  if (isPublic) return response

  const hasNextRedirect = Boolean(request.nextUrl.searchParams.get("next"))

  if (
    REDIRECT_IF_AUTHED.some((p) => isPathOrSubpath(pathname, p)) &&
    !hasNextRedirect
  ) {
    return redirectWith(request, dashboardPathForRole(role), response)
  }

  for (const [prefixRole, prefix] of ROLE_PREFIXES) {
    if (isPathOrSubpath(pathname, prefix) && role !== prefixRole) {
      const target = role ? dashboardPathForRole(role) : "/login"
      return redirectWith(request, target, response)
    }
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
