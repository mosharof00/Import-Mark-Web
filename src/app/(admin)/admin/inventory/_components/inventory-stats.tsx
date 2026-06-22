import { Boxes, PackageX, AlertTriangle, Layers } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { StatCard } from "@/components/shared/stat-card"
import { ErrorCard } from "@/components/shared/error-card"

import { stockHealth } from "./inventory-filters"

export async function InventoryStats() {
  const supabase = await createClient()

  try {
    const [stockRes, lowStockRes] = await Promise.all([
      supabase
        .from("stock")
        .select("quantity_available, low_stock_threshold"),
      supabase
        .from("low_stock_alerts")
        .select("id", { count: "exact", head: true }),
    ])

    if (stockRes.error) throw stockRes.error
    if (lowStockRes.error) throw lowStockRes.error

    const rows = stockRes.data ?? []
    let outOfStock = 0
    let totalUnits = 0

    for (const row of rows) {
      totalUnits += row.quantity_available
      if (stockHealth(row.quantity_available, row.low_stock_threshold) === "out_of_stock") {
        outOfStock += 1
      }
    }

    const lowStockCount = lowStockRes.count ?? 0

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="SKUs Tracked"
          value={rows.length}
          icon={Boxes}
          hint="Products with stock records"
        />
        <StatCard
          label="Low Stock"
          value={lowStockCount}
          icon={AlertTriangle}
          accent={lowStockCount > 0 ? "amber" : "default"}
          hint="At or below threshold"
        />
        <StatCard
          label="Out of Stock"
          value={outOfStock}
          icon={PackageX}
          accent={outOfStock > 0 ? "red" : "default"}
          hint="Zero quantity available"
        />
        <StatCard
          label="Total Units"
          value={totalUnits}
          icon={Layers}
          hint="Across all products"
        />
      </div>
    )
  } catch {
    return <ErrorCard title="Couldn't load inventory stats" />
  }
}
