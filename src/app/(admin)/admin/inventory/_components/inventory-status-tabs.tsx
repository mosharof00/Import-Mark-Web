import Link from "next/link"

import { cn } from "@/lib/utils"

import {
  INVENTORY_FILTER_LABELS,
  type InventoryFilter,
} from "./inventory-filters"

export function InventoryStatusTabs({
  active,
  counts,
}: {
  active: InventoryFilter
  counts: Record<InventoryFilter, number>
}) {
  const tabs = Object.keys(INVENTORY_FILTER_LABELS) as InventoryFilter[]

  return (
    <div className="border-border flex flex-wrap gap-1 border-b">
      {tabs.map((tab) => {
        const isActive = tab === active
        const count = counts[tab]
        const isAlertTab =
          tab === "low_stock" || tab === "out_of_stock"

        return (
          <Link
            key={tab}
            href={
              tab === "all"
                ? "/admin/inventory"
                : `/admin/inventory?status=${tab}`
            }
            className={cn(
              "relative -mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {INVENTORY_FILTER_LABELS[tab]}
            <span
              className={cn(
                "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums",
                isActive && isAlertTab && count > 0
                  ? tab === "out_of_stock"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                  : isActive
                    ? "bg-muted text-foreground"
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
