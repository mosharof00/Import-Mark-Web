import { PageHeader } from "@/components/shared/page-header"
import { CreateAccountForm } from "@/components/shared/create-account-form"
import { createCustomerAccount } from "@/lib/users/create-customer-action"
import { requireRole } from "@/lib/auth/get-user"

export const dynamic = "force-dynamic"

export default async function ManagerNewCustomerPage() {
  await requireRole("manager")

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add customer"
        description="Create a wholesale customer account and send an email invite to verify and set their password."
      />
      <CreateAccountForm
        action={createCustomerAccount}
        cancelHref="/manager/customers"
        showCompany
      />
    </div>
  )
}
