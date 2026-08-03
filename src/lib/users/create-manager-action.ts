"use server"

import { revalidatePath } from "next/cache"

import { getAuthedUser } from "@/lib/auth/get-user"
import { inviteUserWithProfile } from "@/lib/users/invite-user"
import {
  createManagerAccountSchema,
  type CreateManagerAccountInput,
} from "@/lib/validations/staff-user"

type ActionResult = { error?: string; userId?: string }

export async function createManagerAccount(
  values: CreateManagerAccountInput
): Promise<ActionResult> {
  const { user, role } = await getAuthedUser()
  if (!user || role !== "admin") {
    return { error: "Not authorized." }
  }

  const parsed = createManagerAccountSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details." }
  }

  const result = await inviteUserWithProfile({
    email: parsed.data.email,
    fullName: parsed.data.fullName,
    phone: parsed.data.phone,
    role: "manager",
    createdBy: user.id,
  })

  if (result.error) return { error: result.error }

  revalidatePath("/admin/managers")
  return { userId: result.userId }
}
