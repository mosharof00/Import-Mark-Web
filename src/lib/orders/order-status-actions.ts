"use server"

import { getAuthedUser } from "@/lib/auth/get-user"
import {
  updateOrderStatusCore,
  markOrderDeliveredCore,
} from "@/lib/orders/update-order-status"

type ActionResult = { error?: string } | void

export async function advanceOrderStatus(
  orderId: string,
  note?: string,
  deliveryImageUrl?: string | null
): Promise<ActionResult> {
  const { user, role } = await getAuthedUser()
  if (!user || !role) return { error: "Not authorized." }
  if (role !== "admin" && role !== "manager") {
    return { error: "Not authorized." }
  }
  return updateOrderStatusCore(
    orderId,
    user.id,
    role,
    note,
    deliveryImageUrl
  )
}

export async function markOrderDelivered(
  orderId: string,
  note?: string,
  deliveryImageUrl?: string | null
): Promise<ActionResult> {
  const { user, role } = await getAuthedUser()
  if (!user || !role) return { error: "Not authorized." }
  if (role !== "admin" && role !== "manager") {
    return { error: "Not authorized." }
  }
  return markOrderDeliveredCore(
    orderId,
    user.id,
    role,
    note,
    deliveryImageUrl
  )
}
