export type InventoryFilter = "all" | "low_stock" | "out_of_stock" | "healthy"

export const INVENTORY_FILTER_LABELS: Record<InventoryFilter, string> = {
  all: "All",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
  healthy: "Healthy",
}

export type StockHealth = "out_of_stock" | "low_stock" | "healthy"

export function stockHealth(
  qty: number,
  threshold: number
): StockHealth {
  if (qty <= 0) return "out_of_stock"
  if (qty <= threshold) return "low_stock"
  return "healthy"
}
