import { CreditCard, CheckCircle2, XCircle } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { StatCard } from "@/components/shared/stat-card"

export async function GatewayStats() {
  const supabase = await createClient()

  const [allRes, activeRes, inactiveRes] = await Promise.all([
    supabase.from("payment_gateways").select("id", { count: "exact", head: true }),
    supabase
      .from("payment_gateways")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("payment_gateways")
      .select("id", { count: "exact", head: true })
      .eq("status", "inactive"),
  ])

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        label="Total gateways"
        value={allRes.count ?? 0}
        icon={CreditCard}
        hint="All payment methods"
      />
      <StatCard
        label="Active"
        value={activeRes.count ?? 0}
        icon={CheckCircle2}
        hint="Available on new orders"
      />
      <StatCard
        label="Inactive"
        value={inactiveRes.count ?? 0}
        icon={XCircle}
        hint="Hidden from order placement"
      />
    </div>
  )
}
