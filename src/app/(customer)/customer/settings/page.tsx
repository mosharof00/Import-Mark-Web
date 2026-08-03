import { PageHeader } from "@/components/shared/page-header"
import { ChangePasswordForm } from "@/components/shared/profile/change-password-form"
import { requireRole } from "@/lib/auth/get-user"

export default async function CustomerSettingsPage() {
  const { user } = await requireRole("customer")

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account security."
      />
      <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold">Change password</h2>
        <ChangePasswordForm email={user.email ?? ""} />
      </section>
    </div>
  )
}
