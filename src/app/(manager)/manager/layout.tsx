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

  return (
    <DashboardShell role="manager" user={user}>
      {children}
    </DashboardShell>
  )
}
