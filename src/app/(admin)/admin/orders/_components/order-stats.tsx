import { ShoppingCart, Clock, Truck, CircleCheck } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { StatCard } from "@/components/shared/stat-card"
import { ErrorCard } from "@/components/shared/error-card"

import { IN_PROGRESS_STATUSES } from "./order-filters"

function monthStart(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
}

export async function OrderStats() {
  const supabase = await createClient()

  try {
    const [totalRes, pendingRes, progressRes, deliveredRes] = await Promise.all([
      supabase.from("sales_orders").select("id", { count: "exact", head: true }),
      supabase
        .from("sales_orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending_approval"),
      supabase
        .from("sales_orders")
        .select("id", { count: "exact", head: true })
        .in("status", IN_PROGRESS_STATUSES),
      supabase
        .from("sales_orders")
        .select("id", { count: "exact", head: true })
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
          label="Total Orders"
          value={totalRes.count ?? 0}
          icon={ShoppingCart}
          hint="All time"
        />
        <StatCard
          label="Pending Approval"
          value={pendingCount}
          icon={Clock}
          accent={pendingCount > 0 ? "amber" : "default"}
          hint={pendingCount > 0 ? "Needs your review" : "All reviewed"}
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
