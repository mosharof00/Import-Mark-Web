import Link from "next/link"

import { cn } from "@/lib/utils"

type TabId = "orders" | "products"

/**
 * Server-driven tab bar for the Approvals page. Tabs are plain links that set
 * `?tab=`, so the active list is chosen on the server (no client state) and each
 * list keeps fetching in a Server Component. Counts render as small badges.
 */
export function ApprovalTabs({
  active,
  orderCount,
  productCount,
}: {
  active: TabId
  orderCount: number
  productCount: number
}) {
  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "orders", label: "Orders", count: orderCount },
    { id: "products", label: "Products", count: productCount },
  ]

  return (
    <div className="border-border flex gap-1 border-b">
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <Link
            key={tab.id}
            href={`/admin/approvals?tab=${tab.id}`}
            className={cn(
              "relative -mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.count > 0 ? (
              <span
                className={cn(
                  "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium",
                  isActive
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </Link>
        )
      })}
    </div>
  )
}
