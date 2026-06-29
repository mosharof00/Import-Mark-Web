"use client"

import { CustomerAddressForm } from "@/components/shared/customer-address-form"
import { createCustomerAddressPage } from "../actions"

export function CreateCustomerAddressForm({
  customerId,
}: {
  customerId: string
}) {
  return (
    <CustomerAddressForm
      lockCustomerId={customerId}
      submitLabel="Save address"
      defaultValues={{ customerId }}
      onSubmit={createCustomerAddressPage}
    />
  )
}
