import { Package } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"
import type { ProductStatus } from "@/types"

import { ProductsTable, type ProductRow } from "./products-table"
import type { ProductFilter } from "./product-status-tabs"

/** Fetches products (optionally filtered by status) and renders the table. */
export async function ProductList({ status }: { status: ProductFilter }) {
  const supabase = await createClient()

  try {
    let query = supabase
      .from("products")
      .select(
        "id, name, sku, sell_price, unit, status, categories(name), brands(name), stock(quantity_available, low_stock_threshold)"
      )
      .order("created_at", { ascending: false })

    if (status !== "all") {
      query = query.eq("status", status)
    }

    const { data: products, error } = await query
    if (error) throw error

    const rows: ProductRow[] = (products ?? []).map((p) => {
      const stock = Array.isArray(p.stock) ? p.stock[0] : p.stock

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        categoryName: p.categories?.name ?? "Uncategorized",
        brandName: p.brands?.name ?? null,
        sellPrice: p.sell_price,
        unit: p.unit,
        status: p.status as ProductStatus,
        stockQty: stock?.quantity_available ?? null,
        lowStockThreshold: stock?.low_stock_threshold ?? null,
      }
    })

    if (rows.length === 0) {
      return (
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <EmptyState
            icon={Package}
            title="No products found"
            description={
              status === "all"
                ? "Your product catalog is empty."
                : `No products with status "${status.replace("_", " ")}".`
            }
          />
        </div>
      )
    }

    return <ProductsTable data={rows} />
  } catch {
    return <ErrorCard title="Couldn't load products" />
  }
}
