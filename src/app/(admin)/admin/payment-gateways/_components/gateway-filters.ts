export type GatewayFilter = "all" | "active" | "inactive"

export const GATEWAY_FILTER_LABELS: Record<GatewayFilter, string> = {
  all: "All",
  active: "Active",
  inactive: "Inactive",
}
