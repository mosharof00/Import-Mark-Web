import { Ship } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"
import { DEFAULT_LIST_LIMIT } from "@/lib/query/list-limit"
import type { ShipmentStatus } from "@/types"

import { AddImportButton } from "./add-import-button"

import { ImportsTable, type ImportRow } from "./imports-table"
import {
  AT_PORT_STATUSES,
  IMPORT_FILTER_LABELS,
  type ImportFilter,
} from "./import-filters"

/** Fetches import shipments (optionally filtered by status) and renders the table. */
export async function ImportList({ status }: { status: ImportFilter }) {
  const supabase = await createClient()

  try {
    let query = supabase
      .from("import_shipments")
      .select(
        "id, shipment_ref, status, currency, total_landed_cost, total_invoice_bdt, shipment_date, arrival_date, created_at, supplier_id, suppliers(name), import_shipment_items(id)"
      )
      .order("created_at", { ascending: false })
      .limit(DEFAULT_LIST_LIMIT)

    if (status === "in_transit") {
      query = query.eq("status", "in_transit")
    } else if (status === "at_port") {
      query = query.in("status", AT_PORT_STATUSES)
    } else if (status === "cleared") {
      query = query.eq("status", "cleared")
    } else if (status === "cancelled") {
      query = query.eq("status", "cancelled")
    }

    const { data: shipments, error } = await query
    if (error) throw error

    const rows: ImportRow[] = (shipments ?? []).map((s) => ({
      id: s.id,
      shipmentRef: s.shipment_ref,
      supplierName: s.suppliers?.name ?? "Unknown",
      supplierId: s.supplier_id,
      itemCount: s.import_shipment_items?.length ?? 0,
      landedCost: s.total_landed_cost ?? s.total_invoice_bdt ?? 0,
      currency: s.currency,
      status: s.status as ShipmentStatus,
      shipmentDate: s.shipment_date,
      arrivalDate: s.arrival_date,
      createdAt: s.created_at,
    }))

    if (rows.length === 0) {
      return (
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <EmptyState
            icon={Ship}
            title="No imports found"
            description={
              status === "all"
                ? "Record a shipment to start the import cycle. Stock is added when it is marked cleared."
                : `No shipments in "${IMPORT_FILTER_LABELS[status]}".`
            }
            action={status === "all" ? <AddImportButton /> : undefined}
          />
        </div>
      )
    }

    return <ImportsTable data={rows} />
  } catch {
    return <ErrorCard title="Couldn't load imports" />
  }
}
