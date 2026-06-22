import { Suspense } from "react"

import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/page-header"
import { FadeIn } from "@/components/shared/fade-in"

import { OrderStats } from "./_components/order-stats"
import { OrderStatusTabs } from "./_components/order-status-tabs"
import { OrderList } from "./_components/order-list"
import {
  CLOSED_STATUSES,
  IN_PROGRESS_STATUSES,
  type OrderFilter,
} from "./_components/order-filters"
import {
  OrderStatsSkeleton,
  OrderListSkeleton,
} from "./_components/skeletons"

export const dynamic = "force-dynamic"

const FILTERS: OrderFilter[] = [
  "all",
  "pending_approval",
  "in_progress",
  "delivered",
  "closed",
]

function parseStatus(value: string | undefined): OrderFilter {
  if (value && FILTERS.includes(value as OrderFilter)) {
    return value as OrderFilter
  }
  return "all"
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: statusParam } = await searchParams
  const status = parseStatus(statusParam)

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Track every sales order — approvals, fulfillment progress, payments, and delivery status."
      />

      <FadeIn delay={0}>
        <Suspense fallback={<OrderStatsSkeleton />}>
          <OrderStats />
        </Suspense>
      </FadeIn>

      <OrderStatusTabs active={status} counts={counts} />

      <FadeIn key={status}>
        <Suspense fallback={<OrderListSkeleton />}>
          <OrderList status={status} />
        </Suspense>
      </FadeIn>
    </div>
  )
}
