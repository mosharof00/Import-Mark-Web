import Link from "next/link"
import { notFound } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/page-header"
import { EditCustomerAddressForm } from "@/components/shared/edit-customer-address-form"

export const dynamic = "force-dynamic"

export default async function ManagerEditAddressPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: address, error } = await supabase
    .from("customer_addresses")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !address) notFound()

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${address.label}`}
        description="Update delivery address details."
      />
      <Link
        href={`/manager/addresses/${id}`}
        className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
      >
        ← Back to address
      </Link>
      <EditCustomerAddressForm
        role="manager"
        addressId={id}
        lockCustomerId={address.customer_id}
        defaultValues={{
          customerId: address.customer_id,
          label: address.label,
          recipientName: address.recipient_name,
          recipientPhone: address.recipient_phone ?? "",
          addressLine1: address.address_line_1,
          addressLine2: address.address_line_2 ?? "",
          city: address.city,
          stateProvince: address.state_province ?? "",
          postalCode: address.postal_code ?? "",
          country: address.country,
          isDefault: address.is_default,
        }}
      />
    </div>
  )
}
