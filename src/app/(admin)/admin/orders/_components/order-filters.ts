import type { OrderStatus } from "@/types"
import {
  CLOSED_STATUSES,
  IN_PROGRESS_STATUSES,
} from "@/lib/orders/status-flow"

export { IN_PROGRESS_STATUSES, CLOSED_STATUSES }

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

export type { OrderStatus }
