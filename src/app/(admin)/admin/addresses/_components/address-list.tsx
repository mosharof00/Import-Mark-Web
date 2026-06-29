import { MapPin } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"

import { AddressesTable, type AddressRow } from "./addresses-table"

export async function AddressList({
  basePath,
  customerId,
}: {
  basePath: string
  customerId?: string
}) {
  const supabase = await createClient()

  try {
    let query = supabase
      .from("customer_addresses")
      .select(
        "id, label, recipient_name, city, country, is_default, created_at, customers(full_name, company_name)"
      )
      .order("created_at", { ascending: false })

    if (customerId) {
      query = query.eq("customer_id", customerId)
    }

    const { data: addresses, error } = await query
    if (error) throw error

    const rows: AddressRow[] = (addresses ?? []).map((a) => ({
      id: a.id,
      label: a.label,
      customerName: a.customers?.full_name ?? "Unknown",
      companyName: a.customers?.company_name ?? null,
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
            description={
              customerId
                ? "This customer has no saved addresses yet."
                : "Add addresses for customers so orders can be delivered to the right location."
            }
          />
        </div>
      )
    }

    return <AddressesTable data={rows} basePath={basePath} />
  } catch {
    return <ErrorCard title="Couldn't load addresses" />
  }
}
