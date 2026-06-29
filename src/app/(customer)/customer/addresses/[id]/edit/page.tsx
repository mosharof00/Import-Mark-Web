import Link from "next/link"
import { notFound } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { PageHeader } from "@/components/shared/page-header"
import { EditCustomerAddressForm } from "@/components/shared/edit-customer-address-form"

export const dynamic = "force-dynamic"

export default async function CustomerEditAddressPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { user } = await getAuthedUser()
  if (!user) notFound()

  const supabase = await createClient()
  const { data: address, error } = await supabase
    .from("customer_addresses")
    .select("*")
    .eq("id", id)
    .eq("customer_id", user.id)
    .single()

  if (error || !address) notFound()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Address"
        description={`Update "${address.label}" delivery details.`}
      />
      <Link
        href={`/customer/addresses/${id}`}
        className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
      >
        ← Back to address
      </Link>
      <EditCustomerAddressForm
        addressId={id}
        role="customer"
        lockCustomerId={user.id}
        defaultValues={{
          customerId: user.id,
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
