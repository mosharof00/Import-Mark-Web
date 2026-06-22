import Link from "next/link"

import { cn } from "@/lib/utils"

import { AddProductButton } from "./add-product-button"

export type ProductFilter = "all" | "active" | "pending_approval" | "rejected"

export function ProductStatusTabs({
  active,
  counts,
}: {
  active: ProductFilter
  counts: Record<ProductFilter, number>
}) {
  const tabs: { id: ProductFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "pending_approval", label: "Pending" },
    { id: "rejected", label: "Rejected" },
  ]

  return (
    <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b">
      <div className="flex flex-wrap gap-1">
        {tabs.map((tab) => {
          const isActive = tab.id === active
          const count = counts[tab.id]
          return (
            <Link
              key={tab.id}
              href={
                tab.id === "all"
                  ? "/manager/products"
                  : `/manager/products?status=${tab.id}`
              }
              className={cn(
                "relative -mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
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
      <AddProductButton />
    </div>
  )
}
