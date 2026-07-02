import type { DeliveryMethod, OrderStatus } from "@/types"

/** Post-approval statuses before delivery is complete. */
export const FULFILLMENT_STATUSES: OrderStatus[] = [
  "approved",
  "processing",
  "ready_for_pickup",
  "out_for_delivery",
]

export const IN_PROGRESS_STATUSES: OrderStatus[] = FULFILLMENT_STATUSES

export const CLOSED_STATUSES: OrderStatus[] = ["rejected", "cancelled"]

export function isFulfillmentStatus(status: OrderStatus): boolean {
  return FULFILLMENT_STATUSES.includes(status)
}

export function getNextOrderStatus(
  current: OrderStatus,
  deliveryMethod: DeliveryMethod
): OrderStatus | null {
  switch (current) {
    case "approved":
      return "processing"
    case "processing":
      return deliveryMethod === "customer_pickup"
        ? "ready_for_pickup"
        : "out_for_delivery"
    case "ready_for_pickup":
    case "out_for_delivery":
      return "delivered"
    default:
      return null
  }
}

export function managerCanAccessOrder(
  order: { created_by: string; status: OrderStatus },
  userId: string,
  canApproveOrders: boolean
): boolean {
  if (canApproveOrders) return true
  if (order.created_by === userId) return true
  return isFulfillmentStatus(order.status)
}
