import { Package } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"
import type { ProductStatus } from "@/types"

import { ProductsTable, type ProductRow } from "./products-table"
import type { ProductFilter } from "./product-status-tabs"

const FILTER_LABELS: Record<ProductFilter, string> = {
  all: "All",
  active: "Active",
  pending_approval: "Pending",
  rejected: "Rejected",
}

export async function ProductList({ status }: { status: ProductFilter }) {
  const { user } = await getAuthedUser()
  if (!user) return <ErrorCard title="Couldn't load products" />

  const supabase = await createClient()

  try {
    let query = supabase
      .from("products")
      .select(
        "id, name, sku, sell_price, unit, status, created_by, categories(name), brands(name), stock(quantity_available, low_stock_threshold)"
      )
      .order("created_at", { ascending: false })

    if (status === "all") {
      query = query.or(`status.eq.active,created_by.eq.${user.id}`)
    } else if (status === "active") {
      query = query.eq("status", "active")
    } else {
      query = query
        .eq("created_by", user.id)
        .eq("status", status)
    }

    const { data: products, error } = await query
    if (error) throw error

    const rows: ProductRow[] = (products ?? []).map((p) => {
      const stock = Array.isArray(p.stock) ? p.stock[0] : p.stock
      const productStatus = p.status as ProductStatus
      const isOwn = p.created_by === user.id

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        categoryName: p.categories?.name ?? "Uncategorized",
        brandName: p.brands?.name ?? null,
        sellPrice: p.sell_price,
        unit: p.unit,
        status: productStatus,
        stockQty: stock?.quantity_available ?? null,
        lowStockThreshold: stock?.low_stock_threshold ?? null,
        canEdit:
          isOwn &&
          (productStatus === "pending_approval" ||
            productStatus === "rejected"),
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
                ? "Active catalog items and your submissions will appear here."
                : `No products in "${FILTER_LABELS[status]}".`
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
