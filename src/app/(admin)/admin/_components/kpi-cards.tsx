import { Wallet, Clock, Users, PackageX } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { StatCard } from "@/components/shared/stat-card"
import { ErrorCard } from "@/components/shared/error-card"
import { formatTaka } from "@/lib/format"

/** Start of the month, `offset` months back from now (0 = this month). */
function monthStart(offset = 0): Date {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() - offset, 1)
}

export async function KpiCards() {
  const supabase = await createClient()

  try {
    const thisMonth = monthStart(0).toISOString()
    const lastMonth = monthStart(1).toISOString()

    // Delivered revenue since the start of last month (to compute this month +
    // the month-over-month trend in one query).
    const revenuePromise = supabase
      .from("sales_orders")
      .select("total_amount, created_at")
      .eq("status", "delivered")
      .gte("created_at", lastMonth)

    const pendingPromise = supabase
      .from("sales_orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_approval")

    const customersPromise = supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")

    const lowStockPromise = supabase
      .from("low_stock_alerts")
      .select("id", { count: "exact", head: true })

    const [revenueRes, pendingRes, customersRes, lowStockRes] =
      await Promise.all([
        revenuePromise,
        pendingPromise,
        customersPromise,
        lowStockPromise,
      ])

    if (revenueRes.error) throw revenueRes.error
    if (pendingRes.error) throw pendingRes.error
    if (customersRes.error) throw customersRes.error
    if (lowStockRes.error) throw lowStockRes.error

    let revenueThisMonth = 0
    let revenueLastMonth = 0
    for (const row of revenueRes.data ?? []) {
      if (row.created_at >= thisMonth) revenueThisMonth += row.total_amount
      else revenueLastMonth += row.total_amount
    }

    // Month-over-month trend for the revenue card only (real data).
    const trend =
      revenueLastMonth > 0
        ? (() => {
            const pct =
              ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
            return {
              direction: pct >= 0 ? ("up" as const) : ("down" as const),
              value: `${Math.abs(pct).toFixed(1)}%`,
              label: "vs last month",
            }
          })()
        : undefined

    const pendingCount = pendingRes.count ?? 0
    const activeCustomers = customersRes.count ?? 0
    const lowStockCount = lowStockRes.count ?? 0

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue This Month"
          value={formatTaka(revenueThisMonth)}
          icon={Wallet}
          trend={trend}
          hint={trend ? undefined : "Delivered orders"}
        />
        <StatCard
          label="Pending Approvals"
          value={pendingCount}
          icon={Clock}
          accent={pendingCount > 0 ? "amber" : "default"}
          hint={pendingCount > 0 ? "Needs your review" : "All caught up"}
        />
        <StatCard
          label="Active Customers"
          value={activeCustomers}
          icon={Users}
          hint="Currently active"
        />
        <StatCard
          label="Low Stock Alerts"
          value={lowStockCount}
          icon={PackageX}
          accent={lowStockCount > 0 ? "red" : "default"}
          hint={lowStockCount > 0 ? "At or below threshold" : "Stock healthy"}
        />
      </div>
    )
  } catch {
    return <ErrorCard title="Couldn't load key metrics" />
  }
}
