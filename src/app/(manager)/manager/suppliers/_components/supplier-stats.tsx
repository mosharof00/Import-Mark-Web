import { Building2, CircleCheck, CircleOff, Wallet } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { StatCard } from "@/components/shared/stat-card"
import { ErrorCard } from "@/components/shared/error-card"
import { formatTaka } from "@/lib/format"

export async function SupplierStats() {
  const supabase = await createClient()

  try {
    const [totalRes, activeRes, inactiveRes, ledgerRes] = await Promise.all([
      supabase.from("suppliers").select("id", { count: "exact", head: true }),
      supabase
        .from("suppliers")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("suppliers")
        .select("id", { count: "exact", head: true })
        .eq("is_active", false),
      supabase.from("supplier_ledger").select("total_due_bdt"),
    ])

    if (totalRes.error) throw totalRes.error
    if (activeRes.error) throw activeRes.error
    if (inactiveRes.error) throw inactiveRes.error
    if (ledgerRes.error) throw ledgerRes.error

    const totalDue = (ledgerRes.data ?? []).reduce(
      (sum, row) => sum + (row.total_due_bdt ?? 0),
      0
    )

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Suppliers"
          value={totalRes.count ?? 0}
          icon={Building2}
          hint="Import partners"
        />
        <StatCard
          label="Active"
          value={activeRes.count ?? 0}
          icon={CircleCheck}
          hint="Available for imports"
        />
        <StatCard
          label="Inactive"
          value={inactiveRes.count ?? 0}
          icon={CircleOff}
          hint="Archived suppliers"
        />
        <StatCard
          label="Outstanding Due"
          value={formatTaka(totalDue)}
          icon={Wallet}
          accent={totalDue > 0 ? "amber" : "default"}
          hint="Unpaid purchase balance"
        />
      </div>
    )
  } catch {
    return <ErrorCard title="Couldn't load supplier stats" />
  }
}
