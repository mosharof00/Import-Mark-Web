import { DashboardShell } from "@/components/layout/dashboard-shell"
import { requireRole } from "@/lib/auth/get-user"

/**
 * Layout + route guard for the entire /admin section. `requireRole` redirects
 * away anyone who is not a signed-in admin (RLS is the real boundary; this is
 * for UX). Every page under (admin) inherits the admin dashboard shell.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await requireRole("admin")

  return (
    <DashboardShell role="admin" user={user}>
      {children}
    </DashboardShell>
  )
}
