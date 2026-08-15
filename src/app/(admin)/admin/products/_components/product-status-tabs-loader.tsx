import { createClient } from "@/lib/supabase/server"
import type { ProductStatus } from "@/types"

import {
  ProductStatusTabs,
  type ProductFilter,
} from "./product-status-tabs"

const PRODUCT_STATUSES: ProductStatus[] = [
  "active",
  "pending_approval",
  "inactive",
  "rejected",
]

export async function ProductStatusTabsLoader({
  active,
}: {
  active: ProductFilter
}) {
  const supabase = await createClient()
  const countResults = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    ...PRODUCT_STATUSES.map((s) =>
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("status", s)
    ),
  ])

  const counts: Record<ProductFilter, number> = {
    all: countResults[0].count ?? 0,
    active: countResults[1].count ?? 0,
    pending_approval: countResults[2].count ?? 0,
    inactive: countResults[3].count ?? 0,
    rejected: countResults[4].count ?? 0,
  }

  return <ProductStatusTabs active={active} counts={counts} />
}
