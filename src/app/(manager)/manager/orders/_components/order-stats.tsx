import { ShoppingCart, Clock, Truck, CircleCheck } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { StatCard } from "@/components/shared/stat-card"
import { ErrorCard } from "@/components/shared/error-card"

import { IN_PROGRESS_STATUSES } from "@/app/(admin)/admin/orders/_components/order-filters"

function monthStart(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
}

export async function OrderStats() {
  const { user } = await getAuthedUser()
  if (!user) return <ErrorCard title="Couldn't load order stats" />

  const supabase = await createClient()

  try {
    const base = () =>
      supabase
        .from("sales_orders")
        .select("id", { count: "exact", head: true })
        .eq("created_by", user.id)

    const [totalRes, pendingRes, progressRes, deliveredRes] = await Promise.all([
      base(),
      base().eq("status", "pending_approval"),
      base().in("status", IN_PROGRESS_STATUSES),
      base()
        .eq("status", "delivered")
        .gte("delivered_at", monthStart()),
    ])

    if (totalRes.error) throw totalRes.error
    if (pendingRes.error) throw pendingRes.error
    if (progressRes.error) throw progressRes.error
    if (deliveredRes.error) throw deliveredRes.error

    const pendingCount = pendingRes.count ?? 0

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="My Orders"
          value={totalRes.count ?? 0}
          icon={ShoppingCart}
          hint="All time"
        />
        <StatCard
          label="Pending Approval"
          value={pendingCount}
          icon={Clock}
          accent={pendingCount > 0 ? "amber" : "default"}
          hint={pendingCount > 0 ? "Waiting on admin" : "None pending"}
        />
        <StatCard
          label="In Progress"
          value={progressRes.count ?? 0}
          icon={Truck}
          hint="Approved through delivery"
        />
        <StatCard
          label="Delivered This Month"
          value={deliveredRes.count ?? 0}
          icon={CircleCheck}
          hint="Completed orders"
        />
      </div>
    )
  } catch {
    return <ErrorCard title="Couldn't load order stats" />
  }
}
