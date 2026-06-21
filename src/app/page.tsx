import { redirect } from "next/navigation"

import { getAuthedUser } from "@/lib/auth/get-user"
import { dashboardPathForRole } from "@/lib/auth/roles"

/**
 * Root route. Sends visitors to their role dashboard when signed in, otherwise
 * to the login page. The middleware does this too, but handling it here covers
 * direct navigation and keeps "/" from rendering anything.
 */
export default async function RootPage() {
  const { user, role } = await getAuthedUser()

  if (!user) {
    redirect("/login")
  }

  redirect(dashboardPathForRole(role))
}
