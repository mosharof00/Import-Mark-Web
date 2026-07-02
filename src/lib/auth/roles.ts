import type { User } from "@supabase/supabase-js"

import type { Database } from "@/types/database.types"

/**
 * The role enum exactly as defined in the database (`user_role`).
 * Roles are stored in `auth.users.raw_app_meta_data.role`, which is
 * server-controlled and cannot be tampered with by the client.
 */
export type UserRole = Database["public"]["Enums"]["user_role"]

export const ROLES = {
  admin: "admin",
  manager: "manager",
  customer: "customer",
} as const satisfies Record<UserRole, UserRole>

/** Public marketing site entry point. */
export const LANDING_HOME = "/"

/** The root path of each role's section of the app. */
export const ROLE_HOME: Record<UserRole, string> = {
  admin: "/admin",
  manager: "/manager",
  customer: "/customer",
}

/**
 * Reads the role from a Supabase user. We ALWAYS read from `app_metadata`
 * because it is server-controlled; `user_metadata` is editable by the client
 * and must never be trusted for authorization.
 */
export function getUserRole(user: User | null): UserRole | null {
  const role = user?.app_metadata?.role
  if (role === "admin" || role === "manager" || role === "customer") {
    return role
  }
  return null
}

/** Where to send a user after login, based on their role. */
export function dashboardPathForRole(role: UserRole | null): string {
  if (!role) return "/login"
  return ROLE_HOME[role]
}
