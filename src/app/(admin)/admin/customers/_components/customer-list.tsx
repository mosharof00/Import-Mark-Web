import { Users } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"
import { DEFAULT_LIST_LIMIT } from "@/lib/query/list-limit"
import type { UserStatus } from "@/types"

import { CustomersTable, type CustomerRow } from "./customers-table"
import type { CustomerFilter } from "./customer-filters"

function formatLocation(city: string | null, area: string | null): string | null {
  if (city && area) return `${area}, ${city}`
  return city ?? area ?? null
}

/** Fetches customers (optionally filtered by status) and renders the table. */
export async function CustomerList({ status }: { status: CustomerFilter }) {
  const supabase = await createClient()

  try {
    let query = supabase
      .from("customers")
      .select("id, full_name, company_name, email, phone, city, area, status, created_at")
      .order("created_at", { ascending: false })
      .limit(DEFAULT_LIST_LIMIT)

    if (status !== "all") {
      query = query.eq("status", status)
    }

    const { data: customers, error } = await query
    if (error) throw error

    const customerIds = (customers ?? []).map((c) => c.id)
    const ledgerByCustomer = new Map<
      string,
      { total_orders: number; total_billed: number; total_due: number }
    >()

    if (customerIds.length > 0) {
      const { data: ledgerRows, error: ledgerError } = await supabase
        .from("customer_ledger")
        .select("customer_id, total_orders, total_billed, total_due")
        .in("customer_id", customerIds)

      if (ledgerError) throw ledgerError

      for (const row of ledgerRows ?? []) {
        if (!row.customer_id) continue
        ledgerByCustomer.set(row.customer_id, {
          total_orders: row.total_orders ?? 0,
          total_billed: row.total_billed ?? 0,
          total_due: row.total_due ?? 0,
        })
      }
    }

    const rows: CustomerRow[] = (customers ?? []).map((c) => {
      const ledger = ledgerByCustomer.get(c.id)

      return {
        id: c.id,
        fullName: c.full_name,
        companyName: c.company_name,
        email: c.email,
        phone: c.phone,
        location: formatLocation(c.city, c.area),
        orderCount: ledger?.total_orders ?? 0,
        totalBilled: ledger?.total_billed ?? 0,
        totalDue: ledger?.total_due ?? 0,
        status: c.status as UserStatus,
        createdAt: c.created_at,
      }
    })

    if (rows.length === 0) {
      return (
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <EmptyState
            icon={Users}
            title="No customers found"
            description={
              status === "all"
                ? "No customer accounts have been registered yet."
                : `No customers with status "${status}".`
            }
          />
        </div>
      )
    }

    return <CustomersTable data={rows} />
  } catch {
    return <ErrorCard title="Couldn't load customers" />
  }
}
