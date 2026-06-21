import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getUserRole, type UserRole } from "@/lib/auth/roles"

/**
 * Returns the current authenticated user and their role, or null if not signed
 * in. Use this in Server Components / Server Actions when you want to read the
 * user without forcing a redirect.
 */
export async function getAuthedUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { user, role: getUserRole(user) }
}

/**
 * Guards a Server Component: ensures the visitor is signed in AND (optionally)
 * has one of the allowed roles. Redirects to /login when not signed in, or to
 * /unauthorized when the role is not allowed.
 *
 * RLS in the database is the real security boundary; this is a UX/redirect
 * convenience for protecting whole pages.
 */
export async function requireRole(allowed: UserRole | UserRole[]) {
  const { user, role } = await getAuthedUser()

  if (!user) {
    redirect("/login")
  }

  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed]
  if (!role || !allowedRoles.includes(role)) {
    redirect("/unauthorized")
  }

  return { user, role }
}
