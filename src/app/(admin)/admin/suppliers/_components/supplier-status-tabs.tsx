import Link from "next/link"

import { cn } from "@/lib/utils"

import {
  SUPPLIER_FILTER_LABELS,
  type SupplierFilter,
} from "./supplier-filters"

export function SupplierStatusTabs({
  active,
  counts,
}: {
  active: SupplierFilter
  counts: Record<SupplierFilter, number>
}) {
  const tabs = Object.keys(SUPPLIER_FILTER_LABELS) as SupplierFilter[]

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
                ? "/admin/suppliers"
                : `/admin/suppliers?status=${tab}`
            }
            className={cn(
              "relative -mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {SUPPLIER_FILTER_LABELS[tab]}
            <span
              className={cn(
                "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums",
                isActive
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
