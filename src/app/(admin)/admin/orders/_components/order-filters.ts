import type { OrderStatus } from "@/types"

/** Orders actively moving through fulfillment (post-approval). */
export const IN_PROGRESS_STATUSES: OrderStatus[] = [
  "approved",
  "processing",
  "ready_for_pickup",
  "out_for_delivery",
]

/** Terminal non-success states grouped for the Closed tab. */
export const CLOSED_STATUSES: OrderStatus[] = ["rejected", "cancelled"]

export type OrderFilter =
  | "all"
  | "pending_approval"
  | "in_progress"
  | "delivered"
  | "closed"

export const ORDER_FILTER_LABELS: Record<OrderFilter, string> = {
  all: "All",
  pending_approval: "Pending",
  in_progress: "In progress",
  delivered: "Delivered",
  closed: "Closed",
}
