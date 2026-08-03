import { PageHeader } from "@/components/shared/page-header"
import { CreateAccountForm } from "@/components/shared/create-account-form"
import { createManagerAccountAction } from "@/app/(admin)/admin/managers/actions"
import { requireRole } from "@/lib/auth/get-user"

export const dynamic = "force-dynamic"

export default async function AdminNewManagerPage() {
  await requireRole("admin")

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add manager"
        description="Create a manager account and send an email invite to verify and set their password."
      />
      <CreateAccountForm
        action={createManagerAccountAction}
        cancelHref="/admin/managers"
        submitLabel="Create manager & send invite"
      />
    </div>
  )
}
