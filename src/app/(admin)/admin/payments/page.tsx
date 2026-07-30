import { Suspense } from "react"
import { Wallet } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"
import { FadeIn } from "@/components/shared/fade-in"
import {
  OutstandingOrdersTable,
  type OutstandingOrderRow,
} from "@/app/(manager)/manager/payments/_components/outstanding-orders-table"
import {
  PaymentsTable,
  type PaymentRow,
} from "@/app/(manager)/manager/payments/_components/payments-table"
import type { OrderStatus, PaymentMode } from "@/types"

export const dynamic = "force-dynamic"

async function AdminOutstandingList() {
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

    return (
      <OutstandingOrdersTable
        data={rows}
        orderHrefBase="/admin/orders"
        gateways={gateways}
      />
    )
  } catch {
    return <ErrorCard title="Couldn't load outstanding orders" />
  }
}

async function AdminPaymentHistoryList() {
  const supabase = await createClient()

  try {
    const { data: payments, error } = await supabase
      .from("payments")
      .select(
        "id, amount, payment_mode, payment_date, reference_no, notes, proof_image_url, created_at, order_id, payment_gateways(name), sales_orders(order_number, customers(full_name, company_name))"
      )
      .order("payment_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) throw error

    const rows: PaymentRow[] = (payments ?? []).map((p) => ({
      id: p.id,
      amount: p.amount,
      paymentMode: p.payment_mode as PaymentMode,
      paymentDate: p.payment_date,
      referenceNo: p.reference_no,
      notes: p.notes,
      proofImageUrl: p.proof_image_url,
      gatewayName: p.payment_gateways?.name ?? null,
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
            icon={Wallet}
            title="No payments yet"
            description="Recorded payments with proof images will appear here."
          />
        </div>
      )
    }

    return <PaymentsTable data={rows} orderHrefBase="/admin/orders" />
  } catch {
    return <ErrorCard title="Couldn't load payments" />
  }
}

export default async function AdminPaymentsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Payments"
        description="Track every payment on due orders — amount, gateway, and receipt or cheque proof."
      />

      <FadeIn>
        <section className="space-y-3">
          <h2 className="text-foreground text-sm font-semibold tracking-wide">
            Outstanding balances
          </h2>
          <Suspense
            fallback={
              <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
                Loading…
              </div>
            }
          >
            <AdminOutstandingList />
          </Suspense>
        </section>
      </FadeIn>

      <FadeIn delay={0.05}>
        <section className="space-y-3">
          <h2 className="text-foreground text-sm font-semibold tracking-wide">
            Recent payments
          </h2>
          <Suspense
            fallback={
              <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
                Loading…
              </div>
            }
          >
            <AdminPaymentHistoryList />
          </Suspense>
        </section>
      </FadeIn>
    </div>
  )
}
