import { Package, CircleCheck, Clock, PackageX } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { StatCard } from "@/components/shared/stat-card"
import { ErrorCard } from "@/components/shared/error-card"

/** Summary KPI row for the product catalog overview. */
export async function ProductStats() {
  const supabase = await createClient()

  try {
    const [totalRes, activeRes, pendingRes, lowStockRes] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending_approval"),
      supabase
        .from("low_stock_alerts")
        .select("id", { count: "exact", head: true }),
    ])

    if (totalRes.error) throw totalRes.error
    if (activeRes.error) throw activeRes.error
    if (pendingRes.error) throw pendingRes.error
    if (lowStockRes.error) throw lowStockRes.error

    const pendingCount = pendingRes.count ?? 0
    const lowStockCount = lowStockRes.count ?? 0

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Products"
          value={totalRes.count ?? 0}
          icon={Package}
          hint="In catalog"
        />
        <StatCard
          label="Active"
          value={activeRes.count ?? 0}
          icon={CircleCheck}
          hint="Live for sale"
        />
        <StatCard
          label="Pending Approval"
          value={pendingCount}
          icon={Clock}
          accent={pendingCount > 0 ? "amber" : "default"}
          hint={pendingCount > 0 ? "Needs review" : "All reviewed"}
        />
        <StatCard
          label="Low Stock"
          value={lowStockCount}
          icon={PackageX}
          accent={lowStockCount > 0 ? "red" : "default"}
          hint={lowStockCount > 0 ? "At or below threshold" : "Stock healthy"}
        />
      </div>
    )
  } catch {
    return <ErrorCard title="Couldn't load product stats" />
  }
}
