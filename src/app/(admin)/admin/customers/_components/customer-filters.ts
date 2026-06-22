import type { UserStatus } from "@/types"

export type CustomerFilter = "all" | UserStatus

export const CUSTOMER_FILTER_LABELS: Record<CustomerFilter, string> = {
  all: "All",
  active: "Active",
  pending: "Pending",
  inactive: "Inactive",
}
