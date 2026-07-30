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
            icon={CreditCard}
            title="No payments yet"
            description="Payments recorded against orders will appear here."
          />
        </div>
      )
    }

    return <PaymentsTable data={rows} />
  } catch {
    return <ErrorCard title="Couldn't load payments" />
  }
}
