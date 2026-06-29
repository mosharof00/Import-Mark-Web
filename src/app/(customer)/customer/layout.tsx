import { DashboardShell } from "@/components/layout/dashboard-shell"
import { requireRole } from "@/lib/auth/get-user"

/**
 * Layout + route guard for the entire /customer portal.
 */
export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await requireRole("customer")

  return (
    <DashboardShell role="customer" user={user}>
      {children}
    </DashboardShell>
  )
}
