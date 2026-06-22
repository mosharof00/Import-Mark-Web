import type { ShipmentStatus } from "@/types"

/** Shipments at port awaiting or undergoing customs clearance. */
export const AT_PORT_STATUSES: ShipmentStatus[] = [
  "arrived",
  "customs_clearance",
]

export type ImportFilter =
  | "all"
  | "in_transit"
  | "at_port"
  | "cleared"
  | "cancelled"

export const IMPORT_FILTER_LABELS: Record<ImportFilter, string> = {
  all: "All",
  in_transit: "In transit",
  at_port: "At port",
  cleared: "Cleared",
  cancelled: "Cancelled",
}
