import { Wallet } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"

import { PayablesTable, type PayableRow } from "./payables-table"

export async function PayablesReport() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("supplier_ledger")
      .select(
        "supplier_id, name, country, total_shipments, total_purchased_bdt, total_paid_bdt, total_due_bdt"
      )
      .order("total_due_bdt", { ascending: false, nullsFirst: false })

    if (error) throw error

    const rows: PayableRow[] = (data ?? [])
      .filter((s) => s.supplier_id && s.name)
      .map((s) => ({
        supplierId: s.supplier_id!,
        name: s.name!,
        country: s.country,
        totalShipments: s.total_shipments ?? 0,
        totalPurchased: s.total_purchased_bdt ?? 0,
        totalPaid: s.total_paid_bdt ?? 0,
        totalDue: s.total_due_bdt ?? 0,
      }))

    if (rows.length === 0) {
      return (
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <EmptyState
            icon={Wallet}
            title="No payables data"
            description="Supplier balances will appear once import shipments are recorded."
          />
        </div>
      )
    }

    return <PayablesTable data={rows} />
  } catch {
    return <ErrorCard title="Couldn't load payables report" />
  }
}
