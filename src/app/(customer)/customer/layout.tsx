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
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email ??
    "Customer"

  return (
    <DashboardShell role="customer" displayName={displayName}>
      {children}
    </DashboardShell>
  )
}
