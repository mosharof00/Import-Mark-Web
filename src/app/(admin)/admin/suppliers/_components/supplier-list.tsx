import { Building2 } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"

import { SuppliersTable, type SupplierRow } from "./suppliers-table"
import type { SupplierFilter } from "./supplier-filters"

/** Fetches suppliers (optionally filtered by active status) and renders the table. */
export async function SupplierList({ status }: { status: SupplierFilter }) {
  const supabase = await createClient()

  try {
    let query = supabase
      .from("suppliers")
      .select(
        "id, name, country, contact_person, email, phone, is_active, created_at"
      )
      .order("created_at", { ascending: false })

    if (status === "active") {
      query = query.eq("is_active", true)
    } else if (status === "inactive") {
      query = query.eq("is_active", false)
    }

    const { data: suppliers, error } = await query
    if (error) throw error

    const supplierIds = (suppliers ?? []).map((s) => s.id)
    const ledgerBySupplier = new Map<
      string,
      {
        total_shipments: number
        total_purchased_bdt: number
        total_due_bdt: number
      }
    >()

    if (supplierIds.length > 0) {
      const { data: ledgerRows, error: ledgerError } = await supabase
        .from("supplier_ledger")
        .select(
          "supplier_id, total_shipments, total_purchased_bdt, total_due_bdt"
        )
        .in("supplier_id", supplierIds)

      if (ledgerError) throw ledgerError

      for (const row of ledgerRows ?? []) {
        if (!row.supplier_id) continue
        ledgerBySupplier.set(row.supplier_id, {
          total_shipments: row.total_shipments ?? 0,
          total_purchased_bdt: row.total_purchased_bdt ?? 0,
          total_due_bdt: row.total_due_bdt ?? 0,
        })
      }
    }

    const rows: SupplierRow[] = (suppliers ?? []).map((s) => {
      const ledger = ledgerBySupplier.get(s.id)

      return {
        id: s.id,
        name: s.name,
        country: s.country,
        contactPerson: s.contact_person,
        email: s.email,
        phone: s.phone,
        shipmentCount: ledger?.total_shipments ?? 0,
        totalPurchased: ledger?.total_purchased_bdt ?? 0,
        totalDue: ledger?.total_due_bdt ?? 0,
        isActive: s.is_active,
        createdAt: s.created_at,
      }
    })

    if (rows.length === 0) {
      return (
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <EmptyState
            icon={Building2}
            title="No suppliers found"
            description={
              status === "all"
                ? "No import suppliers have been added yet."
                : `No ${status} suppliers.`
            }
          />
        </div>
      )
    }

    return <SuppliersTable data={rows} />
  } catch {
    return <ErrorCard title="Couldn't load suppliers" />
  }
}
