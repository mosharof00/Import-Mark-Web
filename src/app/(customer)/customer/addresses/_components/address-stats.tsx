import { MapPin, Star } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { StatCard } from "@/components/shared/stat-card"
import { ErrorCard } from "@/components/shared/error-card"

export async function AddressStats() {
  const { user } = await getAuthedUser()
  if (!user) return <ErrorCard title="Couldn't load address stats" />

  const supabase = await createClient()

  const [totalRes, defaultRes] = await Promise.all([
    supabase
      .from("customer_addresses")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", user.id),
    supabase
      .from("customer_addresses")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", user.id)
      .eq("is_default", true),
  ])

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <StatCard
        label="Saved addresses"
        value={totalRes.count ?? 0}
        icon={MapPin}
        hint="Delivery locations"
      />
      <StatCard
        label="Default address"
        value={(defaultRes.count ?? 0) > 0 ? "Set" : "None"}
        icon={Star}
        hint={
          (defaultRes.count ?? 0) > 0
            ? "Primary delivery location"
            : "Set a default for faster checkout"
        }
      />
    </div>
  )
}
