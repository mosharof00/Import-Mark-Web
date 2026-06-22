import { Suspense } from "react"

import { FadeIn } from "@/components/shared/fade-in"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardHeader } from "@/app/(manager)/manager/_components/dashboard-header"
import { KpiCards } from "@/app/(manager)/manager/_components/kpi-cards"
import { PendingApprovalOrders } from "@/app/(manager)/manager/_components/pending-approval-orders"
import { RevenueChart } from "@/app/(manager)/manager/_components/revenue-chart"
import { RecentOrders } from "@/app/(manager)/manager/_components/recent-orders"
import { LowStockList } from "@/app/(manager)/manager/_components/low-stock-list"
import {
  KpiCardsSkeleton,
  PendingOrdersSkeleton,
  RevenueChartSkeleton,
  ListSectionSkeleton,
} from "@/app/(manager)/manager/_components/skeletons"

export const dynamic = "force-dynamic"

function HeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="size-10 rounded-full" />
    </div>
  )
}

export default function ManagerDashboardPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<HeaderSkeleton />}>
        <DashboardHeader />
      </Suspense>

      <FadeIn delay={0}>
        <Suspense fallback={<KpiCardsSkeleton />}>
          <KpiCards />
        </Suspense>
      </FadeIn>

      <FadeIn delay={100}>
        <Suspense fallback={<PendingOrdersSkeleton />}>
          <PendingApprovalOrders />
        </Suspense>
      </FadeIn>

      <FadeIn delay={200}>
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
      </FadeIn>

      <FadeIn delay={300}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Suspense fallback={<ListSectionSkeleton />}>
            <RecentOrders />
          </Suspense>
          <Suspense fallback={<ListSectionSkeleton />}>
            <LowStockList />
          </Suspense>
        </div>
      </FadeIn>
    </div>
  )
}
