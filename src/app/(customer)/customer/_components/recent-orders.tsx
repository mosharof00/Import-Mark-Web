import Link from "next/link"
import { ShoppingCart } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { buttonVariants } from "@/components/ui/button"
import { formatDate, formatTaka } from "@/lib/format"
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
        "id, order_number, status, total_amount, due_amount, created_at"
      )
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    if (error) throw error

    if ((orders ?? []).length === 0) {
      return (
        <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <h2 className="text-foreground mb-4 text-sm font-semibold">
            Recent orders
          </h2>
          <EmptyState
            icon={ShoppingCart}
            title="No orders yet"
            description="Orders placed for your account will appear here."
          />
        </section>
      )
    }

    return (
      <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-foreground text-sm font-semibold">
            Recent orders
          </h2>
          <Link
            href="/customer/orders"
            className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="divide-border divide-y">
          {(orders ?? []).map((order) => {
            const due = order.due_amount ?? 0
            return (
              <Link
                key={order.id}
                href={`/customer/orders/${order.id}`}
                className="hover:bg-muted/40 flex flex-wrap items-center justify-between gap-3 py-3 transition-colors first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-foreground font-medium">
                    {order.order_number ?? "Order"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-foreground text-sm font-medium tabular-nums">
                    {formatTaka(order.total_amount)}
                  </span>
                  {due > 0 ? (
                    <span className="text-xs font-medium text-red-700 tabular-nums dark:text-red-400">
                      Due {formatTaka(due)}
                    </span>
                  ) : null}
                  <StatusBadge
                    kind="order"
                    value={order.status as OrderStatus}
                  />
                </div>
              </Link>
            )
          })}
        </div>
        <div className="mt-4">
          <Link
            href="/customer/orders"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-full"
            )}
          >
            Browse all orders
          </Link>
        </div>
      </section>
    )
  } catch {
    return <ErrorCard title="Couldn't load recent orders" />
  }
}
