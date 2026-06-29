import { Package } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getAppSettings } from "@/lib/settings/get-settings"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"

import { ProductsTable, type ProductRow } from "./products-table"

export async function ProductList() {
  const supabase = await createClient()
  const settings = await getAppSettings()
  const showStockQty = settings.customer_show_stock_quantity

  try {
    const { data: products, error } = await supabase
      .from("products")
      .select(
        "id, name, sku, sell_price, unit, categories(name), brands(name), stock(quantity_available)"
      )
      .eq("status", "active")
      .order("name", { ascending: true })

    if (error) throw error

    const rows: ProductRow[] = (products ?? []).map((p) => {
      const stock = Array.isArray(p.stock) ? p.stock[0] : p.stock
      const stockQty = stock?.quantity_available ?? null

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        categoryName: p.categories?.name ?? "Uncategorized",
        brandName: p.brands?.name ?? null,
        sellPrice: p.sell_price,
        unit: p.unit,
        stockQty,
      }
    })

    if (rows.length === 0) {
      return (
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <EmptyState
            icon={Package}
            title="No products available"
            description="Active catalog items will appear here when they are published."
          />
        </div>
      )
    }

    return <ProductsTable data={rows} showStockQuantity={showStockQty} />
  } catch {
    return <ErrorCard title="Couldn't load products" />
  }
}
