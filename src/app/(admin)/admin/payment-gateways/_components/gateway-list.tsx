import { CreditCard } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorCard } from "@/components/shared/error-card"
import type { PaymentGatewayStatus, PaymentMode } from "@/types"

import { GatewaysTable, type GatewayRow } from "./gateways-table"
import type { GatewayFilter } from "./gateway-filters"
import { GATEWAY_FILTER_LABELS } from "./gateway-filters"

export async function GatewayList({
  status,
  basePath,
}: {
  status: GatewayFilter
  basePath: string
}) {
  const supabase = await createClient()

  try {
    let query = supabase
      .from("payment_gateways")
      .select("id, name, type, status, account_number, sort_order")
      .order("sort_order")
      .order("name")

    if (status === "active") query = query.eq("status", "active")
    else if (status === "inactive") query = query.eq("status", "inactive")

    const { data: gateways, error } = await query
    if (error) throw error

    const rows: GatewayRow[] = (gateways ?? []).map((g) => ({
      id: g.id,
      name: g.name,
      type: g.type as PaymentMode,
      status: g.status as PaymentGatewayStatus,
      accountNumber: g.account_number,
      sortOrder: g.sort_order,
    }))

    if (rows.length === 0) {
      return (
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <EmptyState
            icon={CreditCard}
            title="No payment gateways found"
            description={
              status === "all"
                ? "Add a gateway so managers can collect payments on orders."
                : `No ${GATEWAY_FILTER_LABELS[status].toLowerCase()} gateways.`
            }
          />
        </div>
      )
    }

    return <GatewaysTable data={rows} basePath={basePath} />
  } catch {
    return <ErrorCard title="Couldn't load payment gateways" />
  }
}
