"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { placeOrderSchema, type PlaceOrderInput } from "@/lib/validations/order"
import { createCustomerAddress as saveCustomerAddress } from "@/app/(manager)/manager/addresses/actions"
import type { CreateCustomerAddressInput } from "@/lib/validations/customer-address"

type ActionResult = { error?: string; orderId?: string; addressId?: string }

async function requireManager() {
  const { user, role } = await getAuthedUser()
  if (!user || role !== "manager") {
    return { error: "You are not authorized to perform this action." as string }
  }
  return { userId: user.id }
}

function revalidateOrderPaths(orderId: string) {
  revalidatePath("/manager")
  revalidatePath("/manager/orders")
  revalidatePath(`/manager/orders/${orderId}`)
  revalidatePath("/manager/customers")
  revalidatePath("/manager/payments")
  revalidatePath("/admin")
  revalidatePath("/admin/approvals")
}

export async function createCustomerAddress(
  values: CreateCustomerAddressInput
): Promise<{ error?: string; addressId?: string }> {
  const result = await saveCustomerAddress(values)
  if (!result) return {}
  return result
}

export async function placeOrder(
  values: PlaceOrderInput
): Promise<ActionResult> {
  const auth = await requireManager()
  if ("error" in auth) return auth

  const parsed = placeOrderSchema.safeParse(values)
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message
    return { error: first ?? "Please check the order and try again." }
  }

  const { placeOrderCore } = await import("@/lib/orders/place-order")
  return placeOrderCore(parsed.data, auth.userId, "manager")
}
