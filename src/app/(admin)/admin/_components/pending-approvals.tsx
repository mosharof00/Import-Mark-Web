import { CircleCheck } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { ApprovalButtons } from "@/components/shared/approval-buttons"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"
import { formatTaka, formatRelativeTime } from "@/lib/format"
import { approveOrder, rejectOrder } from "@/app/(admin)/admin/actions"

export async function PendingApprovals() {
  const supabase = await createClient()

  try {
    // Pending orders with the customer (to-one) and a count of line items.
    const { data: orders, error } = await supabase
      .from("sales_orders")
      .select(
        "id, order_number, total_amount, paid_amount, due_amount, created_at, created_by, customers(full_name, company_name), order_items(id)"
      )
      .eq("status", "pending_approval")
      .order("created_at", { ascending: true })

    if (error) throw error

    // created_by has no FK to managers, so resolve names with a small lookup.
    const { data: managers } = await supabase
      .from("managers")
      .select("id, full_name")
    const managerName = new Map(
      (managers ?? []).map((m) => [m.id, m.full_name])
    )

    const rows = orders ?? []

    return (
      <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <h2 className="text-foreground text-lg font-semibold">
            Pending Approvals
          </h2>
          {rows.length > 0 ? (
            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
              {rows.length}
            </span>
          ) : null}
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={CircleCheck}
            title="All orders approved"
            description="Nothing is waiting for your review right now."
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
                  <th className="px-3 py-2 text-right font-medium">Paid</th>
                  <th className="px-3 py-2 text-right font-medium">Due</th>
                  <th className="px-3 py-2 font-medium">Created by</th>
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
                    <td className="text-muted-foreground px-3 py-4 text-right tabular-nums">
                      {formatTaka(order.paid_amount)}
                    </td>
                    <td className="px-3 py-4 text-right font-medium tabular-nums text-red-700 dark:text-red-400">
                      {formatTaka(order.due_amount ?? 0)}
                    </td>
                    <td className="text-muted-foreground px-3 py-4 whitespace-nowrap">
                      {managerName.get(order.created_by) ?? "Staff"}
                    </td>
                    <td className="text-muted-foreground px-3 py-4 whitespace-nowrap">
                      {formatRelativeTime(order.created_at)}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex justify-end">
                        <ApprovalButtons
                          itemLabel="order"
                          onApprove={approveOrder.bind(null, order.id)}
                          onReject={rejectOrder.bind(null, order.id)}
                        />
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
    return <ErrorCard title="Couldn't load pending approvals" />
  }
}
