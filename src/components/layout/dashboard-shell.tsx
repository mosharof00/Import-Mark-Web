import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { NAV_BY_ROLE } from "@/components/layout/nav-config"
import type { UserRole } from "@/lib/auth/roles"

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Administrator",
  manager: "Manager",
  customer: "Customer",
}

/**
 * Shared dashboard layout used by all three role sections. It renders the
 * role-specific sidebar, a top bar, and the page content. The role layouts
 * (server components) pass in the authenticated user's role and display name.
 */
export function DashboardShell({
  role,
  displayName,
  children,
}: {
  role: UserRole
  displayName: string
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full">
      <Sidebar items={NAV_BY_ROLE[role]} title={ROLE_LABEL[role]} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar displayName={displayName} roleLabel={ROLE_LABEL[role]} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
