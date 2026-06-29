import { CreditCard } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"
import type { PaymentMode } from "@/types"

import { PaymentsTable, type PaymentRow } from "./payments-table"

export async function PaymentList() {
  const { user } = await getAuthedUser()
  if (!user) return <ErrorCard title="Couldn't load payments" />

  const supabase = await createClient()

  try {
    const { data: orders, error: ordersError } = await supabase
      .from("sales_orders")
      .select("id")
      .eq("created_by", user.id)

    if (ordersError) throw ordersError

    const orderIds = (orders ?? []).map((o) => o.id)
    if (orderIds.length === 0) {
      return (
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <EmptyState
            icon={CreditCard}
            title="No payments yet"
            description="Payments you record against your orders will appear here."
          />
        </div>
      )
    }

    const { data: payments, error } = await supabase
      .from("payments")
      .select(
        "id, amount, payment_mode, payment_date, reference_no, notes, created_at, order_id, sales_orders(order_number, customers(full_name, company_name))"
      )
      .in("order_id", orderIds)
      .order("payment_date", { ascending: false })

    if (error) throw error

    const rows: PaymentRow[] = (payments ?? []).map((p) => ({
      id: p.id,
      amount: p.amount,
      paymentMode: p.payment_mode as PaymentMode,
      paymentDate: p.payment_date,
      referenceNo: p.reference_no,
      notes: p.notes,
      createdAt: p.created_at,
      orderId: p.order_id,
      orderNumber: p.sales_orders?.order_number ?? null,
      customerName: p.sales_orders?.customers?.full_name ?? "Unknown",
      companyName: p.sales_orders?.customers?.company_name ?? null,
    }))

    if (rows.length === 0) {
      return (
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <EmptyState
            icon={CreditCard}
            title="No payments yet"
            description="Payments you record against your orders will appear here."
          />
        </div>
      )
    }

    return <PaymentsTable data={rows} />
  } catch {
    return <ErrorCard title="Couldn't load payments" />
  }
}
