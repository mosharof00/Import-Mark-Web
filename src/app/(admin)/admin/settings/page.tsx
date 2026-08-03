import { PageHeader } from "@/components/shared/page-header"
import { getAppSettings, getPlatformCurrency } from "@/lib/settings/get-settings"
import { requireRole } from "@/lib/auth/get-user"

import { AdminSettingsShell } from "./_components/admin-settings-shell"

export const dynamic = "force-dynamic"

export default async function AdminSettingsPage() {
  const { user } = await requireRole("admin")
  const [settings, currency] = await Promise.all([
    getAppSettings(),
    getPlatformCurrency(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure platform policies, currency, and operational rules."
      />
      <AdminSettingsShell
        settings={settings}
        currency={currency}
        email={user.email ?? ""}
      />
    </div>
  )
}
