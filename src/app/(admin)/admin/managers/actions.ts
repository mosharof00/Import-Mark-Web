"use server"

import { createManagerAccount } from "@/lib/users/create-manager-action"
import type { CreateCustomerAccountInput } from "@/lib/validations/staff-user"

export async function createManagerAccountAction(
  values: CreateCustomerAccountInput
) {
  return createManagerAccount({
    fullName: values.fullName,
    email: values.email,
    phone: values.phone,
  })
}
