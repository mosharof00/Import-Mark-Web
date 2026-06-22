import { createClient } from "@/lib/supabase/server"
import { ErrorCard } from "@/components/shared/error-card"
import { ORDER_STATUS_CONFIG } from "@/lib/constants"
import type { OrderStatus } from "@/types"

import { RevenueChart } from "@/app/(admin)/admin/_components/revenue-chart"

const PIPELINE_STATUSES: OrderStatus[] = [
  "pending_approval",
  "approved",
  "processing",
  "ready_for_pickup",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "rejected",
]

export async function ReportOverview() {
  const supabase = await createClient()

  try {
    const results = await Promise.all(
      PIPELINE_STATUSES.map((status) =>
        supabase
          .from("sales_orders")
          .select("id", { count: "exact", head: true })
          .eq("status", status)
      )
    )

    for (const res of results) {
      if (res.error) throw res.error
    }

    const counts = PIPELINE_STATUSES.map((status, i) => ({
      status,
      count: results[i].count ?? 0,
    }))

    return (
      <div className="space-y-6">
        <RevenueChart />

        <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="text-foreground text-lg font-semibold">
              Order pipeline
            </h2>
            <span className="text-muted-foreground text-xs tracking-wider uppercase">
              By status
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {counts.map(({ status, count }) => {
              const config = ORDER_STATUS_CONFIG[status]
              return (
                <div
                  key={status}
                  className="border-border rounded-xl border px-4 py-3"
                >
                  <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                    {config.label}
                  </p>
                  <p className="text-foreground mt-1 text-2xl font-semibold tabular-nums">
                    {count}
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    )
  } catch {
    return <ErrorCard title="Couldn't load overview report" />
  }
}
