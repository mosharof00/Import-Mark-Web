"use server"

import { getAuthedUser } from "@/lib/auth/get-user"
import { placeOrderSchema, type PlaceOrderInput } from "@/lib/validations/order"

type ActionResult = { error?: string; orderId?: string }

export async function placeCustomerOrder(
  values: PlaceOrderInput
): Promise<ActionResult> {
  const { user, role } = await getAuthedUser()
  if (!user || role !== "customer") {
    return { error: "You are not authorized to place orders." }
  }

  const parsed = placeOrderSchema.safeParse({
    ...values,
    customerId: user.id,
  })
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message
    return { error: first ?? "Please check the order and try again." }
  }

  const { placeOrderCore } = await import("@/lib/orders/place-order")
  return placeOrderCore(parsed.data, user.id, "customer")
}
