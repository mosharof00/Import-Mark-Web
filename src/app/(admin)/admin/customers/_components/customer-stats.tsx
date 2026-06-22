import { Users, UserCheck, Clock, Wallet } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { StatCard } from "@/components/shared/stat-card"
import { ErrorCard } from "@/components/shared/error-card"
import { formatTaka } from "@/lib/format"

export async function CustomerStats() {
  const supabase = await createClient()

  try {
    const [totalRes, activeRes, pendingRes, ledgerRes] = await Promise.all([
      supabase.from("customers").select("id", { count: "exact", head: true }),
      supabase
        .from("customers")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("customers")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase.from("customer_ledger").select("total_due"),
    ])

    if (totalRes.error) throw totalRes.error
    if (activeRes.error) throw activeRes.error
    if (pendingRes.error) throw pendingRes.error
    if (ledgerRes.error) throw ledgerRes.error

    const pendingCount = pendingRes.count ?? 0
    const totalDue = (ledgerRes.data ?? []).reduce(
      (sum, row) => sum + (row.total_due ?? 0),
      0
    )

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Customers"
          value={totalRes.count ?? 0}
          icon={Users}
          hint="Registered accounts"
        />
        <StatCard
          label="Active"
          value={activeRes.count ?? 0}
          icon={UserCheck}
          hint="Can place orders"
        />
        <StatCard
          label="Pending Activation"
          value={pendingCount}
          icon={Clock}
          accent={pendingCount > 0 ? "amber" : "default"}
          hint={pendingCount > 0 ? "Awaiting approval" : "All reviewed"}
        />
        <StatCard
          label="Outstanding Due"
          value={formatTaka(totalDue)}
          icon={Wallet}
          accent={totalDue > 0 ? "amber" : "default"}
          hint="Across all customers"
        />
      </div>
    )
  } catch {
    return <ErrorCard title="Couldn't load customer stats" />
  }
}
