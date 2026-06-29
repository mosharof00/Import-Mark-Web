import { Suspense } from "react"

import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/page-header"
import { FadeIn } from "@/components/shared/fade-in"

import { GatewayStats } from "./_components/gateway-stats"
import { GatewayStatusTabs } from "./_components/gateway-status-tabs"
import { GatewayList } from "./_components/gateway-list"
import { AddGatewayButton } from "./_components/add-gateway-button"
import type { GatewayFilter } from "./_components/gateway-filters"
import {
  GatewayStatsSkeleton,
  GatewayListSkeleton,
} from "./_components/skeletons"

export const dynamic = "force-dynamic"

const FILTERS: GatewayFilter[] = ["all", "active", "inactive"]
const BASE_PATH = "/admin/payment-gateways"

function parseStatus(value: string | undefined): GatewayFilter {
  if (value && FILTERS.includes(value as GatewayFilter)) {
    return value as GatewayFilter
  }
  return "all"
}

export default async function AdminPaymentGatewaysPage({
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
        description="Configure how customers pay — bank accounts, mobile banking, cash on delivery, and instructions for your team."
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
