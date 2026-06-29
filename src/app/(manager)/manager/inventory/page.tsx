import { Suspense } from "react"

import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/page-header"
import { FadeIn } from "@/components/shared/fade-in"

import { InventoryStats } from "./_components/inventory-stats"
import { InventoryStatusTabs } from "./_components/inventory-status-tabs"
import { InventoryList } from "./_components/inventory-list"
import {
  stockHealth,
  type InventoryFilter,
} from "@/app/(admin)/admin/inventory/_components/inventory-filters"
import {
  InventoryStatsSkeleton,
  InventoryListSkeleton,
} from "./_components/skeletons"

export const dynamic = "force-dynamic"

const FILTERS: InventoryFilter[] = [
  "all",
  "low_stock",
  "out_of_stock",
  "healthy",
]

function parseStatus(value: string | undefined): InventoryFilter {
  if (value && FILTERS.includes(value as InventoryFilter)) {
    return value as InventoryFilter
  }
  return "all"
}

export default async function ManagerInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: statusParam } = await searchParams
  const status = parseStatus(statusParam)

  const supabase = await createClient()
  const [stockRes, lowStockRes] = await Promise.all([
    supabase
      .from("stock")
      .select(
        "quantity_available, low_stock_threshold, products!inner(status)"
      )
      .eq("products.status", "active"),
    supabase
      .from("low_stock_alerts")
      .select("id", { count: "exact", head: true }),
  ])

  const stockRows = stockRes.data ?? []
  let outOfStock = 0
  let healthy = 0
  let lowStock = 0

  for (const row of stockRows) {
    const health = stockHealth(row.quantity_available, row.low_stock_threshold)
    if (health === "out_of_stock") outOfStock += 1
    if (health === "healthy") healthy += 1
    if (health === "low_stock") lowStock += 1
  }

  const counts: Record<InventoryFilter, number> = {
    all: stockRows.length,
    low_stock: lowStock,
    out_of_stock: outOfStock,
    healthy,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Monitor godown stock for active products and make adjustments with a full audit trail."
      />

      <FadeIn delay={0}>
        <Suspense fallback={<InventoryStatsSkeleton />}>
          <InventoryStats />
        </Suspense>
      </FadeIn>

      <InventoryStatusTabs active={status} counts={counts} />

      <FadeIn key={status}>
        <Suspense fallback={<InventoryListSkeleton />}>
          <InventoryList status={status} />
        </Suspense>
      </FadeIn>
    </div>
  )
}
