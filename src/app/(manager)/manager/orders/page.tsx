import { Suspense } from "react"

import { PageHeader } from "@/components/shared/page-header"
import { FadeIn } from "@/components/shared/fade-in"
import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"

import { OrderStats } from "./_components/order-stats"
import { OrderStatusTabs } from "./_components/order-status-tabs"
import { OrderList } from "./_components/order-list"
import { PlaceOrderButton } from "./_components/place-order-button"
import {
  CLOSED_STATUSES,
  IN_PROGRESS_STATUSES,
  type OrderFilter,
} from "@/app/(admin)/admin/orders/_components/order-filters"
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

async function ManagerOrderStatusTabsLoader({
  active,
}: {
  active: OrderFilter
}) {
  const { user } = await getAuthedUser()
  const supabase = await createClient()

  if (!user) {
    return <OrderStatusTabs active={active} counts={{
      all: 0,
      pending_approval: 0,
      in_progress: 0,
      delivered: 0,
      closed: 0,
    }} />
  }

  const base = () =>
    supabase
      .from("sales_orders")
      .select("id", { count: "exact", head: true })
      .eq("created_by", user.id)

  const [allRes, pendingRes, progressRes, deliveredRes, closedRes] =
    await Promise.all([
      base(),
      base().eq("status", "pending_approval"),
      base().in("status", IN_PROGRESS_STATUSES),
      base().eq("status", "delivered"),
      base().in("status", CLOSED_STATUSES),
    ])

  return (
    <OrderStatusTabs
      active={active}
      counts={{
        all: allRes.count ?? 0,
        pending_approval: pendingRes.count ?? 0,
        in_progress: progressRes.count ?? 0,
        delivered: deliveredRes.count ?? 0,
        closed: closedRes.count ?? 0,
      }}
    />
  )
}

export default async function ManagerOrdersPage({
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
        description="Track sales orders you've created — approval status, fulfillment, and customer payments."
        action={<PlaceOrderButton />}
      />

      <FadeIn delay={0}>
        <Suspense fallback={<OrderStatsSkeleton />}>
          <OrderStats />
        </Suspense>
      </FadeIn>

      <Suspense fallback={<OrderStatusTabs active={status} />}>
        <ManagerOrderStatusTabsLoader active={status} />
      </Suspense>

      <FadeIn key={status}>
        <Suspense fallback={<OrderListSkeleton />}>
          <OrderList status={status} />
        </Suspense>
      </FadeIn>
    </div>
  )
}
