import { TrendingUp, ShoppingBag, ArrowDownLeft, ArrowUpRight } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { StatCard } from "@/components/shared/stat-card"
import { ErrorCard } from "@/components/shared/error-card"
import { formatTaka } from "@/lib/format"

function monthStart(offset = 0): Date {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() - offset, 1)
}

export async function ReportStats() {
  const supabase = await createClient()

  try {
    const thisMonth = monthStart(0).toISOString()
    const lastMonth = monthStart(1).toISOString()
    const thisMonthDate = monthStart(0).toISOString().slice(0, 10)

    const [revenueRes, purchasesRes, customerLedgerRes, supplierLedgerRes] =
      await Promise.all([
        supabase
          .from("sales_orders")
          .select("total_amount, created_at")
          .eq("status", "delivered")
          .gte("created_at", lastMonth),
        supabase
          .from("import_shipments")
          .select("total_landed_cost, total_invoice_bdt, clearance_date")
          .eq("status", "cleared")
          .gte("clearance_date", thisMonthDate),
        supabase.from("customer_ledger").select("total_due"),
        supabase.from("supplier_ledger").select("total_due_bdt"),
      ])

    if (revenueRes.error) throw revenueRes.error
    if (purchasesRes.error) throw purchasesRes.error
    if (customerLedgerRes.error) throw customerLedgerRes.error
    if (supplierLedgerRes.error) throw supplierLedgerRes.error

    let revenueThisMonth = 0
    let revenueLastMonth = 0
    for (const row of revenueRes.data ?? []) {
      if (row.created_at >= thisMonth) revenueThisMonth += row.total_amount
      else revenueLastMonth += row.total_amount
    }

    const purchasesThisMonth = (purchasesRes.data ?? []).reduce(
      (sum, row) =>
        sum + (row.total_landed_cost ?? row.total_invoice_bdt ?? 0),
      0
    )

    const totalReceivable = (customerLedgerRes.data ?? []).reduce(
      (sum, row) => sum + (row.total_due ?? 0),
      0
    )
    const totalPayable = (supplierLedgerRes.data ?? []).reduce(
      (sum, row) => sum + (row.total_due_bdt ?? 0),
      0
    )

    const revenueTrend =
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

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue This Month"
          value={formatTaka(revenueThisMonth)}
          icon={TrendingUp}
          trend={revenueTrend}
          hint={revenueTrend ? undefined : "Delivered orders"}
        />
        <StatCard
          label="Purchases Cleared"
          value={formatTaka(purchasesThisMonth)}
          icon={ShoppingBag}
          hint="Landed cost this month"
        />
        <StatCard
          label="Receivables"
          value={formatTaka(totalReceivable)}
          icon={ArrowDownLeft}
          accent={totalReceivable > 0 ? "amber" : "default"}
          hint="Customer balances due"
        />
        <StatCard
          label="Payables"
          value={formatTaka(totalPayable)}
          icon={ArrowUpRight}
          accent={totalPayable > 0 ? "amber" : "default"}
          hint="Supplier balances due"
        />
      </div>
    )
  } catch {
    return <ErrorCard title="Couldn't load report stats" />
  }
}
