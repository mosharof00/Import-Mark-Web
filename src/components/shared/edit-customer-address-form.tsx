"use client"

import { CustomerAddressForm } from "@/components/shared/customer-address-form"
import { updateCustomerAddress as adminUpdate } from "@/app/(admin)/admin/addresses/actions"
import { updateCustomerAddress as managerUpdate } from "@/app/(manager)/manager/addresses/actions"
import { updateCustomerAddress as customerUpdate } from "@/app/(customer)/customer/addresses/actions"
import type { CreateCustomerAddressInput } from "@/lib/validations/customer-address"

export function EditCustomerAddressForm({
  addressId,
  role,
  lockCustomerId,
  defaultValues,
}: {
  addressId: string
  role: "admin" | "manager" | "customer"
  lockCustomerId: string
  defaultValues: Partial<CreateCustomerAddressInput>
}) {
  const update =
    role === "admin"
      ? adminUpdate
      : role === "manager"
        ? managerUpdate
        : customerUpdate

  return (
    <CustomerAddressForm
      lockCustomerId={lockCustomerId}
      submitLabel="Save changes"
      defaultValues={defaultValues}
      onSubmit={(values) => update({ ...values, id: addressId })}
    />
  )
}
