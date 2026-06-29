import { Users, UserCheck, ShoppingCart, Wallet } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { StatCard } from "@/components/shared/stat-card"
import { ErrorCard } from "@/components/shared/error-card"
import { formatTaka } from "@/lib/format"

export async function CustomerStats() {
  const { user } = await getAuthedUser()
  if (!user) return <ErrorCard title="Couldn't load customer stats" />

  const supabase = await createClient()

  try {
    const [activeRes, myOrdersRes] = await Promise.all([
      supabase
        .from("customers")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("sales_orders")
        .select("customer_id, due_amount")
        .eq("created_by", user.id)
        .not("status", "in", "(rejected,cancelled)"),
    ])

    if (activeRes.error) throw activeRes.error
    if (myOrdersRes.error) throw myOrdersRes.error

    const myOrders = myOrdersRes.data ?? []
    const myBuyerIds = new Set(
      myOrders.map((o) => o.customer_id).filter(Boolean)
    )
    const myOutstanding = myOrders.reduce(
      (sum, o) => sum + (o.due_amount ?? 0),
      0
    )

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active Buyers"
          value={activeRes.count ?? 0}
          icon={UserCheck}
          hint="Can place orders"
        />
        <StatCard
          label="My Buyers"
          value={myBuyerIds.size}
          icon={Users}
          hint="Customers you've sold to"
        />
        <StatCard
          label="My Orders"
          value={myOrders.length}
          icon={ShoppingCart}
          hint="Orders you've created"
        />
        <StatCard
          label="My Outstanding Due"
          value={formatTaka(myOutstanding)}
          icon={Wallet}
          accent={myOutstanding > 0 ? "red" : "default"}
          hint={myOutstanding > 0 ? "Collect from customers" : "All paid up"}
        />
      </div>
    )
  } catch {
    return <ErrorCard title="Couldn't load customer stats" />
  }
}
