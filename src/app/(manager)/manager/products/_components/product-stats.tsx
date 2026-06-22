import { Package, CircleCheck, Clock, PackageX } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { StatCard } from "@/components/shared/stat-card"
import { ErrorCard } from "@/components/shared/error-card"

export async function ProductStats() {
  const { user } = await getAuthedUser()
  if (!user) return <ErrorCard title="Couldn't load product stats" />

  const supabase = await createClient()

  try {
    const [activeRes, pendingRes, rejectedRes, lowStockRes] =
      await Promise.all([
        supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
        supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("created_by", user.id)
          .eq("status", "pending_approval"),
        supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("created_by", user.id)
          .eq("status", "rejected"),
        supabase
          .from("low_stock_alerts")
          .select("id", { count: "exact", head: true }),
      ])

    if (activeRes.error) throw activeRes.error
    if (pendingRes.error) throw pendingRes.error
    if (rejectedRes.error) throw rejectedRes.error
    if (lowStockRes.error) throw lowStockRes.error

    const pendingCount = pendingRes.count ?? 0
    const rejectedCount = rejectedRes.count ?? 0
    const lowStockCount = lowStockRes.count ?? 0

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active Catalog"
          value={activeRes.count ?? 0}
          icon={CircleCheck}
          hint="Available to sell"
        />
        <StatCard
          label="My Pending"
          value={pendingCount}
          icon={Clock}
          accent={pendingCount > 0 ? "amber" : "default"}
          hint={pendingCount > 0 ? "Awaiting admin" : "None waiting"}
        />
        <StatCard
          label="My Rejected"
          value={rejectedCount}
          icon={Package}
          accent={rejectedCount > 0 ? "red" : "default"}
          hint={rejectedCount > 0 ? "Needs revision" : "None rejected"}
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
