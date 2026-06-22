import { Boxes } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"

import {
  INVENTORY_FILTER_LABELS,
  stockHealth,
  type InventoryFilter,
} from "./inventory-filters"
import { InventoryTable, type InventoryRow } from "./inventory-table"

export async function InventoryList({ status }: { status: InventoryFilter }) {
  const supabase = await createClient()

  try {
    const { data: stockRows, error } = await supabase
      .from("stock")
      .select(
        "quantity_available, low_stock_threshold, last_updated, products(id, name, sku, categories(name), brands(name))"
      )
      .order("quantity_available", { ascending: true })

    if (error) throw error

    let rows: InventoryRow[] = (stockRows ?? [])
      .filter((row) => row.products)
      .map((row) => {
        const qty = row.quantity_available
        const threshold = row.low_stock_threshold
        return {
          productId: row.products!.id,
          name: row.products!.name,
          sku: row.products!.sku,
          categoryName: row.products!.categories?.name ?? "Uncategorized",
          brandName: row.products!.brands?.name ?? null,
          quantity: qty,
          threshold,
          health: stockHealth(qty, threshold),
          lastUpdated: row.last_updated,
        }
      })

    if (status === "low_stock") {
      rows = rows.filter((r) => r.health === "low_stock")
    } else if (status === "out_of_stock") {
      rows = rows.filter((r) => r.health === "out_of_stock")
    } else if (status === "healthy") {
      rows = rows.filter((r) => r.health === "healthy")
    }

    if (rows.length === 0) {
      return (
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <EmptyState
            icon={Boxes}
            title="No inventory items"
            description={
              status === "all"
                ? "Stock records will appear when products are added."
                : `No products in "${INVENTORY_FILTER_LABELS[status]}".`
            }
          />
        </div>
      )
    }

    return <InventoryTable data={rows} />
  } catch {
    return <ErrorCard title="Couldn't load inventory" />
  }
}
