import { DashboardShellClient } from "@/components/layout/dashboard-shell-client"
import { CurrencyProvider } from "@/components/providers/currency-provider"
import {
  getCurrentProfile,
  getUnreadNotificationCount,
} from "@/lib/auth/get-profile"
import type { UserRole } from "@/lib/auth/roles"
import { getPlatformCurrency } from "@/lib/settings/get-settings"
import type { User } from "@supabase/supabase-js"

/**
 * Shared dashboard layout used by all three role sections. It renders the
 * role-specific sidebar, a top bar, and the page content. The role layouts
 * (server components) pass in the authenticated user's role and display name.
 */
export async function DashboardShell({
  role,
  user,
  children,
}: {
  role: UserRole
  user: User
  children: React.ReactNode
}) {
  const profile = await getCurrentProfile(user.id, role)
  const unreadCount = await getUnreadNotificationCount(user.id)
  const currency = await getPlatformCurrency()

  const displayName =
    profile?.fullName ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email ??
    "User"

  return (
    <CurrencyProvider
      currency={{
        symbol: currency.symbol,
        locale: currency.locale,
        code: currency.currencyCode,
      }}
    >
      <DashboardShellClient
        role={role}
        displayName={displayName}
        email={profile?.email ?? user.email ?? ""}
        avatarUrl={profile?.avatarUrl}
        unreadCount={unreadCount}
      >
        {children}
      </DashboardShellClient>
    </CurrencyProvider>
  )
}
