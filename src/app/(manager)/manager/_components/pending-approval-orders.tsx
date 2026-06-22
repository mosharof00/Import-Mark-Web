import Link from "next/link"
import { Clock, ArrowRight } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { buttonVariants } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"
import { formatTaka, formatRelativeTime } from "@/lib/format"
import { cn } from "@/lib/utils"

export async function PendingApprovalOrders() {
  const { user } = await getAuthedUser()
  if (!user) return <ErrorCard title="Couldn't load pending orders" />

  const supabase = await createClient()

  try {
    const { data: orders, error } = await supabase
      .from("sales_orders")
      .select(
        "id, order_number, total_amount, due_amount, created_at, customers(full_name, company_name), order_items(id)"
      )
      .eq("created_by", user.id)
      .eq("status", "pending_approval")
      .order("created_at", { ascending: true })
      .limit(8)

    if (error) throw error

    const rows = orders ?? []

    return (
      <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-foreground text-lg font-semibold">
              Awaiting Admin Approval
            </h2>
            {rows.length > 0 ? (
              <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                {rows.length}
              </span>
            ) : null}
          </div>
          <Link
            href="/manager/orders?status=pending_approval"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs transition-colors"
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No orders waiting"
            description="New orders you create will appear here until an admin approves them."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-muted-foreground text-left text-xs tracking-wider uppercase">
                  <th className="px-3 py-2 font-medium">Order #</th>
                  <th className="px-3 py-2 font-medium">Customer</th>
                  <th className="px-3 py-2 text-center font-medium">Items</th>
                  <th className="px-3 py-2 text-right font-medium">Total</th>
                  <th className="px-3 py-2 text-right font-medium">Due</th>
                  <th className="px-3 py-2 font-medium">When</th>
                  <th className="px-3 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((order, index) => (
                  <tr
                    key={order.id}
                    className="border-border animate-fade-up hover:bg-muted/40 border-t transition-colors"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <td className="text-foreground px-3 py-4 font-medium whitespace-nowrap">
                      {order.order_number ?? "—"}
                    </td>
                    <td className="px-3 py-4">
                      <div className="text-foreground font-medium">
                        {order.customers?.full_name ?? "Unknown"}
                      </div>
                      {order.customers?.company_name ? (
                        <div className="text-muted-foreground text-xs">
                          {order.customers.company_name}
                        </div>
                      ) : null}
                    </td>
                    <td className="text-foreground px-3 py-4 text-center tabular-nums">
                      {order.order_items?.length ?? 0}
                    </td>
                    <td className="text-foreground px-3 py-4 text-right tabular-nums">
                      {formatTaka(order.total_amount)}
                    </td>
                    <td className="px-3 py-4 text-right font-medium tabular-nums text-red-700 dark:text-red-400">
                      {formatTaka(order.due_amount ?? 0)}
                    </td>
                    <td className="text-muted-foreground px-3 py-4 whitespace-nowrap">
                      {formatRelativeTime(order.created_at)}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex justify-end">
                        <Link
                          href={`/manager/orders/${order.id}`}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "rounded-full px-4"
                          )}
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    )
  } catch {
    return <ErrorCard title="Couldn't load pending orders" />
  }
}
