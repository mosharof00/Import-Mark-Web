import { CreditCard, Wallet, AlertCircle, Receipt } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { StatCard } from "@/components/shared/stat-card"
import { ErrorCard } from "@/components/shared/error-card"
import { formatTaka } from "@/lib/format"

function monthStart(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}

export async function LedgerStats() {
  const { user } = await getAuthedUser()
  if (!user) return <ErrorCard title="Couldn't load ledger summary" />

  const supabase = await createClient()

  try {
    const { data: ledger, error: ledgerError } = await supabase
      .from("customer_ledger")
      .select("total_orders, total_billed, total_paid, total_due")
      .eq("customer_id", user.id)
      .maybeSingle()

    if (ledgerError) throw ledgerError

    const { data: orders, error: ordersError } = await supabase
      .from("sales_orders")
      .select("id, due_amount")
      .eq("customer_id", user.id)
      .not("status", "in", "(rejected,cancelled)")

    if (ordersError) throw ordersError

    const orderIds = (orders ?? []).map((o) => o.id)
    let paidThisMonth = 0
    let paymentCount = 0

    if (orderIds.length > 0) {
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("amount, payment_date")
        .in("order_id", orderIds)
        .gte("payment_date", monthStart())

      if (paymentsError) throw paymentsError

      paymentCount = payments?.length ?? 0
      paidThisMonth = (payments ?? []).reduce((sum, p) => sum + p.amount, 0)
    }

    let ordersWithBalance = 0
    for (const order of orders ?? []) {
      if ((order.due_amount ?? 0) > 0) ordersWithBalance += 1
    }

    const totalDue = ledger?.total_due ?? 0

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Billed"
          value={formatTaka(ledger?.total_billed ?? 0)}
          icon={Receipt}
          hint={`${ledger?.total_orders ?? 0} order${(ledger?.total_orders ?? 0) === 1 ? "" : "s"}`}
        />
        <StatCard
          label="Total Paid"
          value={formatTaka(ledger?.total_paid ?? 0)}
          icon={CreditCard}
          hint={`${formatTaka(paidThisMonth)} this month`}
        />
        <StatCard
          label="Outstanding Due"
          value={formatTaka(totalDue)}
          icon={Wallet}
          accent={totalDue > 0 ? "red" : "default"}
          hint={totalDue > 0 ? "Balance remaining" : "All settled"}
        />
        <StatCard
          label="Orders With Balance"
          value={ordersWithBalance}
          icon={AlertCircle}
          accent={ordersWithBalance > 0 ? "amber" : "default"}
          hint={
            paymentCount > 0
              ? `${paymentCount} payment${paymentCount === 1 ? "" : "s"} this month`
              : "No payments this month"
          }
        />
      </div>
    )
  } catch {
    return <ErrorCard title="Couldn't load ledger summary" />
  }
}
