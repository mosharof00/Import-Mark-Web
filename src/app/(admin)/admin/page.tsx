import { Suspense } from "react"

import { FadeIn } from "@/components/shared/fade-in"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardHeader } from "@/app/(admin)/admin/_components/dashboard-header"
import { KpiCards } from "@/app/(admin)/admin/_components/kpi-cards"
import { PendingApprovals } from "@/app/(admin)/admin/_components/pending-approvals"
import { RevenueChart } from "@/app/(admin)/admin/_components/revenue-chart"
import { ProductApprovalQueue } from "@/app/(admin)/admin/_components/product-approval-queue"
import { LowStockList } from "@/app/(admin)/admin/_components/low-stock-list"
import {
  KpiCardsSkeleton,
  PendingApprovalsSkeleton,
  RevenueChartSkeleton,
  ListSectionSkeleton,
} from "@/app/(admin)/admin/_components/skeletons"

// Always render fresh data; approvals change the underlying tables frequently.
export const dynamic = "force-dynamic"

function HeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="size-10 rounded-full" />
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<HeaderSkeleton />}>
        <DashboardHeader />
      </Suspense>

      {/* Each section streams independently with a matching skeleton, and fades
          up in a staggered sequence (100ms apart) as it mounts. */}
      <FadeIn delay={0}>
        <Suspense fallback={<KpiCardsSkeleton />}>
          <KpiCards />
        </Suspense>
      </FadeIn>

      <FadeIn delay={100}>
        <Suspense fallback={<PendingApprovalsSkeleton />}>
          <PendingApprovals />
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
            <ProductApprovalQueue />
          </Suspense>
          <Suspense fallback={<ListSectionSkeleton />}>
            <LowStockList />
          </Suspense>
        </div>
      </FadeIn>
    </div>
  )
}
