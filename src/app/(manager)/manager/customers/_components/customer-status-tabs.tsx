import Link from "next/link"

import { cn } from "@/lib/utils"

import {
  CUSTOMER_FILTER_LABELS,
  type CustomerFilter,
} from "@/app/(admin)/admin/customers/_components/customer-filters"

export function CustomerStatusTabs({
  active,
  counts,
}: {
  active: CustomerFilter
  counts: Record<CustomerFilter, number>
}) {
  const tabs = Object.keys(CUSTOMER_FILTER_LABELS) as CustomerFilter[]

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
                ? "/manager/customers"
                : `/manager/customers?status=${tab}`
            }
            className={cn(
              "relative -mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {CUSTOMER_FILTER_LABELS[tab]}
            <span
              className={cn(
                "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums",
                isActive
                  ? tab === "pending" && count > 0
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
