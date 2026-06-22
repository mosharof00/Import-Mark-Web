import Link from "next/link"
import { ShoppingCart, ArrowRight } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { buttonVariants } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatRelativeTime, formatTaka } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/types"

export async function RecentOrders() {
  const { user } = await getAuthedUser()
  if (!user) return <ErrorCard title="Couldn't load recent orders" />

  const supabase = await createClient()

  try {
    const { data: orders, error } = await supabase
      .from("sales_orders")
      .select(
        "id, order_number, total_amount, due_amount, status, created_at, customers(full_name)"
      )
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })
      .limit(6)

    if (error) throw error

    const rows = orders ?? []

    return (
      <section className="border-border bg-card flex h-full flex-col rounded-2xl border p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-foreground text-lg font-semibold">
            Recent Orders
          </h2>
          <Link
            href="/manager/orders"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs transition-colors"
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No orders yet"
            description="Orders you create for customers will show up here."
          />
        ) : (
          <ul className="divide-border divide-y">
            {rows.map((order, index) => (
              <li
                key={order.id}
                className="animate-fade-up flex items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="min-w-0">
                  <p className="text-foreground truncate font-medium">
                    {order.order_number ?? "—"}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {order.customers?.full_name ?? "Unknown"} ·{" "}
                    {formatRelativeTime(order.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="hidden text-right sm:block">
                    <p className="text-foreground text-sm font-medium tabular-nums">
                      {formatTaka(order.total_amount)}
                    </p>
                    {(order.due_amount ?? 0) > 0 ? (
                      <p className="text-xs font-medium tabular-nums text-red-700 dark:text-red-400">
                        {formatTaka(order.due_amount)} due
                      </p>
                    ) : null}
                  </div>
                  <StatusBadge
                    kind="order"
                    value={order.status as OrderStatus}
                  />
                  <Link
                    href={`/manager/orders/${order.id}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "rounded-full px-3"
                    )}
                  >
                    View
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    )
  } catch {
    return <ErrorCard title="Couldn't load recent orders" />
  }
}
