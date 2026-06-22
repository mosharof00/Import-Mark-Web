import { Wallet, Clock, Banknote, Truck } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { StatCard } from "@/components/shared/stat-card"
import { ErrorCard } from "@/components/shared/error-card"
import { formatTaka } from "@/lib/format"

import { IN_PROGRESS_STATUSES } from "@/app/(admin)/admin/orders/_components/order-filters"

function monthStart(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
}

export async function KpiCards() {
  const { user } = await getAuthedUser()
  if (!user) return <ErrorCard title="Couldn't load key metrics" />

  const supabase = await createClient()

  try {
    const [deliveredRes, pendingRes, dueRes, progressRes] = await Promise.all([
      supabase
        .from("sales_orders")
        .select("total_amount")
        .eq("created_by", user.id)
        .eq("status", "delivered")
        .gte("delivered_at", monthStart()),
      supabase
        .from("sales_orders")
        .select("id", { count: "exact", head: true })
        .eq("created_by", user.id)
        .eq("status", "pending_approval"),
      supabase
        .from("sales_orders")
        .select("due_amount")
        .eq("created_by", user.id)
        .gt("due_amount", 0)
        .not("status", "in", "(rejected,cancelled)"),
      supabase
        .from("sales_orders")
        .select("id", { count: "exact", head: true })
        .eq("created_by", user.id)
        .in("status", IN_PROGRESS_STATUSES),
    ])

    if (deliveredRes.error) throw deliveredRes.error
    if (pendingRes.error) throw pendingRes.error
    if (dueRes.error) throw dueRes.error
    if (progressRes.error) throw progressRes.error

    const salesThisMonth = (deliveredRes.data ?? []).reduce(
      (sum: number, row) => sum + (row.total_amount ?? 0),
      0
    )
    const outstandingDue = (dueRes.data ?? []).reduce(
      (sum: number, row) => sum + (row.due_amount ?? 0),
      0
    )
    const pendingCount = pendingRes.count ?? 0
    const inProgressCount = progressRes.count ?? 0

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Sales This Month"
          value={formatTaka(salesThisMonth)}
          icon={Wallet}
          hint="Delivered orders"
        />
        <StatCard
          label="Pending Approval"
          value={pendingCount}
          icon={Clock}
          accent={pendingCount > 0 ? "amber" : "default"}
          hint={pendingCount > 0 ? "Waiting on admin" : "None pending"}
        />
        <StatCard
          label="Outstanding Due"
          value={formatTaka(outstandingDue)}
          icon={Banknote}
          accent={outstandingDue > 0 ? "red" : "default"}
          hint={outstandingDue > 0 ? "Collect from customers" : "All paid up"}
        />
        <StatCard
          label="In Progress"
          value={inProgressCount}
          icon={Truck}
          hint="Approved through delivery"
        />
      </div>
    )
  } catch {
    return <ErrorCard title="Couldn't load key metrics" />
  }
}
