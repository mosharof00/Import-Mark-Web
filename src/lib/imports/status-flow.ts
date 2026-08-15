import type { ShipmentStatus } from "@/types"

/** Forward cycle for inbound shipments. Cancelled / cleared have no next step. */
export function getNextShipmentStatus(
  current: ShipmentStatus
): ShipmentStatus | null {
  switch (current) {
    case "in_transit":
      return "arrived"
    case "arrived":
      return "customs_clearance"
    case "customs_clearance":
      return "cleared"
    default:
      return null
  }
}

export function canCancelShipment(status: ShipmentStatus): boolean {
  return (
    status === "in_transit" ||
    status === "arrived" ||
    status === "customs_clearance"
  )
}

export const IMPORT_CURRENCIES = [
  "USD",
  "CNY",
  "EUR",
  "INR",
  "AED",
  "GBP",
] as const
