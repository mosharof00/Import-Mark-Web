import { PageHeader } from "@/components/shared/page-header"
import { ChangePasswordForm } from "@/components/shared/profile/change-password-form"

export default function CustomerSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account security."
      />
      <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold">Change password</h2>
        <ChangePasswordForm />
      </section>
    </div>
  )
}
