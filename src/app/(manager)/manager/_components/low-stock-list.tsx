import Link from "next/link"
import { Boxes, ArrowRight } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"

export async function LowStockList() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("low_stock_alerts")
      .select("id, name, category, quantity_available, low_stock_threshold")
      .order("quantity_available", { ascending: true })
      .limit(6)

    if (error) throw error

    const rows = data ?? []

    return (
      <section className="border-border bg-card flex h-full flex-col rounded-2xl border p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-foreground text-lg font-semibold">
              Low Stock Alerts
            </h2>
            {rows.length > 0 ? (
              <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/50 dark:text-red-300">
                {rows.length}
              </span>
            ) : null}
          </div>
          <Link
            href="/manager/inventory"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs transition-colors"
          >
            View inventory
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="Stock is healthy"
            description="No products are at or below their threshold."
          />
        ) : (
          <ul className="divide-border divide-y">
            {rows.map((item, index) => (
              <li
                key={item.id ?? index}
                className="animate-fade-up flex items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="min-w-0">
                  <p className="text-foreground truncate font-medium">
                    {item.name ?? "Unnamed product"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {item.category ?? "Uncategorized"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums text-red-700 dark:text-red-400">
                    {item.quantity_available ?? 0}
                  </p>
                  <p className="text-muted-foreground text-xs tabular-nums">
                    threshold {item.low_stock_threshold ?? 0}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    )
  } catch {
    return <ErrorCard title="Couldn't load low stock alerts" />
  }
}
