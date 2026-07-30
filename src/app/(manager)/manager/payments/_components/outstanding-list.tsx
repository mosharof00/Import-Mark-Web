import { Wallet } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"
import type { OrderStatus, PaymentMode } from "@/types"

import {
  OutstandingOrdersTable,
  type OutstandingOrderRow,
} from "./outstanding-orders-table"

export async function OutstandingList() {
  const { user } = await getAuthedUser()
  if (!user) return <ErrorCard title="Couldn't load outstanding orders" />

  const supabase = await createClient()

  try {
    const [ordersRes, gatewaysRes] = await Promise.all([
      supabase
        .from("sales_orders")
        .select(
          "id, order_number, total_amount, paid_amount, due_amount, status, customers(full_name, company_name)"
        )
        .gt("due_amount", 0)
        .not("status", "in", "(rejected,cancelled)")
        .order("due_amount", { ascending: false }),
      supabase
        .from("payment_gateways")
        .select("id, name, type")
        .eq("status", "active")
        .order("sort_order"),
    ])

    if (ordersRes.error) throw ordersRes.error

    const gateways = (gatewaysRes.data ?? []).map((g) => ({
      id: g.id,
      name: g.name,
      type: g.type as PaymentMode,
    }))

    const rows: OutstandingOrderRow[] = (ordersRes.data ?? []).map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      customerName: o.customers?.full_name ?? "Unknown",
      companyName: o.customers?.company_name ?? null,
      totalAmount: o.total_amount,
      paidAmount: o.paid_amount,
      dueAmount: o.due_amount ?? 0,
      status: o.status as OrderStatus,
    }))

    if (rows.length === 0) {
      return (
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <EmptyState
            icon={Wallet}
            title="All caught up"
            description="No orders have an outstanding balance."
          />
        </div>
      )
    }

    return <OutstandingOrdersTable data={rows} gateways={gateways} />
  } catch {
    return <ErrorCard title="Couldn't load outstanding orders" />
  }
}
