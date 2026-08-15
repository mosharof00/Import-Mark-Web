import { createClient } from "@/lib/supabase/server"

import {
  CLOSED_STATUSES,
  IN_PROGRESS_STATUSES,
  type OrderFilter,
} from "./order-filters"
import { OrderStatusTabs } from "./order-status-tabs"

export async function OrderStatusTabsLoader({
  active,
}: {
  active: OrderFilter
}) {
  const supabase = await createClient()
  const [allRes, pendingRes, progressRes, deliveredRes, closedRes] =
    await Promise.all([
      supabase.from("sales_orders").select("id", { count: "exact", head: true }),
      supabase
        .from("sales_orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending_approval"),
      supabase
        .from("sales_orders")
        .select("id", { count: "exact", head: true })
        .in("status", IN_PROGRESS_STATUSES),
      supabase
        .from("sales_orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "delivered"),
      supabase
        .from("sales_orders")
        .select("id", { count: "exact", head: true })
        .in("status", CLOSED_STATUSES),
    ])

  const counts: Record<OrderFilter, number> = {
    all: allRes.count ?? 0,
    pending_approval: pendingRes.count ?? 0,
    in_progress: progressRes.count ?? 0,
    delivered: deliveredRes.count ?? 0,
    closed: closedRes.count ?? 0,
  }

  return <OrderStatusTabs active={active} counts={counts} />
}
