import { Ship, Anchor, CircleCheck, Package } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { StatCard } from "@/components/shared/stat-card"
import { ErrorCard } from "@/components/shared/error-card"
import { formatTaka } from "@/lib/format"

import { AT_PORT_STATUSES } from "./import-filters"

function monthStart(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}

export async function ImportStats() {
  const supabase = await createClient()

  try {
    const [totalRes, transitRes, portRes, clearedRes, landedRes] =
      await Promise.all([
        supabase
          .from("import_shipments")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("import_shipments")
          .select("id", { count: "exact", head: true })
          .eq("status", "in_transit"),
        supabase
          .from("import_shipments")
          .select("id", { count: "exact", head: true })
          .in("status", AT_PORT_STATUSES),
        supabase
          .from("import_shipments")
          .select("id", { count: "exact", head: true })
          .eq("status", "cleared")
          .gte("clearance_date", monthStart()),
        supabase
          .from("import_shipments")
          .select("total_landed_cost, total_invoice_bdt")
          .eq("status", "cleared")
          .gte("clearance_date", monthStart()),
      ])

    if (totalRes.error) throw totalRes.error
    if (transitRes.error) throw transitRes.error
    if (portRes.error) throw portRes.error
    if (clearedRes.error) throw clearedRes.error
    if (landedRes.error) throw landedRes.error

    const portCount = portRes.count ?? 0
    const landedThisMonth = (landedRes.data ?? []).reduce(
      (sum, row) =>
        sum + (row.total_landed_cost ?? row.total_invoice_bdt ?? 0),
      0
    )

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Shipments"
          value={totalRes.count ?? 0}
          icon={Package}
          hint="All import records"
        />
        <StatCard
          label="In Transit"
          value={transitRes.count ?? 0}
          icon={Ship}
          accent={(transitRes.count ?? 0) > 0 ? "amber" : "default"}
          hint="On the way"
        />
        <StatCard
          label="At Port"
          value={portCount}
          icon={Anchor}
          accent={portCount > 0 ? "amber" : "default"}
          hint="Arrived or in customs"
        />
        <StatCard
          label="Cleared This Month"
          value={clearedRes.count ?? 0}
          icon={CircleCheck}
          hint={`${formatTaka(landedThisMonth)} landed cost`}
        />
      </div>
    )
  } catch {
    return <ErrorCard title="Couldn't load import stats" />
  }
}
