import { DashboardShell } from "@/components/layout/dashboard-shell"
import { requireRole } from "@/lib/auth/get-user"

/**
 * Layout + route guard for the entire /manager section.
 */
export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await requireRole("manager")
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email ??
    "Manager"

  return (
    <DashboardShell role="manager" displayName={displayName}>
      {children}
    </DashboardShell>
  )
}
