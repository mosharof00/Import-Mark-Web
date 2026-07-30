"use server"

import { getAuthedUser } from "@/lib/auth/get-user"
import { recordPaymentCore } from "@/lib/payments/record-payment"
import {
  recordPaymentSchema,
  type RecordPaymentInput,
} from "@/lib/validations/payment"

type ActionResult = { error?: string; paymentId?: string } | void

export async function recordOrderPayment(
  values: RecordPaymentInput
): Promise<ActionResult> {
  const { user, role } = await getAuthedUser()
  if (!user || !role) return { error: "Not authorized." }
  if (role !== "admin" && role !== "manager") {
    return { error: "Not authorized." }
  }

  const parsed = recordPaymentSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid payment." }
  }

  return recordPaymentCore(parsed.data, user.id, role)
}
