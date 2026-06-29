import Link from "next/link"

import { getAuthedUser } from "@/lib/auth/get-user"
import { PageHeader } from "@/components/shared/page-header"
import { CreateCustomerAddressForm } from "../_components/create-address-form"

export const dynamic = "force-dynamic"

export default async function CustomerNewAddressPage() {
  const { user } = await getAuthedUser()
  if (!user) return null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Delivery Address"
        description="Save a new delivery location for your orders."
      />
      <Link
        href="/customer/addresses"
        className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
      >
        ← Back to addresses
      </Link>
      <CreateCustomerAddressForm customerId={user.id} />
    </div>
  )
}
