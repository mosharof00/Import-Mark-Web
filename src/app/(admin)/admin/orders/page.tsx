import { Suspense } from "react"

import { PageHeader } from "@/components/shared/page-header"
import { FadeIn } from "@/components/shared/fade-in"

import { OrderStats } from "./_components/order-stats"
import { OrderStatusTabs } from "./_components/order-status-tabs"
import { OrderStatusTabsLoader } from "./_components/order-status-tabs-loader"
import { OrderList } from "./_components/order-list"
import { PlaceOrderButton } from "./_components/place-order-button"
import { type OrderFilter } from "./_components/order-filters"
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Track every sales order — approvals, fulfillment progress, payments, and delivery status."
        action={<PlaceOrderButton href="/admin/orders/new" />}
      />

      <FadeIn delay={0}>
        <Suspense fallback={<OrderStatsSkeleton />}>
          <OrderStats />
        </Suspense>
      </FadeIn>

      <Suspense fallback={<OrderStatusTabs active={status} />}>
        <OrderStatusTabsLoader active={status} />
      </Suspense>

      <FadeIn key={status}>
        <Suspense fallback={<OrderListSkeleton />}>
          <OrderList status={status} />
        </Suspense>
      </FadeIn>
    </div>
  )
}
