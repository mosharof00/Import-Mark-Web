import { Suspense } from "react"

import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/page-header"
import { FadeIn } from "@/components/shared/fade-in"
import { AddImportButton } from "./_components/add-import-button"
import { ImportStats } from "./_components/import-stats"
import { ImportStatusTabs } from "./_components/import-status-tabs"
import { ImportList } from "./_components/import-list"
import { AT_PORT_STATUSES, type ImportFilter } from "./_components/import-filters"
import {
  ImportStatsSkeleton,
  ImportListSkeleton,
} from "./_components/skeletons"

export const dynamic = "force-dynamic"

const FILTERS: ImportFilter[] = [
  "all",
  "in_transit",
  "at_port",
  "cleared",
  "cancelled",
]

function parseStatus(value: string | undefined): ImportFilter {
  if (value && FILTERS.includes(value as ImportFilter)) {
    return value as ImportFilter
  }
  return "all"
}

export default async function ImportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: statusParam } = await searchParams
  const status = parseStatus(statusParam)

  const supabase = await createClient()
  const [allRes, transitRes, portRes, clearedRes, cancelledRes] =
    await Promise.all([
      supabase
        .from("import_shipments")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("import_shipments")
        .select("id", { count: "exact", head: true })
        .eq("status", "in_transit"),
      supabase
        .from("import_shipments")
        .select("id", { count: "exact", head: true })
        .in("status", AT_PORT_STATUSES),
      supabase
        .from("import_shipments")
        .select("id", { count: "exact", head: true })
        .eq("status", "cleared"),
      supabase
        .from("import_shipments")
        .select("id", { count: "exact", head: true })
        .eq("status", "cancelled"),
    ])

  const counts: Record<ImportFilter, number> = {
    all: allRes.count ?? 0,
    in_transit: transitRes.count ?? 0,
    at_port: portRes.count ?? 0,
    cleared: clearedRes.count ?? 0,
    cancelled: cancelledRes.count ?? 0,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Imports"
        description="Track inbound shipments — transit status, customs clearance, landed costs, and line-item breakdowns."
        action={<AddImportButton />}
      />

      <FadeIn delay={0}>
        <Suspense fallback={<ImportStatsSkeleton />}>
          <ImportStats />
        </Suspense>
      </FadeIn>

      <ImportStatusTabs active={status} counts={counts} />

      <FadeIn key={status}>
        <Suspense fallback={<ImportListSkeleton />}>
          <ImportList status={status} />
        </Suspense>
      </FadeIn>
    </div>
  )
}
