import type {
  OrderStatus,
  ProductStatus,
  ShipmentStatus,
  UserStatus,
} from "@/types"

/**
 * Display config (human label + badge color classes) for the DB status enums.
 * Centralized here so every screen renders statuses consistently. Colors are
 * applied as Tailwind classes since the base Badge only ships neutral variants.
 */

type StatusConfig = { label: string; className: string }

const GREEN = "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
const AMBER = "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
const BLUE = "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
const RED = "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
const GRAY = "bg-muted text-muted-foreground"
const PURPLE =
  "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"

export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  draft: { label: "Draft", className: GRAY },
  pending_approval: { label: "Pending approval", className: AMBER },
  approved: { label: "Approved", className: BLUE },
  processing: { label: "Processing", className: BLUE },
  ready_for_pickup: { label: "Ready for pickup", className: PURPLE },
  out_for_delivery: { label: "Out for delivery", className: PURPLE },
  delivered: { label: "Delivered", className: GREEN },
  cancelled: { label: "Cancelled", className: GRAY },
  rejected: { label: "Rejected", className: RED },
}

export const PRODUCT_STATUS_CONFIG: Record<ProductStatus, StatusConfig> = {
  pending_approval: { label: "Pending approval", className: AMBER },
  active: { label: "Active", className: GREEN },
  inactive: { label: "Inactive", className: GRAY },
  rejected: { label: "Rejected", className: RED },
}

export const USER_STATUS_CONFIG: Record<UserStatus, StatusConfig> = {
  active: { label: "Active", className: GREEN },
  inactive: { label: "Inactive", className: GRAY },
  pending: { label: "Pending", className: AMBER },
}

export const SHIPMENT_STATUS_CONFIG: Record<ShipmentStatus, StatusConfig> = {
  in_transit: { label: "In transit", className: BLUE },
  arrived: { label: "Arrived", className: PURPLE },
  customs_clearance: { label: "Customs clearance", className: AMBER },
  cleared: { label: "Cleared", className: GREEN },
  cancelled: { label: "Cancelled", className: GRAY },
}
