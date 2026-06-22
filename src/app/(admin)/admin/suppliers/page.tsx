import { Suspense } from "react"

import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/page-header"
import { FadeIn } from "@/components/shared/fade-in"

import { SupplierStats } from "./_components/supplier-stats"
import { SupplierStatusTabs } from "./_components/supplier-status-tabs"
import { SupplierList } from "./_components/supplier-list"
import type { SupplierFilter } from "./_components/supplier-filters"
import {
  SupplierStatsSkeleton,
  SupplierListSkeleton,
} from "./_components/skeletons"

export const dynamic = "force-dynamic"

const FILTERS: SupplierFilter[] = ["all", "active", "inactive"]

function parseStatus(value: string | undefined): SupplierFilter {
  if (value && FILTERS.includes(value as SupplierFilter)) {
    return value as SupplierFilter
  }
  return "all"
}

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: statusParam } = await searchParams
  const status = parseStatus(statusParam)

  const supabase = await createClient()
  const [allRes, activeRes, inactiveRes] = await Promise.all([
    supabase.from("suppliers").select("id", { count: "exact", head: true }),
    supabase
      .from("suppliers")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("suppliers")
      .select("id", { count: "exact", head: true })
      .eq("is_active", false),
  ])

  const counts: Record<SupplierFilter, number> = {
    all: allRes.count ?? 0,
    active: activeRes.count ?? 0,
    inactive: inactiveRes.count ?? 0,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        description="Oversee import partners — contact details, shipment history, purchase totals, and outstanding payables."
      />

      <FadeIn delay={0}>
        <Suspense fallback={<SupplierStatsSkeleton />}>
          <SupplierStats />
        </Suspense>
      </FadeIn>

      <SupplierStatusTabs active={status} counts={counts} />

      <FadeIn key={status}>
        <Suspense fallback={<SupplierListSkeleton />}>
          <SupplierList status={status} />
        </Suspense>
      </FadeIn>
    </div>
  )
}
