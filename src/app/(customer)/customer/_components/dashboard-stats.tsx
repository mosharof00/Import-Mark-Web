import { CreditCard, ShoppingCart, Wallet, AlertCircle } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { StatCard } from "@/components/shared/stat-card"
import { ErrorCard } from "@/components/shared/error-card"
import { formatTaka } from "@/lib/format"

export async function DashboardStats() {
  const { user } = await getAuthedUser()
  if (!user) return <ErrorCard title="Couldn't load account summary" />

  const supabase = await createClient()

  try {
    const { data: ledger, error } = await supabase
      .from("customer_ledger")
      .select("total_orders, total_billed, total_paid, total_due")
      .eq("customer_id", user.id)
      .maybeSingle()

    if (error) throw error

    const totalDue = ledger?.total_due ?? 0

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Orders"
          value={ledger?.total_orders ?? 0}
          icon={ShoppingCart}
          hint="All time"
        />
        <StatCard
          label="Total Billed"
          value={formatTaka(ledger?.total_billed ?? 0)}
          icon={CreditCard}
          hint="Across all orders"
        />
        <StatCard
          label="Total Paid"
          value={formatTaka(ledger?.total_paid ?? 0)}
          icon={Wallet}
          hint="Payments received"
        />
        <StatCard
          label="Outstanding Due"
          value={formatTaka(totalDue)}
          icon={AlertCircle}
          accent={totalDue > 0 ? "red" : "default"}
          hint={totalDue > 0 ? "Balance remaining" : "All settled"}
        />
      </div>
    )
  } catch {
    return <ErrorCard title="Couldn't load account summary" />
  }
}
