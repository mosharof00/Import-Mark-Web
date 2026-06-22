import { CircleCheck } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { ApprovalButtons } from "@/components/shared/approval-buttons"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"
import { formatTaka, formatRelativeTime } from "@/lib/format"
import { approveOrder, rejectOrder } from "@/app/(admin)/admin/actions"

/**
 * Full list of orders awaiting admin approval (the dashboard shows the same
 * data in a compact card; this is the dedicated, unbounded view).
 */
export async function OrderApprovals() {
  const supabase = await createClient()

  try {
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

    if (rows.length === 0) {
      return (
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <EmptyState
            icon={CircleCheck}
            title="All orders approved"
            description="Nothing is waiting for your review right now."
          />
        </div>
      )
    }

    return (
      <div className="border-border bg-card overflow-x-auto rounded-2xl border p-2 shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-muted-foreground text-left text-xs tracking-wider uppercase">
              <th className="px-3 py-3 font-medium">Order #</th>
              <th className="px-3 py-3 font-medium">Customer</th>
              <th className="px-3 py-3 text-center font-medium">Items</th>
              <th className="px-3 py-3 text-right font-medium">Total</th>
              <th className="px-3 py-3 text-right font-medium">Paid</th>
              <th className="px-3 py-3 text-right font-medium">Due</th>
              <th className="px-3 py-3 font-medium">Created by</th>
              <th className="px-3 py-3 font-medium">When</th>
              <th className="px-3 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((order, index) => (
              <tr
                key={order.id}
                className="border-border animate-fade-up hover:bg-muted/40 border-t transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
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
    )
  } catch {
    return <ErrorCard title="Couldn't load order approvals" />
  }
}
