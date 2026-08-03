"use server"

import { revalidatePath } from "next/cache"

import { getAuthedUser } from "@/lib/auth/get-user"
import { inviteUserWithProfile } from "@/lib/users/invite-user"
import {
  createCustomerAccountSchema,
  type CreateCustomerAccountInput,
} from "@/lib/validations/staff-user"

type ActionResult = { error?: string; userId?: string }

export async function createCustomerAccount(
  values: CreateCustomerAccountInput
): Promise<ActionResult> {
  const { user, role } = await getAuthedUser()
  if (!user || (role !== "admin" && role !== "manager")) {
    return { error: "Not authorized." }
  }

  const parsed = createCustomerAccountSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details." }
  }

  const result = await inviteUserWithProfile({
    email: parsed.data.email,
    fullName: parsed.data.fullName,
    phone: parsed.data.phone,
    companyName: parsed.data.companyName,
    role: "customer",
    createdBy: user.id,
  })

  if (result.error) return { error: result.error }

  revalidatePath("/admin/customers")
  revalidatePath("/manager/customers")
  return { userId: result.userId }
}
