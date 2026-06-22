import { Wallet } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"

import {
  ReceivablesTable,
  type ReceivableRow,
} from "./receivables-table"

export async function ReceivablesReport() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("customer_ledger")
      .select(
        "customer_id, full_name, company_name, total_orders, total_billed, total_paid, total_due"
      )
      .order("total_due", { ascending: false, nullsFirst: false })

    if (error) throw error

    const rows: ReceivableRow[] = (data ?? [])
      .filter((c) => c.customer_id && c.full_name)
      .map((c) => ({
        customerId: c.customer_id!,
        fullName: c.full_name!,
        companyName: c.company_name,
        totalOrders: c.total_orders ?? 0,
        totalBilled: c.total_billed ?? 0,
        totalPaid: c.total_paid ?? 0,
        totalDue: c.total_due ?? 0,
      }))

    if (rows.length === 0) {
      return (
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <EmptyState
            icon={Wallet}
            title="No receivables data"
            description="Customer balances will appear once orders are placed."
          />
        </div>
      )
    }

    return <ReceivablesTable data={rows} />
  } catch {
    return <ErrorCard title="Couldn't load receivables report" />
  }
}
