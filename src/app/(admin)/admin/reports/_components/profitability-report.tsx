import { BarChart3 } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"

import {
  ProfitabilityTable,
  type ProfitabilityRow,
} from "./profitability-table"

export async function ProfitabilityReport() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("product_profitability")
      .select(
        "product_id, name, category, brand, sell_price, avg_cost_per_unit_bdt, gross_margin_per_unit, margin_percent, stock_available"
      )
      .order("margin_percent", { ascending: false, nullsFirst: false })

    if (error) throw error

    const rows: ProfitabilityRow[] = (data ?? [])
      .filter((p) => p.product_id && p.name)
      .map((p) => ({
        productId: p.product_id!,
        name: p.name!,
        category: p.category,
        brand: p.brand,
        sellPrice: p.sell_price,
        avgCost: p.avg_cost_per_unit_bdt,
        marginPerUnit: p.gross_margin_per_unit,
        marginPercent: p.margin_percent,
        stockAvailable: p.stock_available,
      }))

    if (rows.length === 0) {
      return (
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <EmptyState
            icon={BarChart3}
            title="No profitability data"
            description="Margin data appears once products have import cost history."
          />
        </div>
      )
    }

    return <ProfitabilityTable data={rows} />
  } catch {
    return <ErrorCard title="Couldn't load profitability report" />
  }
}
