import { ShoppingCart } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"
import type { OrderStatus } from "@/types"

import {
  CLOSED_STATUSES,
  IN_PROGRESS_STATUSES,
  ORDER_FILTER_LABELS,
  type OrderFilter,
} from "./order-filters"
import { OrdersTable, type OrderRow } from "./orders-table"

export async function OrderList({ status }: { status: OrderFilter }) {
  const supabase = await createClient()

  try {
    let query = supabase
      .from("sales_orders")
      .select(
        "id, order_number, total_amount, paid_amount, due_amount, status, created_at, created_by, customers(full_name, company_name), order_items(id)"
      )
      .order("created_at", { ascending: false })

    if (status === "pending_approval") {
      query = query.eq("status", "pending_approval")
    } else if (status === "in_progress") {
      query = query.in("status", IN_PROGRESS_STATUSES)
    } else if (status === "delivered") {
      query = query.eq("status", "delivered")
    } else if (status === "closed") {
      query = query.in("status", CLOSED_STATUSES)
    }

    const { data: orders, error } = await query
    if (error) throw error

    const { data: managers } = await supabase
      .from("managers")
      .select("id, full_name")
    const managerName = new Map(
      (managers ?? []).map((m) => [m.id, m.full_name])
    )

    const rows: OrderRow[] = (orders ?? []).map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customers?.full_name ?? "Unknown",
      companyName: order.customers?.company_name ?? null,
      itemCount: order.order_items?.length ?? 0,
      totalAmount: order.total_amount,
      paidAmount: order.paid_amount,
      dueAmount: order.due_amount ?? 0,
      status: order.status as OrderStatus,
      createdByName: managerName.get(order.created_by) ?? "Staff",
      createdAt: order.created_at,
    }))

    if (rows.length === 0) {
      return (
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <EmptyState
            icon={ShoppingCart}
            title="No orders found"
            description={
              status === "all"
                ? "Sales orders will appear here once managers create them."
                : `No orders in "${ORDER_FILTER_LABELS[status]}".`
            }
          />
        </div>
      )
    }

    return <OrdersTable data={rows} />
  } catch {
    return <ErrorCard title="Couldn't load orders" />
  }
}
