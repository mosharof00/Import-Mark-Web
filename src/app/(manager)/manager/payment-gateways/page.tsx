import { Suspense } from "react"

import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/page-header"
import { FadeIn } from "@/components/shared/fade-in"

import { GatewayStats } from "@/app/(admin)/admin/payment-gateways/_components/gateway-stats"
import { GatewayStatusTabs } from "@/app/(admin)/admin/payment-gateways/_components/gateway-status-tabs"
import { GatewayList } from "@/app/(admin)/admin/payment-gateways/_components/gateway-list"
import { AddGatewayButton } from "@/app/(admin)/admin/payment-gateways/_components/add-gateway-button"
import type { GatewayFilter } from "@/app/(admin)/admin/payment-gateways/_components/gateway-filters"
import {
  GatewayStatsSkeleton,
  GatewayListSkeleton,
} from "@/app/(admin)/admin/payment-gateways/_components/skeletons"

export const dynamic = "force-dynamic"

const FILTERS: GatewayFilter[] = ["all", "active", "inactive"]
const BASE_PATH = "/manager/payment-gateways"

function parseStatus(value: string | undefined): GatewayFilter {
  if (value && FILTERS.includes(value as GatewayFilter)) {
    return value as GatewayFilter
  }
  return "all"
}

export default async function ManagerPaymentGatewaysPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: statusParam } = await searchParams
  const status = parseStatus(statusParam)

  const supabase = await createClient()
  const [allRes, activeRes, inactiveRes] = await Promise.all([
    supabase.from("payment_gateways").select("id", { count: "exact", head: true }),
    supabase
      .from("payment_gateways")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("payment_gateways")
      .select("id", { count: "exact", head: true })
      .eq("status", "inactive"),
  ])

  const counts: Record<GatewayFilter, number> = {
    all: allRes.count ?? 0,
    active: activeRes.count ?? 0,
    inactive: inactiveRes.count ?? 0,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Gateways"
        description="Manage payment methods available when placing orders."
        action={<AddGatewayButton href={`${BASE_PATH}/new`} />}
      />

      <FadeIn delay={0}>
        <Suspense fallback={<GatewayStatsSkeleton />}>
          <GatewayStats />
        </Suspense>
      </FadeIn>

      <GatewayStatusTabs active={status} counts={counts} />

      <FadeIn key={status}>
        <Suspense fallback={<GatewayListSkeleton />}>
          <GatewayList status={status} basePath={BASE_PATH} />
        </Suspense>
      </FadeIn>
    </div>
  )
}
