import { MapPin, Star, Users } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { StatCard } from "@/components/shared/stat-card"

export async function AddressStats() {
  const supabase = await createClient()

  const [totalRes, defaultRes, customersRes] = await Promise.all([
    supabase
      .from("customer_addresses")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("customer_addresses")
      .select("id", { count: "exact", head: true })
      .eq("is_default", true),
    supabase.from("customer_addresses").select("customer_id"),
  ])

  const uniqueCustomers = new Set(
    (customersRes.data ?? []).map((r) => r.customer_id)
  ).size

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        label="Total addresses"
        value={totalRes.count ?? 0}
        icon={MapPin}
        hint="Saved delivery locations"
      />
      <StatCard
        label="Default addresses"
        value={defaultRes.count ?? 0}
        icon={Star}
        hint="Primary per customer"
      />
      <StatCard
        label="Customers with addresses"
        value={uniqueCustomers}
        icon={Users}
        hint="Have at least one saved"
      />
    </div>
  )
}
