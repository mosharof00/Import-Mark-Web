import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { getAuthedUser } from "@/lib/auth/get-user"
import { dashboardPathForRole } from "@/lib/auth/roles"

/**
 * Shown when a signed-in user tries to access a section that belongs to a
 * different role.
 */
export default async function UnauthorizedPage() {
  const { role } = await getAuthedUser()
  const home = dashboardPathForRole(role)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Access denied</h1>
      <p className="text-muted-foreground max-w-md text-sm">
        You don&apos;t have permission to view this page with your current
        account.
      </p>
      <Link href={home} className={buttonVariants()}>
        Go to your dashboard
      </Link>
    </div>
  )
}
