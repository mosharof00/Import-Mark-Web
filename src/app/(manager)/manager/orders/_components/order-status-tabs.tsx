import Link from "next/link"

import { cn } from "@/lib/utils"

import {
  ORDER_FILTER_LABELS,
  type OrderFilter,
} from "@/app/(admin)/admin/orders/_components/order-filters"

export function OrderStatusTabs({
  active,
  counts,
}: {
  active: OrderFilter
  counts: Record<OrderFilter, number>
}) {
  const tabs = Object.keys(ORDER_FILTER_LABELS) as OrderFilter[]

  return (
    <div className="border-border flex flex-wrap gap-1 border-b">
      {tabs.map((tab) => {
        const isActive = tab === active
        const count = counts[tab]
        return (
          <Link
            key={tab}
            href={
              tab === "all"
                ? "/manager/orders"
                : `/manager/orders?status=${tab}`
            }
            className={cn(
              "relative -mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {ORDER_FILTER_LABELS[tab]}
            <span
              className={cn(
                "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums",
                isActive
                  ? tab === "pending_approval" && count > 0
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                    : "bg-muted text-foreground"
                  : "bg-muted/60 text-muted-foreground"
              )}
            >
              {count}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
