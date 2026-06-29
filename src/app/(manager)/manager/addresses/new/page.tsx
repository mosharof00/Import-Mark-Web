import Link from "next/link"

import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/page-header"
import { CustomerAddressForm } from "@/components/shared/customer-address-form"
import { createCustomerAddressPage } from "../actions"

export const dynamic = "force-dynamic"

export default async function ManagerNewAddressPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>
}) {
  const { customer: customerIdParam } = await searchParams
  const supabase = await createClient()
  const { data: customers } = await supabase
    .from("customers")
    .select("id, full_name, company_name")
    .eq("status", "active")
    .order("full_name")

  const options = (customers ?? []).map((c) => ({
    id: c.id,
    label: c.company_name
      ? `${c.full_name} · ${c.company_name}`
      : c.full_name,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Delivery Address"
        description="Save a new delivery location for a customer."
      />
      <Link
        href="/manager/addresses"
        className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
      >
        ← Back to addresses
      </Link>
      <CustomerAddressForm
        customers={options}
        submitLabel="Save address"
        defaultValues={
          customerIdParam ? { customerId: customerIdParam } : undefined
        }
        lockCustomerId={customerIdParam}
        onSubmit={createCustomerAddressPage}
      />
    </div>
  )
}
