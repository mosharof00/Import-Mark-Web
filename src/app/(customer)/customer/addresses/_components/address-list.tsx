import { MapPin } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"

import { AddressesTable, type AddressRow } from "./addresses-table"

export async function AddressList() {
  const { user } = await getAuthedUser()
  if (!user) return <ErrorCard title="Couldn't load addresses" />

  const supabase = await createClient()

  try {
    const { data: addresses, error } = await supabase
      .from("customer_addresses")
      .select(
        "id, label, recipient_name, city, country, is_default, created_at"
      )
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    const rows: AddressRow[] = (addresses ?? []).map((a) => ({
      id: a.id,
      label: a.label,
      recipientName: a.recipient_name,
      city: a.city,
      country: a.country,
      isDefault: a.is_default,
      createdAt: a.created_at,
    }))

    if (rows.length === 0) {
      return (
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <EmptyState
            icon={MapPin}
            title="No delivery addresses yet"
            description="Add an address so orders can be delivered to the right location."
          />
        </div>
      )
    }

    return <AddressesTable data={rows} />
  } catch {
    return <ErrorCard title="Couldn't load addresses" />
  }
}
